"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { formatPrice, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useRouter } from "@/i18n/navigation";
import { publicPath } from "@/lib/public-path";
import {
  STAMP_FLYER_OPTIONS,
  getStampFlyerOption,
  stampProductSlug,
} from "@/lib/stamps-flyer";
import { OrderExtras, useDesignUpload } from "./OrderExtras";

interface FlyerStampsConfiguratorProps {
  product: {
    id: string;
    slug: string;
    nameAr: string;
    nameEn: string;
    legacyId: string | null;
    basePrice: number;
    minQuantity: number;
    pricingCategory: string | null;
  };
}

export function FlyerStampsConfigurator({ product }: FlyerStampsConfiguratorProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const { designFile, designFileName, uploading, handleUpload, setDesignFromUrl } =
    useDesignUpload(isAr);

  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(Math.max(1, product.minQuantity || 1));
  const [notes, setNotes] = useState("");

  const selected =
    getStampFlyerOption(product.legacyId) ||
    STAMP_FLYER_OPTIONS.find((o) => product.slug.endsWith(o.id)) ||
    STAMP_FLYER_OPTIONS[0];

  const unitPrice = selected?.price ?? product.basePrice;
  const totalPrice = unitPrice * quantity;
  const productDisplayName = isAr
    ? selected?.nameAr || product.nameAr
    : selected?.nameEn || product.nameEn;

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const configurationSummary = useMemo(() => {
    const size =
      selected?.widthCm && selected?.heightCm
        ? `${selected.widthCm}×${selected.heightCm} cm · `
        : "";
    return `${size}${quantity} ${isAr ? "قطعة" : "pcs"}`;
  }, [selected, quantity, isAr]);

  const selectStamp = (id: string) => {
    setOpen(false);
    if (id === selected?.id) return;
    router.push(`/products/${stampProductSlug(id)}`);
  };

  const handleAddToCart = () => {
    if (!selected) return;
    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: productDisplayName,
      quantity,
      selectedOptions: [
        {
          id: selected.id,
          name: productDisplayName,
          priceAddon: 0,
        },
      ],
      unitPrice,
      totalPrice,
      designFile: designFile || undefined,
      designFileName: designFileName || undefined,
      notes: notes || undefined,
    });
  };

  if (!selected) return null;

  return (
    <div className="heritage-card rounded-sm p-6 lg:p-8 space-y-6">
      <h2 className="text-xl font-display font-bold text-brand-900">
        {isAr ? "اختر نوع الختم" : "Choose stamp type"}
      </h2>

      <div ref={rootRef} className="relative">
        <p className="text-sm font-medium text-brand-700 mb-2">
          {isAr ? "الأختام" : "Stamps"}
        </p>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-xl border text-start transition-colors",
            open
              ? "border-brand-500 bg-brand-500/5"
              : "border-brand-200 hover:border-brand-300 bg-white"
          )}
        >
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-brand-100 bg-brand-50">
            <Image
              src={publicPath(selected.image)}
              alt={productDisplayName}
              fill
              className="object-contain p-1"
              sizes="56px"
            />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-medium text-brand-900 truncate">
              {productDisplayName}
            </span>
            <span className="block text-xs text-brand-500 mt-0.5">
              {formatPrice(unitPrice, locale)}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-brand-500 shrink-0 transition-transform",
              open && "rotate-180"
            )}
          />
        </button>

        {open && (
          <ul
            id={listId}
            role="listbox"
            aria-label={isAr ? "قائمة الأختام" : "Stamp list"}
            className="absolute z-30 mt-2 w-full max-h-80 overflow-auto rounded-xl border border-brand-200 bg-white shadow-lg py-1"
          >
            {STAMP_FLYER_OPTIONS.map((option) => {
              const label = isAr ? option.nameAr : option.nameEn;
              const active = option.id === selected.id;
              return (
                <li key={option.id} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => selectStamp(option.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-start transition-colors",
                      active ? "bg-brand-500/10" : "hover:bg-brand-50"
                    )}
                  >
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-brand-100 bg-brand-50">
                      <Image
                        src={publicPath(option.image)}
                        alt={label}
                        fill
                        className="object-contain p-0.5"
                        sizes="48px"
                      />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm text-brand-900 leading-snug">
                        {label}
                      </span>
                      <span className="block text-xs text-brand-500 mt-0.5">
                        {formatPrice(option.price, locale)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Input
        label={isAr ? "الكمية" : "Quantity"}
        type="number"
        min={product.minQuantity || 1}
        value={quantity}
        onChange={(e) =>
          setQuantity(Math.max(product.minQuantity || 1, Number(e.target.value) || 1))
        }
      />

      <OrderExtras
        locale={locale}
        notes={notes}
        onNotesChange={setNotes}
        designFile={designFile}
        designFileName={designFileName}
        uploading={uploading}
        onUpload={handleUpload}
        totalPrice={totalPrice}
        onAddToCart={handleAddToCart}
        productName={productDisplayName}
        productSlug={product.slug}
        pricingCategory={product.pricingCategory}
        configurationSummary={configurationSummary}
        configurationState={{
          category: "Stamps",
          productSlug: product.slug,
          productName: productDisplayName,
          pricingType: "per_unit",
          stampId: selected.id,
          widthCm: selected.widthCm,
          heightCm: selected.heightCm,
          quantity,
        }}
        onDesignFromAi={setDesignFromUrl}
      />
    </div>
  );
}
