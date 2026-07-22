/**
 * Build static site for GitHub Pages (SQLite + exported pricing JSON).
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const root = process.cwd();
const middlewarePath = path.join(root, "src/middleware.ts");
const middlewareBackup = path.join(root, "src/middleware.ts.pages-build-bak");
const apiPath = path.join(root, "src/app/api");
const apiBackup = path.join(root, "src/app/_api_pages_build_bak");

function hideDir(source, backup) {
  if (!fs.existsSync(source)) return false;
  if (fs.existsSync(backup)) fs.rmSync(backup, { recursive: true, force: true });
  fs.cpSync(source, backup, { recursive: true });
  fs.rmSync(source, { recursive: true, force: true });
  return true;
}

function restoreDir(source, backup) {
  if (!fs.existsSync(backup)) return;
  if (fs.existsSync(source)) fs.rmSync(source, { recursive: true, force: true });
  fs.cpSync(backup, source, { recursive: true });
  fs.rmSync(backup, { recursive: true, force: true });
}

const buildEnv = {
  GITHUB_PAGES: "true",
  NEXT_PUBLIC_STATIC_PRICING: "true",
  NEXT_PUBLIC_BASE_PATH: "/ahmed-el-deriny",
  DATABASE_URL: "file:./prisma/pages.db",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@ahmedderiny.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "Admin@123",
  ADMIN_NAME: process.env.ADMIN_NAME || "مدير النظام",
  SESSION_SECRET: process.env.SESSION_SECRET || "github-pages-static-build",
};

function run(command, extraEnv = {}) {
  execSync(command, {
    stdio: "inherit",
    env: { ...process.env, ...buildEnv, ...extraEnv },
  });
}

let middlewareDisabled = false;
let apiHidden = false;

try {
  if (fs.existsSync(middlewarePath)) {
    fs.renameSync(middlewarePath, middlewareBackup);
    middlewareDisabled = true;
  }
  apiHidden = hideDir(apiPath, apiBackup);

  run("npx prisma generate");
  run("npx prisma db push --accept-data-loss");
  run("npx tsx prisma/seed.ts");
  run("node scripts/export-static-pricing.mjs");
  run("npx next build");

  const heroSrc = path.join(root, "public", "videos", "hero-intro.mp4");
  const heroOut = path.join(root, "out", "videos", "hero-intro.mp4");
  if (fs.existsSync(heroSrc)) {
    fs.mkdirSync(path.dirname(heroOut), { recursive: true });
    fs.copyFileSync(heroSrc, heroOut);
    console.log("✓ Hero video copied to out/videos/hero-intro.mp4");
  } else {
    console.warn("⚠ Missing public/videos/hero-intro.mp4 — hero video will not show on Pages");
  }

  const noJekyll = path.join(root, "out", ".nojekyll");
  fs.writeFileSync(noJekyll, "");
  // Override repo .gitignore on gh-pages so *.mp4 video assets are included
  fs.writeFileSync(path.join(root, "out", ".gitignore"), "# deploy all static assets\n");
  console.log("\n✓ GitHub Pages build complete → out/\n");
} finally {
  if (apiHidden) restoreDir(apiPath, apiBackup);
  if (middlewareDisabled && fs.existsSync(middlewareBackup)) {
    fs.renameSync(middlewareBackup, middlewarePath);
  }
}
