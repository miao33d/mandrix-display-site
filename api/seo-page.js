import { getSeoPage } from "../lib/_supabase.js";
import {
  baseHead,
  cleanSeoCategory,
  cleanSeoSlug,
  escapeHtml,
  readingTime,
  seoCategories,
  seoPageUrl,
  siteFooter,
  siteHeader,
  siteUrl,
} from "../lib/_seoContent.js";

function imageUrl(path) {
  const value = String(path || "");
  if (/^https?:/i.test(value)) return value;
  return `${siteUrl}/${value.replace(/^\/+/, "")}`;
}

function paragraphBlock(text) {
  return String(text || "")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `<p>${escapeHtml(part)}</p>`)
    .join("\n");
}

function renderArticle(page) {
  const payload = page.payload || {};
  const cards = [
    [payload.card1Title, payload.card1Text],
    [payload.card2Title, payload.card2Text],
    [payload.card3Title, payload.card3Text],
  ].filter(([title, text]) => title && text);
  const chips = String(payload.chips || "")
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
  const body = payload.articleBody || payload.sectionBody || page.description;
  return `<article class="dynamic-insight-article">
        <div class="article-meta">
          <a href="/insights#${escapeHtml(page.category)}">${escapeHtml(seoCategories[page.category]?.label || "Mandrix Guide")}</a>
          <span>${escapeHtml(readingTime(`${page.title} ${page.description} ${body}`))}</span>
        </div>
        <h1>${escapeHtml(payload.h1 || page.title)}</h1>
        <p class="lead">${escapeHtml(payload.lead || page.excerpt || page.description)}</p>
        ${chips.length ? `<div class="landing-proof">${chips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join("")}</div>` : ""}
        <figure>
          <img src="${escapeHtml(page.image || payload.image || "assets/backup-study-desk.jpg")}" alt="${escapeHtml(page.imageAlt || payload.imageAlt || page.title)}" width="1400" height="934" decoding="async" fetchpriority="high">
        </figure>
        ${cards.length ? `<div class="landing-card-grid">${cards.map(([title, text], index) => `<section class="landing-card">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <h2>${escapeHtml(title)}</h2>
          <p>${escapeHtml(text)}</p>
        </section>`).join("")}</div>` : ""}
        <section class="article-body">
          <h2>${escapeHtml(payload.sectionTitle || "What this guide helps you understand")}</h2>
          ${paragraphBlock(body)}
        </section>
        <section class="article-body">
          <h2>${escapeHtml(payload.ctaTitle || "Start with the right diagnosis")}</h2>
          <p>${escapeHtml(payload.ctaBody || "The fastest way to improve is to locate the exact blocker first, then build a learning path around it.")}</p>
          <div class="actions">
            <a class="btn primary" href="${escapeHtml(payload.primaryHref || "/booking")}">${escapeHtml(payload.primaryLabel || "Book $29 Diagnostic")}</a>
            <a class="btn secondary" href="${escapeHtml(payload.secondaryHref || "/courses")}">${escapeHtml(payload.secondaryLabel || "View Courses")}</a>
          </div>
        </section>
      </article>`;
}

export default async function handler(req, res) {
  try {
    const match = String(req.url || "").match(/\/insights\/([^/?#]+)\/([^/?#]+)/);
    const category = cleanSeoCategory(req.query.category || match?.[1]);
    const slug = cleanSeoSlug(req.query.slug || match?.[2]);
    const page = await getSeoPage({ category, slug });
    if (!page) {
      res.status(404).send("Mandrix guide not found.");
      return;
    }
    const canonical = seoPageUrl(page);
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.title,
      description: page.description,
      image: imageUrl(page.image),
      author: {
        "@type": "Person",
        name: "Jane Chen",
      },
      publisher: {
        "@type": "EducationalOrganization",
        name: "Mandrix",
        url: siteUrl,
      },
      mainEntityOfPage: canonical,
    };
    const html = `<!doctype html>
<html lang="en">
  <head>
${baseHead({
  title: page.title,
  description: page.description,
  canonical,
  image: imageUrl(page.image),
  type: "article",
})}
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
  </head>
  <body class="insight-article-page">
    <div class="shell insight-shell">
      ${siteHeader()}
      <main class="wrap insight-article">
        ${renderArticle(page)}
      </main>
    </div>
    ${siteFooter()}
  </body>
</html>`;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300");
    res.status(200).send(html);
  } catch (error) {
    res.status(500).send(`Mandrix guide failed to load: ${error.message}`);
  }
}
