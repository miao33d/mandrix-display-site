const list = document.querySelector("#bookingList");
const lessonList = document.querySelector("#lessonList");
const summary = document.querySelector("#bookingSummary");
const refreshButton = document.querySelector("#refreshBookings");
const exportButton = document.querySelector("#exportCsv");
const langToggle = document.querySelector("#langToggle");
const statusFilter = document.querySelector("#statusFilter");
const searchInput = document.querySelector("#searchBookings");
const timetableStart = document.querySelector("#timetableStart");
const timetableDays = document.querySelector("#timetableDays");
const loginPanel = document.querySelector("#adminLogin");
const loginForm = document.querySelector("#adminLoginForm");
const passwordInput = document.querySelector("#adminPassword");
const loginMessage = document.querySelector("#adminLoginMessage");
const adminTabs = document.querySelectorAll("[data-admin-tab]");
const adminPanels = document.querySelectorAll("[data-admin-panel]");
const analyticsRange = document.querySelector("#analyticsRange");
const clearAnalyticsButton = document.querySelector("#clearAnalyticsButton");
const analyticsStatus = document.querySelector("#analyticsStatus");
const analyticsKpis = document.querySelector("#analyticsKpis");
const dailyChart = document.querySelector("#dailyChart");
const funnelList = document.querySelector("#funnelList");
const topPages = document.querySelector("#topPages");
const profileSplits = document.querySelector("#profileSplits");
const trafficSources = document.querySelector("#trafficSources");
const recentEvents = document.querySelector("#recentEvents");
const growthDiagnosis = document.querySelector("#growthDiagnosis");
const courseInterest = document.querySelector("#courseInterest");
const contentPerformance = document.querySelector("#contentPerformance");
const engagementSignals = document.querySelector("#engagementSignals");
const ctaPerformance = document.querySelector("#ctaPerformance");
const courseConversion = document.querySelector("#courseConversion");
const articleAssists = document.querySelector("#articleAssists");
const segmentConversion = document.querySelector("#segmentConversion");
const priorityActions = document.querySelector("#priorityActions");
const renewalPanel = document.querySelector("#renewalPanel");
const seoForm = document.querySelector("#seoForm");
const seoPreset = document.querySelector("#seoPreset");
const seoChecks = document.querySelector("#seoChecks");
const seoPreview = document.querySelector("#seoPreview");
const seoOutput = document.querySelector("#seoOutput");
const seoPreviewPath = document.querySelector("#seoPreviewPath");
const seoSlugPreview = document.querySelector("#seoSlugPreview");
const seoCopyPackage = document.querySelector("#seoCopyPackage");
const seoDownloadHtml = document.querySelector("#seoDownloadHtml");
const seoCopySitemap = document.querySelector("#seoCopySitemap");
const seoSaveDraft = document.querySelector("#seoSaveDraft");
const seoPublishLive = document.querySelector("#seoPublishLive");
const seoLiveStatus = document.querySelector("#seoLiveStatus");
const seoAiCode = document.querySelector("#seoAiCode");
const seoApplyAiCode = document.querySelector("#seoApplyAiCode");
const seoClearAiCode = document.querySelector("#seoClearAiCode");
const seoCopyAiPrompt = document.querySelector("#seoCopyAiPrompt");
const seoImagePromptBox = document.querySelector("#seoImagePrompt");
const seoCopyImagePrompt = document.querySelector("#seoCopyImagePrompt");
const seoImageUpload = document.querySelector("#seoImageUpload");
const seoImagePreview = document.querySelector("#seoImagePreview");
const seoImageTarget = document.querySelector("#seoImageTarget");
const seoImageGallery = document.querySelector("#seoImageGallery");
const levelChecksStatus = document.querySelector("#levelChecksStatus");
const levelChecksList = document.querySelector("#levelChecksList");

const timeSlots = [
  "08:00 - 09:00",
  "09:15 - 10:15",
  "10:30 - 11:30",
  "13:00 - 14:00",
  "14:15 - 15:15",
  "15:30 - 16:30",
  "16:45 - 17:45",
  "19:00 - 20:00",
  "20:15 - 21:15",
  "21:30 - 22:30",
  "22:45 - 23:45",
];

const statuses = [
  "New",
  "Paid - needs verification",
  "Payment Pending",
  "Paid",
  "Time Confirmed",
  "Meeting Link Sent",
  "Completed",
  "Cancelled",
];

const seoUsedImages = {
  "assets/course-business.jpg": "首页/中文页 Business 课程图",
  "assets/course-daily.jpg": "首页/中文页 Daily 课程图",
  "assets/course-hsk.jpg": "首页/中文页 HSK 课程图",
  "assets/course-diagnostic-student.webp": "首页/中文页 Diagnostic 图",
  "assets/jane.png": "首页/中文页 Jane 头像",
  "assets/corporate-training-hero.png": "Corporate 企业培训页",
};

const seoImageLibrary = [
  { value: "assets/sourcing-supplier-laptop.jpg", label: "Sourcing supplier laptop", topic: "Sourcing / supplier communication", alt: "Supplier sourcing communication on laptop" },
  { value: "assets/backup-business-meeting.jpg", label: "Business meeting desk", topic: "Business Chinese / meetings", alt: "Business meeting desk with reports and working notes" },
  { value: "assets/backup-study-desk.jpg", label: "Study desk", topic: "HSK / study planning", alt: "Online HSK preparation desk with notes and video lesson" },
  { value: "assets/course-daily.jpg", label: "Daily Chinese", topic: "Daily Chinese / conversations", alt: "Adult learner practice for daily Chinese conversation" },
  { value: "assets/course-diagnostic-online.webp", label: "Diagnostic online", topic: "Free AI check / diagnosis", alt: "Online Chinese diagnostic session on a laptop" },
  { value: "assets/corporate-training-hero.png", label: "Corporate training", topic: "Corporate training", alt: "Corporate Chinese training session" },
  { value: "assets/backup-online-lesson.jpg", label: "Online lesson", topic: "Flexible online lesson", alt: "Adult online Chinese lesson on screen" },
  { value: "assets/backup-warehouse.jpg", label: "Warehouse sourcing", topic: "Sourcing / procurement", alt: "Warehouse sourcing and procurement scene" },
  { value: "assets/mandrix-scene-1on1.jpg", label: "1-on-1 lesson", topic: "Private lesson", alt: "One-on-one Mandarin lesson scene" },
  { value: "assets/mandrix-scene-daily.jpg", label: "Daily scene", topic: "Daily communication", alt: "Daily Chinese learning scene" },
  { value: "assets/mandrix-scene-hsk.jpg", label: "HSK scene", topic: "HSK coaching", alt: "HSK coaching scene with notes" },
  { value: "assets/mandrix-scene-method.jpg", label: "Method scene", topic: "Learning method", alt: "Mandrix learning method visual" },
  { value: "assets/mandrix-scene-reception.jpg", label: "Reception scene", topic: "Corporate / office", alt: "Professional reception and office learning scene" },
  { value: "assets/jane-portrait.jpg", label: "Jane portrait", topic: "Founder / about", alt: "Jane Chen professional portrait" },
];

const seoCategoryLabels = {
  "business-chinese": "Business Chinese",
  "hsk-prep": "HSK Prep",
  "daily-chinese": "Daily Chinese",
  "sourcing-chinese": "Sourcing Chinese",
  "culture-communication": "Culture & Communication",
  "learning-method": "Learning Method",
  "supplier-communication": "Supplier Communication",
  "workplace-mandarin": "Workplace Mandarin",
  "chinese-for-amazon-sellers": "Chinese for Amazon Sellers",
  "adult-mandarin-learning": "Adult Mandarin Learning",
  "professional-chinese": "Professional Chinese",
};

