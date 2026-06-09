import crypto from "node:crypto";
import { analyzeAvailability, cleanString, frequencyLabel } from "./_bookingLogic.js";

export function extractAmount(course) {
  const match = cleanString(course).match(/\$(\d+(?:\.\d{1,2})?)/);
  return match ? match[1] : "";
}

export function bookingRequiredFields({ paid }) {
  const fields = ["fullName", "email", "contact", "country", "timezone", "level", "course", "date", "time", "frequency", "goal"];
  return paid ? [...fields, "paymentReference"] : fields;
}

export function missingFields(payload, options = {}) {
  return bookingRequiredFields(options).filter((key) => !cleanString(payload[key]));
}

export function buildBookingFromPayload(payload, rows, options = {}) {
  const availability = analyzeAvailability(rows, payload);
  if (!availability.ok) return { availability };

  const payment = options.payment || "Payment Pending";
  const amount = cleanString(payload.amount) || extractAmount(payload.course);
  const paymentReference = cleanString(payload.paymentReference);
  const paymentAccount = cleanString(payload.paymentAccount);
  const paymentProofLink = cleanString(payload.paymentProofLink);

  const notes = [
    paymentReference ? `Payment reference: ${paymentReference}` : "",
    paymentAccount ? `Payment account / name: ${paymentAccount}` : "",
    paymentProofLink ? `Receipt / screenshot link: ${paymentProofLink}` : "",
    "",
    cleanString(payload.notes) ? `Student notes: ${cleanString(payload.notes)}` : "Student notes: None",
  ].filter((line) => line || line === "").join("\n");

  return {
    availability,
    booking: {
      id: options.id || crypto.randomUUID(),
      status: options.status || "New",
      fullName: cleanString(payload.fullName),
      email: cleanString(payload.email),
      contact: cleanString(payload.contact),
      country: cleanString(payload.country),
      timezone: cleanString(payload.timezone),
      level: cleanString(payload.level),
      course: cleanString(payload.course),
      date: cleanString(payload.date),
      time: cleanString(payload.time),
      frequency: cleanString(payload.frequency || "weekly"),
      frequencyLabel: frequencyLabel(payload.frequency || "weekly"),
      lessonCount: availability.lessonCount,
      lessonSchedule: availability.schedule,
      bookingType: availability.type,
      groupInfo: availability.type === "group" ? {
        currentStudentsBeforeBooking: availability.currentStudents,
        currentStudentsAfterBooking: availability.currentStudents + 1,
        neededToOpen: availability.neededToOpen,
        remainingSeatsAfterBooking: Math.max(0, availability.remainingSeats - 1),
        minStudents: availability.minStudents,
        maxStudents: availability.maxStudents,
        cohortKey: availability.cohortKey,
      } : null,
      goal: cleanString(payload.goal),
      payment,
      amount,
      paypalLink: cleanString(options.paypalLink || paymentProofLink),
      paymentProvider: cleanString(options.paymentProvider || payload.paymentProvider || "PayPal"),
      notes,
      meetingLink: cleanString(options.meetingLink || process.env.GOOGLE_MEET_LINK || process.env.DEFAULT_MEETING_LINK || ""),
      teacherNotes: cleanString(options.teacherNotes),
      updatedAt: null,
    },
  };
}
