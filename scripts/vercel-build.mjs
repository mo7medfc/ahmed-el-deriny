/**
 * Vercel / production build — seeds SQLite then builds Next.js.
 * Runtime copies the seeded DB into /tmp (see src/lib/prisma.ts).
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const root = process.cwd();
const dbRel = "prisma/vercel.db";
const dbAbs = path.join(root, dbRel);

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:./${dbRel}`;
}

function run(cmd) {
  execSync(cmd, { stdio: "inherit", env: process.env });
}

run("npx prisma generate");
run("npx prisma db push --accept-data-loss");
run("npx tsx prisma/seed.ts");

if (!fs.existsSync(dbAbs)) {
  console.error(`✗ Expected database at ${dbAbs} after seed`);
  process.exit(1);
}

console.log(`✓ Seeded database ready (${(fs.statSync(dbAbs).size / 1024).toFixed(0)} KB)`);
run("npx next build");
