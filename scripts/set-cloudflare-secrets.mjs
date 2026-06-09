import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const envText = readFileSync(".env.production.local", "utf8");
const env = {};
for (const rawLine of envText.split(/\n/)) {
  const line = rawLine.trim();
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!match) continue;
  let value = match[2].trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  env[match[1]] = value;
}

const names = ["RESEND_API_KEY", "ADMIN_TOKEN", "ADMIN_EMAIL", "EMAIL_FROM"];
for (const name of names) {
  if (!env[name]) {
    console.log(`${name}: missing`);
    continue;
  }
  const result = spawnSync("npx", ["wrangler", "pages", "secret", "put", name, "--project-name", "mandrix-display-site"], {
    input: env[name],
    encoding: "utf8",
    env: {
      ...process.env,
      CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN || "",
    },
  });
  console.log(`${name}: ${result.status === 0 ? "set" : "failed"}`);
  if (result.status !== 0) {
    const output = `${result.stdout || ""}${result.stderr || ""}`.split("\n").filter(Boolean).slice(-3).join("\n");
    console.log(output);
  }
}
