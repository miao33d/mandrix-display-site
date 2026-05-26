import { analyzeAvailability } from "./_bookingLogic.js";
import { listBookings, sendJson } from "./_supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const payload = {
      course: req.query.course,
      date: req.query.date,
      time: req.query.time,
      frequency: req.query.frequency || "weekly",
    };

    if (!payload.course || !payload.date || !payload.time) {
      sendJson(res, 200, { ok: false, pending: true, message: "Choose a course, date, and time to check availability." });
      return;
    }

    const rows = await listBookings();
    sendJson(res, 200, analyzeAvailability(rows, payload));
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Availability check failed" });
  }
}