const seoPresets = {
  custom: {
    category: "learning-method",
    status: "published",
    slug: "new-mandarin-page",
    title: "Learn Mandarin Chinese Online | Mandrix",
    description: "Logic-based Mandarin Chinese lessons for adults. Start with the free AI level check, then choose a paid path if it fits.",
    eyebrow: "Mandrix Chinese",
    h1: "Build Chinese you can actually use.",
    lead: "A focused Mandrix page for adult learners who want Chinese explained through logic, structure, and real output.",
    articleBody: "This guide should explain one clear Chinese learning problem, show how Mandrix diagnoses it, and give the learner a practical next step. Keep the writing specific, grounded, and useful for adults.",
    image: "assets/sourcing-supplier-laptop.jpg",
    imageAlt: "Reviewing Mandarin learning materials on a laptop",
    chips: "Logic first, Adult learners, Real output, Free AI check",
    primaryLabel: "Start Free AI Level Check",
    primaryHref: "/level-check",
    secondaryLabel: "View Courses",
    secondaryHref: "/courses",
    card1Title: "Diagnose the blocker",
    card1Text: "Find the exact grammar, tone, or communication gap that keeps your Chinese from moving forward.",
    card2Title: "Decode the logic",
    card2Text: "Learn the sentence structure behind useful Chinese instead of memorizing scattered phrases.",
    card3Title: "Build real output",
    card3Text: "Leave each session with templates, corrected wording, or a roadmap you can use right away.",
    sectionEyebrow: "Why Mandrix works",
    sectionTitle: "Chinese becomes lighter when the structure is visible.",
    sectionBody: "Most adult learners do not need more random phrases. They need someone to show how Chinese sentences are assembled, then help them build their own.",
    ctaEyebrow: "Start with diagnosis",
    ctaTitle: "Find the blocker first.",
    ctaBody: "The free AI level check gives you an initial direction before you invest in a paid program.",
  },
  sourcing: {
    category: "sourcing-chinese",
    status: "published",
    slug: "chinese-for-sourcing-agents",
    title: "Chinese for Sourcing Agents & Amazon Sellers | Mandrix",
    description: "Learn practical Mandarin for factory visits, supplier negotiation, 1688, MOQ, and WeChat communication. Logic-based Chinese for buyers and importers.",
    eyebrow: "Sourcing & Supplier Chinese",
    h1: "Stop relying on Google Translate with your suppliers.",
    lead: "For buyers, Amazon sellers, and importers who deal with Chinese factories daily. Learn the Mandarin that actually comes up: MOQ, samples, lead time, quality issues, and price negotiation.",
    articleBody: "Sourcing conversations are different from general Mandarin. The goal is not to sound impressive. The goal is to ask accurate questions, reduce misunderstanding, and protect business decisions.\n\nA strong sourcing Chinese lesson should include supplier WeChat phrases, factory visit questions, 1688 listing language, sample requests, MOQ discussion, payment terms, production timing, and quality issue wording.\n\nMandrix starts by diagnosing the exact sourcing situations you face, then builds reusable Chinese templates around them.",
    image: "assets/sourcing-supplier-laptop.jpg",
    imageAlt: "Reviewing supplier details and sourcing messages on a laptop",
    chips: "Factory visits, Supplier WeChat, 1688 listings, MOQ and price terms",
    primaryLabel: "Start Free AI Level Check",
    primaryHref: "/level-check",
    secondaryLabel: "View Sourcing Program",
    secondaryHref: "/specialty",
    card1Title: "Factory and market visits",
    card1Text: "Handle Yiwu, Guangzhou, Shenzhen, and factory floor conversations without depending on translation apps for every sentence.",
    card2Title: "Supplier WeChat and 1688",
    card2Text: "Read listings, negotiate on WeChat, ask follow-up questions, and keep communication professional in Chinese.",
    card3Title: "Negotiation language",
    card3Text: "Discuss price, MOQ, samples, lead time, payment terms, quality issues, and shipment details with more control.",
    sectionEyebrow: "Why this is not general Mandarin",
    sectionTitle: "Sourcing Chinese protects business decisions.",
    sectionBody: "General Chinese teaches you how to order food and introduce yourself. Sourcing Chinese teaches you how to ask about quality without sounding accusatory, negotiate price without losing face, and understand what a supplier means when they say no problem.",
    ctaEyebrow: "Not sure where to start?",
    ctaTitle: "Start with the free AI level check.",
    ctaBody: "In 60 minutes, Jane identifies what blocks your supplier communication and maps the fastest path toward usable sourcing Chinese.",
  },
  business: {
    category: "business-chinese",
    status: "published",
    slug: "business-chinese-online",
    title: "Business Chinese Lessons Online for Professionals | Mandrix",
    description: "1-on-1 Business Chinese coaching for professionals. Emails, WeChat, meetings, negotiations. Bring real work materials. Start with the free AI level check.",
    eyebrow: "Business Chinese Online",
    h1: "Sound professional in Chinese, not just grammatically correct.",
    lead: "Business Chinese is not vocabulary. Tone, structure, and cultural context decide whether your message sounds clear and trustworthy or blunt and unprepared.",
    articleBody: "Business Chinese requires more than correct grammar. In real work, the same sentence can sound confident, abrupt, vague, or overly casual depending on structure and tone.\n\nMandrix helps professionals work with real materials: WeChat messages, emails, meeting notes, proposals, presentations, and follow-up wording. The focus is to understand why Chinese business communication works the way it does, then build reusable templates.\n\nStart with a diagnostic if you need to know whether your blocker is grammar, vocabulary, tone, pronunciation, or cultural context.",
    image: "assets/backup-business-meeting.jpg",
    imageAlt: "Business meeting desk with reports and working notes",
    chips: "WeChat and email, Meetings and calls, Negotiation, Professional tone",
    primaryLabel: "Start Free AI Level Check",
    primaryHref: "/level-check",
    secondaryLabel: "View Business Programs",
    secondaryHref: "/courses",
    card1Title: "WeChat and professional email",
    card1Text: "Write messages that sound natural, respectful, and appropriately formal instead of translated or stiff.",
    card2Title: "Meetings and calls",
    card2Text: "Follow conversations, ask clarifying questions, express opinions, and respond without translating every sentence in your head.",
    card3Title: "Negotiation and presentations",
    card3Text: "Structure proposals, handle objections, present numbers, and manage difficult conversations with the right register.",
    sectionEyebrow: "Bring real work materials",
    sectionTitle: "Your course can use your real messages.",
    sectionBody: "Mandrix lessons can work with real emails, WeChat messages, meeting notes, company introductions, proposals, or presentation drafts. You leave with polished, ready-to-use wording and a correction record you can reuse.",
    ctaEyebrow: "Start with diagnosis",
    ctaTitle: "Find the workplace blocker first.",
    ctaBody: "The free AI level check identifies likely grammar, tone, or structure gaps behind your business communication problem.",
  },
  hsk: {
    category: "hsk-prep",
    status: "published",
    slug: "hsk-preparation-online",
    title: "HSK 3.0 Exam Preparation Online — Tutor & Coaching | Mandrix",
    description: "Structured HSK 3.0 preparation with 1-on-1 coaching. Vocabulary, grammar, listening, reading, and mock tests. Aligned with official HSK framework.",
    eyebrow: "HSK Exam Preparation",
    h1: "Pass your HSK exam without just drilling vocabulary lists.",
    lead: "Most students struggle with HSK because they never understood the grammar patterns behind the exam questions. Mandrix decodes the logic so the test format has no surprises.",
    articleBody: "HSK preparation works best when vocabulary, grammar, listening, reading, and mock test correction are connected. Memorizing lists may help short term, but it often breaks down when the exam asks the same pattern in a new way.\n\nMandrix starts with a level diagnosis, then builds a study plan around the learner's target level, weak grammar points, listening habits, and reading speed.\n\nThe goal is exam readiness and practical Chinese at the same time.",
    image: "assets/backup-study-desk.jpg",
    imageAlt: "Online HSK preparation desk with notes and video lesson",
    chips: "Level diagnosis, Grammar logic, Mock tests, Correction plan",
    primaryLabel: "Start Free AI Level Check",
    primaryHref: "/level-check",
    secondaryLabel: "View HSK Programs",
    secondaryHref: "/courses",
    card1Title: "Level diagnosis first",
    card1Text: "Know exactly where you are and what to study before buying a full course or choosing an exam date.",
    card2Title: "Grammar logic, not just rules",
    card2Text: "Understand the patterns behind HSK questions so you can answer new questions, not just repeat old ones.",
    card3Title: "Mock tests and correction",
    card3Text: "Review mistakes with Jane and identify why the wrong answer looked right before the exam makes it expensive.",
    sectionEyebrow: "Aligned preparation",
    sectionTitle: "HSK study should build real Chinese too.",
    sectionBody: "Mandrix is not an official HSK testing center. Courses are aligned with the official HSK 3.0 framework and use exam-style practice to build both test readiness and practical communication ability.",
    ctaEyebrow: "Start with an HSK diagnostic",
    ctaTitle: "Map your study plan before you cram.",
    ctaBody: "In 60 minutes, Jane checks your current level, finds your biggest HSK blockers, and recommends a realistic plan for your target level.",
  },
};

const i18n = {
  en: {
    toggle: "中文",
    pageTitle: "Booking Requests",
    refresh: "Refresh",
    export: "Export CSV",
    viewSite: "View Site",
    access: "Admin Access",
    passwordTitle: "Enter the admin password",
    passwordHint: "Enter the current admin password to load bookings.",
    wrongPassword: "Wrong admin password. Enter the current password and try again.",
    passwordLabel: "Admin Password",
    load: "Load Bookings",
    statusFilter: "Status Filter",
    all: "All",
    search: "Search",
    searchPlaceholder: "Name, email, course, contact...",
    startDate: "Timetable Start Date",
    range: "Timetable Range",
    days: (count) => `${count} days`,
    timetable: "Timetable",
    timetableTitle: "Availability Timetable",
    timetableIntro: "Available slots are shown by date and Beijing time. Booked slots show the student and course.",
    available: "Available",
    booked: "Booked",
    scheduled: "Scheduled",
    total: "Total",
    active: "Active",
    paidPending: "Paid / Verify",
    lessonsToday: "Lessons Today",
    renewalDue: "Renewal Follow-ups",
    renewalPanelTitle: "Renewal Follow-ups",
    renewalPanelIntro: "Students who need a continuation message before momentum drops.",
    noRenewals: "No renewal follow-ups due right now.",
    copyRenewal: "Copy Follow-up Email",
    clearAnalytics: "Clear analytics",
    clearAnalyticsConfirm: "Clear all website analytics events? This will not delete booking records.",
    clearingAnalytics: "Clearing...",
    analyticsCleared: "Analytics records cleared.",
    analyticsClearFailed: "Could not clear analytics. Please check the admin password and try again.",
    copied: "Copied",
    noBookings: "No booking requests found.",
    noLessons: "No lessons in this range.",
    loadingBookings: "Loading bookings...",
    loadingTimetable: "Loading timetable...",
    loadFailed: "Could not load bookings. Please refresh and try again.",
    saveFailed: "Save failed. Please try again.",
    exportFailed: "Export failed. Please refresh and enter the admin password again.",
    course: "Course",
    frequency: "Frequency / Lessons",
    country: "Country / Time Zone",
    level: "Level",
    payment: "Payment",
    amount: "Amount",
    receipt: "Receipt / Payment Link",
    created: "Created",
    goal: "Learning Goal",
    notes: "Payment Details / Notes",
    schedule: "Auto Lesson Schedule",
    status: "Status",
    meeting: "Meeting Link",
    teacherNotes: "Teacher Notes",
    save: "Save",
    deleteBooking: "Delete",
    deleteConfirm: "Delete this booking? This cannot be undone.",
    saving: "Saving...",
    saved: "Saved",
    openMeeting: "Open Meeting",
    beijingTime: "Beijing Time",
    group: "Group",
    needs: "needs",
    more: "more",
    canOpen: "can open",
  },
  zh: {
    toggle: "English",
    pageTitle: "预约订单",
    refresh: "刷新",
    export: "导出 CSV",
    viewSite: "查看官网",
    access: "后台访问",
    passwordTitle: "输入后台密码",
    passwordHint: "输入当前后台密码后加载预约订单。",
    wrongPassword: "后台密码错误。请输入当前密码后重试。",
    passwordLabel: "后台密码",
    load: "加载订单",
    statusFilter: "状态筛选",
    all: "全部",
    search: "搜索",
    searchPlaceholder: "姓名、邮箱、课程、联系方式...",
    startDate: "课表开始日期",
    range: "课表范围",
    days: (count) => `${count} 天`,
    timetable: "课表",
    timetableTitle: "可预约时间表",
    timetableIntro: "按日期和北京时间显示可预约时段；已占用时段会显示学生和课程。",
    available: "可预约",
    booked: "已占用",
    scheduled: "已排课",
    total: "总订单",
    active: "进行中",
    paidPending: "已付款待核验",
    lessonsToday: "今日课程",
    renewalDue: "续课跟进",
    renewalPanelTitle: "续课漏斗提醒",
    renewalPanelIntro: "这些学员需要现在跟进，避免课包结束后自然流失。",
    noRenewals: "当前没有需要跟进的续课提醒。",
    copyRenewal: "复制跟进邮件",
    clearAnalytics: "清空浏览数据",
    clearAnalyticsConfirm: "确定清空所有浏览统计吗？此操作不会删除预约订单。",
    clearingAnalytics: "清空中...",
    analyticsCleared: "浏览数据已清空。",
    analyticsClearFailed: "清空失败，请确认后台密码后重试。",
    copied: "已复制",
    noBookings: "没有符合条件的预约订单。",
    noLessons: "这个范围内没有课程。",
    loadingBookings: "正在加载订单...",
    loadingTimetable: "正在加载课表...",
    loadFailed: "订单加载失败，请刷新后重试。",
    saveFailed: "保存失败，请重试。",
    exportFailed: "导出失败，请刷新并重新输入后台密码。",
    course: "课程",
    frequency: "频率 / 节数",
    country: "国家 / 时区",
    level: "水平",
    payment: "付款",
    amount: "金额",
    receipt: "收据 / 付款链接",
    created: "创建时间",
    goal: "学习目标",
    notes: "付款信息 / 备注",
    schedule: "自动课表",
    status: "状态",
    meeting: "会议链接",
    teacherNotes: "老师备注",
    save: "保存",
    deleteBooking: "删除",
    deleteConfirm: "确定删除这条订单吗？此操作不可撤销。",
    saving: "保存中...",
    saved: "已保存",
    openMeeting: "打开会议",
    beijingTime: "北京时间",
    group: "小班",
    needs: "还差",
    more: "人",
    canOpen: "可开班",
  },
};

let bookings = [];
let levelChecks = [];
let analytics = null;
let activeAdminTab = new URLSearchParams(window.location.search).get("tab") || "operations";
if (!["operations", "level-checks", "analytics", "seo"].includes(activeAdminTab)) activeAdminTab = "operations";
let adminLang = localStorage.getItem("mandrixAdminLang") || "zh";
let seoUploadedImagePreviewUrl = "";
const urlToken = new URLSearchParams(window.location.search).get("token") || "";
let adminToken = urlToken || sessionStorage.getItem("mandrixAdminToken") || "";
if (urlToken) sessionStorage.setItem("mandrixAdminToken", urlToken);

