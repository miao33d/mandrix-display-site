const SITE_URL = "https://www.mandrix.top";
const ADMIN_EMAIL = "Jane.Mandrix@outlook.com";
const FROM_EMAIL = "Mandrix <onboarding@resend.dev>";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-admin-token, authorization, x-worldfirst-signature",
};

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });
}

function text(payload, status = 200, contentType = "text/plain; charset=utf-8") {
  return new Response(payload, { status, headers: { ...CORS, "Content-Type": contentType } });
}

function clean(value) {
  return String(value || "").trim();
}

function randomId() {
  return crypto.randomUUID();
}

function amountFromCourse(course) {
  const match = clean(course).match(/\$([\d,]+(?:\.\d{1,2})?)/);
  return match ? match[1].replace(/,/g, "") : "";
}

function normalizeAmount(value) {
  const number = Number(clean(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(number) ? number.toFixed(2) : "";
}

function lessonCount(course) {
  const text = clean(course);
  const lesson = text.match(/(\d+)\s+lessons?/i);
  if (lesson) return Number(lesson[1]);
  const session = text.match(/(\d+)\s+sessions?/i);
  return session ? Number(session[1]) : 1;
}

function frequencySteps(frequency) {
  if (frequency === "twice-weekly") return [3, 4];
  if (frequency === "intensive") return [2, 2, 3];
  return [7];
}

function frequencyLabel(frequency) {
  if (frequency === "twice-weekly") return "Twice a week";
  if (frequency === "intensive") return "Three times a week";
  return "Once a week";
}

function addDays(dateValue, days) {
  const date = new Date(`${dateValue}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function buildSchedule(payload, meetingLink = "") {
  const count = lessonCount(payload.course);
  const steps = frequencySteps(payload.frequency);
  const lessons = [];
  let date = clean(payload.date);
  for (let index = 0; index < count; index += 1) {
    if (index > 0) date = addDays(date, steps[(index - 1) % steps.length]);
    lessons.push({
      lesson: index + 1,
      date,
      time: clean(payload.time),
      status: "Scheduled",
      meetingProvider: meetingLink ? "Video classroom" : "",
      meetingLink,
    });
  }
  return lessons;
}

function isGroupCourse(course) {
  return /\bGroup\b/i.test(clean(course));
}

function scheduleConflicts(rows, payload) {
  const schedule = buildSchedule(payload);
  const group = isGroupCourse(payload.course);
  const active = rows.filter((row) => !["Cancelled", "Completed"].includes(clean(row.status)));
  const conflicts = [];
  for (const lesson of schedule) {
    const rowsAtSlot = active.filter((row) => {
      const rowSchedule = parseJson(row.lesson_schedule, []);
      return rowSchedule.some((item) => item.date === lesson.date && item.time === lesson.time);
    });
    for (const row of rowsAtSlot) {
      const sameGroup = group && isGroupCourse(row.course)
        && clean(row.course) === clean(payload.course)
        && clean(row.date) === clean(payload.date)
        && clean(row.time) === clean(payload.time)
        && clean(row.frequency || "weekly") === clean(payload.frequency || "weekly");
      if (!sameGroup) conflicts.push({ date: lesson.date, time: lesson.time, course: row.course, student: row.full_name });
    }
  }
  return { schedule, conflicts };
}

function parseJson(value, fallback = null) {
  if (value == null) return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function isAdmin(request, env) {
  const token = clean(request.headers.get("x-admin-token"))
    || clean(new URL(request.url).searchParams.get("token"));
  const expected = clean(env.ADMIN_TOKEN || env.MANDRIX_ADMIN_TOKEN);
  return Boolean(expected && token === expected);
}

async function ensureDb(env) {
  const db = env.MANDRIX_DB || env.DB;
  if (!db) return null;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT,
      status TEXT,
      full_name TEXT,
      email TEXT,
      contact TEXT,
      country TEXT,
      timezone TEXT,
      level TEXT,
      course TEXT,
      booking_type TEXT,
      date TEXT,
      time TEXT,
      frequency TEXT,
      frequency_label TEXT,
      lesson_count INTEGER,
      lesson_schedule TEXT,
      payment TEXT,
      payment_provider TEXT,
      payment_reference TEXT,
      amount TEXT,
      goal TEXT,
      notes TEXT,
      meeting_link TEXT,
      teacher_notes TEXT
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS level_checks (
      id TEXT PRIMARY KEY,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      status TEXT,
      full_name TEXT,
      email TEXT,
      contact TEXT,
      goal TEXT,
      background TEXT,
      confidence TEXT,
      recognition TEXT,
      word_order TEXT,
      grammar TEXT,
      scenario TEXT,
      blocker TEXT,
      sample TEXT,
      report TEXT
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      event_type TEXT,
      path TEXT,
      page_title TEXT,
      referrer TEXT,
      session_id TEXT,
      metadata TEXT
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS payment_orders (
      id TEXT PRIMARY KEY,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      provider TEXT,
      order_id TEXT,
      email TEXT,
      amount TEXT,
      course TEXT,
      raw_payload TEXT,
      status TEXT
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS seo_pages (
      id TEXT PRIMARY KEY,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT,
      status TEXT,
      category TEXT,
      slug TEXT,
      title TEXT,
      description TEXT,
      excerpt TEXT,
      image TEXT,
      image_alt TEXT,
      payload TEXT,
      UNIQUE(category, slug)
    )`),
  ]);
  return db;
}

async function listBookingRows(env) {
  const db = await ensureDb(env);
  if (!db) return [];
  const result = await db.prepare("SELECT * FROM bookings ORDER BY date ASC, time ASC, created_at ASC").all();
  return result.results || [];
}

function bookingToClient(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    fullName: row.full_name,
    email: row.email,
    contact: row.contact,
    country: row.country,
    timezone: row.timezone,
    level: row.level,
    course: row.course,
    bookingType: row.booking_type,
    date: row.date,
    time: row.time,
    frequency: row.frequency,
    frequencyLabel: row.frequency_label,
    lessonCount: row.lesson_count,
    lessonSchedule: parseJson(row.lesson_schedule, []),
    payment: row.payment,
    paymentProvider: row.payment_provider,
    paymentReference: row.payment_reference,
    amount: row.amount,
    goal: row.goal,
    notes: row.notes,
    meetingLink: row.meeting_link,
    teacherNotes: row.teacher_notes,
  };
}

async function sendEmail(env, { to, subject, text: bodyText, html, replyTo, attachments }) {
  if (!env.RESEND_API_KEY) return { ok: false, skipped: true, error: "RESEND_API_KEY is not configured." };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM || FROM_EMAIL,
      to,
      subject,
      text: bodyText,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
      ...(attachments?.length ? { attachments } : {}),
    }),
  });
  const data = await response.json().catch(() => ({}));
  return response.ok ? { ok: true, to, id: data.id } : { ok: false, to, error: data.message || data.error || "Email failed." };
}

