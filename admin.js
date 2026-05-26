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
let analytics = null;
let activeAdminTab = "operations";
let adminLang = localStorage.getItem("mandrixAdminLang") || "zh";
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
      meetingLink: booking.meetingLink,
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
  summary.innerHTML = `
    <div><strong>${rows.length}</strong><span>${t("total")}</span></div>
    <div><strong>${active}</strong><span>${t("active")}</span></div>
    <div><strong>${paidPending || rows.filter(isPaidLike).length}</strong><span>${t("paidPending")}</span></div>
    <div><strong>${todayRows}</strong><span>${t("lessonsToday")}</span></div>
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
            return `
              <div class="slot-cell booked">
                <span>${meetingLink ? t("scheduled") : t("booked")}</span>
                <strong>${escapeHtml(lesson.fullName)}</strong>
                <small>${escapeHtml(lesson.course)}</small>
                <em>${escapeHtml(groupText || "")}</em>
                ${meetingLink ? `<a href="${escapeHtml(meetingLink)}" target="_blank" rel="noopener">${t("openMeeting")}</a>` : ""}
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
  renderLessons();
  if (!rows.length) {
    list.innerHTML = `<p>${t("noBookings")}</p>`;
    return;
  }
  list.innerHTML = rows.map((booking) => `
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
          ${lessonScheduleFor(booking).map((lesson) => `<li>Lesson ${escapeHtml(lesson.lesson)} · ${escapeHtml(lesson.date)} · ${escapeHtml(lesson.time)} ${t("beijingTime")}</li>`).join("")}
        </ol>
      </div>
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
          <input data-field="meetingLink" value="${escapeHtml(booking.meetingLink || "")}" placeholder="Tencent Meeting / Google Meet link">
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
  `).join("");
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
  if (tab === "analytics" && !analytics) loadAnalytics();
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
applyLanguage();
loadBookings();
