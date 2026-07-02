import {
  ENVELOPE_PLATE_PRICE_DEFAULT,
  getEnvelopeTierForQuantity,
} from "./envelope-catalog";

export type EnvelopeSellDoc = {
  quantityTiers?: Record<string, number>;
  platePricePerColor?: number;
  inkjetPricePerSheetOneColor?: number;
  inkjetPricePerSheetFullColor?: number;
};

export function calculateEnvelopePrice(params: {
  printingType: "offset" | "inkjet";
  colorOption: "one" | "full";
  quantity: number;
  sellDoc: EnvelopeSellDoc;
}) {
  const { printingType, colorOption, sellDoc } = params;
  let quantity = Math.max(1, Math.floor(params.quantity));
  const numColors = colorOption === "full" ? 4 : 1;
  const platePrice = sellDoc.platePricePerColor ?? ENVELOPE_PLATE_PRICE_DEFAULT;

  if (printingType === "offset") {
    const tier = getEnvelopeTierForQuantity(quantity);
    quantity = tier;
    const tierPrice = Number(sellDoc.quantityTiers?.[String(tier)] ?? 0);
    const plateCost = numColors * platePrice;
    return {
      totalPrice: tierPrice + plateCost,
      tier,
      tierPrice,
      plateCost,
      billedQuantity: tier,
      valid: tierPrice + plateCost > 0,
    };
  }

  const pricePerSheet =
    colorOption === "full"
      ? Number(sellDoc.inkjetPricePerSheetFullColor ?? 0)
      : Number(sellDoc.inkjetPricePerSheetOneColor ?? 0);

  return {
    totalPrice: pricePerSheet * quantity,
    tier: null,
    tierPrice: 0,
    plateCost: 0,
    billedQuantity: quantity,
    valid: pricePerSheet > 0 && quantity > 0,
  };
}

export function formatEnvelopeSummary(
  locale: string,
  params: {
    sizeNameAr?: string;
    sizeNameEn?: string;
    printingType: "offset" | "inkjet";
    colorOption: "one" | "full";
    tier?: number | null;
  }
) {
  const isAr = locale === "ar";
  const printLabel =
    params.printingType === "offset"
      ? isAr
        ? "أوفست"
        : "Offset"
      : isAr
        ? "إنك جيت"
        : "Inkjet";
  const colorLabel =
    params.colorOption === "full"
      ? isAr
        ? "4 ألوان"
        : "Full color"
      : isAr
        ? "لون واحد"
        : "One color";
  const size = isAr ? params.sizeNameAr : params.sizeNameEn;
  const tierPart =
    params.tier && params.printingType === "offset"
      ? ` · ${isAr ? "شريحة" : "tier"} ${params.tier}`
      : "";
  return [size, printLabel, colorLabel].filter(Boolean).join(" · ") + tierPart;
}
