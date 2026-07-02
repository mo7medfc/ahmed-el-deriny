export const PAPER_WEIGHTS = [
  { id: "60", nameAr: "60 جرام" },
  { id: "70", nameAr: "70 جرام" },
  { id: "80", nameAr: "80 جرام" },
  { id: "100", nameAr: "100 جرام" },
  { id: "120", nameAr: "120 جرام" },
];

export const DAFATER_PROFIT_TIERS = [
  { min: 0, max: 1000, percent: 30 },
  { min: 1000, max: 3000, percent: 25 },
  { min: 3000, max: 7000, percent: 20 },
  { min: 7000, max: null as number | null, percent: 15 },
];

export const STAMP_BANDS = [
  { id: "automatic_machine", nameAr: "ماكينة أوتوماتيك" },
  { id: "wooden_handle", nameAr: "مقبض خشبي" },
  { id: "cliche_only", nameAr: "كليشيه فقط" },
];

export const STAMP_DEFAULT_SIZES: Record<
  string,
  Array<{ sizeId: string; productNameAr: string; productName: string }>
> = {
  automatic_machine: [
    { sizeId: "rect-1.5-4", productNameAr: "مستطيل 1.5 × 4 سم", productName: "Rectangular 1.5 × 4 cm" },
    { sizeId: "rect-5-2", productNameAr: "مستطيل 5 × 2 سم", productName: "Rectangular 5 × 2 cm" },
    { sizeId: "rect-6-3", productNameAr: "مستطيل 6 × 3 سم", productName: "Rectangular 6 × 3 cm" },
    { sizeId: "rect-7-3", productNameAr: "مستطيل 7 × 3 سم", productName: "Rectangular 7 × 3 cm" },
    { sizeId: "oval-5-2", productNameAr: "بيضاوي 5 × 2 سم", productName: "Oval 5 × 2 cm" },
    { sizeId: "oval-5-3", productNameAr: "بيضاوي 5 × 3 سم", productName: "Oval 5 × 3 cm" },
    { sizeId: "oval-6-3", productNameAr: "بيضاوي 6 × 3 سم", productName: "Oval 6 × 3 cm" },
    { sizeId: "square-4-4", productNameAr: "مربع 4 × 4 سم", productName: "Square 4 × 4 cm" },
    { sizeId: "round-4-4", productNameAr: "دائري 4 × 4 سم", productName: "Round 4 × 4 cm" },
    { sizeId: "round-5-5", productNameAr: "دائري 5 × 5 سم", productName: "Round 5 × 5 cm" },
  ],
  wooden_handle: [
    { sizeId: "rect-1.5-4", productNameAr: "مستطيل 1.5 × 4 سم", productName: "Rectangular 1.5 × 4 cm" },
    { sizeId: "rect-5-2", productNameAr: "مستطيل 5 × 2 سم", productName: "Rectangular 5 × 2 cm" },
    { sizeId: "rect-6-3", productNameAr: "مستطيل 6 × 3 سم", productName: "Rectangular 6 × 3 cm" },
    { sizeId: "rect-7-3", productNameAr: "مستطيل 7 × 3 سم", productName: "Rectangular 7 × 3 cm" },
    { sizeId: "oval-5-2", productNameAr: "بيضاوي 5 × 2 سم", productName: "Oval 5 × 2 cm" },
    { sizeId: "oval-6-3", productNameAr: "بيضاوي 6 × 3 سم", productName: "Oval 6 × 3 cm" },
    { sizeId: "square-4-4", productNameAr: "مربع 4 × 4 سم", productName: "Square 4 × 4 cm" },
    { sizeId: "round-4-4", productNameAr: "دائري 4 × 4 سم", productName: "Round 4 × 4 cm" },
    { sizeId: "square-5-5", productNameAr: "مربع 5 × 5 سم", productName: "Square 5 × 5 cm" },
    { sizeId: "round-5-5", productNameAr: "دائري 5 × 5 سم", productName: "Round 5 × 5 cm" },
  ],
};

export const NBB_COVER_PAPERS = [
  { id: "coated_150", nameAr: "كوشيه 150 جرام" },
  { id: "coated_200", nameAr: "كوشيه 200 جرام" },
  { id: "coated_250", nameAr: "كوشيه 250 جرام" },
  { id: "coated_300", nameAr: "كوشيه 300 جرام" },
  { id: "coated_350", nameAr: "كوشيه 350 جرام" },
  { id: "bristol_coated_350", nameAr: "بريستول كوشيه 350 جرام" },
];

export const NBB_INK_PAPERS = [
  { id: "60g", nameAr: "60 جم" },
  { id: "70g", nameAr: "70 جم" },
  { id: "80g", nameAr: "80 جم" },
  { id: "100g", nameAr: "100 جم" },
  { id: "120g", nameAr: "120 جم" },
  { id: "concord_white", nameAr: "كونكورد أبيض" },
  { id: "concord_beige", nameAr: "كونكورد بيج" },
  { id: "fabriano_white", nameAr: "فابريانو أبيض" },
  { id: "fabriano_cream", nameAr: "فابريانو كريمي" },
  { id: "woodfree_white", nameAr: "وود فري أبيض" },
  { id: "woodfree_cream", nameAr: "وود فري كريمي" },
  { id: "opaline_white", nameAr: "أوبالين أبيض" },
  { id: "linen_white", nameAr: "لينن أبيض" },
  { id: "linen_cream", nameAr: "لينن كريمي" },
];

export const NBB_FINISHING_TYPES = [
  { id: "wire_top", nameAr: "سلك من أعلى" },
  { id: "wire_side", nameAr: "سلك جانب" },
  { id: "staple", nameAr: "دبوس" },
  { id: "perfect_binding", nameAr: "بشر" },
  { id: "hardcover_binding", nameAr: "تجليد جلد" },
];

export const NBB_INK_RATE_KEYS = [
  { id: "one_fixed", nameAr: "لون واحد - ثابت" },
  { id: "one_variable", nameAr: "لون واحد - متغير" },
  { id: "full_fixed", nameAr: "ألوان - ثابت" },
  { id: "full_variable", nameAr: "ألوان - متغير" },
];

export const NOTEBOOKS_INVOICES_OFFSET_TYPES = [
  { id: "1", nameAr: "أصل وصورة" },
  { id: "2", nameAr: "أصل وصورتين" },
  { id: "3", nameAr: "أصل و 3 صورة" },
  { id: "4", nameAr: "أصل و 4 صورة" },
  { id: "5", nameAr: "أصل و 5 صورة" },
  { id: "6", nameAr: "أصل و 6 صورة" },
  { id: "7", nameAr: "أصل و 7 صورة" },
  { id: "8", nameAr: "أصل و 8 صورة" },
  { id: "60", nameAr: "ورق 60 جرام" },
  { id: "70", nameAr: "ورق 70 جرام" },
  { id: "80", nameAr: "ورق 80 جرام" },
  { id: "100", nameAr: "ورق 100 جرام" },
  { id: "120", nameAr: "ورق 120 جرام" },
];

export function stampDocId(bandId: string, sizeId: string) {
  if (bandId === "cliche_only") return "Stamps_cliche";
  return `Stamps_${bandId}_${sizeId}`;
}

export function stampSerialDocId(bandId: string) {
  return `Stamps_${bandId}_serial_addon`;
}
