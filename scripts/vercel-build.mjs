/**
 * Vercel / production build — seeds SQLite then builds Next.js.
 * Note: Prisma SQLite paths are relative to prisma/schema.prisma.
 * Runtime copies the seeded DB into /tmp (see src/lib/prisma.ts).
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const root = process.cwd();
// Relative to schema file → creates prisma/vercel.db
const databaseUrl = "file:./vercel.db";
const dbAbs = path.join(root, "prisma", "vercel.db");

process.env.DATABASE_URL = databaseUrl;

function run(cmd) {
  execSync(cmd, { stdio: "inherit", env: process.env });
}

run("npx prisma generate");
run("npx prisma db push --accept-data-loss");
run("npx tsx prisma/seed.ts");

const candidates = [
  dbAbs,
  path.join(root, "prisma", "prisma", "vercel.db"),
  path.join(root, "vercel.db"),
];
const found = candidates.find((p) => fs.existsSync(p));

if (!found) {
  console.error("✗ Expected database after seed. Checked:");
  for (const p of candidates) console.error(`  - ${p}`);
  process.exit(1);
}

if (found !== dbAbs) {
  fs.mkdirSync(path.dirname(dbAbs), { recursive: true });
  fs.copyFileSync(found, dbAbs);
  console.log(`✓ Copied DB ${found} → ${dbAbs}`);
}

console.log(`✓ Seeded database ready (${(fs.statSync(dbAbs).size / 1024).toFixed(0)} KB)`);
run("npx next build");
