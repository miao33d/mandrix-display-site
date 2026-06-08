import { isAdmin } from "../lib/_auth.js";
import { clearAnalyticsEvents, insertAnalyticsEvent, listAnalyticsEvents, sendJson } from "../lib/_supabase.js";

function clean(value) {
  return String(value || "").trim();
}

function parseUserAgent(userAgent = "") {
  const ua = String(userAgent);
  const browser = /Edg\//.test(ua) ? "Edge"
    : /Chrome\//.test(ua) ? "Chrome"
      : /Safari\//.test(ua) && !/Chrome\//.test(ua) ? "Safari"
        : /Firefox\//.test(ua) ? "Firefox"
          : /OPR\//.test(ua) ? "Opera"
            : "Other";
  const os = /iPhone|iPad|iPod/.test(ua) ? "iOS"
    : /Android/.test(ua) ? "Android"
      : /Mac OS X/.test(ua) ? "macOS"
        : /Windows/.test(ua) ? "Windows"
          : /Linux/.test(ua) ? "Linux"
            : "Other";
  return { browser, os };
}

function eventDate(event) {
  const date = new Date(event.createdAt);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function countBy(events, keyFn, limit = 8) {
  const map = new Map();
  for (const event of events) {
    const key = clean(keyFn(event)) || "Unknown";
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function uniqueCount(events, key) {
  return new Set(events.map((event) => clean(event[key])).filter(Boolean)).size;
}

function eventMeta(event, key) {
  return event.metadata && typeof event.metadata === "object" ? event.metadata[key] : "";
}

function pageGroup(path = "") {
  const value = clean(path);
  if (value.includes("/insights/")) return "Insights Article";
  if (value.includes("insights.html")) return "Insights Index";
  if (value.includes("zh.html")) return "Chinese Home";
  if (value.includes("#booking") || value === "/booking" || value.includes("/booking?")) return "Booking Section";
  if (["/method", "/courses", "/about", "/testimonials", "/faq", "/contact", "/diagnostic", "/daily", "/business", "/hsk", "/specialty", "/private"].includes(value)) return "English Home Section";
  if (value === "/" || value.includes("index.html")) return "English Home";
  return "Other";
}

function buildRecommendations({ totals, topPages, courseInterest, articlePerformance, devices, sources }) {
  const tips = [];
  if (totals.pageViews && totals.ctaClicks / totals.pageViews < 0.05) {
    tips.push("CTA click rate is low. Strengthen the first-screen diagnostic offer and repeat the $29 CTA after high-intent sections.");
  }
  if (totals.ctaClicks && totals.paymentClicks / totals.ctaClicks < 0.25) {
    tips.push("People click booking but do not reach payment enough. Simplify the booking block and make PayPal/payment steps more visible.");
  }
  if (totals.paymentClicks && totals.bookingSubmits / totals.paymentClicks < 0.55) {
    tips.push("Payment-to-form completion is leaking. Add clearer copy: pay first, then submit transaction ID, and keep the form shorter.");
  }
  if (courseInterest[0]) {
    tips.push(`Most course interest: ${courseInterest[0].label}. Put this program higher and use it in ads/social posts.`);
  }
  if (articlePerformance[0]) {
    tips.push(`Best article traffic: ${articlePerformance[0].label}. Add stronger diagnostic CTA inside this article.`);
  }
  if (devices[0]?.label === "mobile") {
    tips.push("Mobile users are leading. Prioritize mobile spacing, short sections, and sticky booking CTA.");
  }
  if (sources[0]?.label && sources[0].label !== "Direct") {
    tips.push(`Top source is ${sources[0].label}. Keep publishing content matched to that channel.`);
  }
  if (!tips.length && !topPages.length) {
    tips.push("No meaningful data yet. After the site receives traffic, this panel will generate concrete optimization advice.");
  }
  return tips.slice(0, 6);
}

function groupedConversion(events, keyFn, limit = 8) {
  const groups = new Map();
  for (const event of events) {
    const key = clean(keyFn(event)) || "Unknown";
    if (!groups.has(key)) {
      groups.set(key, {
        label: key,
        visitors: new Set(),
        pageViews: 0,
        ctaClicks: 0,
        paymentClicks: 0,
        bookingSubmits: 0,
      });
    }
    const group = groups.get(key);
    if (event.sessionId) group.visitors.add(event.sessionId);
    if (event.eventType === "page_view") group.pageViews += 1;
    if (event.eventType === "booking_cta_click") group.ctaClicks += 1;
    if (event.eventType === "payment_click") group.paymentClicks += 1;
    if (event.eventType === "booking_submit_success") group.bookingSubmits += 1;
  }
  return [...groups.values()]
    .map((group) => ({
      ...group,
      visitors: group.visitors.size,
      conversionRate: group.visitors.size ? Number(((group.bookingSubmits / group.visitors.size) * 100).toFixed(1)) : 0,
      intentScore: group.ctaClicks * 2 + group.paymentClicks * 4 + group.bookingSubmits * 8,
    }))
    .sort((a, b) => b.intentScore - a.intentScore || b.visitors - a.visitors)
    .slice(0, limit);
}

function courseFunnel(events) {
  return groupedConversion(
    events.filter((event) => eventMeta(event, "course")),
    (event) => eventMeta(event, "course"),
    10,
  );
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
    const articleViews = sessionEvents.filter((event) => event.eventType === "page_view" && clean(event.path).includes("/insights/"));
    if (!articleViews.length) continue;
    const hasCta = sessionEvents.some((event) => event.eventType === "booking_cta_click");
    const hasPayment = sessionEvents.some((event) => event.eventType === "payment_click");
    const hasSubmit = sessionEvents.some((event) => event.eventType === "booking_submit_success");
    for (const view of articleViews) {
      const key = clean(view.path).replace(/^\/insights\//, "").replace(/\.html.*$/, "");
      if (!rows.has(key)) rows.set(key, { label: key, views: 0, ctaClicks: 0, paymentClicks: 0, bookingSubmits: 0 });
      const row = rows.get(key);
      row.views += 1;
      if (hasCta) row.ctaClicks += 1;
      if (hasPayment) row.paymentClicks += 1;
      if (hasSubmit) row.bookingSubmits += 1;
    }
  }
  return [...rows.values()]
    .map((row) => ({
      ...row,
      assistRate: row.views ? Number(((row.ctaClicks / row.views) * 100).toFixed(1)) : 0,
      intentScore: row.ctaClicks * 2 + row.paymentClicks * 4 + row.bookingSubmits * 8,
    }))
    .sort((a, b) => b.intentScore - a.intentScore || b.views - a.views)
    .slice(0, 8);
}

function buildPriorityActions({ courseRows, contentRows, deviceRows, countryRows, totals }) {
  const actions = [];
  if (courseRows[0]) {
    actions.push({
      priority: "High",
      title: `Push ${courseRows[0].label}`,
      detail: "This course has the strongest buying intent. Give it stronger placement, clearer outcomes, and more social content.",
    });
  }
  if (contentRows[0] && contentRows[0].ctaClicks) {
    actions.push({
      priority: "High",
      title: `Strengthen CTA in ${contentRows[0].label}`,
      detail: "This article is already assisting booking behavior. Add a mid-article diagnostic CTA and a stronger end CTA.",
    });
  }
  if (deviceRows[0]?.label === "mobile" && totals.ctaRate < 8) {
    actions.push({
      priority: "Medium",
      title: "Tighten mobile booking path",
      detail: "Mobile visitors dominate but CTA rate is not high enough. Keep the booking button sticky and reduce form friction.",
    });
  }
  if (countryRows[0]) {
    actions.push({
      priority: "Medium",
      title: `Localize for ${countryRows[0].label}`,
      detail: "Use this market in testimonials, examples, posting times, and course scenarios.",
    });
  }
  if (totals.submitErrors > 0) {
    actions.push({
      priority: "High",
      title: "Fix failed submissions first",
      detail: "Submission errors mean paid students may be blocked. Check form validation, availability, and email/API status.",
    });
  }
  if (!actions.length) {
    actions.push({
      priority: "Watch",
      title: "Collect more traffic",
      detail: "The dashboard is ready. After real visits come in, priority actions will become more specific.",
    });
  }
  return actions.slice(0, 6);
}

function buildSummary(events, days) {
  const pageViews = events.filter((event) => event.eventType === "page_view");
  const visitors = uniqueCount(events, "sessionId");
  const ctaClicks = events.filter((event) => event.eventType === "booking_cta_click").length;
  const courseSelects = events.filter((event) => event.eventType === "course_select").length;
  const paymentClicks = events.filter((event) => event.eventType === "payment_click").length;
  const formStarts = events.filter((event) => event.eventType === "booking_form_start").length;
  const bookingSubmits = events.filter((event) => event.eventType === "booking_submit_success").length;
  const submitErrors = events.filter((event) => event.eventType === "booking_submit_error").length;
  const contactClicks = events.filter((event) => event.eventType === "contact_click").length;
  const dailyMap = new Map();
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    dailyMap.set(date.toISOString().slice(0, 10), { date: date.toISOString().slice(0, 10), pageViews: 0, visitors: new Set() });
  }
  for (const event of events) {
    const key = eventDate(event);
    if (!dailyMap.has(key)) continue;
    if (event.eventType === "page_view") dailyMap.get(key).pageViews += 1;
    if (event.sessionId) dailyMap.get(key).visitors.add(event.sessionId);
  }
  const daily = [...dailyMap.values()].map((item) => ({
    date: item.date,
    pageViews: item.pageViews,
    visitors: item.visitors.size,
  }));

  const courseInterest = countBy(
    events.filter((event) => ["course_select", "booking_cta_click", "booking_submit_success"].includes(event.eventType) && eventMeta(event, "course")),
    (event) => eventMeta(event, "course"),
    10,
  ).filter((row) => row.label !== "Unknown");
  const articlePerformance = countBy(
    pageViews.filter((event) => clean(event.path).includes("/insights/")),
    (event) => event.path.replace(/^\/insights\//, "").replace(/\.html.*$/, ""),
    8,
  );
  const devices = countBy(events, (event) => event.device, 5);
  const sources = countBy(events, (event) => event.utmSource || (event.referrer ? "Referral" : "Direct"), 8);
  const topPages = countBy(pageViews, (event) => event.path, 10);
  const totals = {
    visitors,
    pageViews: pageViews.length,
    ctaClicks,
    courseSelects,
    paymentClicks,
    formStarts,
    bookingSubmits,
    submitErrors,
    contactClicks,
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
      { label: "Course selects", value: courseSelects },
      { label: "Payment clicks", value: paymentClicks },
      { label: "Form starts", value: formStarts },
      { label: "Booking submits", value: bookingSubmits },
    ],
    daily,
    topPages,
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
      { label: "Contact clicks", value: contactClicks },
      { label: "Form starts", value: formStarts },
      { label: "Submit errors", value: submitErrors },
      { label: "90% scrolls", value: events.filter((event) => event.eventType === "scroll_depth" && Number(eventMeta(event, "depth")) >= 90).length },
    ],
    recommendations: buildRecommendations({ totals, topPages, courseInterest, articlePerformance, devices, sources }),
    priorityActions: buildPriorityActions({ courseRows, contentRows, deviceRows, countryRows, totals }),
    recentEvents: events.slice(0, 80),
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const { browser, os } = parseUserAgent(req.headers["user-agent"]);
      const country = req.headers["x-vercel-ip-country"] || req.headers["cf-ipcountry"] || payload.country || "";
      const event = {
        ...payload,
        eventType: payload.eventType || payload.type || "event",
        browser: payload.browser || browser,
        os: payload.os || os,
        country,
      };
      if (!event.sessionId || !event.eventType) {
        sendJson(res, 400, { error: "Missing analytics event fields" });
        return;
      }
      await insertAnalyticsEvent(event);
      sendJson(res, 201, { ok: true });
      return;
    }

    if (req.method === "DELETE") {
      if (!isAdmin(req)) {
        sendJson(res, 401, { error: "Admin password required" });
        return;
      }
      await clearAnalyticsEvents();
      sendJson(res, 200, { ok: true, cleared: true });
      return;
    }

    if (req.method !== "GET") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }
    if (!isAdmin(req)) {
      sendJson(res, 401, { error: "Admin password required" });
      return;
    }

    const days = Math.min(Math.max(Number(req.query.days || 30), 1), 180);
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days + 1);
    sinceDate.setHours(0, 0, 0, 0);
    const events = await listAnalyticsEvents({ since: sinceDate.toISOString() });
    sendJson(res, 200, { analytics: buildSummary(events, days) });
  } catch (error) {
    const message = error.message || "Analytics request failed";
    const setupNeeded = /analytics_events|schema cache|relation/i.test(message);
    sendJson(res, setupNeeded ? 424 : 500, { error: message, setupNeeded });
  }
}
