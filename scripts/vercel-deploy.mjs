/**
 * Link + set production env from local .env + deploy to Vercel.
 * Skips DATABASE_URL (vercel-build seeds prisma/vercel.db).
 */
import { execSync, spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const root = process.cwd();
const envPath = path.join(root, ".env");

function parseEnv(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const key = trimmed.slice(0, i).trim();
    let val = trimmed.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: root, ...opts });
}

function setEnv(key, value, environment = "production") {
  if (!value) return;
  // Remove existing silently, then add from stdin
  spawnSync("npx", ["vercel", "env", "rm", key, environment, "-y"], {
    cwd: root,
    stdio: "ignore",
    shell: true,
  });
  const res = spawnSync(
    "npx",
    ["vercel", "env", "add", key, environment],
    {
      cwd: root,
      input: value + "\n",
      encoding: "utf8",
      shell: true,
    }
  );
  if (res.status !== 0) {
    console.warn(`⚠ Failed to set ${key}:`, res.stderr || res.stdout);
  } else {
    console.log(`✓ ${key} → ${environment}`);
  }
}

const local = parseEnv(envPath);
if (!local.OPENAI_API_KEY || local.OPENAI_API_KEY.includes("sk-...")) {
  console.error("✗ OPENAI_API_KEY missing or placeholder in .env — aborting");
  process.exit(1);
}

if (!fs.existsSync(path.join(root, ".vercel", "project.json"))) {
  run("npx vercel link --yes --project ahmed-deriny");
} else {
  console.log("✓ Already linked to Vercel project");
}

const keys = [
  "OPENAI_API_KEY",
  "OPENAI_MAIN_MODEL",
  "OPENAI_CHAT_MODEL",
  "OPENAI_CREATIVE_MODEL",
  "OPENAI_REFINE_MODEL",
  "OPENAI_IMAGE_MODEL",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "ADMIN_NAME",
  "SESSION_SECRET",
];

for (const envName of ["production", "preview", "development"]) {
  for (const key of keys) {
    if (local[key]) setEnv(key, local[key], envName);
  }
}

console.log("\n🚀 Deploying to production...\n");
run("npx vercel --prod --yes");
