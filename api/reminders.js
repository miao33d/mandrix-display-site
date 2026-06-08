import { isAdmin } from "../lib/_auth.js";
import { sendBookingNotifications, sendRenewalNotification } from "../lib/_email.js";
import { getBooking, listBookings, patchBooking, sendJson } from "../lib/_supabase.js";
import { buildRenewalEmail, markRenewalSent, renewalRows, renewalStatusFor } from "../lib/renewal.js";

function isAuthorized(req) {
  const secret = process.env.REMINDER_SECRET || process.env.CRON_SECRET || process.env.ADMIN_TOKEN;
  const token = req.headers["x-reminder-secret"] || req.query.secret;
  const auth = String(req.headers.authorization || "");
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return Boolean(secret) && (token === secret || bearer === secret);
}

function lessonStartUtc(lesson) {
  const startTime = String(lesson.time || "").split(" - ")[0];
  const [year, month, day] = String(lesson.date || "").split("-").map(Number);
  const [hour, minute] = String(startTime || "").split(":").map(Number);
  if (![year, month, day, hour, minute].every(Number.isFinite)) return null;
  return new Date(Date.UTC(year, month - 1, day, hour - 8, minute));
}

function needsReminder(booking, lesson, now) {
  if (!lesson.meetingLink || lesson.reminderSentAt) return false;
  const start = lessonStartUtc(lesson);
  if (!start) return false;
  const diffMs = start.getTime() - now.getTime();
  return diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000;
}

async function sendRenewal({ booking, renewal, force = false }) {
  if (!booking?.email) return { ok: false, bookingId: booking?.id, error: "Booking has no email" };
  if (renewal.alreadySent && !force) {
    return { ok: false, skipped: true, bookingId: booking.id, stage: renewal.stage, error: "Renewal already sent" };
  }
  const renewalEmail = buildRenewalEmail(booking, renewal);
  const emailResults = await sendRenewalNotification(booking, renewalEmail);
  const sentAt = new Date().toISOString();
  if (emailResults.student?.ok) {
    await patchBooking(booking.id, {
      lessonSchedule: markRenewalSent(booking, renewal, sentAt),
      teacherNotes: `${booking.teacherNotes || ""}\nRenewal email sent at ${sentAt}: ${renewal.label} (${renewal.stage})`.trim(),
    });
  }
  return {
    ok: Boolean(emailResults.student?.ok),
    bookingId: booking.id,
    stage: renewal.stage,
    label: renewal.label,
    emailResults,
  };
}

export default async function handler(req, res) {
  const admin = isAdmin(req);
  const authorized = isAuthorized(req);
  if (!admin && !authorized) {
    sendJson(res, 401, { error: "Reminder secret required" });
    return;
  }
  if (req.method !== "GET" && req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const job = req.query.job || req.body?.job || (req.method === "GET" && !admin ? "all" : "class");
    if (job === "renewals") {
      if (req.method === "POST") {
        if (!admin) {
          sendJson(res, 401, { error: "Admin password required" });
          return;
        }
        const bookingId = req.body?.bookingId || req.query.bookingId;
        if (!bookingId) {
          sendJson(res, 400, { error: "bookingId required" });
          return;
        }
        const booking = await getBooking(bookingId);
        if (!booking) {
          sendJson(res, 404, { error: "Booking not found" });
          return;
        }
        const renewal = renewalStatusFor(booking);
        if (!renewal) {
          sendJson(res, 409, { error: "No renewal follow-up is due for this booking" });
          return;
        }
        const result = await sendRenewal({ booking, renewal, force: Boolean(req.body?.force || req.query.force === "1") });
        sendJson(res, result.ok ? 200 : 409, result);
        return;
      }

      const rows = await listBookings();
      if (admin && req.query.send !== "1") {
        const due = renewalRows(rows, { includeSent: req.query.includeSent === "1" });
        sendJson(res, 200, {
          ok: true,
          mode: "preview",
          renewals: due.map(({ booking, renewal }) => ({
            bookingId: booking.id,
            fullName: booking.fullName,
            studentEmail: booking.email,
            course: booking.course,
            renewal,
            renewalEmail: buildRenewalEmail(booking, renewal),
          })),
        });
        return;
      }

      const due = renewalRows(rows);
      const results = [];
      for (const row of due) {
        results.push(await sendRenewal(row));
      }
      sendJson(res, 200, { ok: true, mode: "renewals", sent: results.filter((row) => row.ok).length, results });
      return;
    }

    const now = new Date();
    const rows = await listBookings();
    const results = [];

    for (const booking of rows) {
      if (booking.status === "Cancelled" || booking.status === "Completed") continue;
      const schedule = Array.isArray(booking.lessonSchedule) ? booking.lessonSchedule : [];
      const dueLessons = schedule.filter((lesson) => needsReminder(booking, lesson, now));
      if (!dueLessons.length) continue;

      const reminderBooking = {
        ...booking,
        lessonSchedule: dueLessons,
        meetingLink: dueLessons[0].meetingLink || booking.meetingLink,
      };
      const emailResults = await sendBookingNotifications(reminderBooking);
      const updatedSchedule = schedule.map((lesson) => (
        dueLessons.some((due) => due.lesson === lesson.lesson)
          ? { ...lesson, reminderSentAt: now.toISOString() }
          : lesson
      ));
      await patchBooking(booking.id, {
        lessonSchedule: updatedSchedule,
        teacherNotes: `${booking.teacherNotes || ""}\nReminder email sent at ${now.toISOString()} for lesson(s): ${dueLessons.map((lesson) => lesson.lesson).join(", ")}`.trim(),
      });
      results.push({ bookingId: booking.id, lessons: dueLessons.map((lesson) => lesson.lesson), emailResults });
    }

    if (job === "all") {
      const renewalDue = renewalRows(rows);
      const renewalResults = [];
      for (const row of renewalDue) {
        renewalResults.push(await sendRenewal(row));
      }
      sendJson(res, 200, {
        ok: true,
        remindersSent: results.length,
        renewalsSent: renewalResults.filter((row) => row.ok).length,
        results,
        renewalResults,
      });
      return;
    }

    sendJson(res, 200, { ok: true, remindersSent: results.length, results });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Reminder job failed" });
  }
}
