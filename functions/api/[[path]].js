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
  const match = clean(course).match(/\$(\d+(?:\.\d{1,2})?)/);
  return match ? match[1] : "";
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
      meetingProvider: "Google Meet",
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

async function sendEmail(env, { to, subject, text: bodyText, html, replyTo }) {
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

function scheduleText(schedule) {
  if (!Array.isArray(schedule) || !schedule.length) return "None";
  return schedule.map((lesson) => {
    const meet = lesson.meetingLink ? ` · Google Meet: ${lesson.meetingLink}` : "";
    return `Lesson ${lesson.lesson}: ${lesson.date} · ${lesson.time} Beijing Time${meet}`;
  }).join("\n");
}

async function createGoogleMeet(env, booking) {
  if (env.GOOGLE_MEET_LINK) return env.GOOGLE_MEET_LINK;
  if (!env.GOOGLE_CLIENT_EMAIL || !env.GOOGLE_PRIVATE_KEY || !env.GOOGLE_CALENDAR_ID) return "";

  const token = await googleAccessToken(env);
  const start = beijingDateTimeToIso(booking.date, booking.time);
  const end = new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString();
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(env.GOOGLE_CALENDAR_ID)}/events?conferenceDataVersion=1&sendUpdates=none`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: `Mandrix · ${booking.course}`,
      description: `Student: ${booking.fullName}\nEmail: ${booking.email}\nPayment reference: ${booking.paymentReference}`,
      start: { dateTime: start, timeZone: "Asia/Shanghai" },
      end: { dateTime: end, timeZone: "Asia/Shanghai" },
      attendees: [{ email: booking.email }],
      conferenceData: { createRequest: { requestId: booking.id, conferenceSolutionKey: { type: "hangoutsMeet" } } },
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || "Google Calendar event failed.");
  return data.hangoutLink || data.conferenceData?.entryPoints?.find((item) => item.entryPointType === "video")?.uri || "";
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
    payment: "WorldFirst reference received",
    paymentProvider: "WorldFirst",
    paymentReference: clean(payload.paymentReference),
    amount: clean(payload.amount) || amountFromCourse(payload.course),
    goal: clean(payload.goal),
    notes: clean(payload.notes),
    meetingLink: "",
  };
  booking.meetingLink = await createGoogleMeet(env, booking).catch((error) => {
    booking.teacherNotes = `Google Meet creation failed: ${error.message}`;
    return clean(env.GOOGLE_MEET_LINK);
  });
  booking.lessonSchedule = buildSchedule(booking, booking.meetingLink);

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
    `WorldFirst reference: ${booking.paymentReference}`,
    `Google Meet: ${booking.meetingLink || "Not configured"}`,
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
    `WorldFirst reference: ${booking.paymentReference}`,
    booking.meetingLink ? `Google Meet: ${booking.meetingLink}` : "Google Meet: Jane will confirm the class link by email.",
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
  await db.prepare(`INSERT INTO level_checks (
    id,status,full_name,email,contact,goal,background,confidence,recognition,word_order,grammar,scenario,blocker,sample,report
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
    id, "New", clean(payload.fullName), clean(payload.email), clean(payload.contact), clean(payload.goal), clean(payload.background),
    clean(payload.confidence), clean(payload.recognition), clean(payload.wordOrder), clean(payload.grammar), clean(payload.scenario),
    clean(payload.blocker), clean(payload.sample), JSON.stringify(payload.report || {}),
  ).run();
  const reportText = `Mandrix Free AI Level Check\n\nName: ${clean(payload.fullName)}\nEmail: ${clean(payload.email)}\nGoal: ${clean(payload.goal)}\nEstimated level: ${payload.report?.level?.label || ""}\nMain blocker: ${payload.report?.blocker?.title || ""}\nRecommended path: ${payload.report?.path?.path || ""}`;
  const admin = await sendEmail(env, { to: clean(env.ADMIN_EMAIL) || ADMIN_EMAIL, subject: `Free level check: ${clean(payload.fullName)}`, text: reportText, html: `<pre>${escapeHtml(reportText)}</pre>`, replyTo: payload.email });
  const student = await sendEmail(env, { to: payload.email, subject: "Your Mandrix level check report", text: reportText, html: `<pre>${escapeHtml(reportText)}</pre>` });
  return json({ levelCheck: { id, ...payload, status: "New" }, saved: true, emailSent: Boolean(admin.ok && student.ok), emailResults: { admin, student } }, 201);
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
  if (meetingLink) schedule = schedule.map((lesson) => ({ ...lesson, meetingProvider: "Google Meet", meetingLink }));
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
  const category = clean(body.category || payload.category || "mandarin-learning");
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

async function handleSitemap() {
  const urls = ["/", "/about", "/booking", "/business", "/courses", "/daily", "/diagnostic", "/faq", "/hsk", "/insights", "/level-check", "/method", "/private", "/specialty", "/zh"];
  const today = new Date().toISOString().slice(0, 10);
  const body = urls.map((path) => `  <url><loc>${SITE_URL}${path}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${path === "/" ? "1.0" : "0.8"}</priority></url>`).join("\n");
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
    if (path === "webhooks/worldfirst.js" || path === "worldfirst-webhook.js") return handleWorldFirstWebhook(request, env);
    if (path === "sitemap.xml.js") return handleSitemap();
    return json({ error: "Cloudflare API route not found", path }, 404);
  } catch (error) {
    return json({ error: error.message || "Cloudflare backend error" }, 500);
  }
}
