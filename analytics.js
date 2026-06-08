(function bootAnalytics() {
  const start = () => {
  const endpoint = "/api/analytics.js";
  const sessionKey = "mandrixAnalyticsSession";
  const optOutKey = "mandrixAnalyticsOptOut";
  const params = new URLSearchParams(window.location.search);

  if (params.get("mandrix_analytics") === "off" || params.get("analytics") === "off") {
    localStorage.setItem(optOutKey, "1");
  }

  if (params.get("mandrix_analytics") === "on" || params.get("analytics") === "on") {
    localStorage.removeItem(optOutKey);
  }

  const analyticsDisabled = localStorage.getItem(optOutKey) === "1";
  if (analyticsDisabled) {
    window.MandrixAnalytics = {
      disabled: true,
      track: () => {},
    };
    return;
  }

  const now = Date.now();
  const existing = JSON.parse(localStorage.getItem(sessionKey) || "null");
  const session = existing && now - existing.createdAt < 30 * 60 * 1000
    ? existing
    : { id: crypto.randomUUID ? crypto.randomUUID() : `${now}-${Math.random().toString(16).slice(2)}`, createdAt: now };
  localStorage.setItem(sessionKey, JSON.stringify(session));

  function deviceType() {
    const width = window.innerWidth || 0;
    if (width < 720) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  }

  function utm() {
    const params = new URLSearchParams(window.location.search);
    return {
      source: params.get("utm_source") || "",
      medium: params.get("utm_medium") || "",
      campaign: params.get("utm_campaign") || "",
    };
  }

  function send(eventType, metadata = {}) {
    const payload = {
      sessionId: session.id,
      eventType,
      path: `${window.location.pathname}${window.location.hash || ""}`,
      pageTitle: document.title,
      referrer: document.referrer,
      utm: utm(),
      language: navigator.language || "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      device: deviceType(),
      metadata,
    };
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
      return;
    }
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }

  window.MandrixAnalytics = { track: send };
  send("page_view");

  const depthMarks = [25, 50, 75, 90];
  const sentDepths = new Set();
  function trackScrollDepth() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const pageHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const depth = Math.round((scrollTop / pageHeight) * 100);
    for (const mark of depthMarks) {
      if (depth >= mark && !sentDepths.has(mark)) {
        sentDepths.add(mark);
        send("scroll_depth", { depth: mark });
      }
    }
  }
  window.addEventListener("scroll", trackScrollDepth, { passive: true });

  let formStarted = false;
  document.addEventListener("input", (event) => {
    if (!formStarted && event.target.closest("#bookingForm")) {
      formStarted = true;
      send("booking_form_start");
    }
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a, button");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    const label = (link.textContent || "").trim().slice(0, 120);
    const selectedCourse = document.querySelector("#bookingForm select[name='course']")?.value || "";
    if (link.matches("[data-course], .floating-contact a") || /book|diagnostic|预约|测评/i.test(label)) {
      send("booking_cta_click", { label, href, course: link.dataset.course || selectedCourse });
    }
    if (/paypal\.me|Pay Now|立即付款/i.test(href + label)) {
      send("payment_click", { label, href, course: selectedCourse });
    }
    if (/whatsapp|wa\.me|telegram|mailto:/i.test(href)) {
      send("contact_click", { label, href });
    }
  });

  document.addEventListener("change", (event) => {
    const field = event.target;
    if (field && field.matches("select[name='course'], #course")) {
      send("course_select", { course: field.value });
    }
  });
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(start, { timeout: 2500 });
  } else {
    window.setTimeout(start, 1200);
  }
})();
