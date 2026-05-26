import { isAdmin } from "./_auth.js";
import { sendMeetingLinkNotification } from "./_email.js";
import { deleteBooking, patchBooking, sendJson } from "./_supabase.js";

export default async function handler(req, res) {
  if (!isAdmin(req)) {
    sendJson(res, 401, { error: "Admin password required" });
    return;
  }

  if (req.method !== "PATCH" && req.method !== "DELETE") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const id = req.query.id || req.body?.id;
    if (!id) {
      sendJson(res, 400, { error: "Booking id required" });
      return;
    }
    if (req.method === "DELETE") {
      await deleteBooking(id);
      sendJson(res, 200, { ok: true, deletedId: id });
      return;
    }
    const payload = req.body || {};
    const updated = await patchBooking(id, payload);
    let meetingEmail = { sent: false };
    const meetingLink = String(payload.meetingLink || "").trim();
    if (updated && meetingLink) {
      const schedule = Array.isArray(updated.lessonSchedule) ? updated.lessonSchedule : [];
      const scheduleWithLink = schedule.map((lesson) => ({
        ...lesson,
        meetingProvider: lesson.meetingProvider || "Tencent Meeting",
        meetingLink: lesson.meetingLink || meetingLink,
      }));
      const enriched = await patchBooking(id, {
        meetingLink,
        lessonSchedule: scheduleWithLink,
        teacherNotes: `${updated.teacherNotes || ""}\nMeeting link saved and sent to student at ${new Date().toISOString()}`.trim(),
      }) || updated;
      meetingEmail = {
        sent: true,
        results: await sendMeetingLinkNotification(enriched),
      };
      sendJson(res, 200, { booking: enriched, meetingEmail });
      return;
    }
    sendJson(res, 200, { booking: updated, meetingEmail });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Booking update failed" });
  }
}
