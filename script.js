const form = document.querySelector("#bookingForm");
const output = document.querySelector("#bookingOutput");
const messageBox = document.querySelector("#bookingMessage");
const copyButton = document.querySelector("#copyMessage");
const submitButton = document.querySelector("#submitBooking");
const resultTitle = document.querySelector("#bookingResultTitle");
const resultText = document.querySelector("#bookingResultText");
const courseSelect = form.elements.course;
const frequencySelect = form.elements.frequency;
const amountPreview = document.querySelector("#amountPreview");
const amountValue = document.querySelector("#amountValue");
const paymentPageLink = document.querySelector("#paymentPageLink");
const dateInput = form.elements.date;
const timeSelect = form.elements.time;
const timezoneInput = form.elements.timezone;
const paymentReferenceInput = form.elements.paymentReference;
const paymentAccountInput = form.elements.paymentAccount;
const goalInput = form.elements.goal;
const localTimePreview = document.querySelector("#localTimePreview");
const localTimeText = document.querySelector("#localTimeText");
const localTimeValue = document.querySelector("#localTimeValue");
const lessonScheduleValue = document.querySelector("#lessonScheduleValue");
const schedulePreview = document.querySelector("#schedulePreview");
const scheduleTitle = document.querySelector("#scheduleTitle");
const scheduleList = document.querySelector("#scheduleList");
const availabilityPreview = document.querySelector("#availabilityPreview");
const availabilityLabel = document.querySelector("#availabilityLabel");
const availabilityTitle = document.querySelector("#availabilityTitle");
const availabilityText = document.querySelector("#availabilityText");
const lang = form.dataset.lang || "en";
const copyDefaultText = lang === "zh" ? "复制信息" : "Copy Message";
const copyDoneText = lang === "zh" ? "已复制" : "Copied";
const submitDefaultText = lang === "zh" ? "提交付款后预约" : "Submit Paid Booking";
const submittingText = lang === "zh" ? "提交中..." : "Submitting...";

let latestAvailability = null;
let availabilityTimer = 0;

function extractAmount(course) {
  const match = String(course || "").match(/\$(\d+(?:\.\d{1,2})?)/);
  return match ? match[1] : "";
}

function extractLessonCount(course) {
  const lessonMatch = String(course || "").match(/(\d+)\s+lessons?/i);
  if (lessonMatch) return Number(lessonMatch[1]);
  const sessionMatch = String(course || "").match(/(\d+)\s+sessions?/i);
  return sessionMatch ? Number(sessionMatch[1]) : 1;
}

function updateAmountPreview() {
  const amount = extractAmount(courseSelect.value);
  const consultationOnly = /Request Consultation/i.test(courseSelect.value);
  if (consultationOnly) {
    amountPreview.hidden = false;
    amountValue.textContent = "Consultation required";
    paymentPageLink.href = "mailto:Jane.Mandrix@outlook.com?subject=Mandrix%20Private%20Intensive%20Consultation";
    paymentPageLink.textContent = "Request Consultation";
    paymentReferenceInput.required = false;
    paymentAccountInput.required = false;
    dateInput.required = false;
    timeSelect.required = false;
    frequencySelect.required = false;
    submitButton.textContent = lang === "zh" ? "联系 Jane" : "Request Consultation";
    return;
  }
  paymentReferenceInput.required = true;
  paymentAccountInput.required = true;
  dateInput.required = true;
  timeSelect.required = true;
  frequencySelect.required = true;
  if (!courseSelect.value) {
    amountPreview.hidden = false;
    amountValue.textContent = lang === "zh" ? "请选择课程" : "Select a course";
    paymentPageLink.href = "#booking";
    paymentPageLink.textContent = lang === "zh" ? "立即付款" : "Pay Now";
    submitButton.textContent = submitDefaultText;
    return;
  }
  if (!amount) {
    amountPreview.hidden = false;
    amountValue.textContent = lang === "zh" ? "请先咨询" : "Contact Jane first";
    paymentPageLink.href = "mailto:Jane.Mandrix@outlook.com?subject=Mandrix%20Program%20Question";
    paymentPageLink.textContent = lang === "zh" ? "邮件咨询" : "Contact Jane";
    submitButton.textContent = submitDefaultText;
    return;
  }
  amountPreview.hidden = false;
  amountValue.textContent = `$${amount}`;
  paymentPageLink.href = `https://paypal.me/mandrixpay/${encodeURIComponent(amount)}`;
  paymentPageLink.textContent = lang === "zh" ? "立即付款" : "Pay Now";
  submitButton.textContent = submitDefaultText;
}

function getUserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
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

function frequencyText(value) {
  const labels = lang === "zh"
    ? { weekly: "每周一次", "twice-weekly": "每周两次", intensive: "每周三次" }
    : { weekly: "Once a week", "twice-weekly": "Twice a week", intensive: "Three times a week" };
  return labels[value] || labels.weekly;
}

function buildLessonScheduleLocal() {
  if (!courseSelect.value || !dateInput.value || !timeSelect.value) return [];
  const count = extractLessonCount(courseSelect.value);
  const steps = frequencySteps(frequencySelect.value);
  const lessons = [];
  let currentDate = dateInput.value;
  for (let index = 0; index < count; index += 1) {
    if (index > 0) currentDate = addDays(currentDate, steps[(index - 1) % steps.length]);
    lessons.push({ lesson: index + 1, date: currentDate, time: timeSelect.value, status: "Scheduled" });
  }
  return lessons;
}

function formatScheduleLine(item) {
  return lang === "zh"
    ? `第 ${item.lesson} 节：${item.date} · ${item.time} 北京时间`
    : `Lesson ${item.lesson}: ${item.date} · ${item.time} Beijing Time`;
}

function updateSchedulePreview(schedule = buildLessonScheduleLocal()) {
  if (!schedule.length) {
    schedulePreview.hidden = true;
    lessonScheduleValue.value = "";
    return;
  }
  schedulePreview.hidden = false;
  scheduleTitle.textContent = lang === "zh"
    ? `${schedule.length} 节课 · ${frequencyText(frequencySelect.value)}`
    : `${schedule.length} lesson(s) · ${frequencyText(frequencySelect.value)}`;
  scheduleList.innerHTML = schedule.map((item) => `<li>${formatScheduleLine(item)}</li>`).join("");
  lessonScheduleValue.value = schedule.map(formatScheduleLine).join("\n");
}

function beijingDateToUtc(dateValue, timeValue) {
  const startTime = String(timeValue || "").split(" - ")[0];
  if (!dateValue || !startTime) return null;
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = startTime.split(":").map(Number);
  if (![year, month, day, hour, minute].every(Number.isFinite)) return null;
  return new Date(Date.UTC(year, month - 1, day, hour - 8, minute));
}

function updateLocalTimePreview() {
  const userTimeZone = getUserTimeZone();
  const convertedDate = beijingDateToUtc(dateInput.value, timeSelect.value);

  if (!convertedDate || !userTimeZone) {
    localTimePreview.hidden = true;
    localTimeText.textContent = "";
    localTimeValue.value = "";
    return;
  }

  const localText = new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: userTimeZone,
    timeZoneName: "short",
  }).format(convertedDate);

  localTimePreview.hidden = false;
  localTimeText.textContent = localText;
  localTimeValue.value = `${localText} (${userTimeZone})`;
}

