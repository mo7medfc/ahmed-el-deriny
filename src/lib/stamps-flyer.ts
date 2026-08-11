/** Fixed stamp price-list from the shop flyer (الأختام). */

export type StampFlyerOption = {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  image: string;
  widthCm?: number;
  heightCm?: number;
};

export const STAMP_FLYER_OPTIONS: StampFlyerOption[] = [
  {
    id: "wood-hand",
    nameAr: "ختم يد خشب 5.5 × 2.2",
    nameEn: "Wooden hand stamp 5.5 × 2.2",
    price: 140,
    image: "/images/products/stamp-wood-hand.jpg",
    widthCm: 5.5,
    heightCm: 2.2,
  },
  {
    id: "auto-small",
    nameAr: "ختم أتوماتيك صغير 3 × 1",
    nameEn: "Small automatic stamp 3 × 1",
    price: 155,
    image: "/images/products/stamp-auto-small.jpg",
    widthCm: 3,
    heightCm: 1,
  },
  {
    id: "auto-medium",
    nameAr: "ختم أتوماتيك وسط 4 × 1.5",
    nameEn: "Medium automatic stamp 4 × 1.5",
    price: 160,
    image: "/images/products/stamp-auto-medium.jpg",
    widthCm: 4,
    heightCm: 1.5,
  },
  {
    id: "auto-large",
    nameAr: "ختم أتوماتيك كبير 5.5 × 2.2",
    nameEn: "Large automatic stamp 5.5 × 2.2",
    price: 165,
    image: "/images/products/stamp-auto-large.jpg",
    widthCm: 5.5,
    heightCm: 2.2,
  },
  {
    id: "round-4",
    nameAr: "ختم مدور 4 × 4",
    nameEn: "Round stamp 4 × 4",
    price: 450,
    image: "/images/products/stamp-round-4.jpg",
    widthCm: 4,
    heightCm: 4,
  },
  {
    id: "round-5",
    nameAr: "ختم مدور 5 × 5",
    nameEn: "Round stamp 5 × 5",
    price: 950,
    image: "/images/products/stamp-round-5.jpg",
    widthCm: 5,
    heightCm: 5,
  },
  {
    id: "rect-3x7",
    nameAr: "ختم 3 × 7",
    nameEn: "Stamp 3 × 7",
    price: 460,
    image: "/images/products/stamp-rect-3x7.jpg",
    widthCm: 3,
    heightCm: 7,
  },
  {
    id: "date-only",
    nameAr: "ختم تاريخ فقط",
    nameEn: "Date stamp only",
    price: 250,
    image: "/images/products/stamp-date-only.jpg",
  },
  {
    id: "date-company",
    nameAr: "ختم تاريخ + اسم الشركة",
    nameEn: "Date + company name stamp",
    price: 850,
    image: "/images/products/stamp-date-company.jpg",
  },
  {
    id: "embosser",
    nameAr: "ماكينة ضاغط بالأكلاشية",
    nameEn: "Embossing press with die",
    price: 2400,
    image: "/images/products/stamp-embosser.jpg",
  },
  {
    id: "cliche-only",
    nameAr: "سريلة فقط بدون ماكينة",
    nameEn: "Rubber die only (no machine)",
    price: 120,
    image: "/images/products/stamp-cliche-only.jpg",
  },
  {
    id: "square-4",
    nameAr: "ختم مربع 4 × 4",
    nameEn: "Square stamp 4 × 4",
    price: 450,
    image: "/images/products/stamp-square-4.jpg",
    widthCm: 4,
    heightCm: 4,
  },
  {
    id: "pocket",
    nameAr: "ختم الجيب",
    nameEn: "Pocket stamp",
    price: 250,
    image: "/images/products/stamp-pocket.jpg",
  },
];

export function getStampFlyerOption(id: string | null | undefined): StampFlyerOption | undefined {
  if (!id) return undefined;
  return STAMP_FLYER_OPTIONS.find((o) => o.id === id);
}

export function stampProductSlug(id: string): string {
  return `stamps-${id}`;
}
