/**
 * Remove Next.js build caches (local junction + external target).
 * Run: npm run clean
 */
import { removeNextCaches } from "./next-cache-dir.mjs";

console.log("Clearing Next.js cache…");
removeNextCaches();
console.log("\nNext.js cache cleared.");
