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
const paypalCheckoutPanel = document.querySelector("#paypalCheckoutPanel");
const paypalButtons = document.querySelector("#paypalButtons");
const paypalStatus = document.querySelector("#paypalStatus");
const paypalOrderIdInput = document.querySelector("#paypalOrderId");
const paypalPayerEmailInput = document.querySelector("#paypalPayerEmail");
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
const submitDefaultText = lang === "zh" ? "提交预约" : "Submit Booking";
const submittingText = lang === "zh" ? "提交中..." : "Submitting...";

let latestAvailability = null;
let availabilityTimer = 0;
let paypalReady = false;
let paypalButtonsRendered = false;
let paidCourseKey = "";

function extractAmount(course) {
  const text = String(course || "");
  const match = text.match(/\$(\d+(?:\.\d{1,2})?)/)
    || text.match(/USD\s*(\d+(?:\.\d{1,2})?)/i)
    || text.match(/(\d+(?:\.\d{1,2})?)\s*(?:美元|美金|usd)/i);
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
    paymentReferenceInput.value = "";
    setPayPalStatus(lang === "zh" ? "申请制课程请先联系 Jane，不需要在线付款。" : "Private intensives require a consultation first. Online payment is not required here.", "neutral");
    if (paymentAccountInput) paymentAccountInput.required = false;
    dateInput.required = false;
    timeSelect.required = false;
    frequencySelect.required = false;
    submitButton.textContent = lang === "zh" ? "联系 Jane" : "Request Consultation";
    return;
  }
  paymentReferenceInput.required = true;
  if (paymentAccountInput) paymentAccountInput.required = false;
  dateInput.required = true;
  timeSelect.required = true;
  frequencySelect.required = true;
  if (!courseSelect.value) {
    amountPreview.hidden = false;
    amountValue.textContent = lang === "zh" ? "请选择课程" : "Select a course";
    paymentPageLink.href = "#paypalCheckoutPanel";
    paymentPageLink.textContent = lang === "zh" ? "选择课程" : "Choose Course";
    resetPayPalPayment();
    setPayPalStatus(lang === "zh" ? "请选择课程后再付款。" : "Choose a course before payment.", "neutral");
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
  amountValue.textContent = lang === "zh" ? `${amount} 美元` : `$${amount}`;
  paymentPageLink.href = "#paypalCheckoutPanel";
  paymentPageLink.textContent = lang === "zh" ? "使用 PayPal 付款" : "Pay with PayPal";
  if (paidCourseKey && paidCourseKey !== paymentKey()) resetPayPalPayment();
  if (!paymentReferenceInput.value) setPayPalStatus(lang === "zh" ? "请先完成 PayPal 付款，再提交预约。" : "Complete PayPal payment before submitting your booking.", "neutral");
  submitButton.textContent = submitDefaultText;
}

function paymentKey() {
  return `${courseSelect.value}|${extractAmount(courseSelect.value)}`;
}

function setPayPalStatus(message, tone = "neutral") {
  if (!paypalStatus) return;
  paypalStatus.textContent = message;
  paypalCheckoutPanel?.setAttribute("data-status", tone);
}

