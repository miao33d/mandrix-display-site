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
    "Your Mandrix booking is received",
    "",
    `Hi ${booking.fullName},`,
    "",
    "Thank you for submitting your paid booking form. This email confirms that Mandrix has received your booking details.",
    "Jane will personally verify the payment reference and class details before sending the meeting link.",
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
      : "Jane will verify your payment reference and send the Tencent Meeting link within 24 business hours.",
    "If the requested time is unavailable, Jane will contact you directly with the closest available options.",
    "For rescheduling, please contact Jane at least 24 hours before class.",
    "",
    "If any information is incorrect, reply to Jane at Jane.Mandrix@outlook.com.",
    "",
    "Mandrix",
  ];

  const text = lines.join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;color:#171a24;line-height:1.55">
      <h1 style="font-size:24px;margin:0 0 16px">Your Mandrix booking is received</h1>
      ${lines.slice(2).map((line) => line ? `<p>${escapeHtml(line)}</p>` : "<br>").join("")}
    </div>
  `;
  return { text, html };
}

export function buildRenewalEmailHtml(text) {
  const lines = String(text || "").split("\n");
  return `
    <div style="font-family:Arial,sans-serif;color:#171a24;line-height:1.55">
      ${lines.map((line) => line ? `<p>${escapeHtml(line)}</p>` : "<br>").join("")}
    </div>
  `;
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
    subject: "Your Mandrix booking is received",
    text: studentEmail.text,
    html: studentEmail.html,
    replyTo: to,
  });

  return { admin: adminResult, student: studentResult };
}

function levelCheckReportLines(levelCheck) {
  const report = levelCheck.report || {};
  const level = report.level || {};
  const blocker = report.blocker || {};
  const path = report.path || {};
  const scores = report.scores || {};
  return [
    "Mandrix Free AI Level Check",
    "",
    `Name: ${levelCheck.fullName}`,
    `Email: ${levelCheck.email}`,
    `Contact: ${levelCheck.contact || "Not provided"}`,
    `Goal: ${levelCheck.goal}`,
    "",
    `Estimated level: ${level.label || "Not available"}`,
    level.hsk || "",
    `Main blocker: ${blocker.title || "Not available"}`,
    blocker.detail || "",
    "",
    "Score snapshot:",
    `Structure awareness: ${scores.structure || "-"}%`,
    `Active output: ${scores.output || "-"}%`,
    `Speaking confidence: ${scores.confidence || "-"}%`,
    `Mandrix path fit: ${scores.goalFit || "-"}%`,
    "",
    `Recommended path: ${path.path || "Mandrix coaching"}`,
    path.why || "",
    "",
    "Helpful next step:",
    path.firstStep || "Book a Jane consultation for a line-by-line diagnosis.",
    "",
    "Student sample:",
    levelCheck.sample || "None",
  ].filter((line) => line !== "");
}

function buildLevelCheckEmailHtml(levelCheck, { admin = false } = {}) {
  const report = levelCheck.report || {};
  const path = report.path || {};
  const blocker = report.blocker || {};
  const level = report.level || {};
  const scores = report.scores || {};
  const adminBlock = admin
    ? `<div style="margin-top:18px;padding:14px;border-radius:12px;background:#fff4e8"><strong>Lead note:</strong><p style="margin:8px 0 0">Follow up with ${escapeHtml(levelCheck.fullName)} about ${escapeHtml(path.path || levelCheck.goal)}. Main blocker: ${escapeHtml(blocker.title || "unknown")}.</p></div>`
    : "";
  return `
    <div style="font-family:Arial,sans-serif;color:#171a24;line-height:1.58;max-width:720px;margin:0 auto">
      <div style="padding:22px 0;border-bottom:1px solid #ece6dc">
        <div style="font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#8a8174">Mandrix</div>
        <h1 style="font-size:28px;margin:8px 0 4px">Chinese, decoded.</h1>
        <p style="margin:0;color:#6d6a66">Your free AI level check report</p>
      </div>
      <h2 style="font-size:22px;margin:24px 0 8px">Hi ${escapeHtml(levelCheck.fullName || "there")}, here is your initial result.</h2>
      <p>This is a short first-pass diagnosis. It is designed to show the likely blocker before you choose a course.</p>
      <div style="display:grid;gap:12px;margin:18px 0">
        <div style="padding:16px;border:1px solid #eee;border-radius:12px"><strong>Estimated level</strong><br>${escapeHtml(level.label || "Not available")}<br><span style="color:#6d6a66">${escapeHtml(level.hsk || "")}</span></div>
        <div style="padding:16px;border:1px solid #eee;border-radius:12px"><strong>Main blocker</strong><br>${escapeHtml(blocker.title || "Not available")}<br><span style="color:#6d6a66">${escapeHtml(blocker.detail || "")}</span></div>
        <div style="padding:16px;border:1px solid #eee;border-radius:12px"><strong>Recommended Mandrix path</strong><br>${escapeHtml(path.path || "Mandrix coaching")}<br><span style="color:#6d6a66">${escapeHtml(path.why || "")}</span></div>
      </div>
      <h3 style="font-size:18px;margin:22px 0 10px">Score snapshot</h3>
      <ul>
        <li>Structure awareness: ${escapeHtml(scores.structure || "-")}%</li>
        <li>Active output: ${escapeHtml(scores.output || "-")}%</li>
        <li>Speaking confidence: ${escapeHtml(scores.confidence || "-")}%</li>
        <li>Mandrix path fit: ${escapeHtml(scores.goalFit || "-")}%</li>
      </ul>
      <h3 style="font-size:18px;margin:22px 0 10px">Useful next direction</h3>
      <p>${escapeHtml(path.firstStep || "Book a Jane consultation for a line-by-line diagnosis.")}</p>
      <p style="padding:16px;border-radius:12px;background:#171a24;color:#fff">For deeper correction, book a Jane consultation. Jane can review your actual sentences line by line and turn this initial check into a precise learning plan.</p>
      ${adminBlock}
      <p style="margin-top:24px;color:#6d6a66">Mandrix | Jane Chen<br>Jane.Mandrix@outlook.com</p>
    </div>
  `;
}

export async function sendLevelCheckNotifications(levelCheck) {
  assertEmailConfigured();
  const to = cleanString(process.env.ADMIN_EMAIL) || DEFAULT_ADMIN_EMAIL;
  const from = cleanString(process.env.EMAIL_FROM) || DEFAULT_FROM_EMAIL;
  const text = levelCheckReportLines(levelCheck).join("\n");
  const html = buildLevelCheckEmailHtml(levelCheck);
  const adminHtml = buildLevelCheckEmailHtml(levelCheck, { admin: true });

  const adminResult = await sendEmail({
    from,
    to,
    subject: `AI level check lead: ${levelCheck.fullName} · ${levelCheck.report?.path?.path || levelCheck.goal}`,
    text,
    html: adminHtml,
    replyTo: levelCheck.email,
  });

  const studentResult = await sendEmail({
    from,
    to: levelCheck.email,
    subject: "Your Mandrix AI level check report",
    text,
    html,
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

export async function sendRenewalNotification(booking, renewalEmail) {
  assertEmailConfigured();
  const adminEmail = cleanString(process.env.ADMIN_EMAIL) || DEFAULT_ADMIN_EMAIL;
  const from = cleanString(process.env.EMAIL_FROM) || DEFAULT_FROM_EMAIL;
  const text = renewalEmail.text || renewalEmail.body || "";
  const studentResult = await sendEmail({
    from,
    to: booking.email,
    subject: renewalEmail.subject,
    text,
    html: buildRenewalEmailHtml(text),
    replyTo: adminEmail,
  });
  return { student: studentResult };
}
