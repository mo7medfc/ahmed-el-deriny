import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, locale: string = "ar") {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateOrderNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `AD-${date}-${random}`;
}

export function calculatePrice(
  pricingType: string,
  basePrice: number,
  width: number,
  height: number,
  quantity: number,
  optionAddons: number = 0
): number {
  let unitPrice = basePrice;

  if (pricingType === "per_sqm") {
    const areaSqm = (width * height) / 10000;
    unitPrice = basePrice * areaSqm + optionAddons;
  } else if (pricingType === "per_meter") {
    unitPrice = basePrice * (width / 100) + optionAddons;
  } else if (pricingType === "per_unit" || pricingType === "stands") {
    unitPrice = basePrice + optionAddons;
  } else {
    unitPrice = basePrice + optionAddons;
  }

  return Math.max(0, unitPrice * quantity);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