function resetPayPalPayment() {
  paidCourseKey = "";
  paymentReferenceInput.value = "";
  if (paypalOrderIdInput) paypalOrderIdInput.value = "";
  if (paypalPayerEmailInput) paypalPayerEmailInput.value = "";
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function loadPayPalCheckout() {
  if (!paypalButtons || paypalReady || paypalButtonsRendered) return;
  try {
    const config = await fetchJson("/api/paypal/config.js");
    if (!config.configured || !config.clientId) {
      setPayPalStatus(lang === "zh"
        ? "PayPal 商家收款还差 Client ID 配置。配置后这里会自动显示 PayPal 按钮。"
        : "PayPal Business checkout is ready in code. Add the PayPal Client ID in Cloudflare to show the live button.",
      "warning");
      return;
    }
    await new Promise((resolve, reject) => {
      const existing = document.querySelector("script[data-paypal-sdk]");
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        if (window.paypal) resolve();
        return;
      }
      const script = document.createElement("script");
      script.dataset.paypalSdk = "true";
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(config.clientId)}&currency=${encodeURIComponent(config.currency || "USD")}&intent=capture&components=buttons`;
      script.onload = resolve;
      script.onerror = () => reject(new Error("PayPal SDK failed to load"));
      document.head.append(script);
    });
    if (!window.paypal) throw new Error("PayPal SDK unavailable");
    paypalReady = true;
    window.paypal.Buttons({
      style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal" },
      onClick: () => {
        const amount = extractAmount(courseSelect.value);
        if (!courseSelect.value || !amount) {
          setPayPalStatus(lang === "zh" ? "请先选择一个可付款课程。" : "Please choose a paid course first.", "warning");
          return false;
        }
        const requiredBeforePayment = ["fullName", "email", "contact", "country", "timezone", "level", "course", "date", "time", "frequency"];
        const missing = requiredBeforePayment.find((name) => !String(form.elements[name]?.value || "").trim());
        if (missing) {
          form.elements[missing]?.focus();
          setPayPalStatus(lang === "zh" ? "请先填写上方预约信息，再付款。" : "Fill in the booking details above before payment.", "warning");
          return false;
        }
        return true;
      },
      createOrder: async () => {
        const payload = Object.fromEntries(new FormData(form).entries());
        payload.amount = extractAmount(payload.course);
        const data = await fetchJson("/api/paypal/create-order.js", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        return data.orderId;
      },
      onApprove: async (data) => {
        const result = await fetchJson("/api/paypal/capture-order.js", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.orderID }),
        });
        paymentReferenceInput.value = result.orderId || data.orderID;
        if (paypalOrderIdInput) paypalOrderIdInput.value = result.orderId || data.orderID;
        if (paypalPayerEmailInput) paypalPayerEmailInput.value = result.payerEmail || "";
        paidCourseKey = paymentKey();
        setPayPalStatus(lang === "zh" ? `付款成功：${paymentReferenceInput.value}` : `Payment confirmed: ${paymentReferenceInput.value}`, "paid");
        window.MandrixAnalytics?.track("paypal_payment_success", {
          course: courseSelect.value,
          amount: extractAmount(courseSelect.value),
          orderId: paymentReferenceInput.value,
        });
      },
      onError: (error) => {
        console.error(error);
        setPayPalStatus(lang === "zh" ? "PayPal 付款未完成，请重试。" : "PayPal payment was not completed. Please try again.", "warning");
      },
    }).render("#paypalButtons");
    paypalButtonsRendered = true;
  } catch (error) {
    console.error(error);
    setPayPalStatus(error.message || (lang === "zh" ? "PayPal 暂时不可用。" : "PayPal is temporarily unavailable."), "warning");
  }
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
        paymentReference: "PayPal 订单号",
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
        course: "Course Plan",
        date: "First Class Date",
        time: "Fixed Class Time",
        frequency: "Class Frequency",
        localTime: "Student Local Time",
        schedule: "Auto Lesson Schedule",
        paymentReference: "PayPal Order ID",
        paymentAccount: "Payment Account",
        paymentProofLink: "Receipt Link",
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
    data.paymentAccount ? `${labels.paymentAccount}: ${data.paymentAccount}` : "",
    data.paymentProofLink ? `${labels.paymentProofLink}: ${data.paymentProofLink}` : "",
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
  payload.paymentProvider = "PayPal";
  if (!payload.paymentReference || paidCourseKey !== paymentKey()) {
    setPayPalStatus(lang === "zh" ? "请先完成当前课程金额的 PayPal 付款。" : "Please complete PayPal payment for the selected course before submitting.", "warning");
    resultTitle.textContent = lang === "zh" ? "请先完成付款。" : "Please complete payment first.";
    resultText.textContent = lang === "zh" ? "PayPal 成功后，系统会自动写入订单号，然后你就可以提交预约。" : "After PayPal confirms the payment, the order ID is attached automatically and you can submit the booking.";
    output.hidden = false;
    paypalCheckoutPanel?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
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
      paymentProvider: "PayPal",
      date: payload.date,
      time: payload.time,
    });
    resultTitle.textContent = lang === "zh" ? "你的预约已提交。" : "Your booking has been submitted.";
    resultText.textContent = lang === "zh"
      ? "系统已生成课表并发送 Google Meet 课程邮件。"
      : "Mandrix generated your schedule and sent the Google Meet details by email.";
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
loadPayPalCheckout();
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
    if (!href) return;
    if (href.startsWith("#")) tabMap[href.slice(1)] = tab;
    if (href.startsWith("/")) tabMap[href.replace("/", "")] = tab;
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

/* ─── Program details: diagnostic-first folded course flow ───────── */
(function () {
  const blocks = document.querySelectorAll(".program-block");
  const toggles = document.querySelectorAll(".program-toggle");
  if (!blocks.length || !toggles.length) return;
  const isChinesePage = document.documentElement.lang && document.documentElement.lang.startsWith("zh");

  const expandedCopyEn = {
    daily: "Hide Daily Chinese plans",
    business: "Hide Business Chinese plans",
    hsk: "Hide HSK plans",
    specialty: "Hide Specialty plans",
    private: "Hide Private Intensive options",
  };

  const collapsedCopyEn = {
    daily: "View Daily Chinese plans",
    business: "View Business Chinese plans",
    hsk: "View HSK plans",
    specialty: "View Specialty plans",
    private: "Show Private Intensive options",
  };

  const expandedCopyZh = {
    daily: "收起日常中文课包",
    business: "收起商务中文课包",
    hsk: "收起 HSK 课包",
    specialty: "收起专项课程",
    private: "收起私人强化课程",
  };

  const collapsedCopyZh = {
    daily: "展开日常中文课包",
    business: "展开商务中文课包",
    hsk: "展开 HSK 课包",
    specialty: "展开专项课程",
    private: "展开私人强化课程",
  };

  const expandedCopy = isChinesePage ? expandedCopyZh : expandedCopyEn;
  const collapsedCopy = isChinesePage ? collapsedCopyZh : collapsedCopyEn;

  function setBlockExpanded(block, expanded) {
    if (!block || !block.id) return;
    block.classList.toggle("is-expanded", expanded);
    const toggle = block.querySelector(".program-toggle");
    if (toggle) {
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      toggle.textContent = expanded
        ? expandedCopy[block.id] || "Hide details"
        : collapsedCopy[block.id] || "Show details";
    }
  }

  function expandFromPath(pathname = window.location.pathname, hash = window.location.hash) {
    const routeKey = pathname.replace("/", "");
    const hashKey = hash ? hash.replace("#", "") : "";
    const targetId = routeKey && !routeKey.endsWith(".html") ? routeKey : hashKey;
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (target && target.classList.contains("program-block")) {
      setBlockExpanded(target, true);
    }
  }

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const block = toggle.closest(".program-block");
      if (!block) return;
      const shouldExpand = !block.classList.contains("is-expanded");
      setBlockExpanded(block, shouldExpand);
    });
  });

  expandFromPath();
  window.addEventListener("popstate", () => expandFromPath());
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    requestAnimationFrame(() => expandFromPath(url.pathname, url.hash));
  });
})();

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

/* ─── Floating CTA: hide where it would cover dense content ──────── */
const floatingContact = document.querySelector(".floating-contact");
const cleanSectionRoutes = {
  "/method": "method",
  "/courses": "courses",
  "/about": "about",
  "/level-check": "level-check",
  "/faq": "faq",
  "/booking": "booking",
  "/contact": "contact",
  "/diagnostic": "diagnostic",
  "/daily": "daily",
  "/business": "business",
  "/hsk": "hsk",
  "/specialty": "specialty",
  "/private": "private",
  "/sourcing-spotlight": "sourcing-spotlight",
};

function scrollToCleanSection(pathname = window.location.pathname, shouldReplace = false, hash = window.location.hash) {
  const hashId = hash ? hash.replace("#", "") : "";
  const targetId = cleanSectionRoutes[pathname] || hashId;
  if (!targetId) return false;
  const target = document.getElementById(targetId);
  if (!target) return false;
  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  if (shouldReplace) history.replaceState(null, "", pathname);
  return true;
}

scrollToCleanSection(window.location.pathname, false, window.location.hash);

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link) return;
  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return;
  if (!cleanSectionRoutes[url.pathname]) return;
  if (!document.getElementById(cleanSectionRoutes[url.pathname])) return;
  event.preventDefault();
  history.pushState(null, "", url.pathname);
  scrollToCleanSection(url.pathname);
});

window.addEventListener("popstate", () => scrollToCleanSection(window.location.pathname, false, window.location.hash));

const floatingHideSections = [
  "#method",
  ".outcomes-section",
  "#level-check",
  "#results",
  "#courses",
  "#faq",
  "#booking",
]
  .map((selector) => document.querySelector(selector))
  .filter(Boolean);

if (floatingContact && floatingHideSections.length) {
  const visibleSections = new Set();
  const updateFloatingContact = () => {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const shouldHide = floatingHideSections.some((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top < viewportHeight - 40 && rect.bottom > 40;
    });
    floatingContact.classList.toggle("is-hidden", shouldHide || visibleSections.size > 0);
  };
  const floatObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleSections.add(entry.target);
        } else {
          visibleSections.delete(entry.target);
        }
      });
      updateFloatingContact();
    },
    { rootMargin: "0px 0px -35% 0px", threshold: 0 }
  );
  floatingHideSections.forEach((section) => floatObserver.observe(section));
  window.addEventListener("scroll", updateFloatingContact, { passive: true });
  window.addEventListener("resize", updateFloatingContact);
  updateFloatingContact();
}

/* ─── Free AI Level Check: branded report + lead capture ─────────── */
const levelCheckForm = document.querySelector("#levelCheckForm");
const levelCheckSubmit = document.querySelector("#levelCheckSubmit");
const levelReport = document.querySelector("#levelReport");
const levelReportContent = document.querySelector("#levelReportContent");
const levelReportStatus = document.querySelector("#levelReportStatus");
const levelCheckReset = document.querySelector("#levelCheckReset");
const voiceRecordButton = document.querySelector("#voiceRecordButton");
const voiceStopButton = document.querySelector("#voiceStopButton");
const voiceClearButton = document.querySelector("#voiceClearButton");
const voicePreview = document.querySelector("#voicePreview");
const voiceStatus = document.querySelector("#voiceStatus");
let levelMediaRecorder = null;
let levelAudioChunks = [];
let levelAudioBlob = null;
let levelAudioUrl = "";
let levelAudioTimer = null;
let levelAudioSeconds = 0;
let levelAudioStream = null;

const goalLabels = {
  daily: "Daily Chinese",
  business: "Business Chinese",
  hsk: "HSK System Prep",
  sourcing: "Sourcing & Supplier Chinese",
  travel: "Travel / Relocation Chinese",
};

function textLengthScore(sample = "") {
  const chineseChars = (sample.match(/[\u3400-\u9fff]/g) || []).length;
  const latinWords = (sample.match(/[a-zA-Z]+/g) || []).length;
  const pinyinSignals = (sample.match(/\b(wo|ni|ta|xiang|yao|xue|zhongwen|hanyu|yinwei|kehu|gongsi|laoshi)\b/gi) || []).length;
  if (chineseChars >= 45 || latinWords >= 35 || pinyinSignals >= 8) return 3;
  if (chineseChars >= 18 || latinWords >= 18 || pinyinSignals >= 4) return 2;
  if (chineseChars >= 4 || latinWords >= 8 || pinyinSignals >= 2) return 1;
  return 0;
}

function answerScore(value) {
  if (value === "high") return 2;
  if (value === "medium" || value === "business") return 1;
  return 0;
}

function estimateLevel(data) {
  let score = 0;
  if (data.background === "months") score += 1;
  if (data.background === "one-two") score += 2;
  if (data.background === "three-plus") score += 3;
  if (data.confidence === "medium") score += 1;
  if (data.confidence === "high") score += 2;
  score += answerScore(data.recognition);
  score += answerScore(data.transferDuration);
  score += answerScore(data.wordOrder);
  score += answerScore(data.grammar);
  score += answerScore(data.chunking);
  score += answerScore(data.scenario);
  score += textLengthScore(data.sample);

  if (score <= 4) return { label: "Beginner", hsk: "Closest HSK range: Pre-HSK / HSK 1", score };
  if (score <= 9) return { label: "Elementary", hsk: "Closest HSK range: HSK 1-2", score };
  if (score <= 14) return { label: "Lower-intermediate", hsk: "Closest HSK range: HSK 2-3", score };
  return { label: "Intermediate", hsk: "Closest HSK range: HSK 3-4+", score };
}

function blockerInsight(blocker) {
  const map = {
    translation: {
      title: "Translation habit",
      detail: "You may know more Chinese than you can use because every sentence passes through English first.",
    },
    "word-order": {
      title: "Sentence order instability",
      detail: "Your next improvement will likely come from reusable sentence frames, not more isolated vocabulary.",
    },
    grammar: {
      title: "Disconnected grammar",
      detail: "Rules may feel like separate facts. Mandrix would connect them into patterns you can reuse.",
    },
    output: {
      title: "Passive-to-active gap",
      detail: "Your comprehension is probably ahead of your speaking. You need controlled output practice.",
    },
  };
  return map[blocker] || map["word-order"];
}

function recommendPath(goal) {
  const map = {
    daily: {
      path: "Daily Chinese",
      why: "Best for real-life fluency, daily interaction, and speaking confidence.",
      firstStep: "Build 8-10 reusable sentence frames for introductions, needs, plans, and opinions.",
    },
    business: {
      path: "Business Chinese",
      why: "Best for meetings, messages, client conversations, negotiation, and professional tone.",
      firstStep: "Start with polite request structures, meeting language, and work-message templates.",
    },
    hsk: {
      path: "HSK System Prep",
      why: "Best when you need structured grammar, vocabulary, reading, listening, and exam tasks.",
      firstStep: "Map your current HSK gap, then study grammar and vocabulary through exam-style output.",
    },
    sourcing: {
      path: "Sourcing & Supplier Chinese",
      why: "Best for factory visits, WeChat supplier messages, pricing, MOQ, samples, and problem solving.",
      firstStep: "Learn supplier-message templates for price, quality, timeline, samples, and follow-up.",
    },
    travel: {
      path: "Travel / Relocation Chinese",
      why: "Best for practical survival Chinese and confidence in daily Chinese-speaking environments.",
      firstStep: "Practice high-frequency scenes: food, transport, housing, appointments, and help requests.",
    },
  };
  return map[goal] || map.daily;
}

function diagnosticEvidence(data) {
  const evidence = [];
  if (data.recognition !== "high") {
    evidence.push({
      title: "Meaning was not automatic",
      detail: "The basic sentence 我今天想喝茶 should be recognized immediately. A miss here suggests your brain is still translating instead of retrieving structure directly.",
    });
  }
  if (data.transferDuration !== "high") {
    evidence.push({
      title: "English duration pattern interfered",
      detail: "For “I have been learning Chinese for 3 months,” natural Chinese uses 已经 + duration + 了. Choosing a direct 'have/for' structure is a classic English-transfer signal.",
    });
  }
  if (data.wordOrder !== "high") {
    evidence.push({
      title: "Time word placement is unstable",
      detail: "In 我明天要见一个中国客户, 明天 sits before the action. If this felt uncertain, your word order is probably not automated yet.",
    });
  }
  if (data.chunking !== "high") {
    evidence.push({
      title: "Chunking needs work",
      detail: "能不能 and 提前半小时 should function as reusable chunks. If they moved around awkwardly, the issue is not vocabulary but sentence assembly.",
    });
  }
  if (data.scenario !== "business") {
    evidence.push({
      title: "Communication tone needs calibration",
      detail: "In supplier or client conversations, literal replies can sound abrupt. You need controlled practice with polite pressure, softening, and negotiation structures.",
    });
  }
  if (textLengthScore(data.sample) <= 1) {
    evidence.push({
      title: "Output sample was limited",
      detail: "A short or mixed sample is normal. It suggests the next useful step is guided output, where you build one accurate sentence pattern at a time.",
    });
  }
  return evidence.slice(0, 3);
}

function automationGap(data) {
  const structureValues = [data.recognition, data.transferDuration, data.wordOrder, data.grammar, data.chunking];
  const correct = structureValues.filter((value) => value === "high").length;
  if (correct >= 4) return "Your structure recognition is relatively strong. The main question is whether you can retrieve these patterns fast enough while speaking.";
  if (correct >= 2) return "You can often recognize the right structure, but the pattern is not fully automatic. This is where timed retrieval practice matters.";
  return "Your answers suggest Chinese structure is still being rebuilt through English. That slows speaking and makes errors feel random.";
}

function buildLevelReport(data) {
  const level = estimateLevel(data);
  const blocker = blockerInsight(data.blocker);
  const path = recommendPath(data.goal);
  const structureCorrect = [data.recognition, data.transferDuration, data.wordOrder, data.grammar, data.chunking].filter((value) => value === "high").length;
  const grammarNote = structureCorrect >= 2
    ? "You can recognize basic meaning and structure. The next step is making that structure available during real-time speaking."
    : "The structure tasks suggest that meaning, word order, and aspect markers may still feel separate. That is exactly where a pattern-first method helps.";
  const scenarioNote = data.scenario === "business"
    ? "Your scenario choice shows awareness of tone and negotiation context, not just literal translation."
    : "Your scenario choice suggests you may need more practice with tone, politeness, and context-specific Chinese.";
  const sampleNote = textLengthScore(data.sample) >= 2
    ? "Your optional sample gives Jane extra material for a sharper follow-up diagnosis."
    : "You did not need a Chinese keyboard to finish this check. For a deeper human diagnosis, you can later send Chinese, pinyin, voice, or English notes.";
  const voiceNote = data.spokenSampleIncluded
    ? "You also included a spoken sample. Jane can use it to review fluency, hesitation, tone, and how quickly you retrieve sentence patterns."
    : "";

  return {
    level,
    blocker,
    path,
    evidence: diagnosticEvidence(data),
    automationGap: automationGap(data),
    grammarNote,
    scenarioNote,
    sampleNote: voiceNote ? `${sampleNote} ${voiceNote}` : sampleNote,
    voiceSample: Boolean(data.spokenSampleIncluded),
    scores: {
      structure: Math.min(95, 28 + level.score * 4 + structureCorrect * 8),
      comprehension: Math.min(94, 34 + answerScore(data.recognition) * 15 + answerScore(data.transferDuration) * 12 + answerScore(data.wordOrder) * 11 + answerScore(data.grammar) * 8),
      communication: Math.min(92, 35 + answerScore(data.scenario) * 18 + (data.goal === "business" || data.goal === "sourcing" ? 8 : 0)),
      output: Math.min(92, 30 + textLengthScore(data.sample) * 14 + (data.confidence === "high" ? 18 : data.confidence === "medium" ? 8 : 0)),
      confidence: data.confidence === "high" ? 78 : data.confidence === "medium" ? 58 : 38,
      goalFit: 88,
    },
  };
}

function renderScoreBar(label, value) {
  return `<div class="level-score-row"><span>${label}</span><b>${value}%</b><i style="--score:${value}%"></i></div>`;
}

function renderLevelReport(data, report) {
  const safeGoal = goalLabels[data.goal] || "Mandrix Path";
  const evidenceHtml = (report.evidence || []).map((item, index) => `
    <article>
      <span>Evidence ${index + 1}</span>
      <strong>${item.title}</strong>
      <p>${item.detail}</p>
    </article>
  `).join("");
  const voiceAnalysis = report.voiceAnalysis;
  const voiceDimensionsHtml = voiceAnalysis?.dimensions?.length ? voiceAnalysis.dimensions.map((item) => `
    <article>
      <span>${item.label || "Diagnostic dimension"}</span>
      <strong>${item.finding || "Pattern observed"}</strong>
      ${item.evidence ? `<p><b>Evidence:</b> ${item.evidence}</p>` : ""}
      ${item.implication ? `<p><b>What it means:</b> ${item.implication}</p>` : ""}
    </article>
  `).join("") : "";
  const voiceIssuesHtml = voiceAnalysis?.specificIssues?.length ? voiceAnalysis.specificIssues.map((item) => `
    <article>
      <span>${item.quote ? "From your speech" : "Voice evidence"}</span>
      <strong>${item.issue || "Speaking pattern"}</strong>
      ${item.quote ? `<p><b>You said:</b> ${item.quote}</p>` : ""}
      ${item.betterVersion ? `<p><b>More natural:</b> ${item.betterVersion}</p>` : ""}
      <p>${item.diagnosis || ""}</p>
    </article>
  `).join("") : "";
  const voiceAnalysisHtml = voiceAnalysis ? `
    <div class="level-report-block voice-analysis-block">
      <h4>Spoken output analysis</h4>
      ${voiceAnalysis.transcript ? `<p><strong>Transcript:</strong> ${voiceAnalysis.transcript}</p>` : ""}
      ${voiceAnalysis.primaryBottleneck ? `<p><strong>Primary bottleneck:</strong> ${voiceAnalysis.primaryBottleneck}</p>` : ""}
      <p>${voiceAnalysis.summary || "Your spoken sample was received for Jane's review."}</p>
      ${voiceAnalysis.fluencySignal ? `<p><strong>Fluency signal:</strong> ${voiceAnalysis.fluencySignal}</p>` : ""}
      ${voiceDimensionsHtml ? `<div class="voice-dimension-grid">${voiceDimensionsHtml}</div>` : ""}
      ${voiceIssuesHtml ? `<div class="voice-issue-grid">${voiceIssuesHtml}</div>` : ""}
      ${voiceAnalysis.betterVersion ? `<p><strong>Suggested polished version:</strong> ${voiceAnalysis.betterVersion}</p>` : ""}
      ${voiceAnalysis.nextStep ? `<p><strong>Training focus:</strong> ${voiceAnalysis.nextStep}</p>` : ""}
      ${voiceAnalysis.conversionBridge ? `<p>${voiceAnalysis.conversionBridge}</p>` : ""}
    </div>
  ` : "";
  levelReportContent.innerHTML = `
    <p class="eyebrow">Diagnostic Report</p>
    <h3>${data.fullName || "Your"} Chinese bottleneck report</h3>
    <div class="level-report-summary">
      <article><span>Estimated level</span><strong>${report.level.label}</strong><small>${report.level.hsk}</small></article>
      <article><span>Main blocker</span><strong>${report.blocker.title}</strong><small>${report.blocker.detail}</small></article>
      <article><span>Best path</span><strong>${safeGoal}</strong><small>${report.path.why}</small></article>
    </div>
    <div class="level-score-panel">
      ${renderScoreBar("Structure awareness", report.scores.structure)}
      ${renderScoreBar("Comprehension", report.scores.comprehension)}
      ${renderScoreBar("Real communication", report.scores.communication)}
      ${renderScoreBar("Active output", report.scores.output)}
      ${renderScoreBar("Speaking confidence", report.scores.confidence)}
      ${renderScoreBar("Mandrix path fit", report.scores.goalFit)}
    </div>
    <div class="level-report-block">
      <h4>Your real operating pattern</h4>
      <p>${report.automationGap}</p>
      <p>${report.grammarNote}</p>
      <p>${report.scenarioNote}</p>
      <p>${report.sampleNote}</p>
    </div>
    <div class="level-evidence-grid">
      ${evidenceHtml}
    </div>
    ${voiceAnalysisHtml}
    <div class="level-report-block">
      <h4>What to do with this diagnosis</h4>
      <p>For the next 30 days, focus on one narrow path: ${report.path.firstStep}</p>
      <p>If you want to know how to fix these blockers, book a short conversation with Jane. She can review your answers, explain the pattern behind the mistakes, and show whether Mandrix is the right next step.</p>
    </div>
    <div class="level-course-recommendation">
      <span>Recommended Mandrix path</span>
      <strong>${report.path.path}</strong>
      <p>${report.path.why}</p>
    </div>
  `;
}

async function submitLevelCheck(data, report) {
  const audioSample = await levelAudioAttachment();
  const response = await fetch("/api/level-check.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, report, ...(audioSample ? { audioSample } : {}) }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Could not save level check");
  return result;
}

function supportedVoiceMimeType() {
  if (!window.MediaRecorder) return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported?.(type)) || "";
}

function voiceExtension(type = "") {
  if (type.includes("mp4")) return "m4a";
  if (type.includes("ogg")) return "ogg";
  return "webm";
}

function setVoiceStatus(message) {
  if (voiceStatus) voiceStatus.textContent = message;
}

function resetVoiceSample() {
  if (levelMediaRecorder && levelMediaRecorder.state !== "inactive") levelMediaRecorder.stop();
  if (levelAudioStream) {
    levelAudioStream.getTracks().forEach((track) => track.stop());
    levelAudioStream = null;
  }
  if (levelAudioTimer) clearInterval(levelAudioTimer);
  levelAudioTimer = null;
  levelAudioSeconds = 0;
  levelAudioChunks = [];
  levelAudioBlob = null;
  if (levelAudioUrl) URL.revokeObjectURL(levelAudioUrl);
  levelAudioUrl = "";
  if (voicePreview) {
    voicePreview.hidden = true;
    voicePreview.removeAttribute("src");
  }
  if (voiceRecordButton) voiceRecordButton.disabled = false;
  if (voiceStopButton) voiceStopButton.disabled = true;
  if (voiceClearButton) voiceClearButton.disabled = true;
  setVoiceStatus("No voice sample recorded.");
}

async function startVoiceRecording() {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    setVoiceStatus("Recording is not supported in this browser. You can still type your sample above.");
    return;
  }
  resetVoiceSample();
  try {
    levelAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = supportedVoiceMimeType();
    levelMediaRecorder = new MediaRecorder(levelAudioStream, mimeType ? { mimeType } : undefined);
    levelAudioChunks = [];
    levelMediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data?.size) levelAudioChunks.push(event.data);
    });
    levelMediaRecorder.addEventListener("stop", () => {
      if (levelAudioTimer) clearInterval(levelAudioTimer);
      levelAudioTimer = null;
      if (levelAudioStream) {
        levelAudioStream.getTracks().forEach((track) => track.stop());
        levelAudioStream = null;
      }
      levelAudioBlob = new Blob(levelAudioChunks, { type: levelMediaRecorder.mimeType || "audio/webm" });
      if (levelAudioUrl) URL.revokeObjectURL(levelAudioUrl);
      levelAudioUrl = URL.createObjectURL(levelAudioBlob);
      if (voicePreview) {
        voicePreview.src = levelAudioUrl;
        voicePreview.hidden = false;
      }
      if (voiceRecordButton) voiceRecordButton.disabled = false;
      if (voiceStopButton) voiceStopButton.disabled = true;
      if (voiceClearButton) voiceClearButton.disabled = false;
      const mb = (levelAudioBlob.size / 1024 / 1024).toFixed(2);
      setVoiceStatus(`Voice sample ready (${levelAudioSeconds}s, ${mb} MB). It will be attached to both emails.`);
    });
    levelMediaRecorder.start();
    levelAudioSeconds = 0;
    if (voiceRecordButton) voiceRecordButton.disabled = true;
    if (voiceStopButton) voiceStopButton.disabled = false;
    if (voiceClearButton) voiceClearButton.disabled = true;
    setVoiceStatus("Recording... 0 / 30 seconds");
    levelAudioTimer = setInterval(() => {
      levelAudioSeconds += 1;
      setVoiceStatus(`Recording... ${levelAudioSeconds} / 30 seconds`);
      if (levelAudioSeconds >= 30 && levelMediaRecorder?.state === "recording") levelMediaRecorder.stop();
    }, 1000);
  } catch (error) {
    setVoiceStatus("Microphone permission was blocked. You can still type your sample above.");
    if (voiceRecordButton) voiceRecordButton.disabled = false;
    if (voiceStopButton) voiceStopButton.disabled = true;
  }
}

function stopVoiceRecording() {
  if (levelMediaRecorder?.state === "recording") levelMediaRecorder.stop();
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function levelAudioAttachment() {
  if (!levelAudioBlob) return null;
  const maxBytes = 4 * 1024 * 1024;
  if (levelAudioBlob.size > maxBytes) {
    throw new Error("Voice sample is too large. Please record a shorter sample.");
  }
  const type = levelAudioBlob.type || "audio/webm";
  return {
    filename: `mandrix-speaking-sample.${voiceExtension(type)}`,
    type,
    size: levelAudioBlob.size,
    content: await blobToBase64(levelAudioBlob),
  };
}

voiceRecordButton?.addEventListener("click", startVoiceRecording);
voiceStopButton?.addEventListener("click", stopVoiceRecording);
voiceClearButton?.addEventListener("click", resetVoiceSample);

if (levelCheckForm) {
  levelCheckForm.addEventListener("invalid", (event) => {
    const details = event.target.closest?.(".level-check-details");
    if (details) details.open = true;
  }, true);

  levelCheckForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(levelCheckForm).entries());
    data.spokenSampleIncluded = Boolean(levelAudioBlob);
    const report = buildLevelReport(data);
    renderLevelReport(data, report);
    levelReport.hidden = false;
    levelReport.scrollIntoView({ behavior: "smooth", block: "start" });
    levelReportStatus.textContent = "Saving your report and sending it to your email...";
    levelCheckSubmit.disabled = true;
    levelCheckSubmit.textContent = "Report Generated";
    try {
      const result = await submitLevelCheck(data, report);
      if (result.levelCheck?.report?.voiceAnalysis) {
        report.voiceAnalysis = result.levelCheck.report.voiceAnalysis;
        renderLevelReport(data, report);
      }
      const emailText = result.emailSent ? "A copy has been sent to your email." : "Your report is saved. If email is not configured yet, Jane can still see it in admin.";
      levelReportStatus.textContent = emailText;
      window.MandrixAnalytics?.track("level_check_submit_success", {
        goal: data.goal,
        level: report.level.label,
        path: report.path.path,
      });
    } catch (error) {
      levelReportStatus.textContent = "Your report is shown here. Email saving needs server setup.";
      window.MandrixAnalytics?.track("level_check_submit_error", { error: error.message });
    }
  });

  levelCheckReset?.addEventListener("click", () => {
    levelCheckForm.reset();
    levelReport.hidden = true;
    levelCheckSubmit.disabled = false;
    levelCheckSubmit.textContent = "Generate My Free Report";
    levelCheckForm.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
