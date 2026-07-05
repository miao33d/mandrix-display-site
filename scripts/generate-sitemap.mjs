import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const siteUrl = "https://www.mandrix.top";
const root = process.cwd();
const excluded = new Set([
  "admin.html",
  "ops.html",
  "运营中心.html",
  "激活自动化.html",
  "google74b1d627968a4964.html",
  "voice-report-demo.html",
]);

const sectionRoutes = [
  "/",
  "/level-check",
  "/courses",
  "/about",
  "/business",
  "/hsk",
  "/sourcing-spotlight",
  "/corporate",
  "/insights",
  "/zh",
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["api", "assets", "data", "lib", "scripts", "dist-cloudflare", "node_modules"].includes(entry.name)) continue;
      files.push(...await walk(full));
    } else if (entry.name.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

function urlFor(file) {
  const rel = path.relative(root, file).replaceAll(path.sep, "/");
  if (excluded.has(rel)) return "";
  if (rel === "index.html") return "/";
  return `/${rel.replace(/\.html$/i, "")}`;
}

function priorityFor(url) {
  if (url === "/") return "1.0";
  if (sectionRoutes.includes(url)) return "0.9";
  if (url.includes("/insights/")) return "0.7";
  if (["/privacy", "/terms", "/privacy.html", "/terms.html"].includes(url)) return "0.3";
  return "0.8";
}

const htmlFiles = await walk(root);
const urls = new Set();
for (const file of htmlFiles) {
  const url = urlFor(file);
  if (url && url.includes("/insights/")) urls.add(url);
}
sectionRoutes.forEach((url) => urls.add(url));

const today = new Date().toISOString().slice(0, 10);
const body = [...urls].sort((a, b) => {
  if (a === "/") return -1;
  if (b === "/") return 1;
  return a.localeCompare(b);
}).map((url) => `  <url>
    <loc>${siteUrl}${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priorityFor(url)}</priority>
  </url>`).join("\n");

await writeFile("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`);

const { size } = await stat("sitemap.xml");
console.log(`Generated sitemap.xml with ${urls.size} URLs (${size} bytes).`);
