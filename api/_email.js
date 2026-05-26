const DEFAULT_ADMIN_EMAIL = "Jane.Mandrix@outlook.com";
const DEFAULT_FROM_EMAIL = "Mandrix <onboarding@resend.dev>";

function cleanString(value) {
  return String(value || "").trim();
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatSchedule(schedule) {
  if (!Array.isArray(schedule) || !schedule.length) return "None";
  return schedule
    .map((lesson) => {
      const meeting = lesson.meetingLink ? ` · Tencent Meeting: ${lesson.meetingLink}` : "";
      return `Lesson ${lesson.lesson}: ${lesson.date} · ${lesson.time} Beijing Time${meeting}`;
    })
    .join("\n");
}

function meetingBlock(booking) {
  const primaryLesson = Array.isArray(booking.lessonSchedule) ? booking.lessonSchedule.find((lesson) => lesson.meetingLink) : null;
  const meetingLink = booking.meetingLink || primaryLesson?.meetingLink || "";
  const meetingCode = primaryLesson?.meetingCode || "";
  if (!meetingLink && !meetingCode) return [];
  return [
    "Tencent Meeting:",
    meetingLink ? `Join link: ${meetingLink}` : "",
    meetingCode ? `Meeting ID: ${meetingCode}` : "",
    "Class note: We use Tencent Meeting for lessons. No app download needed; open the link in your browser to join. Real-time Chinese-English subtitles are available in class.",
  ].filter(Boolean);
}

export function assertEmailConfigured() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Email service is not configured. Add RESEND_API_KEY in Vercel before accepting paid booking forms.");
  }
}

export function buildAdminBookingEmail(booking) {
  const meetingLines = meetingBlock(booking);
  const lines = [
    "New paid Mandrix booking",
    "",
    `Booking ID: ${booking.id}`,
    `Status: ${booking.status}`,
    `Payment: ${booking.payment}`,
    `Amount: $${booking.amount || ""}`,
    "",
    `Name: ${booking.fullName}`,
    `Email: ${booking.email}`,
    `Contact: ${booking.contact}`,
    `Country / Region: ${booking.country}`,
    `Time Zone: ${booking.timezone}`,
    `Current Level: ${booking.level}`,
    "",
    `Course: ${booking.course}`,
    `First Class Date: ${booking.date}`,
    `Fixed Class Time: ${booking.time} Beijing Time`,
    `Frequency: ${booking.frequencyLabel || booking.frequency}`,
    `Lessons: ${booking.lessonCount}`,
    "",
    ...meetingLines,
    ...(meetingLines.length ? [""] : []),
    "Auto Lesson Schedule:",
    formatSchedule(booking.lessonSchedule),
    "",
    "Learning Goal:",
    booking.goal,
    "",
    "Notes / Payment Details:",
    booking.notes || "None",
  ];

  const text = lines.join("\n");
  const htmlRows = lines.map((line) => line ? `<p>${escapeHtml(line)}</p>` : "<br>").join("");
  const html = `
    <div style="font-family:Arial,sans-serif;color:#171a24;line-height:1.55">
      <h1 style="font-size:24px;margin:0 0 16px">New paid Mandrix booking</h1>
      ${htmlRows}
    </div>
  `;
  return { text, html };
}

