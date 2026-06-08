import { listSeoPages } from "../lib/_supabase.js";
import {
  baseHead,
  escapeHtml,
  seoCategories,
  siteFooter,
  siteHeader,
  siteUrl,
  staticInsights,
} from "../lib/_seoContent.js";

function groupPages(pages) {
  const groups = {};
  Object.keys(seoCategories).forEach((key) => { groups[key] = []; });
  staticInsights.forEach((page) => groups[page.category]?.push(page));
  pages.forEach((page) => groups[page.category]?.push({
    ...page,
    url: `/insights/${page.category}/${page.slug}`,
  }));
  return groups;
}

function pageCard(page) {
  return `<article class="insight-card">
          <span>${escapeHtml(seoCategories[page.category]?.label || "Mandrix Guide")}</span>
          <h2>${escapeHtml(page.title)}</h2>
          <p>${escapeHtml(page.excerpt || page.description)}</p>
          <a class="program-cta" href="${escapeHtml(page.url)}">Read guide</a>
        </article>`;
}

export default async function handler(req, res) {
  try {
    const pages = await listSeoPages();
    const groups = groupPages(pages);
    const allPages = Object.values(groups).flat();
    const schema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Mandrix Insights",
      url: `${siteUrl}/insights`,
      about: ["Business Chinese", "HSK preparation", "Mandarin learning", "Chinese communication"],
      mainEntity: allPages.slice(0, 24).map((page) => ({
        "@type": "Article",
        headline: page.title,
        url: page.url?.startsWith("http") ? page.url : `${siteUrl}${page.url}`,
      })),
    };

    const categorySections = Object.entries(seoCategories).map(([key, category]) => {
      const cards = (groups[key] || []).map(pageCard).join("\n");
      if (!cards) return "";
      return `<section class="section insights-category" id="${escapeHtml(key)}">
      <div class="wrap">
        <div class="section-head split">
          <div>
            <p class="eyebrow">Learning guides</p>
            <h2>${escapeHtml(category.label)}</h2>
          </div>
          <p>${escapeHtml(category.description)}</p>
        </div>
        <div class="insight-grid">${cards}</div>
      </div>
    </section>`;
    }).join("\n");

    const html = `<!doctype html>
<html lang="en">
  <head>
${baseHead({
  title: "Mandrix Insights | Business Chinese, HSK, and Mandarin Learning Guides",
  description: "Structured Mandarin learning guides for adult learners, professionals, HSK candidates, sourcing teams, and cross-cultural communication.",
  canonical: `${siteUrl}/insights`,
})}
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
  </head>
  <body>
    <div class="shell insight-shell">
      ${siteHeader()}
      <main>
        <section class="wrap insight-hero">
          <p class="eyebrow">Mandrix Insights</p>
          <h1>Chinese learning guides organized by real learner goals.</h1>
          <p class="lead">Practical guides for adults who want Chinese to become clearer, more usable, and easier to apply in work, exams, sourcing, and daily communication.</p>
          <div class="insight-category-nav">
            ${Object.entries(seoCategories).map(([key, category]) => `<a href="#${escapeHtml(key)}">${escapeHtml(category.label)}</a>`).join("\n            ")}
          </div>
        </section>
      </main>
    </div>
    ${categorySections}
    <section class="section alt contact">
      <div class="wrap">
        <p class="eyebrow">Start with diagnosis</p>
        <h2>Find the exact blocker before buying a larger course.</h2>
        <p class="lead">Book a $29 diagnostic and receive a written roadmap for daily Chinese, Business Chinese, or HSK preparation.</p>
        <div class="actions">
          <a class="btn primary" href="/booking">Book $29 Diagnostic</a>
          <a class="btn secondary" href="mailto:Jane.Mandrix@outlook.com">Email Jane</a>
        </div>
      </div>
    </section>
    ${siteFooter()}
  </body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300");
    res.status(200).send(html);
  } catch (error) {
    res.status(500).send(`Mandrix Insights failed to load: ${error.message}`);
  }
}
