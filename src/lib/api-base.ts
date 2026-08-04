/**
 * Base URL for API routes.
 *
 * Empty on the full Next.js deployment (same-origin `/api/...`). The static
 * GitHub Pages build has no server, so it is built with NEXT_PUBLIC_API_BASE
 * pointing at the Vercel deployment that hosts the API routes.
 */
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

/** False only on a static build with no API host configured. */
export function isApiAvailable(): boolean {
  return process.env.NEXT_PUBLIC_STATIC_PRICING !== "true" || API_BASE.length > 0;
}
