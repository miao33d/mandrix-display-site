export const siteUrl = "https://www.mandrix.top";

export const seoCategories = {
  "business-chinese": {
    label: "Business Chinese",
    description: "Chinese for emails, meetings, negotiation, cross-border work, and professional tone.",
  },
  "hsk-prep": {
    label: "HSK Prep",
    description: "Structured HSK preparation for adult learners who want exam progress without blind memorization.",
  },
  "daily-chinese": {
    label: "Daily Chinese",
    description: "Practical Chinese for real conversations, travel, daily life, and speaking confidence.",
  },
  "sourcing-chinese": {
    label: "Sourcing Chinese",
    description: "Mandarin for suppliers, factories, 1688, trade shows, WeChat, MOQ, samples, and quality issues.",
  },
  "culture-communication": {
    label: "Culture & Communication",
    description: "Chinese communication logic, cultural context, indirect expression, and real-life usage.",
  },
  "learning-method": {
    label: "Learning Method",
    description: "Mandrix thinking on structure-first Chinese learning, adult learning, patterns, and clarity.",
  },
};

export const staticInsights = [
  {
    slug: "polite-no-chinese-business",
    category: "business-chinese",
    title: "How to Politely Say No in a Chinese Business Meeting",
    description: "Three executive formulas for declining, disagreeing, or slowing a decision without sounding blunt in Mandarin.",
    excerpt: "Three executive formulas for declining, disagreeing, or slowing a decision without sounding blunt in Mandarin.",
    url: "/insights/polite-no-chinese-business",
  },
  {
    slug: "hsk-for-professionals",
    category: "hsk-prep",
    title: "Is HSK Certification Worth It for Corporate Executives and Professionals?",
    description: "How HSK preparation can support workplace credibility when it is connected to real communication instead of memorized lists.",
    excerpt: "How HSK preparation can support workplace credibility when it is connected to real communication instead of memorized lists.",
    url: "/insights/hsk-for-professionals",
  },
  {
    slug: "logic-based-business-chinese",
    category: "learning-method",
    title: "Rote Memorization Is Slowing Down Your Business Chinese Progress",
    description: "A practical alternative for analytical adult learners: learn Chinese structure first, then reuse it across real situations.",
    excerpt: "A practical alternative for analytical adult learners: learn Chinese structure first, then reuse it across real situations.",
    url: "/insights/logic-based-business-chinese",
  },
];

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
  return seoCategories[category] ? category : "learning-method";
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
            <a href="/method">Method</a>
            <a href="/courses">Courses</a>
            <a href="/corporate">Corporate</a>
            <a href="/about">About</a>
            <a href="/insights">Insights</a>
            <a href="/faq">FAQ</a>
            <a class="nav-cta" href="/booking">Book $29 Diagnostic</a>
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
