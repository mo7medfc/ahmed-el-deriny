/**
 * Vercel / production build — uses SQLite by default for trial deploys.
 */
import { execSync } from "child_process";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./prisma/vercel.db";
}

function run(cmd) {
  execSync(cmd, { stdio: "inherit", env: process.env });
}

run("npx prisma generate");
run("npx prisma db push --accept-data-loss");
run("npx tsx prisma/seed.ts");
run("npx next build");