function escapeHtml(value) {
  return clean(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function pct(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0%";
  return `${Math.max(0, Math.min(100, Math.round(number)))}%`;
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function levelCheckReportText(payload) {
  const report = payload.report || {};
  const evidence = Array.isArray(report.evidence) ? report.evidence : [];
  const hasAudio = Boolean(payload.audioSample?.content);
  const voice = report.voiceAnalysis || {};
  const voiceIssues = Array.isArray(voice.specificIssues) ? voice.specificIssues : [];
  const voiceDimensions = Array.isArray(voice.dimensions) ? voice.dimensions : [];
  return [
    "Mandrix Free AI Level Check",
    "",
    `Name: ${clean(payload.fullName)}`,
    `Email: ${clean(payload.email)}`,
    `Goal: ${clean(payload.goal)}`,
    `Estimated level: ${clean(report.level?.label)}`,
    `HSK range: ${clean(report.level?.hsk)}`,
    `Main blocker: ${clean(report.blocker?.title)}`,
    `Recommended path: ${clean(report.path?.path)}`,
    `Voice sample: ${hasAudio ? "Attached to this email" : "Not included"}`,
    voice.transcript ? `Voice transcript: ${clean(voice.transcript)}` : "",
    voice.primaryBottleneck ? `Voice bottleneck: ${clean(voice.primaryBottleneck)}` : "",
    voice.summary ? `Voice analysis: ${clean(voice.summary)}` : "",
    ...voiceDimensions.map((item) => `Voice dimension - ${clean(item.label)}: ${clean(item.finding)} Evidence: ${clean(item.evidence)} Implication: ${clean(item.implication)}`),
    ...voiceIssues.map((item, index) => `Voice issue ${index + 1}: ${clean(item.issue)} | You said: ${clean(item.quote)} | Better: ${clean(item.betterVersion)} | ${clean(item.diagnosis)}`),
    "",
    "Operating pattern:",
    clean(report.automationGap),
    clean(report.grammarNote),
    clean(report.scenarioNote),
    "",
    "Evidence:",
    ...evidence.map((item, index) => `${index + 1}. ${clean(item.title)} - ${clean(item.detail)}`),
    "",
    "Student output sample:",
    clean(payload.sample) || "None",
  ].join("\n");
}

function levelCheckReportHtml(payload, { admin = false } = {}) {
  const report = payload.report || {};
  const scores = report.scores || {};
  const evidence = Array.isArray(report.evidence) ? report.evidence : [];
  const hasAudio = Boolean(payload.audioSample?.content);
  const voice = report.voiceAnalysis || {};
  const voiceIssues = Array.isArray(voice.specificIssues) ? voice.specificIssues : [];
  const voiceDimensions = Array.isArray(voice.dimensions) ? voice.dimensions : [];
  const voiceDimensionsHtml = voiceDimensions.map((item) => `
    <div style="padding:14px;border:1px solid #d8e5f4;border-radius:12px;background:#ffffff;margin-top:10px;">
      <div style="color:#2f55d4;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">${escapeHtml(item.label || "Diagnostic dimension")}</div>
      <p style="margin:8px 0 0;color:#172033;font-size:14px;line-height:1.6;"><strong>Finding:</strong> ${escapeHtml(item.finding || "")}</p>
      ${item.evidence ? `<p style="margin:6px 0 0;color:#5b6475;font-size:14px;line-height:1.6;"><strong>Evidence:</strong> ${escapeHtml(item.evidence)}</p>` : ""}
      ${item.implication ? `<p style="margin:6px 0 0;color:#5b6475;font-size:14px;line-height:1.6;"><strong>What it means:</strong> ${escapeHtml(item.implication)}</p>` : ""}
    </div>
  `).join("");
  const voiceIssuesHtml = voiceIssues.map((item) => `
    <div style="padding:14px;border:1px solid #d8e5f4;border-radius:12px;background:#ffffff;margin-top:10px;">
      <div style="color:#2f55d4;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">Voice evidence</div>
      <div style="margin-top:8px;color:#172033;font-size:15px;font-weight:800;">${escapeHtml(item.issue || "Speaking pattern")}</div>
      ${item.quote ? `<p style="margin:8px 0 0;color:#5b6475;font-size:14px;line-height:1.6;"><strong>You said:</strong> ${escapeHtml(item.quote)}</p>` : ""}
      ${item.betterVersion ? `<p style="margin:6px 0 0;color:#5b6475;font-size:14px;line-height:1.6;"><strong>More natural:</strong> ${escapeHtml(item.betterVersion)}</p>` : ""}
      <p style="margin:6px 0 0;color:#5b6475;font-size:14px;line-height:1.6;">${escapeHtml(item.diagnosis || "")}</p>
    </div>
  `).join("");
  const scoreRows = [
    ["Structure awareness", scores.structure],
    ["Comprehension", scores.comprehension],
    ["Real communication", scores.communication],
    ["Active output", scores.output],
    ["Speaking confidence", scores.confidence],
    ["Mandrix path fit", scores.goalFit],
  ].map(([label, value]) => `
    <tr>
      <td style="padding:10px 0;color:#5b6475;font-size:14px;">${escapeHtml(label)}</td>
      <td style="padding:10px 0;text-align:right;color:#172033;font-weight:700;">${pct(value)}</td>
    </tr>
  `).join("");
  const evidenceCards = evidence.map((item, index) => `
    <div style="padding:16px;border:1px solid #e7ebf2;border-radius:14px;background:#ffffff;margin-top:12px;">
      <div style="color:#c06335;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;">Evidence ${index + 1}</div>
      <div style="margin-top:8px;color:#172033;font-size:17px;font-weight:700;line-height:1.3;">${escapeHtml(item.title)}</div>
      <p style="margin:8px 0 0;color:#5b6475;font-size:14px;line-height:1.65;">${escapeHtml(item.detail)}</p>
    </div>
  `).join("");
  const sampleBlock = admin ? `
    <div style="margin-top:18px;padding:16px;border-radius:14px;background:#fff8f2;border:1px solid #f0d3bf;">
      <div style="color:#8a4b2a;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">Student output sample</div>
      <p style="margin:8px 0 0;color:#172033;font-size:14px;line-height:1.65;white-space:pre-wrap;">${escapeHtml(payload.sample || "None")}</p>
    </div>
  ` : "";
  const costlyErrors = [];
  if (clean(report.blocker?.title).includes("Translation")) costlyErrors.push("You are converting too much of Chinese through English before speaking.");
  if (clean(report.blocker?.title).includes("Sentence order")) costlyErrors.push("Your sentence frames are not stable enough to produce under pressure.");
  if (clean(report.blocker?.title).toLowerCase().includes("grammar")) costlyErrors.push("Grammar feels like separate facts instead of reusable patterns.");
  if (voice.primaryBottleneck) costlyErrors.push(clean(voice.primaryBottleneck));
  const costlyErrorHtml = costlyErrors.slice(0, 3).length
    ? `<ol style="margin:10px 0 0;padding-left:20px;color:#172033;font-size:14px;line-height:1.7;">${costlyErrors.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`
    : `<p style="margin:8px 0 0;color:#5b6475;font-size:14px;line-height:1.65;">Your answers do not show a single dramatic breakdown. The real issue is that several smaller gaps are slowing retrieval.</p>`;
  const cta = admin ? `
    <p style="margin:18px 0 0;color:#5b6475;font-size:14px;line-height:1.65;">Reply directly to this email to follow up with the learner.</p>
  ` : `
    <div style="margin-top:22px;padding:18px;border-radius:16px;background:#172033;color:#ffffff;">
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.64);">Your conversion point</div>
      <div style="margin-top:8px;font-size:22px;font-weight:800;line-height:1.25;">Book a short review with Jane</div>
      <p style="margin:10px 0 0;color:rgba(255,255,255,.8);font-size:14px;line-height:1.65;">This free report shows where the pattern is likely breaking. The Jane review is where the diagnosis becomes usable.</p>
      <div style="margin-top:14px;padding:14px;border:1px solid rgba(255,255,255,.18);border-radius:12px;background:rgba(255,255,255,.06);">
        <div style="font-size:14px;font-weight:800;">What Jane will do in the review</div>
        <ul style="margin:8px 0 0;padding-left:18px;color:rgba(255,255,255,.78);font-size:14px;line-height:1.7;">
          <li>Review your exact answers and optional voice sample.</li>
          <li>Identify the one pattern currently costing you the most progress.</li>
          <li>Show how to fix it through a 30-day structure-first plan.</li>
          <li>Recommend the right Mandrix path only if it fits your goal.</li>
        </ul>
      </div>
      <p style="margin:14px 0 14px;color:rgba(255,255,255,.72);font-size:14px;line-height:1.65;">Likely path after review: <strong style="color:#ffffff;">${escapeHtml(report.path?.path || "Mandrix structured coaching")}</strong>.</p>
      <a href="https://www.mandrix.top/booking" style="display:inline-block;padding:12px 16px;border-radius:10px;background:#ffffff;color:#172033;text-decoration:none;font-weight:750;">Book Jane Review</a>
    </div>
  `;
  return `
  <div style="margin:0;padding:28px;background:#f5f7fb;font-family:Inter,Arial,sans-serif;color:#172033;">
    <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e7ebf2;border-radius:22px;overflow:hidden;">
      <div style="padding:28px 28px 22px;border-bottom:1px solid #edf0f5;">
        <div style="color:#788196;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;">Mandrix · Chinese, decoded.</div>
        <h1 style="margin:10px 0 0;font-size:30px;line-height:1.12;letter-spacing:0;">${admin ? "New level check lead" : "Your Chinese bottleneck report"}</h1>
        <p style="margin:12px 0 0;color:#5b6475;font-size:15px;line-height:1.65;">This is an initial AI-assisted diagnosis based on automation, English transfer, sentence chunking, and real output evidence.</p>
      </div>
      <div style="padding:26px 28px;">
        <div style="display:grid;gap:12px;">
          <div style="padding:16px;border-radius:14px;background:#f7f9fd;border:1px solid #edf0f5;">
            <div style="color:#788196;font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;">Estimated level</div>
            <div style="margin-top:6px;font-size:22px;font-weight:800;">${escapeHtml(report.level?.label || "Pending")}</div>
            <div style="margin-top:4px;color:#5b6475;font-size:14px;">${escapeHtml(report.level?.hsk || "")}</div>
          </div>
          <div style="padding:16px;border-radius:14px;background:#f7f9fd;border:1px solid #edf0f5;">
            <div style="color:#788196;font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;">Main blocker</div>
            <div style="margin-top:6px;font-size:20px;font-weight:800;">${escapeHtml(report.blocker?.title || "")}</div>
            <p style="margin:6px 0 0;color:#5b6475;font-size:14px;line-height:1.65;">${escapeHtml(report.blocker?.detail || "")}</p>
          </div>
          <div style="padding:16px;border-radius:14px;background:#f7f9fd;border:1px solid #edf0f5;">
            <div style="color:#788196;font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;">Recommended path</div>
            <div style="margin-top:6px;font-size:20px;font-weight:800;">${escapeHtml(report.path?.path || "")}</div>
            <p style="margin:6px 0 0;color:#5b6475;font-size:14px;line-height:1.65;">${escapeHtml(report.path?.why || "")}</p>
          </div>
        </div>
        <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:20px;border-top:1px solid #edf0f5;border-bottom:1px solid #edf0f5;">
          ${scoreRows}
        </table>
        <div style="margin-top:20px;padding:18px;border-radius:16px;background:#fbfcff;border:1px solid #edf0f5;">
          <div style="font-size:18px;font-weight:800;">Your real operating pattern</div>
          <p style="margin:10px 0 0;color:#5b6475;font-size:14px;line-height:1.65;">${escapeHtml(report.automationGap || "")}</p>
          <p style="margin:8px 0 0;color:#5b6475;font-size:14px;line-height:1.65;">${escapeHtml(report.grammarNote || "")}</p>
          <p style="margin:8px 0 0;color:#5b6475;font-size:14px;line-height:1.65;">${escapeHtml(report.scenarioNote || "")}</p>
        </div>
        ${evidenceCards}
        <div style="margin-top:18px;padding:16px;border-radius:14px;background:#f7f9fd;border:1px solid #edf0f5;">
          <div style="color:#788196;font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;">30-day direction</div>
          <p style="margin:8px 0 0;color:#172033;font-size:15px;line-height:1.65;">${escapeHtml(report.path?.firstStep || "")}</p>
        </div>
        ${hasAudio ? `<div style="margin-top:18px;padding:16px;border-radius:14px;background:#f1fbf8;border:1px solid #cfeee5;"><div style="color:#177a62;font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;">Spoken sample included</div><p style="margin:8px 0 0;color:#172033;font-size:14px;line-height:1.65;">The optional voice sample is attached to this email for review. Mandrix does not store the audio file on the website.</p></div>` : ""}
        ${voice.summary || voice.transcript ? `<div style="margin-top:18px;padding:16px;border-radius:14px;background:#f6f9ff;border:1px solid #d8e5f4;"><div style="color:#2f55d4;font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;">Spoken output analysis</div>${voice.transcript ? `<p style="margin:8px 0 0;color:#172033;font-size:14px;line-height:1.65;"><strong>Transcript:</strong> ${escapeHtml(voice.transcript)}</p>` : ""}${voice.primaryBottleneck ? `<p style="margin:8px 0 0;color:#172033;font-size:15px;line-height:1.65;"><strong>Primary bottleneck:</strong> ${escapeHtml(voice.primaryBottleneck)}</p>` : ""}<p style="margin:8px 0 0;color:#172033;font-size:14px;line-height:1.65;">${escapeHtml(voice.summary || "")}</p>${voice.fluencySignal ? `<p style="margin:8px 0 0;color:#5b6475;font-size:14px;line-height:1.65;"><strong>Fluency signal:</strong> ${escapeHtml(voice.fluencySignal)}</p>` : ""}${voiceDimensionsHtml}${voiceIssuesHtml}${voice.betterVersion ? `<p style="margin:10px 0 0;color:#172033;font-size:14px;line-height:1.65;"><strong>Suggested polished version:</strong> ${escapeHtml(voice.betterVersion)}</p>` : ""}${voice.nextStep ? `<p style="margin:8px 0 0;color:#172033;font-size:14px;line-height:1.65;"><strong>Training focus:</strong> ${escapeHtml(voice.nextStep)}</p>` : ""}${voice.conversionBridge ? `<p style="margin:8px 0 0;color:#5b6475;font-size:14px;line-height:1.65;">${escapeHtml(voice.conversionBridge)}</p>` : ""}${admin && voice.adminNote ? `<p style="margin:8px 0 0;color:#8a4b2a;font-size:13px;line-height:1.6;"><strong>Admin note:</strong> ${escapeHtml(voice.adminNote)}</p>` : ""}</div>` : ""}
        <div style="margin-top:18px;padding:16px;border-radius:14px;background:#fff8f2;border:1px solid #f0d3bf;">
          <div style="color:#8a4b2a;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">The expensive mistakes</div>
          ${costlyErrorHtml}
          <p style="margin:10px 0 0;color:#5b6475;font-size:14px;line-height:1.65;">These are the mistakes that usually keep adult learners stuck even when they keep studying vocabulary.</p>
        </div>
        ${sampleBlock}
        ${cta}
      </div>
    </div>
  </div>`;
}

function levelCheckAudioAttachments(payload) {
  const audio = payload.audioSample || {};
  if (!audio.content) return [];
  const size = Number(audio.size || 0);
  const maxBytes = 4 * 1024 * 1024;
  if (!Number.isFinite(size) || size <= 0 || size > maxBytes) return [];
  const filename = clean(audio.filename || "mandrix-speaking-sample.webm").replace(/[^a-zA-Z0-9._-]/g, "-");
  const content = String(audio.content || "").replace(/^data:[^,]+,/, "");
  if (!/^[a-zA-Z0-9+/=]+$/.test(content)) return [];
  return [{ filename, content }];
}

async function transcribeLevelCheckAudio(env, payload) {
  if (!env.OPENAI_API_KEY) return null;
  const audio = payload.audioSample || {};
  const attachments = levelCheckAudioAttachments(payload);
  if (!attachments.length) return null;
  const attachment = attachments[0];
  const type = clean(audio.type) || "audio/webm";
  const form = new FormData();
  form.append("model", env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe");
  form.append("file", new File([base64ToBytes(attachment.content)], attachment.filename, { type }));
  form.append("prompt", "Mandrix Chinese diagnostic sample. The learner may speak Mandarin, pinyin, English, or mixed Chinese-English about price negotiation, Chinese learning, work, or daily communication.");
  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` },
    body: form,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || "Voice transcription failed.");
  return clean(data.text || data.transcript || "");
}

function fallbackVoiceAnalysis(message) {
  return {
    status: "manual_review",
    summary: "Your spoken sample was received. Jane can review it manually to check fluency, hesitation, sentence assembly, and business tone.",
    adminNote: message || "Automatic voice analysis is not available. Review the attached audio manually.",
    transcript: "",
    fluencySignal: "",
    specificIssues: [],
  };
}

async function analyzeLevelCheckVoice(env, payload, transcript) {
  if (!env.OPENAI_API_KEY || !transcript) return null;
  const report = payload.report || {};
  const context = {
    goal: payload.goal,
    background: payload.background,
    confidence: payload.confidence,
    blocker: payload.blocker,
    writtenSample: payload.sample,
    estimatedLevel: report.level?.label,
    recommendedPath: report.path?.path,
    transcript,
  };
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENAI_TEXT_MODEL || "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: [
            "You are Mandrix's expert diagnostic assistant for adult learners of Mandarin Chinese.",
            "Analyze the spoken transcript as second-language output evidence.",
            "This must feel like a premium diagnostic report, not generic quiz feedback.",
            "Separate what you can infer from transcript text from what requires human listening.",
            "Assess grammar/syntax, word order, vocabulary choice, pragmatic tone, sentence chunking, English transfer, and fluency/retrieval signals visible from transcript structure.",
            "Mention pronunciation only as a limitation unless the transcript explicitly includes pronunciation notes.",
            "Return only valid JSON with keys: summary, primaryBottleneck, fluencySignal, dimensions, specificIssues, betterVersion, nextStep, conversionBridge.",
            "dimensions must be 4-6 objects with keys: label, finding, evidence, implication. Include labels such as Grammar & syntax, Word order, Vocabulary choice, Pragmatic tone, Chunking, Fluency/retrieval.",
            "specificIssues must be an array of 1-3 objects with keys: quote, issue, betterVersion, diagnosis.",
            "betterVersion should be one polished Chinese version suited to the learner's scenario, with pinyin only if the transcript used pinyin.",
            "nextStep should name one concrete Mandrix training focus.",
            "conversionBridge should naturally invite a Jane review without sounding pushy.",
            "Use clear English. Be specific, high-end, adult, and commercially useful.",
          ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify(context),
        },
      ],
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || "Voice analysis failed.");
  const raw = data.choices?.[0]?.message?.content || "{}";
  let parsed = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = { summary: clean(raw), specificIssues: [] };
  }
  return {
    status: "analyzed",
    transcript,
    summary: clean(parsed.summary),
    primaryBottleneck: clean(parsed.primaryBottleneck),
    fluencySignal: clean(parsed.fluencySignal),
    dimensions: Array.isArray(parsed.dimensions)
      ? parsed.dimensions.slice(0, 6).map((item) => ({
        label: clean(item.label),
        finding: clean(item.finding),
        evidence: clean(item.evidence),
        implication: clean(item.implication),
      }))
      : [],
    specificIssues: Array.isArray(parsed.specificIssues)
      ? parsed.specificIssues.slice(0, 3).map((item) => ({
        quote: clean(item.quote),
        issue: clean(item.issue),
        betterVersion: clean(item.betterVersion),
        diagnosis: clean(item.diagnosis),
      }))
      : [],
    betterVersion: clean(parsed.betterVersion),
    nextStep: clean(parsed.nextStep),
    conversionBridge: clean(parsed.conversionBridge),
  };
}

async function buildVoiceAnalysis(env, payload) {
  if (!payload.audioSample?.content) return null;
  if (!env.OPENAI_API_KEY) return fallbackVoiceAnalysis("OpenAI API key is not configured. Automatic transcription and voice analysis were skipped.");
  try {
    const transcript = await transcribeLevelCheckAudio(env, payload);
    if (!transcript) return fallbackVoiceAnalysis("The spoken sample was attached, but the transcript came back empty. Jane can still review the audio manually.");
    return await analyzeLevelCheckVoice(env, payload, transcript);
  } catch (error) {
    return fallbackVoiceAnalysis(`The spoken sample was attached. Automatic voice analysis could not complete: ${clean(error.message)}`);
  }
}

function scheduleText(schedule) {
  if (!Array.isArray(schedule) || !schedule.length) return "None";
  return schedule.map((lesson) => {
    const provider = clean(lesson.meetingProvider) || "Video classroom";
    const meet = lesson.meetingLink ? ` · ${provider}: ${lesson.meetingLink}` : "";
    return `Lesson ${lesson.lesson}: ${lesson.date} · ${lesson.time} Beijing Time${meet}`;
  }).join("\n");
}

function createVideoClassroomLink(env, booking, lesson) {
  const base = clean(env.VIDEO_ROOM_BASE_URL) || "https://meet.jit.si";
  const safeBase = base.replace(/\/+$/, "");
  const dateCode = clean(lesson.date).replaceAll("-", "") || "date";
  const timeCode = (clean(lesson.time).split(" - ")[0] || "class").replace(/[^\dA-Za-z]/g, "") || "class";
  const seed = [
    "Mandrix",
    dateCode,
    timeCode,
    booking.id.slice(0, 8),
    `L${lesson.lesson}`,
  ].join("-");
  return `${safeBase}/${encodeURIComponent(seed)}`;
}

async function createGoogleMeetEvent(env, booking, lesson) {
  const token = await googleAccessToken(env);
  const start = beijingDateTimeToIso(lesson.date, lesson.time);
  const end = new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString();
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(env.GOOGLE_CALENDAR_ID)}/events?conferenceDataVersion=1&sendUpdates=none`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: `Mandrix Lesson ${lesson.lesson} · ${booking.course}`,
      description: `Student: ${booking.fullName}\nEmail: ${booking.email}\nPayment reference: ${booking.paymentReference}\nLesson: ${lesson.lesson}/${booking.lessonCount}`,
      start: { dateTime: start, timeZone: "Asia/Shanghai" },
      end: { dateTime: end, timeZone: "Asia/Shanghai" },
      attendees: [{ email: booking.email }],
      conferenceData: { createRequest: { requestId: `${booking.id}-${lesson.lesson}`, conferenceSolutionKey: { type: "hangoutsMeet" } } },
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || "Google Calendar event failed.");
  return data.hangoutLink || data.conferenceData?.entryPoints?.find((item) => item.entryPointType === "video")?.uri || "";
}

async function createGoogleMeetSchedule(env, booking, schedule) {
  if (!env.GOOGLE_CLIENT_EMAIL || !env.GOOGLE_PRIVATE_KEY || !env.GOOGLE_CALENDAR_ID) {
    return schedule.map((lesson) => ({
      ...lesson,
      meetingProvider: "Video classroom",
      meetingLink: createVideoClassroomLink(env, booking, lesson),
    }));
  }
  const lessons = [];
  for (const lesson of schedule) {
    const meetingLink = await createGoogleMeetEvent(env, booking, lesson);
    lessons.push({ ...lesson, meetingProvider: "Google Meet", meetingLink });
  }
  return lessons;
}

function beijingDateTimeToIso(date, time) {
  const startTime = clean(time).split(" - ")[0] || "09:00";
  return `${date}T${startTime}:00+08:00`;
}

async function googleAccessToken(env) {
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const claim = base64Url(JSON.stringify({
    iss: env.GOOGLE_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/calendar.events",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  }));
  const key = await importPrivateKey(env.GOOGLE_PRIVATE_KEY);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${claim}`));
  const jwt = `${header}.${claim}.${base64Url(signature)}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || "Google auth failed.");
  return data.access_token;
}

function base64Url(input) {
  const bytes = input instanceof ArrayBuffer ? new Uint8Array(input) : new TextEncoder().encode(String(input));
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function importPrivateKey(pem) {
  const normalized = clean(pem).replaceAll("\\n", "\n");
  const body = normalized.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return crypto.subtle.importKey("pkcs8", bytes, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
}

async function handleAvailability(request, env) {
  const url = new URL(request.url);
  const payload = Object.fromEntries(url.searchParams.entries());
  if (!payload.course || !payload.date || !payload.time) return json({ ok: false, pending: true, message: "Choose a course, date, and time to check availability." });
  const rows = await listBookingRows(env);
  const { schedule, conflicts } = scheduleConflicts(rows, payload);
  return json({
    ok: conflicts.length === 0,
    type: isGroupCourse(payload.course) ? "group" : "one-on-one",
    schedule,
    lessonCount: schedule.length,
    conflicts,
    message: conflicts.length ? "This time is already booked. Please choose another slot." : "This time is available.",
  });
}

async function handleBookings(request, env) {
  const db = await ensureDb(env);
  if (!db) return json({ error: "Cloudflare D1 binding MANDRIX_DB is not configured." }, 500);
  if (request.method === "GET") {
    if (!isAdmin(request, env)) return json({ error: "Admin password required" }, 401);
    const rows = await listBookingRows(env);
    return json({ bookings: rows.map(bookingToClient) });
  }
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const payload = await request.json();
  const required = ["fullName", "email", "contact", "country", "timezone", "level", "course", "date", "time", "frequency", "goal", "paymentReference"];
  const missing = required.filter((field) => !clean(payload[field]));
  if (missing.length) return json({ error: `Missing required fields: ${missing.join(", ")}` }, 400);

  const rows = await listBookingRows(env);
  const { schedule, conflicts } = scheduleConflicts(rows, payload);
  if (conflicts.length) return json({ error: "This time is already booked. Please choose another slot.", availability: { ok: false, conflicts } }, 409);

  const paymentProvider = clean(payload.paymentProvider || "PayPal");
  const expectedAmount = normalizeAmount(clean(payload.amount) || amountFromCourse(payload.course));
  if (/paypal/i.test(paymentProvider)) {
    const payment = await db.prepare("SELECT * FROM payment_orders WHERE provider = ? AND order_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1")
      .bind("PayPal", clean(payload.paymentReference), "COMPLETED").first();
    const fallbackPayment = payment || await db.prepare("SELECT * FROM payment_orders WHERE provider = ? AND order_id = ? ORDER BY created_at DESC LIMIT 1")
      .bind("PayPal", clean(payload.paymentReference)).first();
    if (!fallbackPayment || clean(fallbackPayment.status).toUpperCase() !== "COMPLETED") {
      return json({ error: "PayPal payment has not been confirmed. Please complete PayPal checkout first." }, 402);
    }
    if (expectedAmount && normalizeAmount(fallbackPayment.amount) !== expectedAmount) {
      return json({ error: "PayPal payment amount does not match the selected course." }, 402);
    }
  }

  const booking = {
    id: randomId(),
    status: "New",
    fullName: clean(payload.fullName),
    email: clean(payload.email),
    contact: clean(payload.contact),
    country: clean(payload.country),
    timezone: clean(payload.timezone),
    level: clean(payload.level),
    course: clean(payload.course),
    bookingType: isGroupCourse(payload.course) ? "group" : "one-on-one",
    date: clean(payload.date),
    time: clean(payload.time),
    frequency: clean(payload.frequency || "weekly"),
    frequencyLabel: frequencyLabel(payload.frequency || "weekly"),
    lessonCount: schedule.length,
    payment: /paypal/i.test(paymentProvider) ? "PayPal payment confirmed" : "Payment reference received",
    paymentProvider: paymentProvider || "PayPal",
    paymentReference: clean(payload.paymentReference),
    amount: clean(payload.amount) || amountFromCourse(payload.course),
    goal: clean(payload.goal),
    notes: clean(payload.notes),
    meetingLink: "",
  };
  booking.lessonSchedule = await createGoogleMeetSchedule(env, booking, schedule).catch((error) => {
    booking.teacherNotes = `Google Meet creation failed, fallback video classroom links were generated: ${error.message}`;
    return schedule.map((lesson) => ({
      ...lesson,
      meetingProvider: "Video classroom",
      meetingLink: createVideoClassroomLink(env, booking, lesson),
    }));
  });
  booking.meetingLink = booking.lessonSchedule.find((lesson) => clean(lesson.meetingLink))?.meetingLink || "";

  await db.prepare(`INSERT INTO bookings (
    id,status,full_name,email,contact,country,timezone,level,course,booking_type,date,time,frequency,frequency_label,
    lesson_count,lesson_schedule,payment,payment_provider,payment_reference,amount,goal,notes,meeting_link,teacher_notes
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
    booking.id, booking.status, booking.fullName, booking.email, booking.contact, booking.country, booking.timezone,
    booking.level, booking.course, booking.bookingType, booking.date, booking.time, booking.frequency, booking.frequencyLabel,
    booking.lessonCount, JSON.stringify(booking.lessonSchedule), booking.payment, booking.paymentProvider, booking.paymentReference,
    booking.amount, booking.goal, booking.notes, booking.meetingLink, booking.teacherNotes || "",
  ).run();

  const emailResults = await sendBookingEmails(env, booking);
  return json({ booking, emailSent: Boolean(emailResults.admin?.ok && emailResults.student?.ok), emailResults }, 201);
}

async function sendBookingEmails(env, booking) {
  const schedule = scheduleText(booking.lessonSchedule);
  const adminText = [
    "New Mandrix booking",
    `Name: ${booking.fullName}`,
    `Email: ${booking.email}`,
    `Contact: ${booking.contact}`,
    `Course: ${booking.course}`,
    `Amount: $${booking.amount}`,
    `${booking.paymentProvider} reference: ${booking.paymentReference}`,
    `Video classroom: ${booking.meetingLink || "Not configured"}`,
    "",
    schedule,
    "",
    `Goal: ${booking.goal}`,
    `Notes: ${booking.notes || "None"}`,
  ].join("\n");
  const studentText = [
    `Hi ${booking.fullName},`,
    "",
    "Your Mandrix booking has been received and your class schedule has been generated.",
    `Course: ${booking.course}`,
    `Amount: $${booking.amount}`,
    `${booking.paymentProvider} reference: ${booking.paymentReference}`,
    booking.meetingLink ? `Video classroom: ${booking.meetingLink}` : "Video classroom: Jane will confirm the class link by email.",
    "",
    schedule,
    "",
    "Please join on time and keep this email as your booking record.",
    "Mandrix",
  ].join("\n");
  const to = clean(env.ADMIN_EMAIL) || ADMIN_EMAIL;
  const admin = await sendEmail(env, { to, subject: `Mandrix booking: ${booking.fullName} · $${booking.amount}`, text: adminText, html: `<pre>${escapeHtml(adminText)}</pre>`, replyTo: booking.email });
  const student = await sendEmail(env, { to: booking.email, subject: "Your Mandrix schedule is confirmed", text: studentText, html: `<pre>${escapeHtml(studentText)}</pre>`, replyTo: to });
  return { admin, student };
}

async function handleLevelCheck(request, env) {
  const db = await ensureDb(env);
  if (!db) return json({ error: "Cloudflare D1 binding MANDRIX_DB is not configured." }, 500);
  if (request.method === "GET") {
    if (!isAdmin(request, env)) return json({ error: "Admin password required" }, 401);
    const rows = await db.prepare("SELECT * FROM level_checks ORDER BY created_at DESC LIMIT 500").all();
    return json({ levelChecks: rows.results || [] });
  }
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const payload = await request.json();
  const id = randomId();
  const audioAttachments = levelCheckAudioAttachments(payload);
  const voiceAnalysis = await buildVoiceAnalysis(env, payload);
  const reportForStorage = {
    ...(payload.report || {}),
    voiceSampleAttached: audioAttachments.length > 0,
    ...(voiceAnalysis ? { voiceAnalysis } : {}),
  };
  await db.prepare(`INSERT INTO level_checks (
    id,status,full_name,email,contact,goal,background,confidence,recognition,word_order,grammar,scenario,blocker,sample,report
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
    id, "New", clean(payload.fullName), clean(payload.email), clean(payload.contact), clean(payload.goal), clean(payload.background),
    clean(payload.confidence), clean(payload.recognition), clean(payload.wordOrder), clean(payload.grammar), clean(payload.scenario),
    clean(payload.blocker), clean(payload.sample), JSON.stringify(reportForStorage),
  ).run();
  payload.report = reportForStorage;
  const reportText = levelCheckReportText(payload);
  const adminTo = clean(env.ADMIN_EMAIL) || ADMIN_EMAIL;
  const admin = await sendEmail(env, {
    to: adminTo,
    subject: `Free level check: ${clean(payload.fullName)}`,
    text: reportText,
    html: levelCheckReportHtml(payload, { admin: true }),
    replyTo: payload.email,
    attachments: audioAttachments,
  });
  const student = await sendEmail(env, {
    to: payload.email,
    subject: "Your Mandrix Chinese Diagnostic Report",
    text: reportText,
    html: levelCheckReportHtml(payload),
    replyTo: adminTo,
    attachments: audioAttachments,
  });
  const { audioSample, ...safePayload } = payload;
  const responseReport = JSON.parse(JSON.stringify(safePayload.report || {}));
  if (responseReport.voiceAnalysis?.adminNote) delete responseReport.voiceAnalysis.adminNote;
  return json({ levelCheck: { id, ...safePayload, report: responseReport, status: "New", voiceSampleAttached: audioAttachments.length > 0 }, saved: true, emailSent: Boolean(admin.ok && student.ok), emailResults: { admin, student } }, 201);
}

async function handleAnalytics(request, env) {
  const db = await ensureDb(env);
  if (!db) return json({ ok: true, skipped: true });
  if (request.method === "POST") {
    const payload = await request.json().catch(() => ({}));
    await db.prepare("INSERT INTO analytics_events (id,event_type,path,page_title,referrer,session_id,metadata) VALUES (?,?,?,?,?,?,?)")
      .bind(randomId(), clean(payload.eventType || payload.type), clean(payload.path), clean(payload.pageTitle || payload.title), clean(payload.referrer), clean(payload.sessionId), JSON.stringify(payload.metadata || {})).run();
    return json({ ok: true }, 201);
  }
  if (!isAdmin(request, env)) return json({ error: "Admin password required" }, 401);
  const rows = await db.prepare("SELECT * FROM analytics_events ORDER BY created_at DESC LIMIT 1000").all();
  return json({ events: rows.results || [], totals: { events: rows.results?.length || 0 } });
}

async function handleBookingUpdate(request, env) {
  const db = await ensureDb(env);
  if (!db) return json({ error: "Cloudflare D1 binding MANDRIX_DB is not configured." }, 500);
  if (!isAdmin(request, env)) return json({ error: "Admin password required" }, 401);
  const url = new URL(request.url);
  const id = clean(url.searchParams.get("id"));
  if (!id) return json({ error: "Booking id required" }, 400);
  if (request.method === "DELETE") {
    await db.prepare("DELETE FROM bookings WHERE id = ?").bind(id).run();
    return json({ ok: true, deletedId: id });
  }
  if (request.method !== "PATCH") return json({ error: "Method not allowed" }, 405);
  const payload = await request.json().catch(() => ({}));
  const current = await db.prepare("SELECT * FROM bookings WHERE id = ?").bind(id).first();
  if (!current) return json({ error: "Booking not found" }, 404);
  const meetingLink = clean(payload.meetingLink || current.meeting_link);
  let schedule = parseJson(current.lesson_schedule, []);
  if (meetingLink) schedule = schedule.map((lesson) => ({ ...lesson, meetingProvider: "Video classroom", meetingLink }));
  await db.prepare(`UPDATE bookings SET
    status = COALESCE(?, status),
    payment = COALESCE(?, payment),
    meeting_link = COALESCE(?, meeting_link),
    lesson_schedule = COALESCE(?, lesson_schedule),
    teacher_notes = COALESCE(?, teacher_notes),
    updated_at = ?
    WHERE id = ?`).bind(
    payload.status ? clean(payload.status) : null,
    payload.payment ? clean(payload.payment) : null,
    meetingLink || null,
    schedule.length ? JSON.stringify(schedule) : null,
    payload.teacherNotes ? clean(payload.teacherNotes) : null,
    new Date().toISOString(),
    id,
  ).run();
  const updated = await db.prepare("SELECT * FROM bookings WHERE id = ?").bind(id).first();
  return json({ booking: bookingToClient(updated), meetingEmail: { sent: false } });
}

async function handleBookingsCsv(request, env) {
  if (!isAdmin(request, env)) return json({ error: "Admin password required" }, 401);
  const rows = await listBookingRows(env);
  const headers = ["created_at", "status", "full_name", "email", "contact", "country", "timezone", "level", "course", "date", "time", "frequency", "lesson_count", "payment", "payment_provider", "payment_reference", "amount", "meeting_link", "goal", "notes"];
  const csv = [headers.join(","), ...rows.map((row) => headers.map((key) => `"${clean(row[key]).replaceAll('"', '""')}"`).join(","))].join("\n");
  return text(`${csv}\n`, 200, "text/csv; charset=utf-8");
}

function seoPageToClient(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    category: row.category,
    slug: row.slug,
    title: row.title,
    description: row.description,
    excerpt: row.excerpt,
    image: row.image,
    imageAlt: row.image_alt,
    payload: parseJson(row.payload, {}),
  };
}

function absoluteAssetUrl(value) {
  const image = clean(value || "assets/backup-study-desk.jpg");
  if (/^https?:\/\//i.test(image)) return image;
  return `${SITE_URL}/${image.replace(/^\/+/, "")}`;
}

function splitList(value, max = 6) {
  return clean(value)
    .split(/[,，\n]/)
    .map((item) => clean(item))
    .filter(Boolean)
    .slice(0, max);
}

function renderParagraphs(value) {
  const text = clean(value);
  if (!text) return "";
  return text
    .split(/\n{2,}/)
    .map((part) => `<p>${escapeHtml(part)}</p>`)
    .join("");
}

function renderDynamicSeoPage(row) {
  const page = seoPageToClient(row);
  const payload = page.payload || {};
  const url = `${SITE_URL}/insights/${cleanSlug(page.category)}/${cleanSlug(page.slug)}`;
  const title = page.title || payload.title || "Mandrix Insight";
  const description = page.description || payload.description || page.excerpt || "";
  const h1 = clean(payload.h1 || title.replace(/\s*\|\s*Mandrix\s*$/i, ""));
  const lead = clean(payload.lead || page.excerpt || description);
  const image = clean(payload.imageUploadTarget || page.image || payload.image || "assets/backup-study-desk.jpg");
  const imageAlt = clean(page.imageAlt || payload.imageAlt || title);
  const chips = splitList(payload.chips || page.category, 6);
  const cards = [
    { title: payload.card1Title, text: payload.card1Text },
    { title: payload.card2Title, text: payload.card2Text },
    { title: payload.card3Title, text: payload.card3Text },
  ].filter((card) => clean(card.title) || clean(card.text));
  const primaryLabel = clean(payload.primaryLabel || "Start Free AI Level Check");
  const primaryHref = clean(payload.primaryHref || "/level-check");
  const secondaryLabel = clean(payload.secondaryLabel || "View Courses");
  const secondaryHref = clean(payload.secondaryHref || "/courses");
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title.replace(/\s*\|\s*Mandrix\s*$/i, ""),
    description,
    url,
    image: absoluteAssetUrl(image),
    datePublished: row.created_at,
    dateModified: row.updated_at || row.created_at,
    mainEntityOfPage: url,
    author: { "@type": "Person", name: "Jane Chen" },
    publisher: { "@type": "EducationalOrganization", name: "Mandrix", url: SITE_URL },
    inLanguage: "en",
  };
  const chipHtml = chips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join("");
  const cardHtml = cards.map((card, index) => `
          <article class="landing-card">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <h2>${escapeHtml(card.title || "Mandrix focus")}</h2>
            <p>${escapeHtml(card.text || "")}</p>
          </article>`).join("");
  const secondaryButton = secondaryLabel && secondaryHref
    ? `<a class="btn secondary" href="${escapeHtml(secondaryHref)}">${escapeHtml(secondaryLabel)}</a>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${escapeHtml(url)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${escapeHtml(url)}">
    <meta property="og:image" content="${escapeHtml(absoluteAssetUrl(image))}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(absoluteAssetUrl(image))}">
    <link rel="icon" type="image/png" href="/assets/mandrix-logo-128.png">
    <link rel="stylesheet" href="/styles.min.css">
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
  </head>
  <body>
    <div class="shell insight-shell">
      <header class="nav" translate="no">
        <div class="nav-inner">
          <a class="brand" href="/">
            <img src="/assets/mandrix-logo-128.png" alt="Mandrix logo" width="128" height="128" decoding="async">
            <span class="brand-word"><span class="brand-name">Mandrix</span><span class="brand-line">Chinese, decoded.</span></span>
          </a>
          <nav class="nav-links" id="navLinks">
            <a href="/method">Method</a>
            <a href="/#core-system">Core System</a>
            <a href="/#learning-paths">Learning Paths</a>
            <a href="/corporate">Corporate</a>
            <a href="/#results">Results</a>
            <a href="/about">About Jane</a>
            <a href="/faq">FAQ</a>
            <a class="nav-cta" href="/level-check">Free AI Check</a>
            <a class="lang-switch" href="/zh">中文</a>
          </nav>
          <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation" aria-expanded="false"><span></span><span></span><span></span></button>
        </div>
      </header>
    </div>

    <main class="wrap insight-article dynamic-insight-article">
      <p class="eyebrow">${escapeHtml(payload.eyebrow || page.category)}</p>
      <h1>${escapeHtml(h1)}</h1>
      <p class="lead">${escapeHtml(lead)}</p>
      <div class="landing-proof">${chipHtml}</div>
      <figure><img src="/${escapeHtml(image).replace(/^\/+/, "")}" alt="${escapeHtml(imageAlt)}"></figure>
      <section class="article-body">
        ${renderParagraphs(payload.articleBody || lead)}
        ${cardHtml ? `<div class="landing-card-grid">${cardHtml}</div>` : ""}
        ${payload.sectionTitle ? `<h2>${escapeHtml(payload.sectionTitle)}</h2>` : ""}
        ${payload.sectionBody ? `<p>${escapeHtml(payload.sectionBody)}</p>` : ""}
        <div class="actions">
          <a class="btn primary" href="${escapeHtml(primaryHref)}">${escapeHtml(primaryLabel)}</a>
          ${secondaryButton}
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="wrap">
        <div class="footer-brand"><strong>Mandrix</strong><span>Chinese, decoded.</span><p>Clearer Chinese for adult learners.</p></div>
        <nav class="footer-links" aria-label="Contact links">
          <a href="/method">Method</a><a href="/courses">Courses</a><a href="/corporate">Corporate</a><a href="/insights">Insights</a><a href="/booking">Booking</a><a href="mailto:Jane.Mandrix@outlook.com">Jane.Mandrix@outlook.com</a>
        </nav>
        <span>© 2026 Mandrix | Jane Chen. All Rights Reserved.</span>
      </div>
    </footer>
    <script src="/analytics.js" defer></script>
    <script>const navToggle=document.querySelector("#navToggle");const navLinks=document.querySelector("#navLinks");navToggle?.addEventListener("click",()=>{const isOpen=navLinks.classList.toggle("nav-open");navToggle.setAttribute("aria-expanded",isOpen?"true":"false")});</script>
  </body>
</html>`;
}

function cleanSlug(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90) || `page-${Date.now()}`;
}

async function handleSeoPages(request, env) {
  const db = await ensureDb(env);
  if (!db) return json({ error: "Cloudflare D1 binding MANDRIX_DB is not configured." }, 500);
  if (request.method === "GET") {
    const rows = await db.prepare("SELECT * FROM seo_pages WHERE status = 'published' ORDER BY updated_at DESC, created_at DESC LIMIT 500").all();
    return json({ pages: (rows.results || []).map(seoPageToClient) });
  }
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!isAdmin(request, env)) return json({ error: "Admin password required" }, 401);
  const body = await request.json().catch(() => ({}));
  const payload = body.payload && typeof body.payload === "object" ? body.payload : body;
  const category = cleanSlug(body.category || payload.category || "mandarin-learning");
  const slug = cleanSlug(body.slug || payload.slug || payload.title || body.title);
  const title = clean(body.title || payload.title).slice(0, 140);
  const description = clean(body.description || payload.description).slice(0, 240);
  if (!title || !description) return json({ error: "Title and description are required." }, 400);
  const id = randomId();
  const now = new Date().toISOString();
  await db.prepare(`INSERT INTO seo_pages (id,status,category,slug,title,description,excerpt,image,image_alt,payload,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(category, slug) DO UPDATE SET
      status=excluded.status,title=excluded.title,description=excluded.description,excerpt=excluded.excerpt,image=excluded.image,
      image_alt=excluded.image_alt,payload=excluded.payload,updated_at=excluded.updated_at`).bind(
    id,
    clean(body.status || payload.status || "published"),
    category,
    slug,
    title,
    description,
    clean(body.excerpt || payload.excerpt || payload.lead || description).slice(0, 320),
    clean(body.image || payload.image || "assets/backup-study-desk.jpg"),
    clean(body.imageAlt || payload.imageAlt || title),
    JSON.stringify({ ...payload, category, slug, title, description }),
    now,
  ).run();
  return json({ page: { id, category, slug, title, description }, url: `${SITE_URL}/insights/${category}/${slug}` }, 201);
}

async function handleSeoPageHtml(request, env, category, slug) {
  const db = await ensureDb(env);
  if (!db) return json({ error: "Cloudflare D1 binding MANDRIX_DB is not configured." }, 500);
  const row = await db.prepare("SELECT * FROM seo_pages WHERE status = 'published' AND category = ? AND slug = ? LIMIT 1")
    .bind(cleanSlug(category), cleanSlug(slug)).first();
  if (!row) return text("Not found", 404);
  return text(renderDynamicSeoPage(row), 200, "text/html; charset=utf-8");
}

async function handleReminders(request, env) {
  if (!isAdmin(request, env) && !clean(env.REMINDER_SECRET)) return json({ error: "Reminder secret required" }, 401);
  return json({ ok: true, message: "Cloudflare backend is active. Calendar reminders can be added after Google Calendar credentials are configured." });
}

async function handleWorldFirstWebhook(request, env) {
  const db = await ensureDb(env);
  if (!db) return json({ error: "Cloudflare D1 binding MANDRIX_DB is not configured." }, 500);
  const raw = await request.text();
  if (env.WORLDFIRST_WEBHOOK_SECRET) {
    const signature = request.headers.get("x-worldfirst-signature") || request.headers.get("x-signature") || "";
    const expected = await hmacHex(env.WORLDFIRST_WEBHOOK_SECRET, raw);
    if (!safeEqual(signature, expected)) return json({ error: "Invalid signature" }, 401);
  }
  const payload = JSON.parse(raw || "{}");
  const orderId = clean(payload.orderId || payload.order_id || payload.reference || payload.paymentReference);
  await db.prepare("INSERT INTO payment_orders (id,provider,order_id,email,amount,course,raw_payload,status) VALUES (?,?,?,?,?,?,?,?)")
    .bind(randomId(), "WorldFirst", orderId, clean(payload.email), clean(payload.amount), clean(payload.course), raw, clean(payload.status || "received")).run();
  return json({ ok: true, orderId });
}

function paypalBaseUrl(env) {
  return clean(env.PAYPAL_ENV).toLowerCase() === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";
}

function paypalConfigured(env) {
  return Boolean(clean(env.PAYPAL_CLIENT_ID) && clean(env.PAYPAL_CLIENT_SECRET));
}

function paypalTestMode(env) {
  return clean(env.PAYPAL_TEST_MODE).toLowerCase() === "true";
}

async function paypalAccessToken(env) {
  if (!paypalConfigured(env)) throw new Error("PayPal Business credentials are not configured.");
  const credentials = btoa(`${clean(env.PAYPAL_CLIENT_ID)}:${clean(env.PAYPAL_CLIENT_SECRET)}`);
  const response = await fetch(`${paypalBaseUrl(env)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error_description || data.error || "PayPal authentication failed");
  return data.access_token;
}

async function paypalRequest(env, path, options = {}) {
  const token = await paypalAccessToken(env);
  const response = await fetch(`${paypalBaseUrl(env)}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error_description || data.error || "PayPal request failed");
  return data;
}

async function handlePayPalConfig(request, env) {
  if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
  return json({
    configured: paypalConfigured(env) || paypalTestMode(env),
    clientId: clean(env.PAYPAL_CLIENT_ID),
    currency: clean(env.PAYPAL_CURRENCY) || "USD",
    environment: paypalTestMode(env) ? "test" : (clean(env.PAYPAL_ENV) || "live"),
    testMode: paypalTestMode(env),
  });
}

async function handlePayPalCreateOrder(request, env) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const db = await ensureDb(env);
  if (!db) return json({ error: "Cloudflare D1 binding MANDRIX_DB is not configured." }, 500);
  const payload = await request.json();
  const amount = normalizeAmount(clean(payload.amount) || amountFromCourse(payload.course));
  if (!amount || Number(amount) <= 0) return json({ error: "A valid payment amount is required." }, 400);
  const course = clean(payload.course);
  if (!course || /Request Consultation/i.test(course)) return json({ error: "This course requires consultation before payment." }, 400);

  if (paypalTestMode(env)) {
    const orderId = `TEST-PAYPAL-${randomId()}`;
    const order = { id: orderId, status: "CREATED", testMode: true, amount, course };
    await db.prepare("INSERT INTO payment_orders (id,provider,order_id,email,amount,course,raw_payload,status) VALUES (?,?,?,?,?,?,?,?)")
      .bind(randomId(), "PayPal", orderId, clean(payload.email), amount, course, JSON.stringify(order), "CREATED").run();
    return json({ orderId, status: "CREATED", amount, testMode: true });
  }

  const order = await paypalRequest(env, "/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        reference_id: randomId(),
        description: course.slice(0, 120),
        amount: {
          currency_code: clean(env.PAYPAL_CURRENCY) || "USD",
          value: amount,
        },
        custom_id: clean(payload.email) || "mandrix-booking",
      }],
      application_context: {
        brand_name: "Mandrix",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
      },
    }),
  });

  await db.prepare("INSERT INTO payment_orders (id,provider,order_id,email,amount,course,raw_payload,status) VALUES (?,?,?,?,?,?,?,?)")
    .bind(randomId(), "PayPal", clean(order.id), clean(payload.email), amount, course, JSON.stringify(order), clean(order.status || "CREATED")).run();
  return json({ orderId: order.id, status: order.status, amount });
}

