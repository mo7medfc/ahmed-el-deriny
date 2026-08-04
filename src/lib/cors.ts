import { NextResponse } from "next/server";

/**
 * The storefront is also published as a static site on GitHub Pages, which has
 * no server of its own. Those pages call these API routes cross-origin, so the
 * deployed origins have to be allow-listed here.
 */
const DEFAULT_ORIGINS = [
  "https://mo7medfc.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function allowedOrigins(): string[] {
  const extra = (process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  return [...DEFAULT_ORIGINS, ...extra];
}

function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin || !allowedOrigins().includes(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function withCors(response: Response, origin: string | null): Response {
  for (const [key, value] of Object.entries(corsHeaders(origin))) {
    response.headers.set(key, value);
  }
  return response;
}

export function corsPreflight(origin: string | null): Response {
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}
