import { isAdmin } from "../lib/_auth.js";
import { listBookings } from "../lib/_supabase.js";

function toCsvValue(value) {
  const text = typeof value === "object" && value !== null ? JSON.stringify(value) : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).send("Method not allowed");
    return;
  }
  if (!isAdmin(req)) {
    res.status(401).json({ error: "Admin password required" });
    return;
  }
  const rows = await listBookings();
  const headers = ["createdAt", "status", "fullName", "email", "contact", "country", "timezone", "level", "course", "date", "time", "frequency", "lessonCount", "payment", "amount", "meetingLink", "goal", "notes", "lessonSchedule"];
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(headers.map((key) => toCsvValue(row[key])).join(","));
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="mandrix-bookings.csv"');
  res.status(200).send(`${lines.join("\n")}\n`);
}
