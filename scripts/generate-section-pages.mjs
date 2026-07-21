import { copyFile, readFile, writeFile } from "node:fs/promises";

const homeSections = [
  "method",
  "courses",
  "about",
  "level-check",
  "faq",
  "booking",
  "contact",
  "diagnostic",
  "daily",
  "business",
  "hsk",
  "specialty",
  "private",
  "sourcing-spotlight",
];

const siteUrl = "https://www.mandrix.top";
const sectionMeta = {
  method: {
    title: "The Mandrix Sourcing Method | Mandrix",
    description: "See how Mandrix teaches sourcing Chinese through supplier-message structure, factory tone, and reusable trade communication templates.",
  },
  courses: {
    title: "China Sourcing Communication Program | Mandrix",
    description: "Explore Mandrix sourcing Chinese programs for Amazon sellers, importers, buyers, and teams communicating with Chinese suppliers.",
  },
  about: {
    title: "About Jane Chen, Founder of Mandrix | Mandrix",
    description: "Meet Jane Chen, Mandrix founder and lead educator, and learn how she teaches Chinese through structure and logic.",
  },
  "level-check": {
    title: "Free Sourcing Communication Audit | Mandrix",
    description: "Start with a free AI-assisted audit for supplier-message clarity, tone, negotiation leverage, and sourcing communication next steps.",
  },
  faq: {
    title: "Mandrix FAQ | Chinese for Sourcing",
    description: "Answers about Mandrix sourcing Chinese lessons, free sourcing audits, PayPal checkout, scheduling, and supplier communication training.",
  },
  booking: {
    title: "Book China Sourcing Chinese Lessons | Mandrix",
    description: "Choose a Mandrix sourcing Chinese program, submit booking details, and receive your lesson schedule and online classroom link.",
  },
  contact: {
    title: "Contact Mandrix | Online Chinese Lessons",
    description: "Contact Mandrix for adult Mandarin lessons, Business Chinese, HSK preparation, and Chinese communication coaching.",
  },
  diagnostic: {
    title: "Mandrix Sourcing Communication Audit | Mandrix",
    description: "Understand supplier-message risks before choosing a paid sourcing Chinese program.",
  },
  daily: {
    title: "Daily Chinese Lessons for Adult Learners | Mandrix",
    description: "Build practical Mandarin for everyday communication, confidence, and real-life conversations with Mandrix.",
  },
  business: {
    title: "Business Chinese Lessons for Professionals | Mandrix",
    description: "Learn professional Mandarin for meetings, messages, negotiation, workplace communication, and Chinese business contexts.",
  },
  hsk: {
    title: "HSK Preparation Lessons for Adults | Mandrix",
    description: "Prepare for HSK with structured Mandarin lessons that connect exam patterns to real communication.",
  },
  specialty: {
    title: "Specialized Sourcing Chinese Programs | Mandrix",
    description: "Explore Mandrix programs for sourcing Chinese, supplier communication, workplace Mandarin, and targeted trade communication goals.",
  },
  private: {
    title: "Private Mandarin Coaching for Adults | Mandrix",
    description: "Private online Mandarin coaching for adults who need diagnosis, structure, correction, and clear learning outcomes.",
  },
  "sourcing-spotlight": {
    title: "Chinese for Sourcing and Supplier Communication | Mandrix",
    description: "Learn Chinese for supplier messages, MOQ, samples, pricing, quality issues, and sourcing communication with Mandrix.",
  },
};

const indexHtml = await readFile("index.html", "utf8");

function routeHtml(section) {
  const url = `${siteUrl}/${section}`;
  const meta = sectionMeta[section] || sectionMeta.method;
  return indexHtml
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${meta.title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${meta.description}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${meta.title}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${meta.description}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${meta.title}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${meta.description}">`);
}

for (const section of homeSections) {
  await writeFile(`${section}.html`, routeHtml(section));
}

await copyFile("corporate.html", "corporate-programs.html");

console.log(`Generated ${homeSections.length + 1} clean route HTML files.`);
