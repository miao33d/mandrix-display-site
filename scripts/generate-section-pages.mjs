import { copyFile } from "node:fs/promises";

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

for (const section of homeSections) {
  await copyFile("index.html", `${section}.html`);
}

await copyFile("corporate.html", "corporate-programs.html");

console.log(`Generated ${homeSections.length + 1} clean route HTML files.`);
