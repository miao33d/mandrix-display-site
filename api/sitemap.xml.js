import { listSeoPages } from "../lib/_supabase.js";
import { seoPageUrl, siteUrl, staticInsights } from "../lib/_seoContent.js";

const baseUrls = [
  ["/", "1.0"],
  ["/about", "0.9"],
  ["/booking", "0.9"],
  ["/business", "0.9"],
  ["/business-chinese-online", "0.8"],
  ["/chinese-for-sourcing-agents", "0.8"],
  ["/contact", "0.9"],
  ["/corporate", "0.8"],
  ["/corporate-programs", "0.9"],
  ["/courses", "0.9"],
  ["/daily", "0.9"],
  ["/diagnostic", "0.9"],
  ["/faq", "0.9"],
  ["/hsk", "0.9"],
  ["/hsk-preparation-online", "0.8"],
  ["/insights", "0.9"],
  ["/method", "0.9"],
  ["/privacy", "0.3"],
  ["/private", "0.9"],
  ["/sourcing-spotlight", "0.9"],
  ["/specialty", "0.9"],
  ["/terms", "0.3"],
  ["/testimonials", "0.9"],
  ["/zh", "0.8"],
];

function entry(loc, priority, lastmod) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export default async function handler(req, res) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const urls = new Map();
    baseUrls.forEach(([path, priority]) => urls.set(`${siteUrl}${path}`, [priority, today]));
    staticInsights.forEach((page) => urls.set(`${siteUrl}${page.url}`, ["0.7", today]));
    const pages = await listSeoPages();
    pages.forEach((page) => {
      const lastmod = String(page.updatedAt || page.createdAt || new Date().toISOString()).slice(0, 10);
      urls.set(seoPageUrl(page), ["0.7", lastmod]);
    });
    const body = [...urls.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([loc, [priority, lastmod]]) => entry(loc, priority, lastmod))
      .join("\n");
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300");
    res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`);
  } catch (error) {
    res.status(500).send(`Sitemap failed: ${error.message}`);
  }
}
