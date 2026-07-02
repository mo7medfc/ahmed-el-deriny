import { join } from "path";
import { existsSync, rmSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const projectRoot = join(__dirname, "..");
export const localNextDir = join(projectRoot, ".next");

/** Remove .next build cache (fixes ENOENT / white page after OneDrive sync). */
export function removeNextCaches() {
  if (!existsSync(localNextDir)) {
    console.log(`  skip (missing): ${localNextDir}`);
    return;
  }
  rmSync(localNextDir, { recursive: true, force: true });
  console.log(`  ✓ removed: ${localNextDir}`);
}

/** Heuristic: partial .next folder without server manifests → corrupted cache. */
export function isNextCacheCorrupted() {
  if (!existsSync(localNextDir)) return false;
  const serverDir = join(localNextDir, "server");
  if (!existsSync(serverDir)) return false;
  const markers = [
    join(serverDir, "middleware-manifest.json"),
    join(serverDir, "pages-manifest.json"),
  ];
  return markers.some((f) => !existsSync(f));
}
