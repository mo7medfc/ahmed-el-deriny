/**
 * Safe dev startup for OneDrive projects:
 * - frees port 3000 (no duplicate dev servers)
 * - auto-cleans corrupted .next cache
 * - uses webpack dev (not turbopack) on OneDrive
 *
 * Run: npm run dev
 */
import { spawn, execSync } from "child_process";
import {
  projectRoot,
  removeNextCaches,
  isNextCacheCorrupted,
} from "./next-cache-dir.mjs";

const PORT = process.env.PORT || "3000";
const onOneDrive = projectRoot.includes("OneDrive");

function freePort(port) {
  if (process.platform !== "win32") return;
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
    const pids = new Set();
    for (const line of out.split("\n")) {
      const m = line.trim().match(/LISTENING\s+(\d+)\s*$/i);
      if (m) pids.add(m[1]);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
        console.log(`  ✓ freed port ${port} (PID ${pid})`);
      } catch {
        /* already gone */
      }
    }
  } catch {
    /* port already free */
  }
}

const forceClean = process.argv.includes("--clean");

freePort(PORT);

if (forceClean || isNextCacheCorrupted()) {
  console.log("Clearing corrupted Next.js cache…");
  removeNextCaches();
}

const devArgs = ["next", "dev", "-p", PORT];
if (!onOneDrive) devArgs.splice(2, 0, "--turbopack");

if (onOneDrive) {
  console.log(
    "\n⚠ Project is on OneDrive — using webpack dev (stable) instead of turbopack.\n"
  );
}

console.log(`Starting dev server on http://localhost:${PORT}\n`);

const child = spawn("npx", devArgs, {
  cwd: projectRoot,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
