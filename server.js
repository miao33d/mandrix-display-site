import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4180;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "bookings.json");
const ANALYTICS_FILE = path.join(DATA_DIR, "analytics.json");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]\n", "utf8");
  }
  try {
    await fs.access(ANALYTICS_FILE);
  } catch {
    await fs.writeFile(ANALYTICS_FILE, "[]\n", "utf8");
  }
}

async function readBookings() {
  await ensureStore();
  const text = await fs.readFile(DATA_FILE, "utf8");
  try {
    const rows = JSON.parse(text);
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

async function writeBookings(rows) {
  await ensureStore();
  await fs.writeFile(DATA_FILE, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
}

async function readAnalytics() {
  await ensureStore();
  try {
    const rows = JSON.parse(await fs.readFile(ANALYTICS_FILE, "utf8"));
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

async function writeAnalytics(rows) {
  await ensureStore();
  await fs.writeFile(ANALYTICS_FILE, `${JSON.stringify(rows.slice(-10000), null, 2)}\n`, "utf8");
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Request body is too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

function cleanString(value) {
  return String(value || "").trim();
}

function parseUserAgent(userAgent = "") {
  const ua = String(userAgent);
  return {
    browser: /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) && !/Chrome\//.test(ua) ? "Safari" : /Firefox\//.test(ua) ? "Firefox" : "Other",
    os: /iPhone|iPad|iPod/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac OS X/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "Other",
  };
}

function countBy(rows, keyFn, limit = 8) {
  const map = new Map();
  for (const row of rows) {
    const key = cleanString(keyFn(row)) || "Unknown";
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([label, count]) => ({ label, count }));
}

function eventMeta(event, key) {
  return event.metadata && typeof event.metadata === "object" ? event.metadata[key] : "";
}

function pageGroup(pathValue = "") {
  const value = cleanString(pathValue);
  if (value.includes("/insights/")) return "Insights Article";
  if (value.includes("insights.html")) return "Insights Index";
  if (value.includes("zh.html")) return "Chinese Home";
  if (value.includes("#booking")) return "Booking Section";
  if (value === "/" || value.includes("index.html")) return "English Home";
  return "Other";
}

function buildRecommendations({ totals, courseInterest, articlePerformance, devices, sources }) {
  const tips = [];
  if (totals.pageViews && totals.ctaClicks / totals.pageViews < 0.05) tips.push("CTA click rate is low. Strengthen the diagnostic offer and repeat the booking CTA.");
  if (totals.ctaClicks && totals.paymentClicks / totals.ctaClicks < 0.25) tips.push("Booking interest is not becoming payment intent. Make the PayPal step more visible.");
  if (totals.paymentClicks && totals.bookingSubmits / totals.paymentClicks < 0.55) tips.push("Payment-to-form completion is leaking. Shorten the form and explain transaction ID submission.");
  if (courseInterest[0]) tips.push(`Most course interest: ${courseInterest[0].label}. Put this program higher and promote it more.`);
  if (articlePerformance[0]) tips.push(`Best article traffic: ${articlePerformance[0].label}. Add stronger diagnostic CTA inside this article.`);
  if (devices[0]?.label === "mobile") tips.push("Mobile traffic leads. Prioritize mobile layout and sticky CTA.");
  if (sources[0]?.label && sources[0].label !== "Direct") tips.push(`Top source is ${sources[0].label}. Keep publishing content for that channel.`);
  if (!tips.length) tips.push("No meaningful data yet. Advice will become concrete after real traffic is collected.");
  return tips.slice(0, 6);
}

function groupedConversion(events, keyFn, limit = 8) {
  const groups = new Map();
  for (const event of events) {
    const key = cleanString(keyFn(event)) || "Unknown";
    if (!groups.has(key)) {
      groups.set(key, { label: key, visitors: new Set(), pageViews: 0, ctaClicks: 0, paymentClicks: 0, bookingSubmits: 0 });
    }
    const group = groups.get(key);
    if (event.sessionId) group.visitors.add(event.sessionId);
    if (event.eventType === "page_view") group.pageViews += 1;
    if (event.eventType === "booking_cta_click") group.ctaClicks += 1;
    if (event.eventType === "payment_click") group.paymentClicks += 1;
    if (event.eventType === "booking_submit_success") group.bookingSubmits += 1;
  }
  return [...groups.values()].map((group) => ({
    ...group,
    visitors: group.visitors.size,
    conversionRate: group.visitors.size ? Number(((group.bookingSubmits / group.visitors.size) * 100).toFixed(1)) : 0,
    intentScore: group.ctaClicks * 2 + group.paymentClicks * 4 + group.bookingSubmits * 8,
  })).sort((a, b) => b.intentScore - a.intentScore || b.visitors - a.visitors).slice(0, limit);
}

function courseFunnel(events) {
  return groupedConversion(events.filter((event) => eventMeta(event, "course")), (event) => eventMeta(event, "course"), 10);
}

function contentAttribution(events) {
  const sessions = new Map();
  for (const event of events) {
    if (!event.sessionId) continue;
    if (!sessions.has(event.sessionId)) sessions.set(event.sessionId, []);
    sessions.get(event.sessionId).push(event);
  }
  const rows = new Map();
  for (const sessionEvents of sessions.values()) {
    const articleViews = sessionEvents.filter((event) => event.eventType === "page_view" && cleanString(event.path).includes("/insights/"));
    if (!articleViews.length) continue;
    const hasCta = sessionEvents.some((event) => event.eventType === "booking_cta_click");
    const hasPayment = sessionEvents.some((event) => event.eventType === "payment_click");
    const hasSubmit = sessionEvents.some((event) => event.eventType === "booking_submit_success");
    for (const view of articleViews) {
      const key = cleanString(view.path).replace(/^\/insights\//, "").replace(/\.html.*$/, "");
      if (!rows.has(key)) rows.set(key, { label: key, views: 0, ctaClicks: 0, paymentClicks: 0, bookingSubmits: 0 });
      const row = rows.get(key);
      row.views += 1;
      if (hasCta) row.ctaClicks += 1;
      if (hasPayment) row.paymentClicks += 1;
      if (hasSubmit) row.bookingSubmits += 1;
    }
  }
  return [...rows.values()].map((row) => ({
    ...row,
    assistRate: row.views ? Number(((row.ctaClicks / row.views) * 100).toFixed(1)) : 0,
    intentScore: row.ctaClicks * 2 + row.paymentClicks * 4 + row.bookingSubmits * 8,
  })).sort((a, b) => b.intentScore - a.intentScore || b.views - a.views).slice(0, 8);
}

function buildPriorityActions({ courseRows, contentRows, deviceRows, countryRows, totals }) {
  const actions = [];
  if (courseRows[0]) actions.push({ priority: "High", title: `Push ${courseRows[0].label}`, detail: "This course has the strongest buying intent. Give it stronger placement, clearer outcomes, and more social content." });
  if (contentRows[0]?.ctaClicks) actions.push({ priority: "High", title: `Strengthen CTA in ${contentRows[0].label}`, detail: "This article is already assisting booking behavior. Add a mid-article diagnostic CTA and a stronger end CTA." });
  if (deviceRows[0]?.label === "mobile" && totals.ctaRate < 8) actions.push({ priority: "Medium", title: "Tighten mobile booking path", detail: "Mobile visitors dominate but CTA rate is not high enough. Keep the booking button sticky and reduce form friction." });
  if (countryRows[0]) actions.push({ priority: "Medium", title: `Localize for ${countryRows[0].label}`, detail: "Use this market in testimonials, examples, posting times, and course scenarios." });
  if (totals.submitErrors > 0) actions.push({ priority: "High", title: "Fix failed submissions first", detail: "Submission errors mean paid students may be blocked. Check form validation, availability, and email/API status." });
  if (!actions.length) actions.push({ priority: "Watch", title: "Collect more traffic", detail: "The dashboard is ready. After real visits come in, priority actions will become more specific." });
  return actions.slice(0, 6);
}

function buildAnalyticsSummary(events, days) {
  const pageViews = events.filter((event) => event.eventType === "page_view");
  const visitors = new Set(events.map((event) => event.sessionId).filter(Boolean)).size;
  const total = (type) => events.filter((event) => event.eventType === type).length;
  const dailyMap = new Map();
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    dailyMap.set(date.toISOString().slice(0, 10), { date: date.toISOString().slice(0, 10), pageViews: 0, visitors: new Set() });
  }
  for (const event of events) {
    const key = cleanString(event.createdAt).slice(0, 10);
    if (!dailyMap.has(key)) continue;
    if (event.eventType === "page_view") dailyMap.get(key).pageViews += 1;
    if (event.sessionId) dailyMap.get(key).visitors.add(event.sessionId);
  }
  const bookingSubmits = total("booking_submit_success");
  const ctaClicks = total("booking_cta_click");
  const paymentClicks = total("payment_click");
  const courseInterest = countBy(events.filter((event) => ["course_select", "booking_cta_click", "booking_submit_success"].includes(event.eventType) && eventMeta(event, "course")), (event) => eventMeta(event, "course"), 10).filter((row) => row.label !== "Unknown");
  const articlePerformance = countBy(pageViews.filter((event) => cleanString(event.path).includes("/insights/")), (event) => event.path.replace(/^\/insights\//, "").replace(/\.html.*$/, ""), 8);
  const devices = countBy(events, (event) => event.device, 5);
  const sources = countBy(events, (event) => event.utm?.source || event.utmSource || (event.referrer ? "Referral" : "Direct"), 8);
  const totals = {
    visitors,
    pageViews: pageViews.length,
    ctaClicks,
    courseSelects: total("course_select"),
    paymentClicks,
    formStarts: total("booking_form_start"),
    bookingSubmits,
    submitErrors: total("booking_submit_error"),
    contactClicks: total("contact_click"),
    conversionRate: visitors ? Number(((bookingSubmits / visitors) * 100).toFixed(1)) : 0,
    ctaRate: pageViews.length ? Number(((ctaClicks / pageViews.length) * 100).toFixed(1)) : 0,
    paymentRate: ctaClicks ? Number(((paymentClicks / ctaClicks) * 100).toFixed(1)) : 0,
  };
  const courseRows = courseFunnel(events);
  const contentRows = contentAttribution(events);
  const deviceRows = groupedConversion(events, (event) => event.device, 6);
  const countryRows = groupedConversion(events, (event) => event.country, 8);
  const languageRows = groupedConversion(events, (event) => event.language, 8);
  return {
    rangeDays: days,
    totals,
    funnel: [
      { label: "Page views", value: pageViews.length },
      { label: "CTA clicks", value: ctaClicks },
      { label: "Course selects", value: total("course_select") },
      { label: "Payment clicks", value: paymentClicks },
      { label: "Form starts", value: total("booking_form_start") },
      { label: "Booking submits", value: bookingSubmits },
    ],
    daily: [...dailyMap.values()].map((item) => ({ date: item.date, pageViews: item.pageViews, visitors: item.visitors.size })),
    topPages: countBy(pageViews, (event) => event.path, 10),
    pageGroups: countBy(pageViews, (event) => pageGroup(event.path), 8),
    topReferrers: countBy(events.filter((event) => event.referrer), (event) => event.referrer.replace(/^https?:\/\//, ""), 8),
    countries: countBy(events, (event) => event.country, 8),
    languages: countBy(events, (event) => event.language, 8),
    devices,
    browsers: countBy(events, (event) => event.browser, 5),
    sources,
    courseInterest,
    courseFunnel: courseRows,
    articlePerformance,
    contentAttribution: contentRows,
    segmentConversion: {
      devices: deviceRows,
      countries: countryRows,
      languages: languageRows,
    },
    ctaLabels: countBy(events.filter((event) => event.eventType === "booking_cta_click"), (event) => eventMeta(event, "label"), 8),
    scrollDepth: countBy(events.filter((event) => event.eventType === "scroll_depth"), (event) => `${eventMeta(event, "depth")}%`, 5),
    engagement: [
      { label: "Contact clicks", value: total("contact_click") },
      { label: "Form starts", value: total("booking_form_start") },
      { label: "Submit errors", value: total("booking_submit_error") },
      { label: "90% scrolls", value: events.filter((event) => event.eventType === "scroll_depth" && Number(eventMeta(event, "depth")) >= 90).length },
    ],
    recommendations: buildRecommendations({ totals, courseInterest, articlePerformance, devices, sources }),
    priorityActions: buildPriorityActions({ courseRows, contentRows, deviceRows, countryRows, totals }),
    recentEvents: events.slice(-80).reverse(),
  };
}

function extractLessonCount(course) {
  const text = cleanString(course);
  const lessonMatch = text.match(/(\d+)\s+lessons?/i);
  if (lessonMatch) return Number(lessonMatch[1]);
  const sessionMatch = text.match(/(\d+)\s+sessions?/i);
  if (sessionMatch) return Number(sessionMatch[1]);
  return 1;
}

function isGroupCourse(course) {
  return /\bGroup\b/i.test(cleanString(course));
}

function addDays(dateValue, days) {
  const date = new Date(`${dateValue}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
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

function buildLessonSchedule({ course, date, time, frequency }) {
  const lessonCount = extractLessonCount(course);
  const steps = frequencySteps(frequency);
  const lessons = [];
  let currentDate = cleanString(date);
  for (let index = 0; index < lessonCount; index += 1) {
    if (index > 0) currentDate = addDays(currentDate, steps[(index - 1) % steps.length]);
    lessons.push({
      lesson: index + 1,
      date: currentDate,
      time: cleanString(time),
      status: "Scheduled",
    });
  }
  return lessons;
}

function bookingSchedule(booking) {
  if (Array.isArray(booking.lessonSchedule) && booking.lessonSchedule.length) {
    return booking.lessonSchedule;
  }
  if (booking.date && booking.time) {
    return [{ lesson: 1, date: booking.date, time: booking.time, status: "Scheduled" }];
  }
  return [];
}

function sameCohort(a, b) {
  return cleanString(a.course) === cleanString(b.course)
    && cleanString(a.date) === cleanString(b.date)
    && cleanString(a.time) === cleanString(b.time)
    && cleanString(a.frequency || "weekly") === cleanString(b.frequency || "weekly");
}

function analyzeAvailability(rows, payload) {
  const schedule = buildLessonSchedule(payload);
  const group = isGroupCourse(payload.course);
  const activeRows = rows.filter((row) => !["Cancelled", "Completed"].includes(cleanString(row.status)));
  const slotConflicts = [];
  const sameGroupMembers = activeRows.filter((row) => isGroupCourse(row.course) && sameCohort(row, payload));

  for (const lesson of schedule) {
    const rowsAtSlot = activeRows.filter((row) => bookingSchedule(row).some((item) => item.date === lesson.date && item.time === lesson.time));
    for (const row of rowsAtSlot) {
      const rowIsGroup = isGroupCourse(row.course);
      const allowedSameGroup = group && rowIsGroup && sameCohort(row, payload);
      if (!allowedSameGroup) {
        slotConflicts.push({
          lesson: lesson.lesson,
          date: lesson.date,
          time: lesson.time,
          course: row.course,
          student: row.fullName,
          type: rowIsGroup ? "group" : "one-on-one",
        });
      }
    }
  }

  if (!group) {
    return {
      ok: slotConflicts.length === 0,
      type: "one-on-one",
      schedule,
      lessonCount: schedule.length,
      conflicts: slotConflicts,
      message: slotConflicts.length
        ? "This time is already booked. Please choose another date or time slot."
        : "This time is available for 1-on-1 booking.",
    };
  }

  const currentStudents = sameGroupMembers.length;
  const maxStudents = 6;
  const minStudents = 4;
  const afterBooking = currentStudents + 1;
  const remainingSeats = Math.max(0, maxStudents - currentStudents);
  const neededToOpen = Math.max(0, minStudents - afterBooking);
  const full = currentStudents >= maxStudents;
  const ok = slotConflicts.length === 0 && !full;

  return {
    ok,
    type: "group",
    schedule,
    lessonCount: schedule.length,
    conflicts: slotConflicts,
    currentStudents,
    remainingSeats,
    neededToOpen,
    maxStudents,
    minStudents,
    cohortKey: `${payload.course} | ${payload.date} | ${payload.time} | ${payload.frequency || "weekly"}`,
    message: slotConflicts.length
      ? "This time is already used by another class. Please choose another date or time slot."
      : full
        ? "This group class is full. Please choose another time slot."
        : neededToOpen > 0
          ? `Group seat available. After you book, ${neededToOpen} more student(s) are needed to open this class.`
          : `Group seat available. This class can open after your booking. ${Math.max(0, remainingSeats - 1)} seat(s) will remain.`,
  };
}

function sortBookings(rows) {
  return [...rows].sort((a, b) => {
    const dateCompare = cleanString(a.date).localeCompare(cleanString(b.date));
    if (dateCompare !== 0) return dateCompare;
    const timeCompare = cleanString(a.time).localeCompare(cleanString(b.time));
    if (timeCompare !== 0) return timeCompare;
    return cleanString(a.createdAt).localeCompare(cleanString(b.createdAt));
  });
}

function toCsvValue(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function bookingsToCsv(rows) {
  const headers = [
    "createdAt",
    "status",
    "fullName",
    "email",
    "contact",
    "country",
    "timezone",
    "level",
    "course",
    "date",
    "time",
    "frequency",
    "lessonCount",
    "payment",
    "amount",
    "meetingLink",
    "goal",
    "notes",
    "lessonSchedule",
  ];
  const lines = [headers.join(",")];
  for (const row of sortBookings(rows)) {
    lines.push(headers.map((key) => toCsvValue(row[key])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

async function handleApi(req, res, pathname) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (pathname === "/api/availability.js") pathname = "/api/availability";
  if (pathname === "/api/analytics.js") pathname = "/api/analytics";
  if (pathname === "/api/bookings.js") pathname = "/api/bookings";
  if (pathname === "/api/bookings.csv.js") pathname = "/api/bookings.csv";
  if (pathname === "/api/booking-update.js" && url.searchParams.get("id")) {
    pathname = `/api/bookings/${url.searchParams.get("id")}`;
  }
  const adminToken = req.headers["x-admin-token"] || url.searchParams.get("token");
  const isPublicAvailability = pathname === "/api/availability" && req.method === "GET";
  const isPublicBookingCreate = pathname === "/api/bookings" && req.method === "POST";
  const isPublicAnalyticsCreate = pathname === "/api/analytics" && req.method === "POST";
  const isAdminRequest = !isPublicAvailability && !isPublicBookingCreate && !isPublicAnalyticsCreate;
  if (isAdminRequest && adminToken !== ADMIN_TOKEN) {
    sendJson(res, 401, { error: "Admin password required" });
    return true;
  }

  if (pathname === "/api/analytics" && req.method === "POST") {
    try {
      const payload = JSON.parse(await readBody(req));
      const { browser, os } = parseUserAgent(req.headers["user-agent"]);
      const rows = await readAnalytics();
      rows.push({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        sessionId: cleanString(payload.sessionId),
        eventType: cleanString(payload.eventType || payload.type || "event"),
        path: cleanString(payload.path),
        pageTitle: cleanString(payload.pageTitle || payload.title),
        referrer: cleanString(payload.referrer),
        utm: payload.utm || {},
        language: cleanString(payload.language),
        timezone: cleanString(payload.timezone),
        device: cleanString(payload.device),
        browser,
        os,
        country: cleanString(req.headers["x-vercel-ip-country"] || payload.country),
        metadata: payload.metadata || {},
      });
      await writeAnalytics(rows);
      sendJson(res, 201, { ok: true });
    } catch (error) {
      sendJson(res, 400, { error: error.message || "Invalid analytics event" });
    }
    return true;
  }

  if (pathname === "/api/analytics" && req.method === "GET") {
    const days = Math.min(Math.max(Number(url.searchParams.get("days") || 30), 1), 180);
    const since = new Date();
    since.setDate(since.getDate() - days + 1);
    since.setHours(0, 0, 0, 0);
    const rows = (await readAnalytics()).filter((event) => new Date(event.createdAt) >= since);
    sendJson(res, 200, { analytics: buildAnalyticsSummary(rows, days) });
    return true;
  }

  if (pathname === "/api/bookings" && req.method === "GET") {
    const rows = sortBookings(await readBookings());
    sendJson(res, 200, { bookings: rows });
    return true;
  }

  if (pathname === "/api/availability" && req.method === "GET") {
    const payload = {
      course: url.searchParams.get("course"),
      date: url.searchParams.get("date"),
      time: url.searchParams.get("time"),
      frequency: url.searchParams.get("frequency") || "weekly",
    };
    if (!cleanString(payload.course) || !cleanString(payload.date) || !cleanString(payload.time)) {
      sendJson(res, 200, { ok: false, pending: true, message: "Choose a course, date, and time to check availability." });
      return true;
    }
    sendJson(res, 200, analyzeAvailability(await readBookings(), payload));
    return true;
  }

  if (pathname === "/api/bookings" && req.method === "POST") {
    try {
      const payload = JSON.parse(await readBody(req));
      const required = ["fullName", "email", "contact", "country", "timezone", "level", "course", "date", "time", "frequency", "goal", "paymentReference", "paymentAccount"];
      const missing = required.filter((key) => !cleanString(payload[key]));
      if (missing.length) {
        sendJson(res, 400, { error: `Missing required fields: ${missing.join(", ")}` });
        return true;
      }
      const rows = await readBookings();
      const availability = analyzeAvailability(rows, payload);
      if (!availability.ok) {
        sendJson(res, 409, { error: availability.message, availability });
        return true;
      }
      const booking = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        status: "New",
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
        payment: "Paid - needs verification",
        amount: cleanString(payload.amount),
        paypalLink: cleanString(payload.paymentProofLink),
        notes: [
          `Payment reference: ${cleanString(payload.paymentReference)}`,
          `Payment account / name: ${cleanString(payload.paymentAccount)}`,
          cleanString(payload.paymentProofLink) ? `Receipt / screenshot link: ${cleanString(payload.paymentProofLink)}` : "",
          "",
          cleanString(payload.notes) ? `Student notes: ${cleanString(payload.notes)}` : "Student notes: None",
        ].filter((line) => line || line === "").join("\n"),
        meetingLink: "",
        teacherNotes: "",
      };
      rows.push(booking);
      await writeBookings(rows);
      sendJson(res, 201, { booking, emailSent: false, localPreview: true });
    } catch (error) {
      sendJson(res, 400, { error: error.message || "Invalid request" });
    }
    return true;
  }

  const updateMatch = pathname.match(/^\/api\/bookings\/([^/]+)$/);
  if (updateMatch && req.method === "PATCH") {
    try {
      const id = updateMatch[1];
      const payload = JSON.parse(await readBody(req));
      const rows = await readBookings();
      const index = rows.findIndex((row) => row.id === id);
      if (index === -1) {
        sendJson(res, 404, { error: "Booking not found" });
        return true;
      }
      const allowed = ["status", "meetingLink", "teacherNotes", "payment"];
      for (const key of allowed) {
        if (key in payload) rows[index][key] = cleanString(payload[key]);
      }
      rows[index].updatedAt = new Date().toISOString();
      await writeBookings(rows);
      sendJson(res, 200, { booking: rows[index] });
    } catch (error) {
      sendJson(res, 400, { error: error.message || "Invalid request" });
    }
    return true;
  }

  if (pathname === "/api/bookings.csv" && req.method === "GET") {
    const csv = bookingsToCsv(await readBookings());
    res.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mandrix-bookings.csv"',
    });
    res.end(csv);
    return true;
  }

  return false;
}

async function serveStatic(req, res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const filePath = path.normalize(path.join(__dirname, safePath));
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      res.writeHead(302, { Location: `${safePath.replace(/\/$/, "")}/index.html` });
      res.end();
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const content = await fs.readFile(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Content-Length": content.length,
      "Cache-Control": "no-store",
    });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

await ensureStore();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api/")) {
    const handled = await handleApi(req, res, url.pathname);
    if (!handled) sendJson(res, 404, { error: "API route not found" });
    return;
  }
  await serveStatic(req, res, url.pathname);
});

server.listen(PORT, () => {
  console.log(`Mandrix site running at http://127.0.0.1:${PORT}`);
});
