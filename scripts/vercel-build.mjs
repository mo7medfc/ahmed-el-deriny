/**
 * Vercel production build: requires DATABASE_URL (Neon Postgres recommended).
 */
import { execSync } from "child_process";

if (!process.env.DATABASE_URL) {
  console.error(
    "\n✗ DATABASE_URL is missing on Vercel.\n" +
      "  Add a Postgres URL (Neon free): Vercel → Project → Settings → Environment Variables\n" +
      "  Example: postgresql://user:pass@host/db?sslmode=require\n"
  );
  process.exit(1);
}

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

run("npx prisma generate");
run("npx prisma db push --accept-data-loss");
run("npx tsx prisma/seed.ts");
run("npx next build");