async function handlePayPalCaptureOrder(request, env) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const db = await ensureDb(env);
  if (!db) return json({ error: "Cloudflare D1 binding MANDRIX_DB is not configured." }, 500);
  const payload = await request.json();
  const orderId = clean(payload.orderId);
  if (!orderId) return json({ error: "PayPal order ID is required." }, 400);
  if (paypalTestMode(env) && orderId.startsWith("TEST-PAYPAL-")) {
    const current = await db.prepare("SELECT * FROM payment_orders WHERE provider = ? AND order_id = ? ORDER BY created_at DESC LIMIT 1")
      .bind("PayPal", orderId).first();
    if (!current) return json({ error: "Test PayPal order was not found." }, 404);
    const capture = { id: orderId, status: "COMPLETED", testMode: true, amount: current.amount, course: current.course };
    await db.prepare("INSERT INTO payment_orders (id,provider,order_id,email,amount,course,raw_payload,status) VALUES (?,?,?,?,?,?,?,?)")
      .bind(randomId(), "PayPal", orderId, clean(current.email), normalizeAmount(current.amount), clean(current.course), JSON.stringify(capture), "COMPLETED").run();
    return json({
      ok: true,
      orderId,
      status: "COMPLETED",
      amount: normalizeAmount(current.amount),
      payerEmail: clean(current.email),
      captureId: `TEST-CAPTURE-${orderId}`,
      testMode: true,
    });
  }
  const capture = await paypalRequest(env, `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, { method: "POST", body: "{}" });
  const unit = capture.purchase_units?.[0] || {};
  const transaction = unit.payments?.captures?.[0] || {};
  const amount = transaction.amount?.value || unit.amount?.value || "";
  const payerEmail = clean(capture.payer?.email_address);
  const status = clean(capture.status || transaction.status || "CAPTURED");

  await db.prepare("INSERT INTO payment_orders (id,provider,order_id,email,amount,course,raw_payload,status) VALUES (?,?,?,?,?,?,?,?)")
    .bind(randomId(), "PayPal", orderId, payerEmail, normalizeAmount(amount), clean(unit.description), JSON.stringify(capture), status).run();
  return json({
    ok: status === "COMPLETED",
    orderId,
    status,
    amount: normalizeAmount(amount),
    payerEmail,
    captureId: clean(transaction.id),
  });
}

async function hmacHex(secret, body) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return [...new Uint8Array(sig)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a, b) {
  const left = clean(a).toLowerCase();
  const right = clean(b).toLowerCase();
  return left.length === right.length && left === right;
}

async function handleSitemap(env) {
  const urls = ["/", "/about", "/booking", "/business", "/courses", "/daily", "/diagnostic", "/faq", "/hsk", "/insights", "/level-check", "/method", "/private", "/specialty", "/zh"];
  const db = await ensureDb(env).catch(() => null);
  if (db) {
    const rows = await db.prepare("SELECT category, slug, updated_at, created_at FROM seo_pages WHERE status = 'published' ORDER BY updated_at DESC, created_at DESC LIMIT 1000").all();
    (rows.results || []).forEach((row) => urls.push(`/insights/${cleanSlug(row.category)}/${cleanSlug(row.slug)}`));
  }
  const today = new Date().toISOString().slice(0, 10);
  const body = [...new Set(urls)].map((path) => `  <url><loc>${SITE_URL}${path}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${path === "/" ? "1.0" : path.startsWith("/insights/") ? "0.7" : "0.8"}</priority></url>`).join("\n");
  return text(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`, 200, "application/xml; charset=utf-8");
}

