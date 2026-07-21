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

const deletedInsightPaths = new Set([
  "daily-chinese/learn-conversational-chinese-as-an-adult",
  "chinese-for-amazon-sellers/chinese-for-amazon-sellers",
  "polite-no-chinese-business",
  "hsk-for-professionals",
  "logic-based-business-chinese",
]);

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

function renderInsightsIndex() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mandrix Insights | Sourcing Chinese Guides</title>
    <meta name="description" content="Mandrix Insights publishes practical sourcing Chinese guides for supplier messages, MOQ, samples, 1688, Alibaba, Canton Fair, and quality follow-up.">
    <link rel="canonical" href="${SITE_URL}/insights">
    <meta property="og:title" content="Mandrix Insights | Sourcing Chinese Guides">
    <meta property="og:description" content="Practical guides for Amazon sellers, importers, buyers, and sourcing teams who communicate with Chinese suppliers.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${SITE_URL}/insights">
    <meta property="og:image" content="${SITE_URL}/assets/mandrix-logo-128.png">
    <link rel="icon" type="image/png" href="/assets/mandrix-logo-128.png">
    <link rel="stylesheet" href="/styles.min.css">
  </head>
  <body>
    <div class="shell insight-shell">
      <header class="nav" translate="no">
        <div class="nav-inner">
          <a class="brand" href="/"><img src="/assets/mandrix-logo-128.png" alt="Mandrix logo" width="128" height="128" decoding="async"><span class="brand-word"><span class="brand-name">Mandrix</span><span class="brand-line">Chinese for Sourcing</span></span></a>
          <nav class="nav-links" id="navLinks"><a href="/">Home</a><a href="/#method">How It Works</a><a href="/courses">Sourcing Program</a><a href="/#results">Results</a><a href="/about">About Jane</a><a href="/faq">FAQ</a><a class="nav-cta" href="/level-check">Free Audit</a><a class="lang-switch" href="/zh">中文</a></nav>
          <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation" aria-expanded="false"><span></span><span></span><span></span></button>
        </div>
      </header>
      <main>
        <section class="wrap insight-hero">
          <p class="eyebrow">Mandrix Insights</p>
          <h1>Sourcing Chinese guides for real supplier conversations.</h1>
          <p class="lead">New articles will focus on buyer intent: supplier messages, MOQ, samples, delivery, quality issues, 1688, Alibaba, Canton Fair, and factory follow-up.</p>
        </section>
      </main>
    </div>
    <section class="section insights-index">
      <div class="wrap insight-grid" id="dynamicInsightsGrid">
        <article class="insight-card dynamic-insight-card" id="emptyInsightsCard">
          <span>Content reset</span>
          <h2>Old SEO articles have been removed.</h2>
          <p>Publish the next sourcing-focused guides from the SEO backend. They will appear here automatically and enter the dynamic sitemap.</p>
          <a class="program-cta" href="/level-check">Start Free Sourcing Audit</a>
        </article>
      </div>
    </section>
    <section class="section alt contact">
      <div class="wrap">
        <p class="eyebrow">Start with diagnosis</p>
        <h2>Before writing or buying lessons, find the supplier-message blocker.</h2>
        <p class="lead">The free sourcing audit points to the communication issue that matters most: clarity, tone, negotiation leverage, or next-step follow-up.</p>
        <div class="actions"><a class="btn primary" href="/level-check">Start Free Sourcing Audit</a><a class="btn secondary" href="/courses">View Sourcing Program</a></div>
      </div>
    </section>
    <footer class="footer"><div class="wrap"><div class="footer-brand"><strong>Mandrix</strong><span>Chinese for Sourcing</span><p>Supplier communication Chinese for Amazon sellers, importers, buyers, and cross-border teams.</p></div><nav class="footer-links" aria-label="Contact links"><a href="/method">How It Works</a><a href="/courses">Sourcing Program</a><a href="/insights">Insights</a><a href="/booking">Booking</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="mailto:Jane.Mandrix@outlook.com">Jane.Mandrix@outlook.com</a></nav><span>© 2026 Mandrix | Jane Chen. All Rights Reserved.</span></div></footer>
    <script src="/analytics.js" defer></script>
    <script>
      const navToggle=document.querySelector("#navToggle");const navLinks=document.querySelector("#navLinks");navToggle?.addEventListener("click",()=>{const isOpen=navLinks.classList.toggle("nav-open");navToggle.setAttribute("aria-expanded",isOpen?"true":"false")});
      const dynamicInsightsGrid=document.querySelector("#dynamicInsightsGrid");const emptyInsightsCard=document.querySelector("#emptyInsightsCard");
      const categoryLabels={"sourcing-chinese":"Sourcing Chinese","supplier-communication":"Supplier Communication","chinese-for-amazon-sellers":"Chinese for Amazon Sellers","canton-fair-chinese":"Canton Fair Chinese","1688-alibaba-chinese":"1688 & Alibaba Chinese","factory-negotiation":"Factory Negotiation","moq-sample-requests":"MOQ & Sample Requests","quality-issue-chinese":"Quality Issue Chinese","import-export-chinese":"Import / Export Chinese"};
      const escapeHtml=(value)=>String(value||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
      const categoryLabel=(value)=>categoryLabels[value]||String(value||"Mandrix Guide").split("-").filter(Boolean).map((word)=>word.charAt(0).toUpperCase()+word.slice(1)).join(" ");
      async function loadDynamicInsights(){if(!dynamicInsightsGrid)return;try{const response=await fetch("/api/seo-pages.js");const data=await response.json();if(!response.ok||!Array.isArray(data.pages)||!data.pages.length)return;const cards=data.pages.slice(0,24).map((page)=>\`<article class="insight-card dynamic-insight-card"><span>\${escapeHtml(categoryLabel(page.category))}</span><h2>\${escapeHtml(page.title||"Mandrix Guide")}</h2><p>\${escapeHtml(page.excerpt||page.description||"")}</p><a class="program-cta" href="/insights/\${encodeURIComponent(page.category)}/\${encodeURIComponent(page.slug)}">Read guide</a></article>\`).join("");emptyInsightsCard?.remove();dynamicInsightsGrid.insertAdjacentHTML("afterbegin",cards)}catch(error){console.info("Dynamic insights unavailable",error)}}loadDynamicInsights();
    </script>
  </body>
</html>`;
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
  const primaryLabel = clean(payload.primaryLabel || "Start Free Sourcing Audit");
  const primaryHref = clean(payload.primaryHref || "/level-check");
  const secondaryLabel = clean(payload.secondaryLabel || "View Sourcing Program");
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
    <link rel="stylesheet" href="/styles.min.css?v=layout-20260706b">
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
  </head>
  <body>
    <div class="shell insight-shell">
      <header class="nav" translate="no">
        <div class="nav-inner">
          <a class="brand" href="/"><img src="/assets/mandrix-logo-128.png" alt="Mandrix logo" width="128" height="128" decoding="async"><span class="brand-word"><span class="brand-name">Mandrix</span><span class="brand-line">Chinese for Sourcing</span></span></a>
          <nav class="nav-links" id="navLinks"><a href="/">Home</a><a href="/#method">How It Works</a><a href="/courses">Sourcing Program</a><a href="/#results">Results</a><a href="/about">About Jane</a><a href="/faq">FAQ</a><a class="nav-cta" href="/level-check">Free Audit</a><a class="lang-switch" href="/zh">中文</a></nav>
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
          <div class="article-cta-copy">
            <p class="article-cta-kicker">${escapeHtml(payload.ctaEyebrow || "Start with diagnosis")}</p>
            <h2>${escapeHtml(payload.ctaTitle || "Find the blocker before choosing a course.")}</h2>
            <p>${escapeHtml(payload.ctaBody || "Use the free sourcing audit to identify your supplier-message blocker before choosing a paid program.")}</p>
          </div>
          <div class="article-cta-actions"><a class="btn primary" href="${escapeHtml(primaryHref)}">${escapeHtml(primaryLabel)}</a>${secondaryButton}</div>
        </div>
      </article>
    </main>
    <footer class="footer"><div class="wrap"><div class="footer-brand"><strong>Mandrix</strong><span>Chinese for Sourcing</span><p>Supplier communication Chinese for Amazon sellers, importers, buyers, and cross-border teams.</p></div><nav class="footer-links" aria-label="Contact links"><a href="/method">How It Works</a><a href="/courses">Sourcing Program</a><a href="/insights">Insights</a><a href="/booking">Booking</a><a href="mailto:Jane.Mandrix@outlook.com">Jane.Mandrix@outlook.com</a></nav><span>© 2026 Mandrix | Jane Chen. All Rights Reserved.</span></div></footer>
    <script src="/analytics.js" defer></script>
    <script>const navToggle=document.querySelector("#navToggle");const navLinks=document.querySelector("#navLinks");navToggle?.addEventListener("click",()=>{const isOpen=navLinks.classList.toggle("nav-open");navToggle.setAttribute("aria-expanded",isOpen?"true":"false")});</script>
  </body>
</html>`;
}

export async function onRequest(context) {
  const path = Array.isArray(context.params.path) ? context.params.path : [context.params.path].filter(Boolean);
  const cleanPath = path.map(cleanSlug).filter(Boolean);
  if (!cleanPath.length) return text(renderInsightsIndex());
  const pathKey = cleanPath.join("/");
  if (deletedInsightPaths.has(pathKey)) return text("Gone", 410, "text/plain; charset=utf-8");
  if (cleanPath.length !== 2) return text("Not found", 404, "text/plain; charset=utf-8");
  const [category, slug] = cleanPath;
  const db = context.env.MANDRIX_DB || context.env.DB;
  if (!db) return text("Cloudflare D1 binding MANDRIX_DB is not configured.", 500, "text/plain; charset=utf-8");
  const row = await db.prepare("SELECT * FROM seo_pages WHERE status = 'published' AND category = ? AND slug = ? LIMIT 1")
    .bind(category, slug).first();
  if (!row) return text("Not found", 404, "text/plain; charset=utf-8");
  return text(renderPage(row));
}
