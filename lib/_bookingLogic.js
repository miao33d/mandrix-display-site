export function cleanString(value) {
  return String(value || "").trim();
}

export function extractLessonCount(course) {
  const text = cleanString(course);
  const lessonMatch = text.match(/(\d+)\s+lessons?/i);
  if (lessonMatch) return Number(lessonMatch[1]);
  const sessionMatch = text.match(/(\d+)\s+sessions?/i);
  if (sessionMatch) return Number(sessionMatch[1]);
  return 1;
}

export function isGroupCourse(course) {
  return /\bGroup\b/i.test(cleanString(course));
}

export function addDays(dateValue, days) {
  const date = new Date(`${dateValue}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function frequencySteps(frequency) {
  if (frequency === "twice-weekly") return [3, 4];
  if (frequency === "intensive") return [2, 2, 3];
  return [7];
}

export function frequencyLabel(frequency) {
  if (frequency === "twice-weekly") return "Twice a week";
  if (frequency === "intensive") return "Three times a week";
  return "Once a week";
}

export function buildLessonSchedule({ course, date, time, frequency }) {
  const lessonCount = extractLessonCount(course);
  const steps = frequencySteps(frequency);
  const lessons = [];
  let currentDate = cleanString(date);
  for (let index = 0; index < lessonCount; index += 1) {
    if (index > 0) currentDate = addDays(currentDate, steps[(index - 1) % steps.length]);
    lessons.push({ lesson: index + 1, date: currentDate, time: cleanString(time), status: "Scheduled" });
  }
  return lessons;
}

export function bookingSchedule(booking) {
  if (Array.isArray(booking.lessonSchedule) && booking.lessonSchedule.length) return booking.lessonSchedule;
  if (booking.date && booking.time) return [{ lesson: 1, date: booking.date, time: booking.time, status: "Scheduled" }];
  return [];
}

function isExpiredPaymentPending(row) {
  const payment = cleanString(row.payment).toLowerCase();
  if (!payment.includes("payment pending")) return false;
  const createdAt = row.createdAt || row.created_at;
  if (!createdAt) return false;
  const ageMs = Date.now() - new Date(createdAt).getTime();
  return Number.isFinite(ageMs) && ageMs > 45 * 60 * 1000;
}

export function sameCohort(a, b) {
  return cleanString(a.course) === cleanString(b.course)
    && cleanString(a.date) === cleanString(b.date)
    && cleanString(a.time) === cleanString(b.time)
    && cleanString(a.frequency || "weekly") === cleanString(b.frequency || "weekly");
}

export function analyzeAvailability(rows, payload) {
  const schedule = buildLessonSchedule(payload);
  const group = isGroupCourse(payload.course);
  const activeRows = rows.filter((row) => !["Cancelled", "Completed"].includes(cleanString(row.status)) && !isExpiredPaymentPending(row));
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
      message: slotConflicts.length ? "This time is already booked. Please choose another date or time slot." : "This time is available for 1-on-1 booking.",
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
