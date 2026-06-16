import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
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
  "voice-report-demo.html",
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

const redirects = `# Canonical domain for SEO.
https://mandrix.top/* https://www.mandrix.top/:splat 301

# Cloudflare Pages handles clean URLs automatically.
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

const css = await readFile(path.join(root, "styles.css"), "utf8");
const minifiedCss = css
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s+/g, " ")
  .replace(/\s*([{}:;,>])\s*/g, "$1")
  .replace(/;}/g, "}")
  .trim();
await writeFile(path.join(root, "styles.min.css"), minifiedCss);

for (const file of topLevelFiles) await copyFileIfExists(file);
await copyDirectoryFiltered("assets", (file) => assetExtensions.has(path.extname(file).toLowerCase()));
await copyDirectoryFiltered("insights", (file) => file.endsWith(".html"));

await writeFile(path.join(outDir, "_redirects"), redirects);
await writeFile(path.join(outDir, "_headers"), headers);

console.log(`Cloudflare Pages output ready: ${path.relative(root, outDir)}`);
