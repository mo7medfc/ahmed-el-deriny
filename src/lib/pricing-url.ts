export function getPricingFetchUrl(category: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  if (process.env.NEXT_PUBLIC_STATIC_PRICING === "true") {
    return `${basePath}/data/pricing/${category}.json`;
  }

  return `${basePath}/api/pricing/${encodeURIComponent(category)}`;
}

export function isStaticHosting(): boolean {
  return process.env.NEXT_PUBLIC_STATIC_PRICING === "true";
}