function setAvailabilityState(state, data = {}) {
  availabilityPreview.hidden = false;
  availabilityPreview.className = `availability-preview ${state}`;
  if (state === "pending") {
    availabilityLabel.textContent = lang === "zh" ? "请选择课程、日期和时间" : "Choose course, date, and time";
    availabilityTitle.textContent = lang === "zh" ? "等待检查可预约状态" : "Waiting to check availability";
    availabilityText.textContent = lang === "zh" ? "选好课程、第一节日期、时间段和频率后，系统会自动生成课表并检查是否可约。" : "After you choose a course, first date, time slot, and frequency, the system will generate your timetable and check availability.";
    submitButton.disabled = false;
    return;
  }
  if (state === "checking") {
    availabilityLabel.textContent = lang === "zh" ? "正在检查" : "Checking";
    availabilityTitle.textContent = lang === "zh" ? "正在检查这个课表是否可约" : "Checking whether this timetable is available";
    availabilityText.textContent = "";
    submitButton.disabled = true;
    return;
  }
  if (state === "ok") {
    availabilityLabel.textContent = lang === "zh" ? "可预约" : "Available";
    availabilityTitle.textContent = data.type === "group"
      ? (lang === "zh" ? "团课名额可预约" : "Group seat available")
      : (lang === "zh" ? "一对一时段可预约" : "1-on-1 time available");
    availabilityText.textContent = lang === "zh" ? translateAvailability(data) : data.message;
    submitButton.disabled = false;
    return;
  }
  availabilityLabel.textContent = lang === "zh" ? "不可预约" : "Unavailable";
  availabilityTitle.textContent = lang === "zh" ? "请更换日期或时间段" : "Please choose another date or time";
  availabilityText.textContent = lang === "zh" ? translateAvailability(data) : (data.message || "This time is not available.");
  submitButton.disabled = true;
}

function translateAvailability(data) {
  if (!data) return "";
  if (data.type === "group" && data.ok) {
    if (data.neededToOpen > 0) return `团课可预约。你预约后，还差 ${data.neededToOpen} 人开班；也可以邀请朋友一起报名，或等待其他学生加入。`;
    return `团课可预约。你预约后即可达到开班人数，还剩 ${Math.max(0, (data.remainingSeats || 1) - 1)} 个名额。`;
  }
  if (data.type === "one-on-one" && data.ok) return "这个一对一时段目前空闲，可以预约。";
  if (data.message && data.message.includes("full")) return "这个团课已满，请选择其他时间段。";
  return "这个时间段已有课程安排，请选择其他日期或时间段。";
}

async function checkAvailability() {
  updateLocalTimePreview();
  const schedule = buildLessonScheduleLocal();
  updateSchedulePreview(schedule);
  latestAvailability = null;

  if (!courseSelect.value || !dateInput.value || !timeSelect.value) {
    setAvailabilityState("pending");
    return;
  }

  setAvailabilityState("checking");
  const params = new URLSearchParams({
    course: courseSelect.value,
    date: dateInput.value,
    time: timeSelect.value,
    frequency: frequencySelect.value,
  });

  try {
    const response = await fetch(`/api/availability.js?${params}`);
    const data = await response.json();
    latestAvailability = data;
    if (data.schedule) updateSchedulePreview(data.schedule);
    setAvailabilityState(data.ok ? "ok" : "blocked", data);
  } catch (error) {
    setAvailabilityState("ok", {
      ok: true,
      type: "preview",
      message: lang === "zh" ? "当前为静态预览，无法读取后台占用；提交时仍会再次检查。" : "Preview mode cannot read booked slots. The system will check again when you submit.",
    });
  }
}

function scheduleCheckAvailability() {
  clearTimeout(availabilityTimer);
  availabilityTimer = setTimeout(checkAvailability, 250);
}

