import { sendBookingNotifications } from "./_email.js";
import { listBookings, patchBooking, sendJson } from "./_supabase.js";

function isAuthorized(req) {
  const secret = process.env.REMINDER_SECRET || process.env.ADMIN_TOKEN;
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

export default async function handler(req, res) {
  if (!isAuthorized(req)) {
    sendJson(res, 401, { error: "Reminder secret required" });
    return;
  }
  if (req.method !== "GET" && req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
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

    sendJson(res, 200, { ok: true, remindersSent: results.length, results });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Reminder job failed" });
  }
}
