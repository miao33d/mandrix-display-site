const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertConfig() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    const missing = [!SUPABASE_URL && "SUPABASE_URL", !SUPABASE_SERVICE_ROLE_KEY && "SUPABASE_SERVICE_ROLE_KEY"].filter(Boolean).join(", ");
    throw new Error(`Missing Supabase environment variable(s): ${missing}`);
  }
}

export function sendJson(res, status, payload) {
  res.status(status).json(payload);
}

export function cleanString(value) {
  return String(value || "").trim();
}

export function toClient(row) {
  if (!row) return row;
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
    lessonSchedule: row.lesson_schedule || [],
    payment: row.payment,
    amount: row.amount,
    paypalLink: row.paypal_link,
    goal: row.goal,
    notes: row.notes,
    meetingLink: row.meeting_link,
    teacherNotes: row.teacher_notes,
    groupInfo: row.group_info,
  };
}

export function toDb(row) {
  return {
    status: row.status,
    full_name: row.fullName,
    email: row.email,
    contact: row.contact,
    country: row.country,
    timezone: row.timezone,
    level: row.level,
    course: row.course,
    booking_type: row.bookingType,
    date: row.date,
    time: row.time,
    frequency: row.frequency,
    frequency_label: row.frequencyLabel,
    lesson_count: row.lessonCount,
    lesson_schedule: row.lessonSchedule,
    payment: row.payment,
    amount: row.amount,
    paypal_link: row.paypalLink,
    goal: row.goal,
    notes: row.notes,
    meeting_link: row.meetingLink,
    teacher_notes: row.teacherNotes,
    group_info: row.groupInfo,
    updated_at: row.updatedAt,
  };
}

export function bookingPayloadToDb(row) {
  const data = toDb(row);
  if (row.id) data.id = row.id;
  return data;
}

async function supabaseFetch(path, options = {}) {
  assertConfig();
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Supabase request failed: ${response.status}`);
  }
  return data;
}

export async function listBookings() {
  const rows = await supabaseFetch("bookings?select=*&order=date.asc,time.asc,created_at.asc");
  return rows.map(toClient);
}

export async function insertBooking(booking) {
  const rows = await supabaseFetch("bookings", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(bookingPayloadToDb(booking)),
  });
  return toClient(rows[0]);
}

export async function patchBooking(id, payload) {
  const update = {};
  if ("status" in payload) update.status = cleanString(payload.status);
  if ("payment" in payload) update.payment = cleanString(payload.payment);
  if ("paypalLink" in payload) update.paypal_link = cleanString(payload.paypalLink);
  if ("lessonSchedule" in payload) update.lesson_schedule = payload.lessonSchedule;
  if ("meetingLink" in payload) update.meeting_link = cleanString(payload.meetingLink);
  if ("teacherNotes" in payload) update.teacher_notes = cleanString(payload.teacherNotes);
  update.updated_at = new Date().toISOString();

  const rows = await supabaseFetch(`bookings?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(update),
  });
  return rows[0] ? toClient(rows[0]) : null;
}

export async function getBooking(id) {
  const rows = await supabaseFetch(`bookings?id=eq.${encodeURIComponent(id)}&select=*&limit=1`);
  return rows[0] ? toClient(rows[0]) : null;
}

export async function findBookingByPaypalOrder(paypalOrderId) {
  const safeOrderId = cleanString(paypalOrderId);
  if (!safeOrderId) return null;
  const rows = await supabaseFetch(`bookings?paypal_link=eq.${encodeURIComponent(safeOrderId)}&select=*&limit=1`);
  return rows[0] ? toClient(rows[0]) : null;
}

export async function deleteBooking(id) {
  await supabaseFetch(`bookings?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
  return true;
}

export function toAnalyticsClient(row) {
  if (!row) return row;
  return {
    id: row.id,
    createdAt: row.created_at,
    sessionId: row.session_id,
    eventType: row.event_type,
    path: row.path,
    pageTitle: row.page_title,
    referrer: row.referrer,
    utmSource: row.utm_source,
    utmMedium: row.utm_medium,
    utmCampaign: row.utm_campaign,
    language: row.language,
    timezone: row.timezone,
    device: row.device,
    browser: row.browser,
    os: row.os,
    country: row.country,
    metadata: row.metadata || {},
  };
}

export async function insertAnalyticsEvent(event) {
  const payload = {
    session_id: cleanString(event.sessionId).slice(0, 120),
    event_type: cleanString(event.eventType || event.type).slice(0, 80),
    path: cleanString(event.path).slice(0, 500),
    page_title: cleanString(event.pageTitle || event.title).slice(0, 300),
    referrer: cleanString(event.referrer).slice(0, 500),
    utm_source: cleanString(event.utmSource || event.utm?.source).slice(0, 120),
    utm_medium: cleanString(event.utmMedium || event.utm?.medium).slice(0, 120),
    utm_campaign: cleanString(event.utmCampaign || event.utm?.campaign).slice(0, 160),
    language: cleanString(event.language).slice(0, 80),
    timezone: cleanString(event.timezone).slice(0, 120),
    device: cleanString(event.device).slice(0, 40),
    browser: cleanString(event.browser).slice(0, 80),
    os: cleanString(event.os).slice(0, 80),
    country: cleanString(event.country).slice(0, 80),
    metadata: event.metadata && typeof event.metadata === "object" ? event.metadata : {},
  };
  const rows = await supabaseFetch("analytics_events", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  return toAnalyticsClient(rows[0]);
}

export async function listAnalyticsEvents({ since } = {}) {
  const sinceFilter = since ? `&created_at=gte.${encodeURIComponent(since)}` : "";
  const rows = await supabaseFetch(`analytics_events?select=*&order=created_at.desc&limit=5000${sinceFilter}`);
  return rows.map(toAnalyticsClient);
}