function t(key, ...args) {
  const value = i18n[adminLang][key] || i18n.en[key] || key;
  return typeof value === "function" ? value(...args) : value;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateValue, days) {
  const date = new Date(`${dateValue}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat(adminLang === "zh" ? "zh-CN" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatCreatedAt(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat(adminLang === "zh" ? "zh-CN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function setAdminContentVisible(visible) {
  document.querySelectorAll(".admin-tabs, [data-admin-panel]")
    .forEach((section) => {
      section.hidden = !visible;
    });
  if (visible) switchAdminTab(activeAdminTab);
}

function applyLanguage() {
  document.documentElement.lang = adminLang === "zh" ? "zh-CN" : "en";
  document.querySelector(".admin-header .eyebrow").textContent = "Mandrix Admin";
  document.querySelector(".admin-header h1").textContent = t("pageTitle");
  langToggle.textContent = t("toggle");
  refreshButton.textContent = t("refresh");
  exportButton.textContent = t("export");
  if (clearAnalyticsButton) clearAnalyticsButton.textContent = t("clearAnalytics");
  document.querySelector(".admin-header a.btn").textContent = t("viewSite");
  document.querySelector("#adminLogin .eyebrow").textContent = t("access");
  document.querySelector("#adminLogin h2").textContent = t("passwordTitle");
  loginMessage.textContent = t("passwordHint");
  document.querySelector("#adminLogin label").childNodes[0].textContent = `${t("passwordLabel")} `;
  document.querySelector("#adminLogin button").textContent = t("load");
  document.querySelector("label[for='statusFilter']")?.remove();
  document.querySelector(".admin-section-head .eyebrow").textContent = t("timetable");
  document.querySelector(".admin-section-head h2").textContent = t("timetableTitle");
  document.querySelector(".admin-section-head p:last-child").textContent = t("timetableIntro");

  const toolbarLabels = document.querySelectorAll(".admin-toolbar label");
  toolbarLabels[0].childNodes[0].textContent = `${t("statusFilter")} `;
  toolbarLabels[1].childNodes[0].textContent = `${t("search")} `;
  toolbarLabels[2].childNodes[0].textContent = `${t("startDate")} `;
  toolbarLabels[3].childNodes[0].textContent = `${t("range")} `;
  statusFilter.options[0].textContent = t("all");
  searchInput.placeholder = t("searchPlaceholder");
  [...timetableDays.options].forEach((option) => {
    option.textContent = t("days", option.value);
  });
}

function showLogin(message = "") {
  adminToken = "";
  sessionStorage.removeItem("mandrixAdminToken");
  setAdminContentVisible(false);
  loginPanel.hidden = false;
  loginMessage.textContent = message || t("passwordHint");
  passwordInput.value = "";
  passwordInput.focus();
}

function hideLogin() {
  loginPanel.hidden = true;
  setAdminContentVisible(true);
}

function isPaidLike(row) {
  return row.status === "Paid" || /paid|payment/i.test(row.payment || "");
}

function lessonScheduleFor(booking) {
  if (Array.isArray(booking.lessonSchedule) && booking.lessonSchedule.length) return booking.lessonSchedule;
  if (booking.date && booking.time) return [{ lesson: 1, date: booking.date, time: booking.time, status: "Scheduled" }];
  return [];
}

function parseLessonDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00+08:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysSince(value) {
  const date = parseLessonDate(value);
  if (!date) return 0;
  return Math.floor((Date.now() - date.getTime()) / 86400000);
}

function lessonIsUsed(lesson) {
  const status = String(lesson.status || "").toLowerCase();
  if (status.includes("complete") || status.includes("done") || status.includes("attended")) return true;
  return String(lesson.date || "") < todayIso();
}

function recommendContinuation(booking) {
  const course = String(booking.course || "").toLowerCase();
  if (course.includes("diagnostic")) {
    return "a 12-lesson foundation path based on your diagnostic result";
  }
  if (course.includes("sourcing") || course.includes("supplier") || course.includes("e-commerce")) {
    return "a continuation block focused on supplier negotiation, follow-up messages, and quality issue handling";
  }
  if (course.includes("business") || course.includes("executive")) {
    return "the next Business Chinese block focused on meetings, follow-up messages, and professional tone";
  }
  if (course.includes("hsk")) {
    return "the next HSK block with a clear mock-test and weak-point repair plan";
  }
  if (course.includes("group")) {
    return "the next small-group block so you can keep the same learning rhythm";
  }
  return "the next Mandrix course block so your current progress does not cool down";
}

function renewalStatusFor(booking) {
  if (!booking || booking.status === "Cancelled") return null;
  const schedule = lessonScheduleFor(booking);
  const total = Number(booking.lessonCount) || schedule.length || 1;
  const used = booking.status === "Completed"
    ? total
    : schedule.filter(lessonIsUsed).length;
  const remaining = Math.max(total - used, 0);
  const lastLesson = schedule
    .map((lesson) => lesson.date)
    .filter(Boolean)
    .sort()
    .at(-1);
  const firstLesson = schedule
    .map((lesson) => lesson.date)
    .filter(Boolean)
    .sort()
    .at(0);
  const isDiagnostic = String(booking.course || "").toLowerCase().includes("diagnostic");

  if (isDiagnostic && (booking.status === "Completed" || (lastLesson && String(lastLesson) < todayIso()))) {
    return {
      stage: "diagnostic",
      priority: 1,
      label: adminLang === "zh" ? "测评后转正课" : "Diagnostic conversion",
      timing: adminLang === "zh" ? "测评已结束，48 小时抵扣窗口要及时跟进。" : "Diagnostic finished. Follow up while the 48-hour credit window is warm.",
      total,
      used,
      remaining,
      recommendation: recommendContinuation(booking),
    };
  }

  if (remaining === 0 && lastLesson && daysSince(lastLesson) >= 7) {
    return {
      stage: "ended7",
      priority: 1,
      label: adminLang === "zh" ? "课包结束后 7 天" : "7 days after package end",
      timing: adminLang === "zh" ? "学习热度正在下降，需要唤醒。" : "Momentum is cooling. Send a reactivation note.",
      total,
      used,
      remaining,
      recommendation: recommendContinuation(booking),
    };
  }

  if (remaining === 1) {
    return {
      stage: "oneLeft",
      priority: 2,
      label: adminLang === "zh" ? "剩 1 节" : "1 lesson left",
      timing: adminLang === "zh" ? "现在确认下一阶段，最容易保住原时间段。" : "Best moment to reserve the next block.",
      total,
      used,
      remaining,
      recommendation: recommendContinuation(booking),
    };
  }

  if (remaining > 1 && remaining <= 3) {
    return {
      stage: "threeLeft",
      priority: 3,
      label: adminLang === "zh" ? `剩 ${remaining} 节` : `${remaining} lessons left`,
      timing: adminLang === "zh" ? "提前规划续课，避免最后一节才仓促推销。" : "Plan before the last lesson so the next step feels natural.",
      total,
      used,
      remaining,
      recommendation: recommendContinuation(booking),
    };
  }

  if (remaining === 0 && firstLesson) {
    return {
      stage: "completed",
      priority: 4,
      label: adminLang === "zh" ? "课包刚结束" : "Package just ended",
      timing: adminLang === "zh" ? "建议在 7 天内发送总结和下一阶段建议。" : "Send a wrap-up and next-step recommendation within 7 days.",
      total,
      used,
      remaining,
      recommendation: recommendContinuation(booking),
    };
  }

  return null;
}

function renewalEmailFor(booking, renewal) {
  const firstName = String(booking.fullName || "there").trim().split(/\s+/)[0] || "there";
  const course = booking.course || "your Mandrix course";
  const recommendation = renewal?.recommendation || recommendContinuation(booking);
  const stage = renewal?.stage || "threeLeft";
  const templates = {
    threeLeft: {
      subject: "Your next Chinese learning step after this package",
      body: `Hi ${firstName},

You have about ${renewal?.remaining || 3} lessons left in your current Mandrix package.

This is a good moment to decide the next step before the learning rhythm breaks. Based on your current course (${course}), I recommend ${recommendation}.

If you would like to continue, I can reserve your current time slot and map the next block around the mistake patterns we have already identified.

Best,
Jane`,
    },
    oneLeft: {
      subject: "One lesson left: shall I reserve your next Mandrix block?",
      body: `Hi ${firstName},

You have one lesson left in your current Mandrix package.

You have already built useful momentum, so I do not recommend stopping here without a next step. Based on your current progress in ${course}, I recommend ${recommendation}.

If you want to continue, reply to this message and I will reserve your preferred time slot before it opens to new bookings.

Best,
Jane`,
    },
    ended7: {
      subject: "Keep your Chinese momentum going",
      body: `Hi ${firstName},

It has been about a week since your Mandrix package ended, so I wanted to check in before the rhythm fades.

The most important thing now is not starting over. Based on your previous course (${course}), I recommend ${recommendation}.

If you would like to continue, I can send the next plan and help you restart from the exact point where we stopped.

Best,
Jane`,
    },
    diagnostic: {
      subject: "Your Mandrix diagnostic next step",
      body: `Hi ${firstName},

Thank you for completing your Mandrix diagnostic.

Based on what we saw in class, the next step should not be random practice. I recommend ${recommendation}, with the first lessons focused on the blockers we identified during the diagnostic.

Your free AI level check is a starting point. If you would like to continue, reply here and I will help you choose the right paid package.

Best,
Jane`,
    },
    completed: {
      subject: "Your next Mandrix learning plan",
      body: `Hi ${firstName},

Congratulations on completing your current Mandrix package.

Before the learning rhythm cools down, I recommend ${recommendation}. The next block should build directly on your existing correction record instead of making you restart from general lessons.

If you would like to continue, I can send the next plan and reserve your preferred time slot.

Best,
Jane`,
    },
  };
  const template = templates[stage] || templates.threeLeft;
  return `Subject: ${template.subject}\n\n${template.body}`;
}

function renewalRows(rows) {
  return rows
    .map((booking) => ({ booking, renewal: renewalStatusFor(booking) }))
    .filter((row) => row.renewal && row.renewal.priority <= 3)
    .sort((a, b) => a.renewal.priority - b.renewal.priority);
}

function flattenLessons(rows) {
  return rows
    .filter((booking) => booking.status !== "Cancelled")
    .flatMap((booking) => lessonScheduleFor(booking).map((lesson) => ({
      ...lesson,
      bookingId: booking.id,
      bookingStatus: booking.status,
      fullName: booking.fullName,
      email: booking.email,
      contact: booking.contact,
      course: booking.course,
      bookingType: booking.bookingType || (String(booking.course || "").includes("Group") ? "group" : "one-on-one"),
      payment: booking.payment,
      amount: booking.amount,
      meetingLink: lesson.meetingLink || booking.meetingLink,
      meetingProvider: lesson.meetingProvider || booking.meetingProvider || "Video classroom",
      groupInfo: booking.groupInfo,
    })))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

function matchesFilters(booking) {
  const selectedStatus = statusFilter.value;
  const query = searchInput.value.trim().toLowerCase();
  if (selectedStatus && booking.status !== selectedStatus) return false;
  if (!query) return true;
  return [
    booking.fullName,
    booking.email,
    booking.contact,
    booking.course,
    booking.date,
    booking.time,
    booking.payment,
    booking.notes,
  ].some((value) => String(value || "").toLowerCase().includes(query));
}

function renderSummary(rows) {
  const active = rows.filter((row) => !["Completed", "Cancelled"].includes(row.status)).length;
  const paidPending = rows.filter((row) => row.status === "Paid - needs verification" || row.payment === "Paid - needs verification").length;
  const lessons = flattenLessons(rows);
  const todayRows = lessons.filter((row) => row.date === todayIso()).length;
  const renewalCount = renewalRows(rows).length;
  summary.innerHTML = `
    <div><span>${t("total")}</span><strong>${rows.length}</strong><small>${adminLang === "zh" ? "全部预约记录" : "All booking records"}</small></div>
    <div><span>${t("active")}</span><strong>${active}</strong><small>${adminLang === "zh" ? "未完成课程" : "Open programs"}</small></div>
    <div><span>${t("paidPending")}</span><strong>${paidPending || rows.filter(isPaidLike).length}</strong><small>${adminLang === "zh" ? "需核验/已付款" : "Paid or pending check"}</small></div>
    <div><span>${t("lessonsToday")}</span><strong>${todayRows}</strong><small>${adminLang === "zh" ? "北京时间今日" : "Beijing time today"}</small></div>
    <div><span>${t("renewalDue")}</span><strong>${renewalCount}</strong><small>${adminLang === "zh" ? "建议跟进" : "Recommended follow-ups"}</small></div>
  `;
}

function renderRenewalPanel(rows) {
  if (!renewalPanel) return;
  const due = renewalRows(rows);
  renewalPanel.innerHTML = `
    <div class="renewal-panel-head">
      <div>
        <p class="eyebrow">${t("renewalPanelTitle")}</p>
        <h2>${adminLang === "zh" ? "维护现有学员续课节奏" : "Protect current student momentum"}</h2>
      </div>
      <p>${t("renewalPanelIntro")}</p>
    </div>
    ${due.length ? `
      <div class="renewal-grid">
        ${due.map(({ booking, renewal }) => `
          <article class="renewal-mini-card" data-id="${escapeHtml(booking.id)}">
            <span>${escapeHtml(renewal.label)}</span>
            <strong>${escapeHtml(booking.fullName)}</strong>
            <p>${escapeHtml(booking.course)}</p>
            <small>${escapeHtml(renewal.timing)}</small>
            <button class="btn secondary copy-renewal" type="button">${t("copyRenewal")}</button>
          </article>
        `).join("")}
      </div>
    ` : `<p class="renewal-empty">${t("noRenewals")}</p>`}
  `;
}

function renderLessons() {
  const start = timetableStart.value || todayIso();
  const days = Number(timetableDays.value || 14);
  const end = addDays(start, days - 1);
  const lessons = flattenLessons(bookings)
    .filter((lesson) => lesson.date >= start && lesson.date <= end);
  const bySlot = new Map(lessons.map((lesson) => [`${lesson.date}|${lesson.time}`, lesson]));

  const dates = Array.from({ length: days }, (_, index) => addDays(start, index));
  if (!lessons.length && !dates.length) {
    lessonList.innerHTML = `<p>${t("noLessons")}</p>`;
    return;
  }

  lessonList.innerHTML = `
    <div class="availability-board">
      <div class="availability-head">
        <span>${adminLang === "zh" ? "日期" : "Date"}</span>
        ${timeSlots.map((slot) => `<span>${escapeHtml(slot)}</span>`).join("")}
      </div>
      ${dates.map((date) => `
        <div class="availability-row">
          <div class="availability-date">
            <strong>${escapeHtml(formatDate(date))}</strong>
            <span>${escapeHtml(date)}</span>
          </div>
          ${timeSlots.map((slot) => {
            const lesson = bySlot.get(`${date}|${slot}`);
            if (!lesson) {
              return `<div class="slot-cell available"><span>${t("available")}</span></div>`;
            }
            const groupText = lesson.bookingType === "group" && lesson.groupInfo
              ? `${t("group")} ${lesson.groupInfo.currentStudentsAfterBooking}/${lesson.groupInfo.maxStudents}`
              : lesson.bookingType;
            const meetingLink = lesson.meetingLink || "";
            const meetingProvider = lesson.meetingProvider || "Video classroom";
            return `
              <div class="slot-cell booked">
                <span>${meetingLink ? t("scheduled") : t("booked")}</span>
                <strong>${escapeHtml(lesson.fullName)}</strong>
                <small>${escapeHtml(lesson.course)}</small>
                <em>${escapeHtml(groupText || "")}</em>
                ${meetingLink ? `
                  <div class="slot-meeting">
                    <b>${escapeHtml(meetingProvider)}</b>
                    <code title="${escapeHtml(meetingLink)}">${escapeHtml(meetingLink)}</code>
                    <a href="${escapeHtml(meetingLink)}" target="_blank" rel="noopener">${t("openMeeting")}</a>
                    <button type="button" class="copy-meeting" data-meeting="${escapeHtml(meetingLink)}">${adminLang === "zh" ? "复制链接" : "Copy link"}</button>
                  </div>
                ` : `<i>${adminLang === "zh" ? "暂无会议链接" : "No meeting link yet"}</i>`}
              </div>
            `;
          }).join("")}
        </div>
      `).join("")}
    </div>
  `;
}

function renderBookings() {
  const rows = bookings.filter(matchesFilters);
  renderSummary(bookings);
  renderRenewalPanel(bookings);
  renderLessons();
  if (!rows.length) {
    list.innerHTML = `
      <div class="admin-empty-state">
        <span>${adminLang === "zh" ? "暂无预约" : "No bookings yet"}</span>
        <strong>${t("noBookings")}</strong>
        <p>${adminLang === "zh" ? "正式预约会在学生完成 PayPal 付款并提交表单后出现在这里。测试记录已清理，不会影响运营判断。" : "Real bookings will appear here after a student completes PayPal checkout and submits the booking form. Test records have been removed."}</p>
        <a class="btn secondary" href="/booking" target="_blank" rel="noopener">${adminLang === "zh" ? "查看预约页" : "View booking page"}</a>
      </div>
    `;
    return;
  }
  list.innerHTML = rows.map((booking) => {
    const renewal = renewalStatusFor(booking);
    return `
    <article class="booking-card" data-id="${booking.id}">
      <div class="booking-card-head">
        <div>
          <p class="eyebrow">${escapeHtml(booking.status || "New")}</p>
          <h2>${escapeHtml(booking.fullName)}</h2>
          <p>${escapeHtml(booking.email)} · ${escapeHtml(booking.contact)}</p>
        </div>
        <div class="booking-time">
          <strong>${escapeHtml(booking.date)}</strong>
          <span>${escapeHtml(booking.time)}</span>
        </div>
      </div>
      <div class="booking-grid">
        <p><strong>${t("course")}</strong><br>${escapeHtml(booking.course)}</p>
        <p><strong>${t("frequency")}</strong><br>${escapeHtml(booking.frequencyLabel || booking.frequency || "Once a week")} · ${escapeHtml(booking.lessonCount || lessonScheduleFor(booking).length || 1)}</p>
        <p><strong>${t("country")}</strong><br>${escapeHtml(booking.country)} · ${escapeHtml(booking.timezone)}</p>
        <p><strong>${t("level")}</strong><br>${escapeHtml(booking.level)}</p>
        <p><strong>${t("payment")}</strong><br>${escapeHtml(booking.payment)}</p>
        <p><strong>${t("amount")}</strong><br>${booking.amount ? `$${escapeHtml(booking.amount)}` : "-"}</p>
        <p><strong>${t("receipt")}</strong><br>${booking.paypalLink ? `<a href="${escapeHtml(booking.paypalLink)}" target="_blank" rel="noopener">${escapeHtml(booking.paypalLink)}</a>` : "-"}</p>
        <p><strong>${t("created")}</strong><br>${escapeHtml(formatCreatedAt(booking.createdAt))}</p>
      </div>
      <div class="booking-notes">
        <p><strong>${t("goal")}</strong><br>${escapeHtml(booking.goal)}</p>
        <p><strong>${t("notes")}</strong><br>${escapeHtml(booking.notes || "None")}</p>
      </div>
      <div class="booking-schedule">
        <strong>${t("schedule")}</strong>
        <ol>
          ${lessonScheduleFor(booking).map((lesson) => {
            const meetingLink = lesson.meetingLink || booking.meetingLink || "";
            const meetingProvider = lesson.meetingProvider || "Video classroom";
            return `<li>
              <span>Lesson ${escapeHtml(lesson.lesson)} · ${escapeHtml(lesson.date)} · ${escapeHtml(lesson.time)} ${t("beijingTime")}</span>
              ${meetingLink ? `<a href="${escapeHtml(meetingLink)}" target="_blank" rel="noopener">${escapeHtml(meetingProvider)}</a><button type="button" class="copy-meeting" data-meeting="${escapeHtml(meetingLink)}">${adminLang === "zh" ? "复制链接" : "Copy link"}</button>` : `<em>${adminLang === "zh" ? "暂无会议链接" : "No meeting link yet"}</em>`}
            </li>`;
          }).join("")}
        </ol>
      </div>
      ${renewal ? `
        <div class="renewal-card">
          <div>
            <span>${escapeHtml(renewal.label)}</span>
            <strong>${adminLang === "zh" ? "续课建议" : "Renewal recommendation"}</strong>
            <p>${escapeHtml(renewal.timing)} ${adminLang === "zh" ? "建议：" : "Recommendation:"} ${escapeHtml(renewal.recommendation)}</p>
          </div>
          <div class="renewal-actions">
            <button class="btn secondary copy-renewal" type="button">${t("copyRenewal")}</button>
          </div>
        </div>
      ` : ""}
      <div class="booking-edit">
        <label>${t("status")}
          <select data-field="status">
            ${statuses.map((status) => `<option ${booking.status === status ? "selected" : ""}>${status}</option>`).join("")}
          </select>
        </label>
        <label>${t("payment")}
          <select data-field="payment">
            ${["Paid - needs verification", "Not yet", "Yes, completed", "I need payment instructions"].map((payment) => `<option ${booking.payment === payment ? "selected" : ""}>${payment}</option>`).join("")}
          </select>
        </label>
        <label>${t("meeting")}
          <input data-field="meetingLink" value="${escapeHtml(booking.meetingLink || "")}" placeholder="Video classroom link">
        </label>
        <label>${t("teacherNotes")}
          <textarea data-field="teacherNotes" placeholder="${t("teacherNotes")}">${escapeHtml(booking.teacherNotes || "")}</textarea>
        </label>
      </div>
      <div class="actions">
        <button class="btn primary save-booking" type="button">${t("save")}</button>
        <button class="btn secondary delete-booking" type="button">${t("deleteBooking")}</button>
        ${booking.meetingLink ? `<a class="btn secondary" href="${escapeHtml(booking.meetingLink)}" target="_blank" rel="noopener">${t("openMeeting")}</a>` : ""}
      </div>
    </article>
  `;
  }).join("");
}

function renderLevelChecks() {
  if (!levelChecksList || !levelChecksStatus) return;
  levelChecksStatus.textContent = levelChecks.length
    ? `${levelChecks.length} AI level check lead${levelChecks.length === 1 ? "" : "s"} loaded.`
    : "No AI level checks yet.";
  if (!levelChecks.length) {
    levelChecksList.innerHTML = `
      <div class="admin-empty-state">
        <span>AI Level Check</span>
        <strong>${adminLang === "zh" ? "暂无测评线索" : "No level-check leads yet"}</strong>
        <p>${adminLang === "zh" ? "用户提交免费 AI 测评后，会在这里看到邮箱、目标、报告摘要和输出样本。" : "When a learner submits the free AI level check, their email, goal, report summary, and output sample appear here."}</p>
        <a class="btn secondary" href="/level-check" target="_blank" rel="noopener">${adminLang === "zh" ? "查看测评页" : "View level check"}</a>
      </div>
    `;
    return;
  }
  levelChecksList.innerHTML = levelChecks.map((item) => {
    const report = item.report || {};
    const level = report.level || {};
    const blocker = report.blocker || {};
    const path = report.path || {};
    const scores = report.scores || {};
    return `
      <article class="booking-card">
        <div class="booking-card-head">
          <div>
            <p class="eyebrow">${escapeHtml(item.status || "New")} · ${escapeHtml(formatCreatedAt(item.createdAt))}</p>
            <h2>${escapeHtml(item.fullName)}</h2>
            <p>${escapeHtml(item.email)}${item.contact ? ` · ${escapeHtml(item.contact)}` : ""}</p>
          </div>
          <div class="booking-time">
            <strong>${escapeHtml(level.label || "Level pending")}</strong>
            <span>${escapeHtml(level.hsk || "")}</span>
          </div>
        </div>
        <div class="booking-grid">
          <p><strong>Goal</strong><br>${escapeHtml(item.goal)}</p>
          <p><strong>Main blocker</strong><br>${escapeHtml(blocker.title || item.blocker)}</p>
          <p><strong>Recommended path</strong><br>${escapeHtml(path.path || "-")}</p>
          <p><strong>Structure</strong><br>${escapeHtml(scores.structure || "-")}%</p>
          <p><strong>Output</strong><br>${escapeHtml(scores.output || "-")}%</p>
          <p><strong>Confidence</strong><br>${escapeHtml(scores.confidence || "-")}%</p>
        </div>
        <div class="booking-notes">
          <p><strong>Report insight</strong><br>${escapeHtml(blocker.detail || "No detail")}</p>
          <p><strong>Student sample</strong><br>${escapeHtml(item.sample || "No sample")}</p>
        </div>
      </article>
    `;
  }).join("");
}

async function loadLevelChecks() {
  if (!adminToken || !levelChecksList) return;
  levelChecksStatus.textContent = "Loading AI level checks...";
  const response = await fetch("/api/level-check.js", {
    headers: { "x-admin-token": adminToken },
  });
  if (response.status === 401) {
    showLogin(t("wrongPassword"));
    return;
  }
  if (!response.ok) {
    levelChecksStatus.textContent = "AI level checks could not load. Please check the Cloudflare D1 setup.";
    levelChecksList.innerHTML = "<p>Load failed.</p>";
    return;
  }
  const data = await response.json();
  levelChecks = data.levelChecks || [];
  renderLevelChecks();
}

async function loadBookings() {
  if (!adminToken) {
    showLogin();
    return;
  }
  hideLogin();
  list.innerHTML = `<p>${t("loadingBookings")}</p>`;
  lessonList.innerHTML = `<p>${t("loadingTimetable")}</p>`;
  const response = await fetch("/api/bookings.js", {
    headers: { "x-admin-token": adminToken },
  });
  if (response.status === 401) {
    showLogin(t("wrongPassword"));
    return;
  }
  if (!response.ok) {
    list.innerHTML = `<p>${t("loadFailed")}</p>`;
    lessonList.innerHTML = `<p>${t("loadFailed")}</p>`;
    return;
  }
  const data = await response.json();
  bookings = data.bookings || [];
  renderBookings();
  loadLevelChecks();
  loadAnalytics();
}

function switchAdminTab(tab) {
  activeAdminTab = tab;
  adminTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.adminTab === tab);
  });
  adminPanels.forEach((panel) => {
    panel.hidden = panel.dataset.adminPanel !== tab;
  });
  const headerTitle = document.querySelector(".admin-header h1");
  if (headerTitle) {
    headerTitle.textContent = tab === "seo" ? "SEO 发布" : tab === "analytics" ? "数据中心" : tab === "level-checks" ? "AI Level Checks" : t("pageTitle");
  }
  if (refreshButton) refreshButton.hidden = tab !== "operations";
  if (exportButton) exportButton.hidden = tab !== "operations";
  if (tab === "level-checks") loadLevelChecks();
  if (tab === "analytics" && !analytics) loadAnalytics();
  if (tab === "seo") updateSeoBuilder();
}

function renderKpis(totals = {}) {
  const labels = adminLang === "zh"
    ? [
        ["visitors", "访客"],
        ["pageViews", "浏览量"],
        ["ctaClicks", "预约点击"],
        ["ctaRate", "点击率"],
        ["paymentClicks", "付款点击"],
        ["conversionRate", "转化率"],
      ]
    : [
        ["visitors", "Visitors"],
        ["pageViews", "Page Views"],
        ["ctaClicks", "CTA Clicks"],
        ["ctaRate", "CTA Rate"],
        ["paymentClicks", "Payment Clicks"],
        ["conversionRate", "Conversion"],
      ];
  analyticsKpis.innerHTML = labels.map(([key, label]) => `
    <div>
      <strong>${["conversionRate", "ctaRate"].includes(key) ? `${totals[key] || 0}%` : escapeHtml(totals[key] || 0)}</strong>
      <span>${label}</span>
    </div>
  `).join("");
}

function renderDaily(rows = []) {
  const max = Math.max(1, ...rows.map((row) => row.pageViews));
  dailyChart.innerHTML = rows.map((row) => `
    <div class="chart-bar" title="${escapeHtml(row.date)} · ${escapeHtml(row.pageViews)} PV">
      <span style="height:${Math.max(5, (row.pageViews / max) * 100)}%"></span>
      <small>${escapeHtml(row.date.slice(5))}</small>
    </div>
  `).join("");
}

function renderRank(target, rows = [], emptyText = "No data yet") {
  const max = Math.max(1, ...rows.map((row) => row.count));
  target.innerHTML = rows.length ? rows.map((row) => `
    <div class="rank-row">
      <div>
        <strong title="${escapeHtml(row.label)}">${escapeHtml(dataLabel(row.label))}</strong>
        <span>${escapeHtml(row.count)}</span>
      </div>
      <em><i style="width:${Math.max(4, (row.count / max) * 100)}%"></i></em>
    </div>
  `).join("") : `<p>${adminLang === "zh" ? "暂无数据。" : emptyText}</p>`;
}

function dataLabel(value) {
  const labels = {
    "Page views": "页面浏览",
    "CTA clicks": "预约按钮点击",
    "Course selects": "选课",
    "Payment clicks": "付款点击",
    "Form starts": "开始填表",
    "Booking submits": "预约提交",
    "Contact clicks": "联系点击",
    "Submit errors": "提交失败",
    "90% scrolls": "深度阅读",
    page_view: "页面浏览",
    booking_cta_click: "预约按钮点击",
    course_select: "选课",
    payment_click: "付款点击",
    booking_form_start: "开始填表",
    booking_submit_success: "预约提交成功",
    booking_submit_error: "预约提交失败",
    contact_click: "联系点击",
    scroll_depth: "滚动深度",
    "Insights Article": "文章详情页",
    "Insights Index": "文章列表页",
    "Chinese Home": "中文首页",
    "Booking Section": "预约区",
    "English Home": "英文首页",
    "Direct": "直接访问",
    "Referral": "外部推荐",
    "Unknown": "未知",
    "mobile": "手机",
    "tablet": "平板",
    "desktop": "电脑",
    "High": "高优先级",
    "Medium": "中优先级",
    "Watch": "观察",
  };
  return adminLang === "zh" ? (labels[value] || value) : value;
}

function diagnosisText(text = "") {
  if (adminLang !== "zh") return text;
  if (text.startsWith("CTA click rate is low.")) return "预约按钮点击率偏低。建议强化首屏测评课卖点，并在高意向模块后重复出现 $29 测评 CTA。";
  if (text.startsWith("People click booking")) return "用户点击了预约，但付款意向不足。建议简化预约区，并让 PayPal / 付款步骤更清楚。";
  if (text.startsWith("Payment-to-form completion")) return "付款到提交表单之间有流失。建议更明确写出：先付款，再提交交易号，并缩短表单。";
  if (text.startsWith("Most course interest:")) return text.replace("Most course interest:", "当前最热门课程：").replace("Put this program higher and use it in ads/social posts.", "建议放到更靠前位置，并用于广告和社媒内容。");
  if (text.startsWith("Best article traffic:")) return text.replace("Best article traffic:", "当前流量最佳文章：").replace("Add stronger diagnostic CTA inside this article.", "建议在文章内加入更强的测评课 CTA。");
  if (text.startsWith("Mobile users are leading.")) return "手机用户占比高。优先检查手机端间距、短模块和底部固定预约按钮。";
  if (text.startsWith("Top source is")) return text.replace("Top source is", "当前主要来源是").replace("Keep publishing content matched to that channel.", "建议继续发布适合这个渠道的内容。");
  if (text.startsWith("No meaningful data yet.")) return "真实访问数据还不够。等流量积累后，这里会自动生成更具体的优化建议。";
  return text;
}

function actionText(row = {}) {
  if (adminLang !== "zh") return row;
  const title = String(row.title || "");
  const detail = String(row.detail || "");
  if (title.startsWith("Push ")) {
    return {
      ...row,
      title: `重点推广：${title.replace("Push ", "")}`,
      detail: "这门课的购买意向最强。建议放到更靠前的位置，强化学习结果，并围绕它多发社媒内容。",
    };
  }
  if (title.startsWith("Strengthen CTA in ")) {
    return {
      ...row,
      title: `加强文章 CTA：${title.replace("Strengthen CTA in ", "")}`,
      detail: "这篇文章已经能带来预约行为。建议在文章中段加入测评课按钮，结尾 CTA 写得更直接。",
    };
  }
  if (title === "Tighten mobile booking path") {
    return { ...row, title: "优化手机端预约路径", detail: "手机访客占比高，但点击率还不够。建议保持底部预约按钮固定，并减少表单阻力。" };
  }
  if (title.startsWith("Localize for ")) {
    return { ...row, title: `针对 ${title.replace("Localize for ", "")} 做本地化`, detail: "建议在评价、案例、发帖时间和课程场景里更贴合这个市场。" };
  }
  if (title === "Fix failed submissions first") {
    return { ...row, title: "优先修复提交失败", detail: "提交失败会直接影响已付款学生。需要检查表单校验、可预约时间、邮件和 API 状态。" };
  }
  if (title === "Collect more traffic") {
    return { ...row, title: "继续积累访问数据", detail: "数据中心已准备好。等真实访问更多后，优先行动会变得更具体。" };
  }
  return { ...row, detail };
}

function renderFunnel(rows = []) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  funnelList.innerHTML = rows.map((row, index) => `
    <div class="funnel-row">
      <span>${index + 1}</span>
      <strong>${escapeHtml(dataLabel(row.label))}</strong>
      <em>${escapeHtml(row.value)}</em>
      <i style="width:${Math.max(6, (row.value / max) * 100)}%"></i>
    </div>
  `).join("");
}

function renderProfile(data) {
  const groups = adminLang === "zh"
    ? [
        ["设备", data.devices],
        ["国家/地区", data.countries],
        ["语言", data.languages],
        ["浏览器", data.browsers],
      ]
    : [
        ["Devices", data.devices],
        ["Countries", data.countries],
        ["Languages", data.languages],
        ["Browsers", data.browsers],
      ];
  profileSplits.innerHTML = groups.map(([title, rows]) => `
    <div>
      <h4>${escapeHtml(title)}</h4>
      ${(rows || []).slice(0, 4).map((row) => `<p><span>${escapeHtml(dataLabel(row.label))}</span><strong>${escapeHtml(row.count)}</strong></p>`).join("") || "<p>暂无数据</p>"}
    </div>
  `).join("");
}

function renderEvents(rows = []) {
  recentEvents.innerHTML = rows.length ? `
    <table>
      <thead><tr><th>时间</th><th>行为</th><th>页面</th><th>设备 / 地区</th></tr></thead>
      <tbody>
        ${rows.map((event) => `
          <tr>
            <td>${escapeHtml(formatCreatedAt(event.createdAt))}</td>
            <td>${escapeHtml(dataLabel(event.eventType))}</td>
            <td title="${escapeHtml(event.path)}">${escapeHtml(event.path)}</td>
            <td>${escapeHtml(dataLabel(event.device))} · ${escapeHtml(event.country || event.language || "")}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  ` : "<p>暂无行为记录。</p>";
}

function renderSignals(rows = []) {
  engagementSignals.innerHTML = rows.length ? rows.map((row) => `
    <div>
      <strong>${escapeHtml(row.value)}</strong>
      <span>${escapeHtml(dataLabel(row.label))}</span>
    </div>
  `).join("") : "<p>暂无互动数据。</p>";
}

function renderDiagnosis(tips = []) {
  const fallback = adminLang === "zh"
    ? ["数据还在积累中。等有真实访问后，这里会自动给出页面、课程、渠道优化建议。"]
    : ["Data is still accumulating. This panel will generate page, course, and channel recommendations after real traffic arrives."];
  growthDiagnosis.innerHTML = (tips.length ? tips : fallback).map((tip) => `<p>${escapeHtml(diagnosisText(tip))}</p>`).join("");
}

function renderConversionTable(target, rows = [], emptyText = "No conversion data yet.") {
  target.innerHTML = rows.length ? `
    <table>
      <thead><tr><th>名称</th><th>访客</th><th>预约点击</th><th>付款点击</th><th>提交</th><th>转化率</th></tr></thead>
      <tbody>
        ${rows.map((row) => `
          <tr>
            <td title="${escapeHtml(row.label)}">${escapeHtml(row.label)}</td>
            <td>${escapeHtml(row.visitors || 0)}</td>
            <td>${escapeHtml(row.ctaClicks || 0)}</td>
            <td>${escapeHtml(row.paymentClicks || 0)}</td>
            <td>${escapeHtml(row.bookingSubmits || 0)}</td>
            <td>${escapeHtml(row.conversionRate || 0)}%</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  ` : `<p>${adminLang === "zh" ? "暂无转化数据。" : emptyText}</p>`;
}

function renderArticleAssists(rows = []) {
  articleAssists.innerHTML = rows.length ? rows.map((row) => `
    <div class="assist-row">
      <strong title="${escapeHtml(row.label)}">${escapeHtml(row.label)}</strong>
      <p><span>浏览</span><b>${escapeHtml(row.views)}</b></p>
      <p><span>预约助攻</span><b>${escapeHtml(row.ctaClicks)}</b></p>
      <p><span>付款助攻</span><b>${escapeHtml(row.paymentClicks)}</b></p>
      <p><span>提交助攻</span><b>${escapeHtml(row.bookingSubmits)}</b></p>
    </div>
  `).join("") : "<p>暂无文章助攻数据。</p>";
}

function renderSegmentConversion(data = {}) {
  const groups = [
    [adminLang === "zh" ? "设备" : "Device", data.devices || []],
    [adminLang === "zh" ? "国家 / 地区" : "Country", data.countries || []],
    [adminLang === "zh" ? "语言" : "Language", data.languages || []],
  ];
  segmentConversion.innerHTML = groups.map(([title, rows]) => `
    <div>
      <h4>${escapeHtml(title)}</h4>
      ${rows.length ? rows.slice(0, 5).map((row) => `
        <p>
          <span title="${escapeHtml(row.label)}">${escapeHtml(dataLabel(row.label))}</span>
          <strong>${escapeHtml(row.visitors)} 访客 · ${escapeHtml(row.conversionRate)}%</strong>
        </p>
      `).join("") : "<p>暂无数据</p>"}
    </div>
  `).join("");
}

function renderPriorityActions(rows = []) {
  priorityActions.innerHTML = rows.length ? rows.map((raw) => {
    const row = actionText(raw);
    return `
    <div class="action-row">
      <span>${escapeHtml(dataLabel(row.priority))}</span>
      <strong>${escapeHtml(row.title)}</strong>
      <p>${escapeHtml(row.detail)}</p>
    </div>
  `;
  }).join("") : "<p>暂无优先行动。</p>";
}

function renderAnalytics() {
  if (!analytics) return;
  analyticsStatus.textContent = adminLang === "zh"
    ? `最近 ${analytics.rangeDays} 天数据。数据只用于你自己运营分析，不采集姓名邮箱等隐私。`
    : `Last ${analytics.rangeDays} days. No names or email addresses are collected for analytics.`;
  renderKpis(analytics.totals);
  renderDaily(analytics.daily);
  renderFunnel(analytics.funnel);
  renderDiagnosis(analytics.recommendations || []);
  renderRank(courseInterest, analytics.courseInterest, "No course interest yet.");
  renderConversionTable(courseConversion, analytics.courseFunnel || []);
  renderRank(contentPerformance, analytics.articlePerformance?.length ? analytics.articlePerformance : analytics.pageGroups, "No content data yet.");
  renderArticleAssists(analytics.contentAttribution || []);
  renderRank(topPages, analytics.topPages, "No page views yet.");
  renderProfile(analytics);
  renderRank(trafficSources, analytics.sources, "No traffic source data yet.");
  renderSignals(analytics.engagement || []);
  renderSegmentConversion(analytics.segmentConversion || {});
  renderRank(ctaPerformance, analytics.ctaLabels?.length ? analytics.ctaLabels : analytics.scrollDepth, "No CTA data yet.");
  renderPriorityActions(analytics.priorityActions || []);
  renderEvents(analytics.recentEvents);
}

async function loadAnalytics() {
  if (!adminToken || !analyticsStatus) return;
  analyticsStatus.textContent = adminLang === "zh" ? "正在加载数据中心..." : "Loading data center...";
  const response = await fetch(`/api/analytics.js?days=${encodeURIComponent(analyticsRange.value || 30)}`, {
    headers: { "x-admin-token": adminToken },
  });
  if (response.status === 401) {
    showLogin(t("wrongPassword"));
    return;
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    analytics = null;
    const setupText = data.setupNeeded
      ? (adminLang === "zh" ? "数据表还没初始化。代码已经做好，生产库需要添加 analytics_events 表后开始记录。" : "Analytics table is not initialized yet.")
      : (data.error || "Analytics failed to load.");
    analyticsStatus.textContent = setupText;
    analyticsKpis.innerHTML = "";
    dailyChart.innerHTML = "";
    funnelList.innerHTML = "";
    topPages.innerHTML = "";
    profileSplits.innerHTML = "";
    trafficSources.innerHTML = "";
    recentEvents.innerHTML = "";
    growthDiagnosis.innerHTML = "";
    courseInterest.innerHTML = "";
    contentPerformance.innerHTML = "";
    engagementSignals.innerHTML = "";
    ctaPerformance.innerHTML = "";
    courseConversion.innerHTML = "";
    articleAssists.innerHTML = "";
    segmentConversion.innerHTML = "";
    priorityActions.innerHTML = "";
    return;
  }
  analytics = data.analytics;
  renderAnalytics();
}

async function clearAnalytics() {
  if (!adminToken) {
    showLogin(t("wrongPassword"));
    return;
  }
  if (!window.confirm(t("clearAnalyticsConfirm"))) return;
  const original = clearAnalyticsButton?.textContent || t("clearAnalytics");
  if (clearAnalyticsButton) {
    clearAnalyticsButton.disabled = true;
    clearAnalyticsButton.textContent = t("clearingAnalytics");
  }
  const response = await fetch("/api/analytics.js", {
    method: "DELETE",
    headers: { "x-admin-token": adminToken },
  });
  if (clearAnalyticsButton) {
    clearAnalyticsButton.disabled = false;
    clearAnalyticsButton.textContent = original;
  }
  if (response.status === 401) {
    showLogin(t("wrongPassword"));
    return;
  }
  if (!response.ok) {
    alert(t("analyticsClearFailed"));
    return;
  }
  analytics = null;
  analyticsStatus.textContent = t("analyticsCleared");
  await loadAnalytics();
}

function seoFields() {
  if (!seoForm) return {};
  const data = Object.fromEntries(new FormData(seoForm).entries());
  if (seoImageUpload?.files?.[0]) data.imageUploadTarget = seoImageAssetPath(data);
  return data;
}

function cleanSeoSlug(value) {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\.html$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "new-mandarin-page";
}

function cleanSeoCategory(value) {
  const category = cleanSeoSlug(value);
  return category || "learning-method";
}

function seoCategoryLabel(value) {
  const category = cleanSeoCategory(value);
  return seoCategoryLabels[category] || category
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function seoUrl(slug) {
  const data = seoFields();
  return `https://www.mandrix.top/insights/${cleanSeoCategory(data.category)}/${cleanSeoSlug(slug)}`;
}

function splitSeoList(value) {
  return String(value || "")
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function seoImageUrl(path) {
  const value = String(path || "");
  if (/^(https?:|blob:|data:)/i.test(value)) return value;
  return `https://www.mandrix.top/${value.replace(/^\/+/, "")}`;
}

function seoImageAssetPath(data = seoFields()) {
  return `assets/${cleanSeoSlug(data.slug)}-hero.jpg`;
}

function seoSuggestedImages(data = seoFields()) {
  const category = cleanSeoCategory(data.category);
  const seen = new Set(Object.keys(seoUsedImages));
  const topicHints = {
    "business-chinese": ["business", "meeting", "corporate"],
    "hsk-prep": ["hsk", "study", "diagnostic"],
    "daily-chinese": ["daily", "conversation"],
    "sourcing-chinese": ["sourcing", "supplier", "warehouse"],
    "culture-communication": ["reception", "business", "daily"],
    "learning-method": ["method", "diagnostic", "study"],
    "supplier-communication": ["sourcing", "supplier", "warehouse"],
    "workplace-mandarin": ["business", "meeting", "corporate"],
    "chinese-for-amazon-sellers": ["sourcing", "warehouse", "business"],
    "adult-mandarin-learning": ["study", "lesson", "method"],
    "professional-chinese": ["business", "meeting", "lesson"],
  };
  const hints = topicHints[category] || [];
  const rank = (item) => {
    const haystack = `${item.value} ${item.label} ${item.topic} ${item.alt}`.toLowerCase();
    let score = 0;
    if (!seen.has(item.value)) score += 4;
    if (hints.some((hint) => haystack.includes(hint))) score += 3;
    if (category.includes("sourcing") && /sourcing|supplier|warehouse/.test(haystack)) score += 4;
    if (category.includes("business") && /business|meeting|corporate/.test(haystack)) score += 4;
    if (category.includes("hsk") && /hsk|study|diagnostic/.test(haystack)) score += 4;
    return score;
  };
  return [...seoImageLibrary].sort((a, b) => rank(b) - rank(a));
}

function seoImageStylePrompt(data = seoFields()) {
  const topic = data.h1 || data.title || "Mandrix Chinese learning page";
  const context = data.eyebrow || "Mandrix online Chinese coaching";
  return `Create one premium website hero image for Mandrix.

Topic: ${topic}
Context: ${context}

Style requirements:
- Realistic adult education / professional Chinese learning scene
- Clean modern desk, online lesson, notes, laptop, subtle Chinese learning materials
- Warm natural daylight, calm premium atmosphere
- Editorial website photography, not stock-photo cheesy
- Minimal composition with generous negative space
- No cartoon, no childish elements, no exaggerated smiles
- No text inside the image, no logo, no watermark
- Avoid clutter, neon colors, fantasy, AI-tech glow, and busy backgrounds
- Color palette should match Mandrix: warm white, soft blue, charcoal, small natural accents
- Horizontal 16:9 composition, suitable for a refined education brand landing page

Output: high-resolution JPG or PNG.`;
}

function seoCardData(data) {
  return [
    { title: data.card1Title, text: data.card1Text },
    { title: data.card2Title, text: data.card2Text },
    { title: data.card3Title, text: data.card3Text },
  ];
}

function seoImageGalleryHtml(data = seoFields()) {
  const current = data.imageUploadTarget || data.image;
  return seoSuggestedImages(data).map((item) => {
    const used = Boolean(seoUsedImages[item.value]);
    const selected = item.value === current;
    return `
      <button type="button" class="seo-image-card ${used ? "used" : ""} ${selected ? "selected" : ""}" data-seo-image="${escapeHtml(item.value)}" data-seo-alt="${escapeHtml(item.alt)}" title="${escapeHtml(item.topic)}">
        <img src="${escapeHtml(item.value)}" alt="${escapeHtml(item.alt)}">
        <span>${escapeHtml(item.label)}</span>
        <small>${escapeHtml(item.topic)}</small>
        ${used ? "<em>核心页已使用</em>" : "<i>推荐使用</i>"}
      </button>
    `;
  }).join("");
}

function buildSeoHtml(rawData = seoFields()) {
  const data = { ...seoPresets.custom, ...rawData };
  const slug = cleanSeoSlug(data.slug);
  const pageUrl = seoUrl(slug);
  const image = data.imageUploadTarget || data.image || seoPresets.custom.image;
  const title = data.title || seoPresets.custom.title;
  const description = data.description || seoPresets.custom.description;
  const chips = splitSeoList(data.chips);
  const cards = seoCardData(data);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: title.replace(/\s*\|\s*Mandrix\s*$/i, ""),
    description,
    provider: {
      "@type": "EducationalOrganization",
      name: "Mandrix",
      url: "https://www.mandrix.top/",
    },
    url: pageUrl,
    inLanguage: "en",
  };
  const jsonLd = JSON.stringify(schema, null, 8);
  const chipHtml = chips.map((chip) => `                <span>${escapeHtml(chip)}</span>`).join("\n");
  const cardHtml = cards.map((card, index) => `        <article class="landing-card">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <h3>${escapeHtml(card.title)}</h3>
          <p>${escapeHtml(card.text)}</p>
        </article>`).join("\n");
  const secondaryButton = data.secondaryLabel && data.secondaryHref
    ? `                <a class="btn secondary" href="${escapeHtml(data.secondaryHref)}">${escapeHtml(data.secondaryLabel)}</a>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${pageUrl}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:image" content="${seoImageUrl(image)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${seoImageUrl(image)}">
    <link rel="icon" type="image/png" href="assets/mandrix-logo.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <script type="application/ld+json">
${jsonLd}
    </script>
  </head>
  <body class="landing-page">
    <div class="shell">
      <header class="nav" translate="no">
        <div class="nav-inner">
          <a class="brand" href="/">
            <img src="assets/mandrix-logo.png" alt="Mandrix logo">
            <span class="brand-word">
              <span class="brand-name">Mandrix</span>
              <span class="brand-line">Chinese, decoded.</span>
            </span>
          </a>
          <nav class="nav-links" id="navLinks">
            <a href="/method">Method</a>
            <a href="/courses">Courses</a>
            <a href="/corporate">Corporate</a>
            <a href="/about">About</a>
            <a href="/insights">Insights</a>
            <a href="/faq">FAQ</a>
            <a class="nav-cta" href="/level-check">Free AI Level Check</a>
            <a class="lang-switch" href="/zh">中文</a>
          </nav>
          <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      <main id="top">
        <section class="landing-hero">
          <div class="wrap landing-hero-grid">
            <div class="landing-copy">
              <p class="eyebrow">${escapeHtml(data.eyebrow)}</p>
              <h1>${escapeHtml(data.h1)}</h1>
              <p class="lead">${escapeHtml(data.lead)}</p>
              <div class="actions">
                <a class="btn primary" href="${escapeHtml(data.primaryHref || "/level-check")}">${escapeHtml(data.primaryLabel || "Start Free AI Level Check")}</a>
${secondaryButton}
              </div>
              <div class="landing-proof">
${chipHtml}
              </div>
            </div>
            <div class="landing-visual">
              <img src="${escapeHtml(image)}" alt="${escapeHtml(data.imageAlt)}">
            </div>
          </div>
        </section>
      </main>
    </div>

    <section class="section">
      <div class="wrap landing-card-grid">
${cardHtml}
      </div>
    </section>

    <section class="section alt">
      <div class="wrap landing-content">
        <p class="eyebrow">${escapeHtml(data.sectionEyebrow)}</p>
        <h2>${escapeHtml(data.sectionTitle)}</h2>
        <p>${escapeHtml(data.sectionBody)}</p>
      </div>
    </section>

    <section class="section">
      <div class="wrap landing-cta-panel">
        <div>
          <p class="eyebrow">${escapeHtml(data.ctaEyebrow)}</p>
          <h2>${escapeHtml(data.ctaTitle)}</h2>
          <p>${escapeHtml(data.ctaBody)}</p>
        </div>
        <a class="btn primary" href="${escapeHtml(data.primaryHref || "/level-check")}">${escapeHtml(data.primaryLabel || "Start Free AI Level Check")}</a>
      </div>
    </section>

    <footer class="footer">
      <div class="wrap">
        <div class="footer-brand">
          <strong>Mandrix</strong>
          <span>Chinese, decoded.</span>
          <p>Clearer Chinese for adult learners.</p>
        </div>
        <nav class="footer-links" aria-label="Contact links">
          <a href="/method">Method</a>
          <a href="/courses">Courses</a>
          <a href="/corporate">Corporate</a>
          <a href="/insights">Insights</a>
          <a href="/booking">Booking</a>
          <a href="mailto:Jane.Mandrix@outlook.com">Jane.Mandrix@outlook.com</a>
          <a href="https://wa.me/message/S6GHIZYKAV4ZH1" translate="no">WhatsApp</a>
        </nav>
        <span>© 2026 Mandrix | Jane Chen. All Rights Reserved.</span>
      </div>
    </footer>
    <script src="analytics.js"></script>
    <script>
      const navToggle = document.querySelector("#navToggle");
      const navLinks = document.querySelector("#navLinks");
      navToggle?.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("nav-open");
        navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    </script>
  </body>
</html>
`;
}

function buildSeoSitemapEntry(data = seoFields()) {
  const slug = cleanSeoSlug(data.slug);
  return `  <url>
    <loc>${seoUrl(slug)}</loc>
    <lastmod>${todayIso()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
}

function seoPublishPackage() {
  const data = seoFields();
  const slug = cleanSeoSlug(data.slug);
  const html = buildSeoHtml(data);
  const uploadedImage = seoImageUpload?.files?.[0];
  const imageNote = uploadedImage
    ? `\n图片文件：${uploadedImage.name}\n请 Codex 把我上传/发送的图片保存为：${seoImageAssetPath(data)}\n`
    : "\n图片文件：未上传新图片，使用表单里选择的现有 assets 图片。\n";
  return `Mandrix SEO 发布包

目标页面：/insights/${cleanSeoCategory(data.category)}/${slug}
正式链接：${seoUrl(slug)}
${imageNote}

请 Codex 执行：
1. 后台发布按钮会写入 Cloudflare D1，并自动进入 Insights 与动态 sitemap。
2. 发布后复制正式链接，到 Google Search Console 做 URL 检查。
3. 检查标题、描述、主图、CTA 是否符合 Mandrix 品牌风格。

Sitemap 条目：
${buildSeoSitemapEntry(data)}

HTML：
\`\`\`html
${html}
\`\`\`
`;
}

function fillSeoForm(values) {
  if (!seoForm) return;
  Object.entries(values).forEach(([key, value]) => {
    const field = seoForm.elements[key];
    if (field) field.value = value;
  });
  updateSeoBuilder();
}

function seoRowsForPrompt(rows = [], label = "No data yet") {
  if (!Array.isArray(rows) || !rows.length) return `- ${label}`;
  return rows.slice(0, 8).map((row, index) => {
    const name = row.label || row.path || row.title || "Unknown";
    const metrics = [
      row.count != null ? `${row.count} events` : "",
      row.visitors != null ? `${row.visitors} visitors` : "",
      row.ctaClicks != null ? `${row.ctaClicks} CTA clicks` : "",
      row.paymentClicks != null ? `${row.paymentClicks} payment clicks` : "",
      row.bookingSubmits != null ? `${row.bookingSubmits} submits` : "",
      row.conversionRate != null ? `${row.conversionRate}% conversion` : "",
    ].filter(Boolean).join(", ");
    return `${index + 1}. ${name}${metrics ? ` — ${metrics}` : ""}`;
  }).join("\n");
}

function seoDemandSnapshot() {
  if (!analytics) {
    return `No live Mandrix analytics loaded in this admin tab yet.
Use general SEO demand, commercial intent, and likely buyer urgency for adult online Mandarin learners.
Prefer topics that connect to a paid Mandrix path: business communication, supplier communication, HSK preparation, daily communication, workplace Mandarin, pronunciation/output blockers, or adult learning method.`;
  }
  return `Mandrix internal demand signals from the current analytics range:

Course interest:
${seoRowsForPrompt(analytics.courseInterest, "No course-interest data yet")}

Content / article performance:
${seoRowsForPrompt(analytics.articlePerformance?.length ? analytics.articlePerformance : analytics.pageGroups, "No content data yet")}

Top pages:
${seoRowsForPrompt(analytics.topPages, "No page data yet")}

Article assists:
${seoRowsForPrompt(analytics.contentAttribution, "No article-assist data yet")}

CTA labels:
${seoRowsForPrompt(analytics.ctaLabels, "No CTA data yet")}

Use this data as directional evidence only. If data is thin, rely on search intent and conversion potential.`;
}

function seoAiPrompt() {
  return `你是 Mandrix 官网 SEO 页面文案助手。请只输出一个可复制的 JSON 代码块，不要解释。

品牌：Mandrix，在线中文教学，高级、清楚、专业，面向成年学习者、商务人士、HSK 学生、采购/跨境/企业客户。
目标：先做轻量选题判断，再生成一个可直接粘贴进 Mandrix 后台的 SEO 页面。语言为英文。不要幼稚、不要夸张、不要长篇大论。

请先在内部完成这 4 步，但不要把分析过程输出：
1. 根据搜索意图、商业价值、成年学习者痛点、以及下面的 Mandrix 站内数据，选择当前最值得发布的主题。
2. 判断这个主题应该进入哪个细分 category。不要被固定分类限制，可以生成新的英文 slug 分类，例如 supplier-communication、workplace-mandarin、chinese-for-amazon-sellers、adult-mandarin-learning、professional-chinese、hsk-writing、mandarin-pronunciation。
3. slug 要面向真实搜索词，而不是品牌自嗨词。
4. 页面要服务转化：读完自然进入免费 AI level check 或课程页。

Mandrix 当前数据线索：
${seoDemandSnapshot()}

固定输出格式如下，字段一个都不要少：
\`\`\`json
{
  "category": "business-chinese",
  "status": "published",
  "slug": "example-page-url",
  "title": "SEO title, 35-65 characters, ends with | Mandrix",
  "description": "Meta description, 110-160 characters.",
  "eyebrow": "Short page label",
  "h1": "Clear page headline.",
  "lead": "2-3 sentence hero paragraph for adult learners.",
  "articleBody": "Full article body. 500-900 words. Include concrete examples, FAQs, and internal link suggestions in natural prose.",
  "image": "assets/backup-business-meeting.jpg",
  "imageAlt": "Short image alt text",
  "chips": "Chip one, Chip two, Chip three, Chip four",
  "primaryLabel": "Start Free AI Level Check",
  "primaryHref": "/level-check",
  "secondaryLabel": "View Courses",
  "secondaryHref": "/courses",
  "card1Title": "Card 1 title",
  "card1Text": "Card 1 text, specific and useful.",
  "card2Title": "Card 2 title",
  "card2Text": "Card 2 text, specific and useful.",
  "card3Title": "Card 3 title",
  "card3Text": "Card 3 text, specific and useful.",
  "sectionEyebrow": "Middle section label",
  "sectionTitle": "Middle section title.",
  "sectionBody": "Middle section paragraph. Keep it concrete.",
  "ctaEyebrow": "Start here",
  "ctaTitle": "Final CTA title.",
  "ctaBody": "Final CTA body with clear next step."
}
\`\`\`

Allowed image values only:
- assets/sourcing-supplier-laptop.jpg
- assets/backup-business-meeting.jpg
- assets/backup-study-desk.jpg
- assets/course-daily.jpg
- assets/course-diagnostic-online.webp
- assets/corporate-training-hero.png
- assets/backup-online-lesson.jpg
- assets/backup-warehouse.jpg
- assets/mandrix-scene-1on1.jpg
- assets/mandrix-scene-daily.jpg
- assets/mandrix-scene-hsk.jpg
- assets/mandrix-scene-method.jpg
- assets/mandrix-scene-reception.jpg
- assets/jane-portrait.jpg

Rules:
- category should be the best-fit lowercase English slug. Existing broad options include business-chinese, hsk-prep, daily-chinese, sourcing-chinese, culture-communication, learning-method, but you may create a more precise category if search intent is stronger.
- Do not invent prices. Use only the approved course prices and the free AI level check.
- Do not promise fluency in unrealistic time.
- Keep title readable, not keyword stuffing.
- H1 should sound human, not AI startup language.
- Use concrete learner situations, not abstract methodology.
- Output JSON only.`;
}

function extractSeoJsonCode(rawValue) {
  const raw = String(rawValue || "").trim();
  if (!raw) throw new Error("请先粘贴 AI 生成的 JSON 代码。");
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : raw;
  const jsonText = candidate
    .replace(/^const\s+\w+\s*=\s*/i, "")
    .replace(/^window\.\w+\s*=\s*/i, "")
    .replace(/;\s*$/g, "")
    .trim();
  const objectMatch = jsonText.match(/\{[\s\S]*\}/);
  if (!objectMatch) throw new Error("没有找到 JSON 对象。请让 AI 按固定格式输出。");
  return JSON.parse(objectMatch[0]);
}

function normalizeSeoAiData(data) {
  const allowedKeys = [
    "category", "status", "slug", "title", "description", "eyebrow", "h1", "lead", "articleBody", "image", "imageAlt", "chips",
    "primaryLabel", "primaryHref", "secondaryLabel", "secondaryHref",
    "card1Title", "card1Text", "card2Title", "card2Text", "card3Title", "card3Text",
    "sectionEyebrow", "sectionTitle", "sectionBody", "ctaEyebrow", "ctaTitle", "ctaBody",
  ];
  const cleaned = {};
  allowedKeys.forEach((key) => {
    cleaned[key] = String(data?.[key] ?? "").trim();
  });
  cleaned.slug = cleanSeoSlug(cleaned.slug);
  cleaned.category = cleanSeoCategory(cleaned.category);
  cleaned.status = cleaned.status === "draft" ? "draft" : "published";
  cleaned.primaryLabel ||= "Start Free AI Level Check";
  cleaned.primaryHref ||= "/level-check";
  cleaned.secondaryLabel ||= "View Courses";
  cleaned.secondaryHref ||= "/courses";
  if (!seoForm?.elements.image?.querySelector(`option[value="${CSS.escape(cleaned.image)}"]`)) {
    cleaned.image = seoSuggestedImages(cleaned)[0]?.value || seoPresets.custom.image;
  }
  return cleaned;
}

function applySeoAiCode() {
  try {
    const parsed = extractSeoJsonCode(seoAiCode?.value);
    const data = normalizeSeoAiData(parsed);
    fillSeoForm(data);
    localStorage.setItem("mandrixSeoDraft", JSON.stringify(seoFields()));
    if (seoApplyAiCode) {
      const original = seoApplyAiCode.textContent;
      seoApplyAiCode.textContent = "已套用";
      setTimeout(() => {
        seoApplyAiCode.textContent = original;
      }, 1600);
    }
  } catch (error) {
    alert(`AI 代码格式不对：${error.message}`);
  }
}

function seoValidation(data) {
  const slug = cleanSeoSlug(data.slug);
  const checks = [];
  checks.push({
    ok: slug === data.slug?.replace(/\.html$/i, ""),
    text: slug === data.slug?.replace(/\.html$/i, "") ? `URL OK: /insights/${cleanSeoCategory(data.category)}/${slug}` : `URL 会自动修正为 /insights/${cleanSeoCategory(data.category)}/${slug}`,
  });
  checks.push({
    ok: cleanSeoCategory(data.category).length >= 3,
    text: `分区：${seoCategoryLabel(data.category)}`,
  });
  checks.push({
    ok: data.title.length >= 35 && data.title.length <= 65,
    text: `Title ${data.title.length} 字符，建议 35-65`,
  });
  checks.push({
    ok: data.description.length >= 110 && data.description.length <= 160,
    text: `Description ${data.description.length} 字符，建议 110-160`,
  });
  checks.push({
    ok: !seoUsedImages[data.image],
    text: seoUsedImages[data.image] ? `图片已用于：${seoUsedImages[data.image]}` : "主图未在核心页面重复使用",
  });
  checks.push({
    ok: splitSeoList(data.chips).length >= 3,
    text: "至少 3 个 chips，首屏信息会更稳",
  });
  checks.push({
    ok: seoCardData(data).every((card) => card.title && card.text),
    text: "三个卡片标题和正文都已填写",
  });
  return checks;
}

function updateSeoBuilder() {
  if (!seoForm) return;
  const data = seoFields();
  const slug = cleanSeoSlug(data.slug);
  const category = cleanSeoCategory(data.category);
  const html = buildSeoHtml(data);
  if (seoSlugPreview) seoSlugPreview.textContent = `/insights/${category}/${slug}`;
  if (seoPreviewPath) seoPreviewPath.textContent = `/insights/${category}/${slug}`;
  if (seoImageTarget) seoImageTarget.value = seoImageAssetPath(data);
  if (seoImagePromptBox) seoImagePromptBox.value = seoImageStylePrompt(data);
  if (seoOutput) seoOutput.value = seoPublishPackage();
  if (seoPreview) {
    const previewData = seoUploadedImagePreviewUrl ? { ...data, imageUploadTarget: seoUploadedImagePreviewUrl } : data;
    const previewHtml = buildSeoHtml(previewData);
    seoPreview.srcdoc = previewHtml.replace("<head>", `<head><base href="${window.location.origin}/">`);
  }
  if (seoChecks) {
    seoChecks.innerHTML = seoValidation(data).map((check) => `
      <div class="${check.ok ? "ok" : "warn"}">
        <span>${check.ok ? "OK" : "注意"}</span>
        <p>${escapeHtml(check.text)}</p>
      </div>
    `).join("");
  }
  if (seoImageGallery) seoImageGallery.innerHTML = seoImageGalleryHtml(data);
}

async function copySeoText(text, button, doneText = "已复制") {
  try {
    await navigator.clipboard.writeText(text);
    const original = button?.textContent;
    if (button) {
      button.textContent = doneText;
      setTimeout(() => {
        button.textContent = original;
      }, 1600);
    }
  } catch (error) {
    window.prompt("复制失败，请手动复制：", text);
  }
}

function downloadSeoHtml() {
  const data = seoFields();
  const slug = cleanSeoSlug(data.slug);
  const blob = new Blob([buildSeoHtml(data)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slug}.html`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function saveSeoDraft() {
  const data = seoFields();
  localStorage.setItem("mandrixSeoDraft", JSON.stringify(data));
  const original = seoSaveDraft?.textContent;
  if (seoSaveDraft) {
    seoSaveDraft.textContent = "已保存";
    setTimeout(() => {
      seoSaveDraft.textContent = original;
    }, 1600);
  }
}

async function publishSeoLive() {
  if (!adminToken) {
    alert("请先输入后台密码，再发布 SEO 页面。");
    return;
  }
  const data = seoFields();
  const payload = {
    ...data,
    category: cleanSeoCategory(data.category),
    slug: cleanSeoSlug(data.slug),
  };
  if (seoPublishLive) {
    seoPublishLive.disabled = true;
    seoPublishLive.textContent = "发布中...";
  }
  if (seoLiveStatus) seoLiveStatus.textContent = "正在写入 Insights 分区，并生成可抓取页面...";
  try {
    const response = await fetch("/api/seo-pages.js", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "发布失败");
    const url = result.url || seoUrl(payload.slug);
    localStorage.setItem("mandrixSeoDraft", JSON.stringify(payload));
    if (seoLiveStatus) {
      seoLiveStatus.innerHTML = `已发布：<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(url)}</a><br>下一步：复制这个地址，到 Google Search Console 做 URL 检查。`;
    }
  } catch (error) {
    if (seoLiveStatus) seoLiveStatus.textContent = `发布失败：${error.message}。请检查 Cloudflare D1 和后台密码配置。`;
    alert(`发布失败：${error.message}`);
  } finally {
    if (seoPublishLive) {
      seoPublishLive.disabled = false;
      seoPublishLive.textContent = "发布到 Insights";
    }
  }
}

async function saveBooking(card) {
  const id = card.dataset.id;
  const payload = {};
  card.querySelectorAll("[data-field]").forEach((field) => {
    payload[field.dataset.field] = field.value;
  });
  const button = card.querySelector(".save-booking");
  button.disabled = true;
  button.textContent = t("saving");
  const response = await fetch(`/api/booking-update.js?id=${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    alert(t("saveFailed"));
    button.disabled = false;
    button.textContent = t("save");
    return;
  }
  button.textContent = t("saved");
  await loadBookings();
}

list.addEventListener("click", (event) => {
  const meetingButton = event.target.closest(".copy-meeting");
  if (meetingButton) {
    copyMeetingLink(meetingButton);
    return;
  }
  const copyButton = event.target.closest(".copy-renewal");
  if (copyButton) {
    copyRenewalEmail(copyButton.closest(".booking-card"));
    return;
  }
  const saveButton = event.target.closest(".save-booking");
  if (saveButton) {
    saveBooking(saveButton.closest(".booking-card"));
    return;
  }
  const deleteButton = event.target.closest(".delete-booking");
  if (!deleteButton) return;
  const card = deleteButton.closest(".booking-card");
  if (!window.confirm(t("deleteConfirm"))) return;
  deleteBooking(card);
});

renewalPanel?.addEventListener("click", (event) => {
  const copyButton = event.target.closest(".copy-renewal");
  if (!copyButton) return;
  copyRenewalEmail(copyButton.closest("[data-id]"));
});

lessonList?.addEventListener("click", (event) => {
  const meetingButton = event.target.closest(".copy-meeting");
  if (!meetingButton) return;
  copyMeetingLink(meetingButton);
});

async function copyMeetingLink(button) {
  const link = button?.dataset.meeting || "";
  if (!link) return;
  const original = button.textContent;
  try {
    await navigator.clipboard.writeText(link);
    button.textContent = adminLang === "zh" ? "已复制" : "Copied";
    setTimeout(() => {
      button.textContent = original;
    }, 1600);
  } catch (error) {
    window.prompt(adminLang === "zh" ? "复制失败，请手动复制会议链接：" : "Copy failed. Copy the meeting link manually:", link);
  }
}

async function copyRenewalEmail(card) {
  const booking = bookings.find((row) => String(row.id) === String(card?.dataset.id));
  if (!booking) return;
  const renewal = renewalStatusFor(booking);
  const text = renewalEmailFor(booking, renewal);
  try {
    await navigator.clipboard.writeText(text);
    const button = card.querySelector(".copy-renewal");
    if (button) {
      const original = button.textContent;
      button.textContent = t("copied");
      setTimeout(() => {
        button.textContent = original;
      }, 1600);
    }
  } catch (error) {
    window.prompt(adminLang === "zh" ? "复制失败，请手动复制：" : "Copy failed. Copy manually:", text);
  }
}

async function deleteBooking(card) {
  const id = card.dataset.id;
  const response = await fetch(`/api/booking-update.js?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "x-admin-token": adminToken },
  });
  if (!response.ok) {
    alert(t("saveFailed"));
    return;
  }
  await loadBookings();
}

refreshButton.addEventListener("click", loadBookings);
statusFilter.addEventListener("change", renderBookings);
searchInput.addEventListener("input", renderBookings);
timetableStart.addEventListener("change", renderLessons);
timetableDays.addEventListener("change", renderLessons);
langToggle.addEventListener("click", () => {
  adminLang = adminLang === "zh" ? "en" : "zh";
  localStorage.setItem("mandrixAdminLang", adminLang);
  applyLanguage();
  renderBookings();
  renderAnalytics();
});

adminTabs.forEach((button) => {
  button.addEventListener("click", () => switchAdminTab(button.dataset.adminTab));
});

analyticsRange.addEventListener("change", loadAnalytics);
clearAnalyticsButton?.addEventListener("click", clearAnalytics);
seoPreset?.addEventListener("change", () => {
  fillSeoForm(seoPresets[seoPreset.value] || seoPresets.custom);
});
seoForm?.addEventListener("input", updateSeoBuilder);
seoApplyAiCode?.addEventListener("click", applySeoAiCode);
seoClearAiCode?.addEventListener("click", () => {
  if (seoAiCode) seoAiCode.value = "";
});
seoCopyAiPrompt?.addEventListener("click", () => copySeoText(seoAiPrompt(), seoCopyAiPrompt, "已复制口令"));
seoCopyImagePrompt?.addEventListener("click", () => copySeoText(seoImageStylePrompt(), seoCopyImagePrompt, "已复制图片口令"));
seoImageUpload?.addEventListener("change", () => {
  const file = seoImageUpload.files?.[0];
  if (seoUploadedImagePreviewUrl) URL.revokeObjectURL(seoUploadedImagePreviewUrl);
  seoUploadedImagePreviewUrl = "";
  if (!file || !seoImagePreview) {
    if (seoImagePreview) seoImagePreview.hidden = true;
    updateSeoBuilder();
    return;
  }
  seoUploadedImagePreviewUrl = URL.createObjectURL(file);
  seoImagePreview.src = seoUploadedImagePreviewUrl;
  seoImagePreview.hidden = false;
  updateSeoBuilder();
});
seoImageGallery?.addEventListener("click", (event) => {
  const card = event.target.closest("[data-seo-image]");
  if (!card || !seoForm) return;
  const imageField = seoForm.elements.image;
  const altField = seoForm.elements.imageAlt;
  if (imageField) imageField.value = card.dataset.seoImage || "";
  if (altField && !altField.value.trim()) altField.value = card.dataset.seoAlt || "";
  updateSeoBuilder();
});
seoCopyPackage?.addEventListener("click", () => copySeoText(seoPublishPackage(), seoCopyPackage));
seoDownloadHtml?.addEventListener("click", downloadSeoHtml);
seoCopySitemap?.addEventListener("click", () => copySeoText(buildSeoSitemapEntry(), seoCopySitemap));
seoSaveDraft?.addEventListener("click", saveSeoDraft);
seoPublishLive?.addEventListener("click", publishSeoLive);

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  adminToken = passwordInput.value.trim();
  sessionStorage.setItem("mandrixAdminToken", adminToken);
  await loadBookings();
});

exportButton.addEventListener("click", async () => {
  const response = await fetch("/api/bookings.csv.js", {
    headers: { "x-admin-token": adminToken },
  });
  if (!response.ok) {
    alert(t("exportFailed"));
    return;
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "mandrix-bookings.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

timetableStart.value = todayIso();
try {
  const savedSeoDraft = JSON.parse(localStorage.getItem("mandrixSeoDraft") || "null");
  fillSeoForm(savedSeoDraft || seoPresets.business);
} catch (error) {
  fillSeoForm(seoPresets.business);
}
applyLanguage();
loadBookings();
