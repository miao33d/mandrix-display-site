const SITE_URL = "https://www.mandrix.top";

function clean(value) {
  return String(value || "").trim();
}

function escapeHtml(value) {
  return clean(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function text(payload, status = 200, contentType = "text/html; charset=utf-8") {
  return new Response(payload, { status, headers: { "Content-Type": contentType } });
}

function parseJson(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function cleanSlug(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);
}

function absoluteAssetUrl(value) {
  const image = clean(value || "assets/backup-study-desk.jpg");
  if (/^https?:\/\//i.test(image)) return image;
  return `${SITE_URL}/${image.replace(/^\/+/, "")}`;
}

function splitList(value, max = 6) {
  return clean(value).split(/[,，\n]/).map((item) => clean(item)).filter(Boolean).slice(0, max);
}

function renderParagraphs(value) {
  const textValue = clean(value);
  if (!textValue) return "";
  return textValue.split(/\n{2,}/).map((part) => `<p>${escapeHtml(part)}</p>`).join("");
}

function readingMinutes(value) {
  const words = clean(value).split(/\s+/).filter(Boolean).length;
  return Math.max(4, Math.ceil(words / 170));
}

function renderPage(row) {
  const payload = parseJson(row.payload, {});
  const category = cleanSlug(row.category);
  const slug = cleanSlug(row.slug);
  const url = `${SITE_URL}/insights/${category}/${slug}`;
  const title = clean(row.title || payload.title || "Mandrix Insight");
  const description = clean(row.description || payload.description || row.excerpt);
  const h1 = clean(payload.h1 || title.replace(/\s*\|\s*Mandrix\s*$/i, ""));
  const lead = clean(payload.lead || row.excerpt || description);
  const image = clean(payload.imageUploadTarget || row.image || payload.image || "assets/backup-study-desk.jpg");
  const imageAlt = clean(row.image_alt || payload.imageAlt || title);
  const cards = [
    { title: payload.card1Title, text: payload.card1Text },
    { title: payload.card2Title, text: payload.card2Text },
    { title: payload.card3Title, text: payload.card3Text },
  ].filter((card) => clean(card.title) || clean(card.text));
  const primaryLabel = clean(payload.primaryLabel || "Start Free AI Level Check");
  const primaryHref = clean(payload.primaryHref || "/level-check");
  const secondaryLabel = clean(payload.secondaryLabel || "View Courses");
  const secondaryHref = clean(payload.secondaryHref || "/courses");
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title.replace(/\s*\|\s*Mandrix\s*$/i, ""),
    description,
    url,
    image: absoluteAssetUrl(image),
    datePublished: row.created_at,
    dateModified: row.updated_at || row.created_at,
    mainEntityOfPage: url,
    author: { "@type": "Person", name: "Jane Chen" },
    publisher: { "@type": "EducationalOrganization", name: "Mandrix", url: SITE_URL },
    inLanguage: "en",
  };
  const readTime = readingMinutes(payload.articleBody || lead);
  const cardHtml = cards.map((card, index) => `
          <article class="landing-card">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <h2>${escapeHtml(card.title || "Mandrix focus")}</h2>
            <p>${escapeHtml(card.text || "")}</p>
          </article>`).join("");
  const secondaryButton = secondaryLabel && secondaryHref
    ? `<a class="btn secondary" href="${escapeHtml(secondaryHref)}">${escapeHtml(secondaryLabel)}</a>`
    : "";
  const sectionHtml = payload.sectionTitle || payload.sectionBody
    ? `${payload.sectionTitle ? `<h2>${escapeHtml(payload.sectionTitle)}</h2>` : ""}${payload.sectionBody ? `<p>${escapeHtml(payload.sectionBody)}</p>` : ""}`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${escapeHtml(url)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${escapeHtml(url)}">
    <meta property="og:image" content="${escapeHtml(absoluteAssetUrl(image))}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(absoluteAssetUrl(image))}">
    <link rel="icon" type="image/png" href="/assets/mandrix-logo-128.png">
    <link rel="stylesheet" href="/styles.min.css">
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
  </head>
  <body>
    <div class="shell insight-shell">
      <header class="nav" translate="no">
        <div class="nav-inner">
          <a class="brand" href="/"><img src="/assets/mandrix-logo-128.png" alt="Mandrix logo" width="128" height="128" decoding="async"><span class="brand-word"><span class="brand-name">Mandrix</span><span class="brand-line">Chinese, decoded.</span></span></a>
          <nav class="nav-links" id="navLinks"><a href="/method">Method</a><a href="/#core-system">Core System</a><a href="/#learning-paths">Learning Paths</a><a href="/corporate">Corporate</a><a href="/#results">Results</a><a href="/about">About Jane</a><a href="/faq">FAQ</a><a class="nav-cta" href="/level-check">Free AI Check</a><a class="lang-switch" href="/zh">中文</a></nav>
          <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation" aria-expanded="false"><span></span><span></span><span></span></button>
        </div>
      </header>
    </div>
    <main>
      <article class="wrap insight-article">
        <a class="back-link" href="/insights">← All insights</a>
        <p class="eyebrow">${escapeHtml(payload.eyebrow || category.replace(/-/g, " "))}</p>
        <div class="article-meta"><span>Mandrix Insights</span><span>${escapeHtml(category.replace(/-/g, " "))}</span><span>${readTime} min read</span></div>
        <h1>${escapeHtml(h1)}</h1>
        <p class="article-dek">${escapeHtml(lead)}</p>
        <figure class="article-hero-image"><img src="/${escapeHtml(image).replace(/^\/+/, "")}" alt="${escapeHtml(imageAlt)}"></figure>
        <div class="article-summary"><strong>In this guide</strong><p>${escapeHtml(payload.sectionBody || lead)}</p></div>
        ${renderParagraphs(payload.articleBody || lead)}
        ${cardHtml ? `<div class="landing-card-grid">${cardHtml}</div>` : ""}
        ${sectionHtml}
        <div class="article-cta">
          <h2>${escapeHtml(payload.ctaTitle || "Start with diagnosis")}</h2>
          <p>${escapeHtml(payload.ctaBody || "Start with the free AI level check before choosing a paid program.")}</p>
          <div class="article-cta-actions"><a class="btn primary" href="${escapeHtml(primaryHref)}">${escapeHtml(primaryLabel)}</a>${secondaryButton}</div>
        </div>
      </article>
    </main>
    <footer class="footer"><div class="wrap"><div class="footer-brand"><strong>Mandrix</strong><span>Chinese, decoded.</span><p>Clearer Chinese for adult learners.</p></div><nav class="footer-links" aria-label="Contact links"><a href="/method">Method</a><a href="/courses">Courses</a><a href="/corporate">Corporate</a><a href="/insights">Insights</a><a href="/booking">Booking</a><a href="mailto:Jane.Mandrix@outlook.com">Jane.Mandrix@outlook.com</a></nav><span>© 2026 Mandrix | Jane Chen. All Rights Reserved.</span></div></footer>
    <script src="/analytics.js" defer></script>
    <script>const navToggle=document.querySelector("#navToggle");const navLinks=document.querySelector("#navLinks");navToggle?.addEventListener("click",()=>{const isOpen=navLinks.classList.toggle("nav-open");navToggle.setAttribute("aria-expanded",isOpen?"true":"false")});</script>
  </body>
</html>`;
}

export async function onRequest(context) {
  const path = Array.isArray(context.params.path) ? context.params.path : [context.params.path].filter(Boolean);
  if (path.length !== 2) return context.next();
  const [category, slug] = path.map(cleanSlug);
  const db = context.env.MANDRIX_DB || context.env.DB;
  if (!db) return text("Cloudflare D1 binding MANDRIX_DB is not configured.", 500, "text/plain; charset=utf-8");
  const row = await db.prepare("SELECT * FROM seo_pages WHERE status = 'published' AND category = ? AND slug = ? LIMIT 1")
    .bind(category, slug).first();
  if (!row) return context.next();
  return text(renderPage(row));
}
