import { buildBookingFromPayload, missingFields } from "../lib/_bookingCreate.js";
import { cleanString } from "../lib/_bookingLogic.js";
import { assertEmailConfigured, sendBookingNotifications } from "../lib/_email.js";
import { isAdmin } from "../lib/_auth.js";
import { insertBooking, listBookings, patchBooking, sendJson } from "../lib/_supabase.js";

export default async function handler(req, res) {
  // CORS — allow the ops dashboard and any local file to call this API
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-token");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }

  try {
    if (req.method === "GET") {
      if (!isAdmin(req)) {
        sendJson(res, 401, { error: "Admin password required" });
        return;
      }
      const rows = await listBookings();
      sendJson(res, 200, { bookings: rows });
      return;
    }

    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }

    const payload = req.body || {};

    const missing = missingFields(payload, { paid: true });
    if (missing.length) {
      sendJson(res, 400, { error: `Missing required fields: ${missing.join(", ")}` });
      return;
    }

    assertEmailConfigured();

    const rows = await listBookings();
    const { availability, booking } = buildBookingFromPayload(payload, rows, {
      payment: "PayPal payment confirmed",
      paymentProvider: "PayPal",
    });
    if (!availability.ok) {
      sendJson(res, 409, { error: availability.message, availability });
      return;
    }

    const saved = await insertBooking(booking);
    const emailResults = await sendBookingNotifications(saved);
    const emailSent = Boolean(emailResults.admin?.ok && emailResults.student?.ok);
    let finalBooking = saved;
    if (!emailSent) {
      const adminStatus = emailResults.admin?.ok
        ? `Admin email sent to ${emailResults.admin.to}${emailResults.admin.fallback ? ` as fallback; original recipient ${emailResults.admin.originalTo} was blocked.` : "."}`
        : `Admin email failed: ${emailResults.admin?.error || "unknown error"}`;
      const studentStatus = emailResults.student?.ok
        ? `Student email sent to ${emailResults.student.to}.`
        : `Student email failed: ${emailResults.student?.error || "unknown error"}`;
      finalBooking = await patchBooking(saved.id, {
        teacherNotes: `Email delivery status:\n${adminStatus}\n${studentStatus}`,
      }) || saved;
    }
    sendJson(res, 201, { booking: finalBooking, emailSent, emailResults, recipients: ["admin", "student"] });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Booking request failed" });
  }
}
