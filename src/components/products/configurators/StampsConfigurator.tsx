"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import {
  buildStampSizeOptions,
  calculateStampOrder,
  formatStampSummary,
  getClicheSellPerCm2,
  getSerialAddonPrice,
  type InkColor,
  type StampBand,
  type StampSellDoc,
  type StampVariant,
} from "@/lib/pricing/stamps-calculator";
import { getPricingFetchUrl } from "@/lib/pricing-url";
import { OrderExtras, useDesignUpload } from "./OrderExtras";
import { parseStampSizeId } from "@/lib/ai/design-studio";

interface StampsConfiguratorProps {
  product: {
    id: string;
    slug: string;
    nameAr: string;
    nameEn: string;
    minQuantity: number;
  };
}

export function StampsConfigurator({ product }: StampsConfiguratorProps) {
  const locale = useLocale();
  const addItem = useCartStore((s) => s.addItem);
  const isAr = locale === "ar";
  const { designFile, designFileName, uploading, handleUpload, setDesignFromUrl } = useDesignUpload(isAr);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sellByDoc, setSellByDoc] = useState<Record<string, StampSellDoc>>({});

  const [band, setBand] = useState<StampBand>("automatic_machine");
  const [sizeDocId, setSizeDocId] = useState("");
  const [variant, setVariant] = useState<StampVariant>("only");
  const [inkColor, setInkColor] = useState<InkColor>("black");
  const [clicheWidth, setClicheWidth] = useState(3);
  const [clicheHeight, setClicheHeight] = useState(3);
  const [quantity, setQuantity] = useState(product.minQuantity || 1);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch(getPricingFetchUrl("Stamps"))
      .then(async (r) => {
        if (!r.ok) throw new Error("pricing");
        return r.json();
      })
      .then((d: { sellByDoc: Record<string, StampSellDoc> }) => {
        setSellByDoc(d.sellByDoc || {});
      })
      .catch(() => setError(isAr ? "تعذر تحميل أسعار الأختام" : "Failed to load stamp prices"))
      .finally(() => setLoading(false));
  }, [isAr]);

  const sizeOptions = useMemo(() => {
    if (band === "cliche_only") return [];
    return buildStampSizeOptions(band, sellByDoc);
  }, [band, sellByDoc]);

  useEffect(() => {
    if (band === "cliche_only") {
      setSizeDocId("");
      return;
    }
    if (sizeOptions.length && !sizeOptions.some((s) => s.docId === sizeDocId)) {
      setSizeDocId(sizeOptions[0]?.docId || "");
    }
  }, [band, sizeOptions, sizeDocId]);

  const selectedSize = sizeOptions.find((s) => s.docId === sizeDocId);
  const clichePerCm2 = getClicheSellPerCm2(sellByDoc);
  const serialAddon =
    band !== "cliche_only" ? getSerialAddonPrice(band, sellByDoc) : 0;

  const pricing = calculateStampOrder({
    band,
    variant,
    quantity,
    sizeDoc: selectedSize?.doc,
    serialAddon,
    inkColor,
    clicheWidthCm: clicheWidth,
    clicheHeightCm: clicheHeight,
    clichePerCm2,
  });

  const showInk = band === "automatic_machine" && variant !== "serial";

  const handleAddToCart = () => {
    if (!pricing.valid) return;

    const summary = formatStampSummary(locale, {
      band,
      variant,
      sizeNameAr: selectedSize?.nameAr,
      sizeNameEn: selectedSize?.nameEn,
      inkColor: showInk ? inkColor : undefined,
      widthCm: band === "cliche_only" ? clicheWidth : undefined,
      heightCm: band === "cliche_only" ? clicheHeight : undefined,
    });

    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: isAr ? product.nameAr : product.nameEn,
      quantity,
      selectedOptions: [],
      unitPrice: pricing.unitPrice,
      totalPrice: pricing.totalPrice,
      designFile: designFile || undefined,
      designFileName: designFileName || undefined,
      notes: notes || undefined,
      configuration: {
        type: "stamps",
        band,
        sizeId: selectedSize?.sizeId,
        sizeDocId: sizeDocId || undefined,
        variant,
        inkColor: showInk ? inkColor : undefined,
        widthCm: band === "cliche_only" ? clicheWidth : undefined,
        heightCm: band === "cliche_only" ? clicheHeight : undefined,
        summary,
      },
    });
  };

  const variantOnlyLabel =
    band === "automatic_machine"
      ? isAr
        ? "ماكينة فقط"
        : "Machine only"
      : isAr
        ? "مقبض فقط"
        : "Handle only";
  const variantStampLabel =
    band === "automatic_machine"
      ? isAr
        ? "ماكينة + ختم"
        : "Machine + stamp"
      : isAr
        ? "مقبض + ختم"
        : "Handle + stamp";

  if (loading) {
    return (
      <div className="heritage-card rounded-sm p-8 flex items-center justify-center min-h-[320px]">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="heritage-card rounded-sm p-8 text-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="heritage-card rounded-sm p-6 lg:p-8 space-y-6">
      <h2 className="text-xl font-display font-bold text-brand-900">
        {isAr ? "تخصيص الطلب" : "Configure order"}
      </h2>

      <div>
        <label className="block text-sm font-medium text-brand-700 mb-1.5">
          {isAr ? "النوع" : "Type"} <span className="text-red-400">*</span>
        </label>
        <select
          value={band}
          onChange={(e) => setBand(e.target.value as StampBand)}
          className="w-full px-4 py-3 rounded-sm bg-white border border-brand-200 text-brand-900 focus:border-gold-500/40 outline-none"
        >
          <option value="automatic_machine">{isAr ? "ماكينة أوتوماتيك" : "Automatic machine"}</option>
          <option value="wooden_handle">{isAr ? "مقبض خشبي" : "Wooden handle"}</option>
          <option value="cliche_only">{isAr ? "كليشيه فقط" : "Cliché only"}</option>
        </select>
      </div>

      {band !== "cliche_only" && (
        <div>
          <label className="block text-sm font-medium text-brand-700 mb-1.5">
            {isAr ? "المقاس" : "Size"} <span className="text-red-400">*</span>
          </label>
          <select
            value={sizeDocId}
            onChange={(e) => setSizeDocId(e.target.value)}
            className="w-full px-4 py-3 rounded-sm bg-white border border-brand-200 text-brand-900 focus:border-gold-500/40 outline-none"
          >
            {sizeOptions.map((s) => (
              <option key={s.docId} value={s.docId}>
                {isAr ? s.nameAr : s.nameEn}
              </option>
            ))}
          </select>
        </div>
      )}

      {band !== "cliche_only" && (
        <div>
          <p className="text-sm font-medium text-brand-700 mb-3">{isAr ? "الخيار" : "Variant"}</p>
          <div className="flex flex-wrap gap-4">
            {(
              [
                { value: "only", label: variantOnlyLabel },
                { value: "stamp", label: variantStampLabel },
                { value: "serial", label: isAr ? "سيريال" : "Serial" },
              ] as const
            ).map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-brand-800">
                <input
                  type="radio"
                  name="stampVariant"
                  value={opt.value}
                  checked={variant === opt.value}
                  onChange={() => setVariant(opt.value)}
                  className="accent-gold-500"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {showInk && (
        <div>
          <label className="block text-sm font-medium text-brand-700 mb-1.5">
            {isAr ? "لون الحبر" : "Ink color"}
          </label>
          <select
            value={inkColor}
            onChange={(e) => setInkColor(e.target.value as InkColor)}
            className="w-full px-4 py-3 rounded-sm bg-white border border-brand-200 text-brand-900 focus:border-gold-500/40 outline-none"
          >
            <option value="black">{isAr ? "أسود" : "Black"}</option>
            <option value="red">{isAr ? "أحمر" : "Red"}</option>
            <option value="green">{isAr ? "أخضر" : "Green"}</option>
          </select>
        </div>
      )}

      {band === "cliche_only" && (
        <div>
          <p className="text-sm font-medium text-brand-700 mb-3">
            {isAr ? "الأبعاد (سم)" : "Dimensions (cm)"}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={isAr ? "العرض" : "Width"}
              type="number"
              step="0.1"
              min={0.1}
              value={clicheWidth}
              onChange={(e) => setClicheWidth(Number(e.target.value))}
            />
            <Input
              label={isAr ? "الارتفاع" : "Height"}
              type="number"
              step="0.1"
              min={0.1}
              value={clicheHeight}
              onChange={(e) => setClicheHeight(Number(e.target.value))}
            />
          </div>
        </div>
      )}

      <Input
        label={isAr ? "الكمية" : "Quantity"}
        type="number"
        min={product.minQuantity || 1}
        value={quantity}
        onChange={(e) => setQuantity(Math.max(product.minQuantity || 1, Number(e.target.value)))}
      />

      {pricing.valid && (
        <div className="rounded-sm bg-white border border-brand-200 p-4 space-y-1 text-sm text-brand-700">
          {band === "cliche_only" && "area" in pricing && typeof pricing.area === "number" && (
            <div className="flex justify-between">
              <span>{isAr ? "المساحة" : "Area"}</span>
              <span>{pricing.area.toFixed(2)} {isAr ? "سم²" : "cm²"}</span>
            </div>
          )}
          {"baseUnitPrice" in pricing && (pricing.baseUnitPrice ?? 0) > 0 && (
            <div className="flex justify-between">
              <span>{isAr ? "سعر الأساس" : "Base price"}</span>
              <span>{formatPrice(pricing.baseUnitPrice ?? 0, locale)}</span>
            </div>
          )}
          {"inkPrice" in pricing && pricing.inkPrice > 0 && (
            <div className="flex justify-between">
              <span>{isAr ? "الحبر" : "Ink"}</span>
              <span>{formatPrice(pricing.inkPrice, locale)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>{isAr ? "سعر الوحدة" : "Unit price"}</span>
            <span>{formatPrice(pricing.unitPrice, locale)}</span>
          </div>
        </div>
      )}

      <OrderExtras
        locale={locale}
        notes={notes}
        onNotesChange={setNotes}
        designFile={designFile}
        designFileName={designFileName}
        uploading={uploading}
        onUpload={handleUpload}
        totalPrice={pricing.valid ? pricing.totalPrice : 0}
        onAddToCart={handleAddToCart}
        disabled={!pricing.valid}
        productName={isAr ? product.nameAr : product.nameEn}
        productSlug={product.slug}
        pricingCategory="Stamps"
        configurationSummary={
          pricing.valid
            ? formatStampSummary(locale, {
                band,
                variant,
                sizeNameAr: selectedSize?.nameAr,
                sizeNameEn: selectedSize?.nameEn,
                inkColor: showInk ? inkColor : undefined,
                widthCm: band === "cliche_only" ? clicheWidth : undefined,
                heightCm: band === "cliche_only" ? clicheHeight : undefined,
              })
            : undefined
        }
        configurationState={{
          category: "Stamps",
          productSlug: product.slug,
          productName: isAr ? product.nameAr : product.nameEn,
          band,
          bandLabel: isAr
            ? band === "automatic_machine"
              ? "ماكينة أوتوماتيك"
              : band === "wooden_handle"
                ? "مقبض خشبي"
                : "كليشيه فقط"
            : band === "automatic_machine"
              ? "Automatic machine"
              : band === "wooden_handle"
                ? "Wooden handle"
                : "Cliche only",
          sizeLabel: isAr ? selectedSize?.nameAr : selectedSize?.nameEn,
          sizeId: selectedSize?.sizeId,
          variant,
          variantLabel:
            variant === "only"
              ? variantOnlyLabel
              : variant === "stamp"
                ? variantStampLabel
                : isAr
                  ? "سيريال"
                  : "Serial",
          inkColor: showInk ? inkColor : undefined,
          quantity,
          ...(band === "cliche_only"
            ? { widthCm: clicheWidth, heightCm: clicheHeight }
            : parseStampSizeId(selectedSize?.sizeId)),
        }}
        onDesignFromAi={setDesignFromUrl}
      />
    </div>
  );
}
