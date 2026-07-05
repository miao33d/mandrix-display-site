const SITE_URL = "https://www.mandrix.top";

function clean(value) {
  return String(value || "").trim();
}

function cleanSlug(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);
}

function xmlEscape(value) {
  return clean(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

const staticUrls = [
  "/",
  "/level-check",
  "/courses",
  "/about",
  "/business",
  "/hsk",
  "/sourcing-spotlight",
  "/corporate",
  "/insights",
  "/insights/polite-no-chinese-business",
  "/insights/hsk-for-professionals",
  "/insights/logic-based-business-chinese",
  "/zh",
];

function priorityFor(path) {
  if (path === "/") return "1.0";
  if (path === "/level-check" || path === "/courses") return "0.9";
  if (path.startsWith("/insights/")) return "0.7";
  if (path === "/privacy" || path === "/terms") return "0.3";
  return "0.8";
}

export async function onRequest(context) {
  const urls = new Map();
  const today = new Date().toISOString().slice(0, 10);
  staticUrls.forEach((path) => urls.set(path, today));
  const db = context.env.MANDRIX_DB || context.env.DB;
  if (db) {
    const rows = await db.prepare("SELECT category, slug, updated_at, created_at FROM seo_pages WHERE status = 'published' ORDER BY updated_at DESC, created_at DESC LIMIT 1000").all();
    (rows.results || []).forEach((row) => {
      const category = cleanSlug(row.category);
      const slug = cleanSlug(row.slug);
      if (category && slug) urls.set(`/insights/${category}/${slug}`, clean(row.updated_at || row.created_at).slice(0, 10) || today);
    });
  }
  const body = [...urls.entries()].sort(([a], [b]) => {
    if (a === "/") return -1;
    if (b === "/") return 1;
    return a.localeCompare(b);
  }).map(([path, lastmod]) => `  <url>
    <loc>${xmlEscape(`${SITE_URL}${path}`)}</loc>
    <lastmod>${xmlEscape(lastmod)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priorityFor(path)}</priority>
  </url>`).join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