export function buildStudentConfirmationEmail(booking) {
  const schedule = formatSchedule(booking.lessonSchedule);
  const meetingLines = meetingBlock(booking);
  const hasMeeting = meetingLines.length > 0;
  const lines = [
    "Your Mandrix paid booking has been received",
    "",
    `Hi ${booking.fullName},`,
    "",
    "Thank you for completing your PayPal payment. Jane has received your booking and will review your class time and course details.",
    "",
    `Course: ${booking.course}`,
    `Amount: $${booking.amount || ""}`,
    `Payment status: ${booking.payment}`,
    `First class date: ${booking.date}`,
    `Class time: ${booking.time} Beijing Time`,
    `Frequency: ${booking.frequencyLabel || booking.frequency}`,
    "",
    ...(hasMeeting ? meetingLines : ["Tencent Meeting link: Jane will send your class link in a separate email after the time is confirmed."]),
    "",
    "Auto lesson schedule:",
    schedule,
    "",
    "What happens next:",
    hasMeeting
      ? "Jane will confirm any final class details by email, WhatsApp, or Telegram if needed."
      : "Jane will create the Tencent Meeting room and send the class link in a separate email.",
    "",
    "If any information is incorrect, reply to Jane at Jane.Mandrix@outlook.com.",
    "",
    "Mandrix",
  ];

  const text = lines.join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;color:#171a24;line-height:1.55">
      <h1 style="font-size:24px;margin:0 0 16px">Your Mandrix paid booking has been received</h1>
      ${lines.slice(2).map((line) => line ? `<p>${escapeHtml(line)}</p>` : "<br>").join("")}
    </div>
  `;
  return { text, html };
}

export function buildMeetingLinkEmail(booking) {
  const schedule = formatSchedule(booking.lessonSchedule);
  const meetingLines = meetingBlock(booking);
  const lines = [
    "Your Mandrix class link is confirmed",
    "",
    `Hi ${booking.fullName},`,
    "",
    "Your Tencent Meeting link has been confirmed. Please use the link below to join your class.",
    "",
    `Course: ${booking.course}`,
    `First class date: ${booking.date}`,
    `Class time: ${booking.time} Beijing Time`,
    "",
    ...meetingLines,
    "",
    "Auto lesson schedule:",
    schedule,
    "",
    "We use Tencent Meeting for lessons.",
    "No app download needed, just open the link via browser to join.",
    "Real-time Chinese-English subtitles are available in class.",
    "",
    "Mandrix",
  ];

  const text = lines.join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;color:#171a24;line-height:1.55">
      <h1 style="font-size:24px;margin:0 0 16px">Your Mandrix class link is confirmed</h1>
      ${lines.slice(2).map((line) => line ? `<p>${escapeHtml(line)}</p>` : "<br>").join("")}
    </div>
  `;
  return { text, html };
}

async function sendEmail({ to, from, subject, text, html, replyTo }) {
  const body = {
    from,
    to,
    subject,
    text,
    html,
  };
  if (replyTo) body.reply_to = replyTo;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { ok: false, to, error: data?.message || data?.error || `Email send failed: ${response.status}` };
  }
  return { ok: true, to, id: data?.id };
}

function extractResendTestRecipient(message = "") {
  const match = String(message).match(/own email address \(([^)]+)\)/i);
  return match ? match[1] : "";
}

export async function sendBookingNotifications(booking) {
  assertEmailConfigured();
  const to = cleanString(process.env.ADMIN_EMAIL) || DEFAULT_ADMIN_EMAIL;
  const from = cleanString(process.env.EMAIL_FROM) || DEFAULT_FROM_EMAIL;
  const adminEmail = buildAdminBookingEmail(booking);
  const studentEmail = buildStudentConfirmationEmail(booking);

  let adminResult = await sendEmail({
      from,
      to,
      subject: `Paid booking: ${booking.fullName} · $${booking.amount || ""}`,
      text: adminEmail.text,
      html: adminEmail.html,
      replyTo: booking.email,
  });

  const fallbackRecipient = adminResult.ok ? "" : extractResendTestRecipient(adminResult.error);
  if (!adminResult.ok && fallbackRecipient) {
    const fallbackResult = await sendEmail({
      from,
      to: fallbackRecipient,
      subject: `[Fallback] Paid booking: ${booking.fullName} · $${booking.amount || ""}`,
      text: `${adminEmail.text}\n\nOriginal recipient blocked by Resend testing mode: ${to}`,
      html: `${adminEmail.html}<p><strong>Original recipient blocked by Resend testing mode:</strong> ${escapeHtml(to)}</p>`,
      replyTo: booking.email,
    });
    adminResult = {
      ...fallbackResult,
      fallback: true,
      originalTo: to,
      originalError: adminResult.error,
    };
  }

  const studentResult = await sendEmail({
    from,
    to: booking.email,
    subject: "Your Mandrix paid booking has been received",
    text: studentEmail.text,
    html: studentEmail.html,
    replyTo: to,
  });

  return { admin: adminResult, student: studentResult };
}

export async function sendMeetingLinkNotification(booking) {
  assertEmailConfigured();
  const to = cleanString(process.env.ADMIN_EMAIL) || DEFAULT_ADMIN_EMAIL;
  const from = cleanString(process.env.EMAIL_FROM) || DEFAULT_FROM_EMAIL;
  const email = buildMeetingLinkEmail(booking);

  const studentResult = await sendEmail({
    from,
    to: booking.email,
    subject: "Your Mandrix class link is confirmed",
    text: email.text,
    html: email.html,
    replyTo: to,
  });

  return { student: studentResult };
}
