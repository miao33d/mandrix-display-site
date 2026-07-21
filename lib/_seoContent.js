export const siteUrl = "https://www.mandrix.top";

export const seoCategories = {
  "sourcing-chinese": {
    label: "Sourcing Chinese",
    description: "Mandarin for suppliers, factories, 1688, trade shows, WeChat, MOQ, samples, and quality issues.",
  },
  "supplier-communication": {
    label: "Supplier Communication",
    description: "Chinese for supplier messages, follow-up, samples, delivery, payment terms, and factory replies.",
  },
  "chinese-for-amazon-sellers": {
    label: "Chinese for Amazon Sellers",
    description: "Mandarin content for Amazon sellers who source from China and communicate with factories.",
  },
  "canton-fair-chinese": {
    label: "Canton Fair Chinese",
    description: "Chinese for booth conversations, factory introductions, product questions, and trade fair follow-up.",
  },
  "1688-alibaba-chinese": {
    label: "1688 & Alibaba Chinese",
    description: "Chinese for reading listings, asking suppliers questions, and comparing factory information.",
  },
  "factory-negotiation": {
    label: "Factory Negotiation",
    description: "Chinese for price, quantity, concessions, terms, timing, and professional negotiation tone.",
  },
  "moq-sample-requests": {
    label: "MOQ & Sample Requests",
    description: "Chinese templates and explanations for MOQ, samples, packaging, materials, and first orders.",
  },
  "quality-issue-chinese": {
    label: "Quality Issue Chinese",
    description: "Chinese for explaining defects, rework, evidence, replacement, and quality follow-up without sounding hostile.",
  },
  "import-export-chinese": {
    label: "Import / Export Chinese",
    description: "Chinese for importers, buyers, cross-border sellers, freight questions, and supplier coordination.",
  },
};

export const staticInsights = [];

export function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function cleanSeoSlug(value) {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\.html$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "new-mandarin-guide";
}

export function cleanSeoCategory(value) {
  const category = cleanSeoSlug(value);
  return seoCategories[category] ? category : "supplier-communication";
}

export function seoPageUrl(page) {
  const category = cleanSeoCategory(page.category);
  const slug = cleanSeoSlug(page.slug);
  return `${siteUrl}/insights/${category}/${slug}`;
}

export function readingTime(text) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(3, Math.ceil(words / 180))} min read`;
}

export function baseHead({ title, description, canonical, image = `${siteUrl}/assets/mandrix-logo-128.png`, type = "website" }) {
  return `    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:type" content="${escapeHtml(type)}">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    <meta property="og:image" content="${escapeHtml(image)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(image)}">
    <link rel="icon" type="image/png" href="/assets/mandrix-logo-128.png">
    <link rel="stylesheet" href="/styles.min.css">`;
}

export function siteHeader() {
  return `<header class="nav" translate="no">
        <div class="nav-inner">
          <a class="brand" href="/">
            <img src="/assets/mandrix-logo-128.png" alt="Mandrix logo" width="128" height="128" decoding="async" fetchpriority="high">
            <span class="brand-word">
              <span class="brand-name">Mandrix</span>
              <span class="brand-line">Chinese, decoded.</span>
            </span>
          </a>
          <nav class="nav-links" id="navLinks">
            <a href="/method">How It Works</a>
            <a href="/courses">Sourcing Program</a>
            <a href="/corporate">Teams</a>
            <a href="/about">About Jane</a>
            <a href="/insights">Insights</a>
            <a href="/faq">FAQ</a>
            <a class="nav-cta" href="/level-check">Free Audit</a>
            <a class="lang-switch" href="/zh">中文</a>
          </nav>
          <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>`;
}

export function siteFooter() {
  return `<footer class="footer">
      <div class="wrap">
        <div class="footer-brand">
          <strong>Mandrix</strong>
          <span>Chinese, decoded.</span>
          <p>Clearer Chinese for adult learners.</p>
        </div>
        <nav class="footer-links" aria-label="Contact links">
          <a href="/method">Method</a>
          <a href="/courses">Courses</a>
          <a href="/corporate">Corporate</a>
          <a href="/insights">Insights</a>
          <a href="/booking">Booking</a>
          <a href="mailto:Jane.Mandrix@outlook.com">Jane.Mandrix@outlook.com</a>
          <a href="https://wa.me/message/S6GHIZYKAV4ZH1" translate="no">WhatsApp</a>
          <a href="https://t.me/Jane_Mandrix" translate="no">Telegram @Jane_Mandrix</a>
        </nav>
        <span>© 2026 Mandrix | Jane Chen. All Rights Reserved.</span>
      </div>
    </footer>
    <script src="/analytics.js" defer></script>
    <script>
      const navToggle = document.querySelector("#navToggle");
      const navLinks = document.querySelector("#navLinks");
      navToggle?.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("nav-open");
        navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    </script>`;
}
