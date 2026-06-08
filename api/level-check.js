import { isAdmin } from "../lib/_auth.js";
import { assertEmailConfigured, sendLevelCheckNotifications } from "../lib/_email.js";
import { insertLevelCheck, listLevelChecks, sendJson } from "../lib/_supabase.js";

function cleanString(value) {
  return String(value || "").trim();
}

function requiredFields(payload) {
  return ["fullName", "email", "goal", "background", "confidence", "recognition", "wordOrder", "grammar", "scenario", "blocker"]
    .filter((field) => !cleanString(payload[field]));
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-token");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  try {
    if (req.method === "GET") {
      if (!isAdmin(req)) {
        sendJson(res, 401, { error: "Admin password required" });
        return;
      }
      const levelChecks = await listLevelChecks();
      sendJson(res, 200, { levelChecks });
      return;
    }

    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }

    const payload = req.body || {};
    const missing = requiredFields(payload);
    if (missing.length) {
      sendJson(res, 400, { error: `Missing required fields: ${missing.join(", ")}` });
      return;
    }

    let saved = {
      ...payload,
      id: "",
      createdAt: new Date().toISOString(),
      status: "New",
    };
    let storageError = "";
    try {
      saved = await insertLevelCheck(payload);
    } catch (error) {
      storageError = error.message || "Could not save level check";
    }

    let emailResults = {};
    let emailSent = false;
    try {
      assertEmailConfigured();
      emailResults = await sendLevelCheckNotifications(saved);
      emailSent = Boolean(emailResults.admin?.ok && emailResults.student?.ok);
    } catch (error) {
      emailResults = { error: error.message || "Email not configured" };
    }

    sendJson(res, 201, {
      levelCheck: saved,
      saved: !storageError,
      storageError,
      emailSent,
      emailResults,
    });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Level check failed" });
  }
}
