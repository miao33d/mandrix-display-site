function todayIso() {
  return new Date().toISOString().slice(0, 10);
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

export function lessonScheduleFor(booking) {
  if (Array.isArray(booking.lessonSchedule) && booking.lessonSchedule.length) return booking.lessonSchedule;
  if (booking.date && booking.time) return [{ lesson: 1, date: booking.date, time: booking.time, status: "Scheduled" }];
  return [];
}

function lessonIsUsed(lesson) {
  const status = String(lesson.status || "").toLowerCase();
  if (status.includes("complete") || status.includes("done") || status.includes("attended")) return true;
  return String(lesson.date || "") < todayIso();
}

export function recommendContinuation(booking) {
  const course = String(booking.course || "").toLowerCase();
  if (course.includes("diagnostic")) return "a 12-lesson foundation path based on your diagnostic result";
  if (course.includes("sourcing") || course.includes("supplier") || course.includes("e-commerce")) {
    return "a continuation block focused on supplier negotiation, follow-up messages, and quality issue handling";
  }
  if (course.includes("business") || course.includes("executive")) {
    return "the next Business Chinese block focused on meetings, follow-up messages, and professional tone";
  }
  if (course.includes("hsk")) return "the next HSK block with a clear mock-test and weak-point repair plan";
  if (course.includes("group")) return "the next small-group block so you can keep the same learning rhythm";
  return "the next Mandrix course block so your current progress does not cool down";
}

function sentMarkerFor(booking, stage) {
  const schedule = lessonScheduleFor(booking);
  return schedule.some((lesson) => lesson?.renewalNotices?.[stage]?.sentAt);
}

export function renewalStatusFor(booking) {
  if (!booking || booking.status === "Cancelled") return null;
  const schedule = lessonScheduleFor(booking);
  const total = Number(booking.lessonCount) || schedule.length || 1;
  const used = booking.status === "Completed" ? total : schedule.filter(lessonIsUsed).length;
  const remaining = Math.max(total - used, 0);
  const dates = schedule.map((lesson) => lesson.date).filter(Boolean).sort();
  const firstLesson = dates[0];
  const lastLesson = dates.at(-1);
  const isDiagnostic = String(booking.course || "").toLowerCase().includes("diagnostic");

  let renewal = null;
  if (isDiagnostic && (booking.status === "Completed" || (lastLesson && String(lastLesson) < todayIso()))) {
    renewal = {
      stage: "diagnostic",
      priority: 1,
      label: "Diagnostic conversion",
      timing: "Diagnostic finished. Follow up while the 48-hour credit window is warm.",
    };
  } else if (remaining === 0 && lastLesson && daysSince(lastLesson) >= 7) {
    renewal = {
      stage: "ended7",
      priority: 1,
      label: "7 days after package end",
      timing: "Momentum is cooling. Send a reactivation note.",
    };
  } else if (remaining === 1) {
    renewal = {
      stage: "oneLeft",
      priority: 2,
      label: "1 lesson left",
      timing: "Best moment to reserve the next block.",
    };
  } else if (remaining > 1 && remaining <= 3) {
    renewal = {
      stage: "threeLeft",
      priority: 3,
      label: `${remaining} lessons left`,
      timing: "Plan before the last lesson so the next step feels natural.",
    };
  } else if (remaining === 0 && firstLesson) {
    renewal = {
      stage: "completed",
      priority: 4,
      label: "Package just ended",
      timing: "Send a wrap-up and next-step recommendation within 7 days.",
    };
  }

  if (!renewal) return null;
  return {
    ...renewal,
    total,
    used,
    remaining,
    recommendation: recommendContinuation(booking),
    alreadySent: sentMarkerFor(booking, renewal.stage),
  };
}

export function renewalRows(rows, { includeSent = false, includeCompletedStage = false } = {}) {
  return rows
    .map((booking) => ({ booking, renewal: renewalStatusFor(booking) }))
    .filter((row) => row.renewal)
    .filter((row) => includeCompletedStage || row.renewal.priority <= 3)
    .filter((row) => includeSent || !row.renewal.alreadySent)
    .sort((a, b) => a.renewal.priority - b.renewal.priority);
}

export function buildRenewalEmail(booking, renewal = renewalStatusFor(booking)) {
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
  return {
    subject: template.subject,
    text: template.body,
    body: template.body,
    clipboard: `Subject: ${template.subject}\n\n${template.body}`,
  };
}

export function markRenewalSent(booking, renewal, sentAt = new Date().toISOString()) {
  const schedule = lessonScheduleFor(booking);
  const stage = renewal?.stage;
  if (!stage) return schedule;
  const targetIndex = schedule.findIndex((lesson) => Number(lesson.lesson) === 1);
  const index = targetIndex >= 0 ? targetIndex : 0;
  return schedule.map((lesson, lessonIndex) => {
    if (lessonIndex !== index) return lesson;
    return {
      ...lesson,
      renewalNotices: {
        ...(lesson.renewalNotices || {}),
        [stage]: {
          sentAt,
          label: renewal.label,
        },
      },
    };
  });
}
