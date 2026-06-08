import crypto from "node:crypto";

const API_BASE = "https://api.meeting.qq.com";

function cleanString(value) {
  return String(value || "").trim();
}

export function tencentMeetingConfigured() {
  return Boolean(
    cleanString(process.env.TENCENT_MEETING_APP_ID)
      && cleanString(process.env.TENCENT_MEETING_SDK_ID)
      && cleanString(process.env.TENCENT_MEETING_SECRET_ID)
      && cleanString(process.env.TENCENT_MEETING_SECRET_KEY)
      && cleanString(process.env.TENCENT_MEETING_USER_ID)
  );
}

function beijingLessonStart(lesson) {
  const startTime = cleanString(lesson.time).split(" - ")[0];
  const [year, month, day] = cleanString(lesson.date).split("-").map(Number);
  const [hour, minute] = startTime.split(":").map(Number);
  if (![year, month, day, hour, minute].every(Number.isFinite)) return null;
  return new Date(Date.UTC(year, month - 1, day, hour - 8, minute));
}

function durationMinutes(timeValue) {
  const [start, end] = cleanString(timeValue).split(" - ");
  if (!start || !end) return 60;
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const minutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : 60;
}

function signature({ method, path, body, timestamp, nonce }) {
  const headerString = `X-TC-Key=${process.env.TENCENT_MEETING_SECRET_ID}&X-TC-Nonce=${nonce}&X-TC-Timestamp=${timestamp}`;
  const stringToSign = [
    method,
    headerString,
    path,
    body,
  ].join("\n");
  return crypto
    .createHmac("sha256", process.env.TENCENT_MEETING_SECRET_KEY)
    .update(stringToSign)
    .digest("base64");
}

async function tencentFetch(path, body) {
  if (!tencentMeetingConfigured()) {
    throw new Error("Tencent Meeting is not configured. Add TENCENT_MEETING_* environment variables in Vercel.");
  }
  const method = "POST";
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = crypto.randomInt(100000, 999999).toString();
  const bodyText = JSON.stringify(body);
  const sign = signature({ method, path, body: bodyText, timestamp, nonce });
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "AppId": process.env.TENCENT_MEETING_APP_ID,
      "SdkId": process.env.TENCENT_MEETING_SDK_ID,
      "X-TC-Key": process.env.TENCENT_MEETING_SECRET_ID,
      "X-TC-Timestamp": String(timestamp),
      "X-TC-Nonce": nonce,
      "X-TC-Signature": sign,
    },
    body: bodyText,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error_info) {
    throw new Error(data.error_info?.message || data.message || `Tencent Meeting request failed: ${response.status}`);
  }
  return data;
}

export async function createTencentMeetingForLesson({ booking, lesson }) {
  const start = beijingLessonStart(lesson);
  if (!start) throw new Error("Invalid lesson date or time for Tencent Meeting");
  const duration = durationMinutes(lesson.time);
  const end = new Date(start.getTime() + duration * 60 * 1000);
  const title = `Mandrix | ${booking.fullName} | Lesson ${lesson.lesson}`;

  const data = await tencentFetch("/v1/meetings", {
    userid: process.env.TENCENT_MEETING_USER_ID,
    instanceid: Number(process.env.TENCENT_MEETING_INSTANCE_ID || 2),
    subject: title,
    type: 0,
    start_time: Math.floor(start.getTime() / 1000).toString(),
    end_time: Math.floor(end.getTime() / 1000).toString(),
    settings: {
      mute_enable_join: false,
      allow_unmute_self: true,
      allow_in_before_host: true,
      auto_in_waiting_room: false,
      participant_join_auto_record: false,
    },
  });

  const meeting = Array.isArray(data.meeting_info_list) ? data.meeting_info_list[0] : data;
  return {
    meetingId: meeting.meeting_id || meeting.meetingid || "",
    meetingCode: meeting.meeting_code || meeting.meeting_code_str || meeting.meeting_number || "",
    meetingLink: meeting.join_url || meeting.join_url_outer || "",
    subject: title,
  };
}

export async function attachTencentMeetings(booking) {
  if (!tencentMeetingConfigured()) {
    return {
      booking,
      configured: false,
      note: "Tencent Meeting auto-create is not configured yet.",
    };
  }

  const lessons = Array.isArray(booking.lessonSchedule) ? booking.lessonSchedule : [];
  const updatedLessons = [];
  const errors = [];

  for (const lesson of lessons) {
    try {
      const meeting = await createTencentMeetingForLesson({ booking, lesson });
      updatedLessons.push({
        ...lesson,
        ...meeting,
        meetingProvider: "Tencent Meeting",
      });
    } catch (error) {
      errors.push(`Lesson ${lesson.lesson}: ${error.message}`);
      updatedLessons.push(lesson);
    }
  }

  const firstMeeting = updatedLessons.find((lesson) => lesson.meetingLink);
  return {
    booking: {
      ...booking,
      lessonSchedule: updatedLessons,
      meetingLink: firstMeeting?.meetingLink || booking.meetingLink || "",
    },
    configured: true,
    ok: errors.length === 0,
    errors,
  };
}
