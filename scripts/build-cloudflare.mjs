import { cp, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "dist-cloudflare");

const topLevelFiles = [
  "index.html",
  "zh.html",
  "about.html",
  "booking.html",
  "business.html",
  "business-chinese-online.html",
  "chinese-for-sourcing-agents.html",
  "contact.html",
  "corporate.html",
  "corporate-programs.html",
  "courses.html",
  "daily.html",
  "diagnostic.html",
  "faq.html",
  "google74b1d627968a4964.html",
  "hsk.html",
  "hsk-preparation-online.html",
  "insights.html",
  "level-check.html",
  "method.html",
  "ops.html",
  "privacy.html",
  "private.html",
  "robots.txt",
  "script.js",
  "analytics.js",
  "admin.html",
  "admin.js",
  "sitemap.xml",
  "sourcing-spotlight.html",
  "specialty.html",
  "styles.css",
  "styles.min.css",
  "terms.html",
];

const assetExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".svg", ".ico"]);

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function copyFileIfExists(relativePath) {
  const from = path.join(root, relativePath);
  if (!(await exists(from))) return;
  const to = path.join(outDir, relativePath);
  await mkdir(path.dirname(to), { recursive: true });
  await cp(from, to);
}

async function copyDirectoryFiltered(relativeDir, filter) {
  const source = path.join(root, relativeDir);
  if (!(await exists(source))) return;
  const entries = await readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      await copyDirectoryFiltered(relativePath, filter);
    } else if (filter(relativePath)) {
      await copyFileIfExists(relativePath);
    }
  }
}

const redirects = `# Cloudflare Pages clean URL fallbacks
/api/* /api/:splat 200
/insights/:category/:slug /insights/:category/:slug.html 200
/corporate-programs /corporate-programs.html 200
/business-chinese-online /business-chinese-online.html 200
/chinese-for-sourcing-agents /chinese-for-sourcing-agents.html 200
/hsk-preparation-online /hsk-preparation-online.html 200
/admin /admin.html 200
/ops /ops.html 200
/privacy /privacy.html 200
/terms /terms.html 200
/zh /zh.html 200
/about /about.html 200
/booking /booking.html 200
/business /business.html 200
/contact /contact.html 200
/courses /courses.html 200
/daily /daily.html 200
/diagnostic /diagnostic.html 200
/faq /faq.html 200
/hsk /hsk.html 200
/insights /insights.html 200
/level-check /level-check.html 200
/method /method.html 200
/private /private.html 200
/sourcing-spotlight /sourcing-spotlight.html 200
/specialty /specialty.html 200
`;

const headers = `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/styles*.css
  Cache-Control: public, max-age=86400

/script.js
  Cache-Control: public, max-age=86400

/analytics.js
  Cache-Control: public, max-age=86400
`;

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const file of topLevelFiles) await copyFileIfExists(file);
await copyDirectoryFiltered("assets", (file) => assetExtensions.has(path.extname(file).toLowerCase()));
await copyDirectoryFiltered("insights", (file) => file.endsWith(".html"));

await writeFile(path.join(outDir, "_redirects"), redirects);
await writeFile(path.join(outDir, "_headers"), headers);

console.log(`Cloudflare Pages output ready: ${path.relative(root, outDir)}`);
