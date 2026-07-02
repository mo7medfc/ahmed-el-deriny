import { STAMP_DEFAULT_SIZES, stampDocId, stampSerialDocId } from "./legacy-catalog";

export type StampBand = "automatic_machine" | "wooden_handle" | "cliche_only";
export type StampVariant = "only" | "stamp" | "serial";
export type InkColor = "black" | "red" | "green";

export type StampSellDoc = Record<string, unknown>;

export function calculateCliche(
  widthCm: number,
  heightCm: number,
  quantity: number,
  pricePerCm2: number
) {
  const area = widthCm * heightCm;
  const unitPrice = area * (pricePerCm2 || 0);
  const totalPrice = unitPrice * quantity;
  return { widthCm, heightCm, area, quantity, pricePerCm2, unitPrice, totalPrice };
}

export function getClicheSellPerCm2(sellByDoc: Record<string, StampSellDoc>) {
  const doc = sellByDoc.Stamps_cliche;
  return Number(doc?.sellPricePerCm2 ?? 0.015);
}

export function getSerialAddonPrice(
  band: StampBand,
  sellByDoc: Record<string, StampSellDoc>
) {
  if (band === "cliche_only") return 0;
  const doc = sellByDoc[stampSerialDocId(band)];
  return Number(doc?.sellSerialAddonPrice ?? 0);
}

export function buildStampSizeOptions(
  band: "automatic_machine" | "wooden_handle",
  sellByDoc: Record<string, StampSellDoc>
) {
  const sizes = STAMP_DEFAULT_SIZES[band] || [];
  return sizes.map((s) => {
    const docId = stampDocId(band, s.sizeId);
    const doc = sellByDoc[docId];
    return {
      sizeId: s.sizeId,
      docId,
      nameAr: (doc?.productNameAr as string) || s.productNameAr,
      nameEn: (doc?.productName as string) || s.productName,
      doc: doc || {},
    };
  });
}

export function calculateStampOrder(params: {
  band: StampBand;
  variant: StampVariant;
  quantity: number;
  sizeDoc?: StampSellDoc;
  serialAddon?: number;
  inkColor?: InkColor;
  clicheWidthCm?: number;
  clicheHeightCm?: number;
  clichePerCm2?: number;
}) {
  const qty = Math.max(1, params.quantity);
  const band = params.band;

  if (band === "cliche_only") {
    const w = params.clicheWidthCm ?? 0;
    const h = params.clicheHeightCm ?? 0;
    if (w <= 0 || h <= 0) {
      return { unitPrice: 0, inkPrice: 0, totalPrice: 0, valid: false as const };
    }
    const calc = calculateCliche(w, h, qty, params.clichePerCm2 ?? 0.015);
    return {
      unitPrice: calc.unitPrice,
      inkPrice: 0,
      totalPrice: calc.totalPrice,
      valid: true as const,
      area: calc.area,
    };
  }

  const data = params.sizeDoc;
  if (!data) {
    return { unitPrice: 0, inkPrice: 0, totalPrice: 0, valid: false as const };
  }

  const isMachine = band === "automatic_machine";
  const variant = params.variant;

  let unitPrice = 0;
  if (variant === "serial") {
    unitPrice = params.serialAddon ?? 0;
  } else if (variant === "stamp") {
    unitPrice = isMachine
      ? Number(data.sellPriceMachineStamp ?? 0)
      : Number(data.sellPriceHandleStamp ?? 0);
  } else {
    unitPrice = isMachine
      ? Number(data.sellPriceMachineOnly ?? 0)
      : Number(data.sellPriceHandleOnly ?? 0);
  }

  const inkPrices = data.sellInkPrices as Record<string, number> | undefined;
  const inkPrice =
    isMachine && variant !== "serial"
      ? Number(inkPrices?.[params.inkColor ?? "black"] ?? 0)
      : 0;

  const unitWithExtras = unitPrice + inkPrice;
  return {
    unitPrice: unitWithExtras,
    inkPrice,
    baseUnitPrice: unitPrice,
    totalPrice: unitWithExtras * qty,
    valid: true as const,
  };
}

export function formatStampSummary(
  locale: string,
  params: {
    band: StampBand;
    variant: StampVariant;
    sizeNameAr?: string;
    sizeNameEn?: string;
    inkColor?: InkColor;
    widthCm?: number;
    heightCm?: number;
  }
) {
  const isAr = locale === "ar";
  const bandLabels: Record<StampBand, { ar: string; en: string }> = {
    automatic_machine: { ar: "ماكينة أوتوماتيك", en: "Automatic machine" },
    wooden_handle: { ar: "مقبض خشبي", en: "Wooden handle" },
    cliche_only: { ar: "كليشيه فقط", en: "Cliché only" },
  };

  if (params.band === "cliche_only") {
    const dims = `${params.widthCm}×${params.heightCm} ${isAr ? "سم" : "cm"}`;
    return isAr
      ? `${bandLabels.cliche_only.ar} — ${dims}`
      : `${bandLabels.cliche_only.en} — ${dims}`;
  }

  const isMachine = params.band === "automatic_machine";
  const variantLabels: Record<StampVariant, { ar: string; en: string }> = {
    only: isMachine
      ? { ar: "ماكينة فقط", en: "Machine only" }
      : { ar: "مقبض فقط", en: "Handle only" },
    stamp: isMachine
      ? { ar: "ماكينة + ختم", en: "Machine + stamp" }
      : { ar: "مقبض + ختم", en: "Handle + stamp" },
    serial: { ar: "سيريال", en: "Serial" },
  };

  const inkLabels: Record<InkColor, { ar: string; en: string }> = {
    black: { ar: "أسود", en: "Black" },
    red: { ar: "أحمر", en: "Red" },
    green: { ar: "أخضر", en: "Green" },
  };

  const parts = [
    isAr ? bandLabels[params.band].ar : bandLabels[params.band].en,
    isAr ? params.sizeNameAr : params.sizeNameEn,
    isAr ? variantLabels[params.variant].ar : variantLabels[params.variant].en,
  ].filter(Boolean);

  if (isMachine && params.variant !== "serial" && params.inkColor) {
    parts.push(isAr ? inkLabels[params.inkColor].ar : inkLabels[params.inkColor].en);
  }

  return parts.join(" · ");
}
