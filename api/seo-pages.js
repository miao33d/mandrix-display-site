import { isAdmin } from "../lib/_auth.js";
import { cleanString, listSeoPages, sendJson, upsertSeoPage } from "../lib/_supabase.js";
import { cleanSeoCategory, cleanSeoSlug, seoPageUrl } from "../lib/_seoContent.js";

function normalizePayload(body = {}) {
  const payload = body.payload && typeof body.payload === "object" ? body.payload : body;
  const category = cleanSeoCategory(body.category || payload.category);
  const slug = cleanSeoSlug(body.slug || payload.slug);
  const title = cleanString(body.title || payload.title).slice(0, 140);
  const description = cleanString(body.description || payload.description).slice(0, 240);
  const excerpt = cleanString(body.excerpt || payload.lead || payload.description).slice(0, 320);
  const image = cleanString(body.image || payload.image || "assets/backup-study-desk.jpg");
  const imageAlt = cleanString(body.imageAlt || payload.imageAlt || title);
  if (!title || !description) {
    throw new Error("Title and description are required.");
  }
  return {
    status: cleanString(body.status || payload.status || "published"),
    category,
    slug,
    title,
    description,
    excerpt,
    image,
    imageAlt,
    payload: {
      ...payload,
      category,
      slug,
      title,
      description,
      excerpt,
      image,
      imageAlt,
    },
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-token");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }

  try {
    if (req.method === "GET") {
      const includeDrafts = isAdmin(req) && req.query.includeDrafts === "1";
      const pages = await listSeoPages({ includeDrafts });
      sendJson(res, 200, { pages });
      return;
    }

    if (req.method === "POST") {
      if (!isAdmin(req)) {
        sendJson(res, 401, { error: "Admin password required" });
        return;
      }
      const page = normalizePayload(req.body || {});
      const saved = await upsertSeoPage(page);
      sendJson(res, 201, { page: saved, url: seoPageUrl(saved) });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "SEO page request failed" });
  }
}
