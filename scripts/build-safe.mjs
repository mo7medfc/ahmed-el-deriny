/**
 * Production build — stops dev server first to avoid .next corruption.
 */
import { execSync } from "child_process";
import { projectRoot } from "./next-cache-dir.mjs";

const PORT = process.env.PORT || "3000";

if (process.platform === "win32") {
  try {
    const out = execSync(`netstat -ano | findstr :${PORT}`, { encoding: "utf8" });
    if (/LISTENING/i.test(out)) {
      console.error(
        `\n✗ Port ${PORT} is in use (dev server running).\n` +
          `  Stop dev first (Ctrl+C), then run: npm run build\n`
      );
      process.exit(1);
    }
  } catch {
    /* port free */
  }
}

execSync("next build", { cwd: projectRoot, stdio: "inherit" });