export async function onRequest(context) {
  const { request, env, params } = context;
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  const path = Array.isArray(params.path) ? params.path.join("/") : clean(params.path);

  try {
    if (path === "availability.js") return handleAvailability(request, env);
    if (path === "bookings.js") return handleBookings(request, env);
    if (path === "booking-update.js") return handleBookingUpdate(request, env);
    if (path === "bookings.csv.js") return handleBookingsCsv(request, env);
    if (path === "level-check.js") return handleLevelCheck(request, env);
    if (path === "analytics.js") return handleAnalytics(request, env);
    if (path === "seo-pages.js") return handleSeoPages(request, env);
    if (path === "reminders.js") return handleReminders(request, env);
    if (path === "paypal/config.js") return handlePayPalConfig(request, env);
    if (path === "paypal/create-order.js") return handlePayPalCreateOrder(request, env);
    if (path === "paypal/capture-order.js") return handlePayPalCaptureOrder(request, env);
    if (path === "webhooks/worldfirst.js" || path === "worldfirst-webhook.js") return handleWorldFirstWebhook(request, env);
    if (path.startsWith("insights/")) {
      const [, category, slug] = path.split("/");
      if (category && slug) return handleSeoPageHtml(request, env, category, slug);
    }
    if (path === "sitemap.xml.js") return handleSitemap(env);
    return json({ error: "Cloudflare API route not found", path }, 404);
  } catch (error) {
    return json({ error: error.message || "Cloudflare backend error" }, 500);
  }
}