function buildBookingMessage(data) {
  const labels = lang === "zh"
    ? {
        title: "Mandrix 预约申请",
        fullName: "姓名",
        email: "邮箱",
        contact: "微信 / WhatsApp",
        country: "国家 / 地区",
        timezone: "时区",
        level: "当前中文水平",
        course: "课程套餐",
        date: "第一节日期",
        time: "固定上课时间",
        frequency: "上课频率",
        localTime: "学生本地时间",
        schedule: "自动生成课表",
        paymentReference: "付款参考号 / 交易号",
        paymentAccount: "付款账户 / 持卡人姓名",
        paymentProofLink: "付款截图或收据链接",
        goal: "学习目标",
        amount: "应付金额",
        notes: "其他需求",
        none: "无",
      }
    : {
        title: "Mandrix Booking Request",
        fullName: "Full Name",
        email: "Email Address",
        contact: "WeChat / WhatsApp",
        country: "Country / Region",
        timezone: "Time Zone",
        level: "Current Chinese Level",
        course: "Course Package",
        date: "First Class Date",
        time: "Fixed Class Time",
        frequency: "Class Frequency",
        localTime: "Student Local Time",
        schedule: "Auto Lesson Schedule",
        paymentReference: "Payment Reference / Transaction ID",
        paymentAccount: "Payment Account / Cardholder Name",
        paymentProofLink: "Receipt or Screenshot Link",
        goal: "Learning Goal",
        amount: "Amount to Pay",
        notes: "Special Requests",
        none: "None",
      };

  return [
    labels.title,
    "",
    `${labels.fullName}: ${data.fullName}`,
    `${labels.email}: ${data.email}`,
    `${labels.contact}: ${data.contact}`,
    `${labels.country}: ${data.country}`,
    `${labels.timezone}: ${data.timezone}`,
    `${labels.level}: ${data.level}`,
    `${labels.course}: ${data.course}`,
    `${labels.date}: ${data.date}`,
    `${labels.time}: ${data.time} Beijing Time`,
    `${labels.frequency}: ${frequencyText(data.frequency)}`,
    `${labels.localTime}: ${data.localTime || labels.none}`,
    "",
    `${labels.schedule}:`,
    data.lessonSchedule || labels.none,
    "",
    `${labels.paymentReference}: ${data.paymentReference || labels.none}`,
    `${labels.paymentAccount}: ${data.paymentAccount || labels.none}`,
    `${labels.paymentProofLink}: ${data.paymentProofLink || labels.none}`,
    "",
    `${labels.goal}:`,
    data.goal,
    "",
    `${labels.amount}: ${data.amount || extractAmount(data.course) ? `$${data.amount || extractAmount(data.course)}` : (lang === "zh" ? "待咨询" : "Consultation required")}`,
    "",
    `${labels.notes}:`,
    data.notes || labels.none,
  ].join("\n");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (/Request Consultation/i.test(courseSelect.value)) {
    resultTitle.textContent = lang === "zh" ? "请先联系 Jane 确认申请制课程。" : "Please request a consultation first.";
    resultText.textContent = lang === "zh"
      ? "申请制课程不直接走 PayPal 付款表单。请通过邮件、WhatsApp 或 Telegram 联系 Jane。"
      : "Private Intensives are not direct PayPal checkout programs. Please contact Jane by email, WhatsApp, or Telegram first.";
    messageBox.value = buildBookingMessage(Object.fromEntries(new FormData(form).entries()));
    output.hidden = false;
    output.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return;
  }
  await checkAvailability();
  if (latestAvailability && latestAvailability.ok === false) {
    resultTitle.textContent = lang === "zh" ? "这个时间暂时不能预约。" : "This time cannot be booked.";
    resultText.textContent = lang === "zh" ? translateAvailability(latestAvailability) : latestAvailability.message;
    output.hidden = false;
    output.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return;
  }

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  const localSchedule = latestAvailability?.schedule || buildLessonScheduleLocal();
  payload.lessonSchedule = localSchedule.map(formatScheduleLine).join("\n");
  payload.amount = extractAmount(payload.course);
  submitButton.disabled = true;
  submitButton.textContent = submittingText;

  try {
    const response = await fetch("/api/bookings.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 409 && error.availability) {
        latestAvailability = error.availability;
        setAvailabilityState("blocked", error.availability);
      }
      throw new Error(error.error || "Booking submission failed");
    }
    await response.json();
    window.MandrixAnalytics?.track("booking_submit_success", {
      course: payload.course,
      amount: payload.amount,
      date: payload.date,
      time: payload.time,
    });
    resultTitle.textContent = lang === "zh" ? "你的付款后预约已提交。" : "Your paid booking has been submitted.";
    resultText.textContent = lang === "zh"
      ? "系统已自动邮件通知 Jane。Jane 核验付款后，会另外发送腾讯会议链接。"
      : "Jane has been notified by email. After payment is verified, Jane will send your Tencent Meeting link in a separate email within 24 business hours.";
    messageBox.value = buildBookingMessage(payload);
    form.reset();
    timezoneInput.value = getUserTimeZone();
    updateAmountPreview();
    updateLocalTimePreview();
    updateSchedulePreview([]);
    setAvailabilityState("pending");
    output.hidden = false;
    output.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (error) {
    window.MandrixAnalytics?.track("booking_submit_error", {
      course: payload.course,
      message: error.message || "Submission failed",
    });
    resultTitle.textContent = lang === "zh" ? "提交失败。" : "Submission failed.";
    resultText.textContent = error.message || (lang === "zh" ? "请检查付款信息和时间后再提交。" : "Please check the payment details and time, then submit again.");
    console.error(error);
    messageBox.value = buildBookingMessage(payload);
    output.hidden = false;
    output.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = submitDefaultText;
  }
});

copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(messageBox.value);
  copyButton.textContent = copyDoneText;
  setTimeout(() => {
    copyButton.textContent = copyDefaultText;
  }, 1600);
});

courseSelect.addEventListener("change", () => {
  updateAmountPreview();
  scheduleCheckAvailability();
});
dateInput.addEventListener("change", scheduleCheckAvailability);
timeSelect.addEventListener("change", scheduleCheckAvailability);
frequencySelect.addEventListener("change", scheduleCheckAvailability);
timezoneInput.value = timezoneInput.value || getUserTimeZone();

document.querySelectorAll("[data-course]").forEach((button) => {
  button.addEventListener("click", () => {
    const selectedCourse = button.dataset.course;
    const option = [...courseSelect.options].find((item) => item.value === selectedCourse || item.textContent === selectedCourse);
    if (option) {
      courseSelect.value = option.value || option.textContent;
      updateAmountPreview();
      scheduleCheckAvailability();
    }
    setTimeout(() => {
      courseSelect.focus();
    }, 350);
  });
});

updateAmountPreview();
updateLocalTimePreview();
updateSchedulePreview([]);
setAvailabilityState("pending");

/* ─── Hamburger mobile nav toggle ─────────────────────── */
const navToggle = document.querySelector("#navToggle");
const navLinks = document.querySelector("#navLinks");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Close menu when a nav link is clicked
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ─── Course tabs: active state via IntersectionObserver ─ */
const courseTabLinks = document.querySelectorAll(".course-tabs a");
const programBlocks = document.querySelectorAll(".program-block");

if (courseTabLinks.length && programBlocks.length) {
  const tabMap = {};
  courseTabLinks.forEach((tab) => {
    const href = tab.getAttribute("href");
    if (href && href.startsWith("#")) tabMap[href.slice(1)] = tab;
  });

  const tabObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          courseTabLinks.forEach((t) => t.classList.remove("active"));
          const activeTab = tabMap[entry.target.id];
          if (activeTab) activeTab.classList.add("active");
        }
      });
    },
    { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
  );

  programBlocks.forEach((block) => {
    if (block.id) tabObserver.observe(block);
  });
}

/* ─── Scroll-reveal: auto-apply to key sections ────────── */
(function () {
  const selectors = [
    ".proof-stat",
    ".outcome-card",
    ".tcard",
    ".program-card",
    ".section-kicker",
    ".trust-badge",
    ".booking-guarantee",
  ];

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
  );

  selectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add("reveal");
      const col = i % 3;
      if (col === 1) el.classList.add("reveal-d1");
      if (col === 2) el.classList.add("reveal-d2");
      revealObserver.observe(el);
    });
  });
})();

/* ─── Proof-strip counter animation ────────────────────── */
(function () {
  const counterEls = document.querySelectorAll("[data-count]");
  if (!counterEls.length) return;

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const decimals = parseInt(el.dataset.decimal || "0", 10);
        const duration = 900;
        const start = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const val = eased * target;
          el.textContent = val.toFixed(decimals) + suffix;
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            el.classList.add("pop");
            setTimeout(() => el.classList.remove("pop"), 300);
          }
        };
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );

  counterEls.forEach((el) => counterObserver.observe(el));
})();

/* ─── Floating CTA: hide when #booking is in view ──────── */
const floatingContact = document.querySelector(".floating-contact");
const bookingSection = document.querySelector("#booking");

if (floatingContact && bookingSection) {
  const floatObserver = new IntersectionObserver(
    ([entry]) => {
      floatingContact.classList.toggle("is-hidden", entry.isIntersecting);
    },
    { threshold: 0.1 }
  );
  floatObserver.observe(bookingSection);
}
