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
    title: "The Mandrix Method for Adult Mandarin Learners | Mandrix",
    description: "See how Mandrix teaches Mandarin through diagnosis, structure, and usable output instead of memorized phrases.",
  },
  courses: {
    title: "Mandrix Mandarin Courses for Adults | Mandrix",
    description: "Explore Daily Chinese, Business Chinese, Sourcing Chinese, and HSK learning paths after a free AI level check.",
  },
  about: {
    title: "About Jane Chen, Founder of Mandrix | Mandrix",
    description: "Meet Jane Chen, Mandrix founder and lead educator, and learn how she teaches Chinese through structure and logic.",
  },
  "level-check": {
    title: "Free AI Chinese Level Check for Adults | Mandrix",
    description: "Start with a free AI Mandarin level check to identify your likely level, main blocker, and recommended Mandrix path.",
  },
  faq: {
    title: "Mandrix FAQ | Online Mandarin Lessons for Adults",
    description: "Answers about Mandrix online Chinese lessons, AI level checks, courses, scheduling, payment, and lesson format.",
  },
  booking: {
    title: "Book Mandrix Online Mandarin Lessons | Mandrix",
    description: "Choose a Mandrix course, submit your booking details, and receive your lesson schedule and online classroom link.",
  },
  contact: {
    title: "Contact Mandrix | Online Chinese Lessons",
    description: "Contact Mandrix for adult Mandarin lessons, Business Chinese, HSK preparation, and Chinese communication coaching.",
  },
  diagnostic: {
    title: "Mandrix Chinese Diagnostic Path | Mandrix",
    description: "Understand your Chinese learning blocker before choosing a paid course or long-term Mandarin learning path.",
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
    title: "Specialized Chinese Learning Paths | Mandrix",
    description: "Explore specialized Mandrix paths for sourcing, workplace Mandarin, business communication, and targeted Chinese goals.",
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
