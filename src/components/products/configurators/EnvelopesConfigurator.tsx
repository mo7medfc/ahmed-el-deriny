"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Input } from "@/components/ui/Input";
import { useCartStore } from "@/store/cart";
import {
  calculateEnvelopePrice,
  formatEnvelopeSummary,
  type EnvelopeSellDoc,
} from "@/lib/pricing/envelopes-calculator";
import {
  ENVELOPE_OFFSET_MIN,
  ENVELOPE_PRODUCTS,
} from "@/lib/pricing/envelope-catalog";
import {
  ConfiguratorShell,
  OrderExtras,
  selectClassName,
  useDesignUpload,
} from "./OrderExtras";
import { getPricingFetchUrl } from "@/lib/pricing-url";

export function EnvelopesConfigurator({
  product,
  defaultSizeId,
}: {
  product: { id: string; slug: string; nameAr: string; nameEn: string; legacyId?: string | null };
  defaultSizeId?: string | null;
}) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const addItem = useCartStore((s) => s.addItem);
  const { designFile, designFileName, uploading, handleUpload, setDesignFromUrl } = useDesignUpload(isAr);

  const [sellByDoc, setSellByDoc] = useState<Record<string, EnvelopeSellDoc>>({});
  const [loading, setLoading] = useState(true);
  const initialSize = defaultSizeId || product.legacyId || ENVELOPE_PRODUCTS[0].id;
  const [sizeId, setSizeId] = useState(initialSize);
  const [printingType, setPrintingType] = useState<"offset" | "inkjet">("offset");
  const [colorOption, setColorOption] = useState<"one" | "full">("one");
  const [quantity, setQuantity] = useState(ENVELOPE_OFFSET_MIN);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch(getPricingFetchUrl("envelopes"))
      .then((r) => r.json())
      .then((d) => setSellByDoc(d.sellByDoc || {}))
      .finally(() => setLoading(false));
  }, []);

  const selectedProduct = ENVELOPE_PRODUCTS.find((p) => p.id === sizeId);
  const supportsInkjet = selectedProduct?.supportsInkjet ?? false;

  useEffect(() => {
    if (!supportsInkjet && printingType === "inkjet") setPrintingType("offset");
  }, [supportsInkjet, printingType]);

  const sellDoc = sellByDoc[sizeId] || {};
  const pricing = useMemo(
    () =>
      calculateEnvelopePrice({
        printingType,
        colorOption,
        quantity,
        sellDoc,
      }),
    [printingType, colorOption, quantity, sellDoc]
  );

  const addToCart = () => {
    if (!pricing.valid || !selectedProduct) return;
    const summary = formatEnvelopeSummary(locale, {
      sizeNameAr: selectedProduct.nameAr,
      sizeNameEn: selectedProduct.nameEn,
      printingType,
      colorOption,
      tier: pricing.tier,
    });
    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: isAr ? product.nameAr : product.nameEn,
      quantity: pricing.billedQuantity,
      selectedOptions: [],
      unitPrice: pricing.totalPrice / pricing.billedQuantity,
      totalPrice: pricing.totalPrice,
      designFile: designFile || undefined,
      designFileName: designFileName || undefined,
      notes: notes || undefined,
      configuration: { type: "envelopes", sizeId, printingType, colorOption, summary },
    });
  };

  if (loading) {
    return (
      <div className="heritage-card rounded-sm p-8 flex justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ConfiguratorShell title={isAr ? "تخصيص الطلب" : "Configure order"}>
      <div>
        <label className="block text-sm font-medium text-dark-200 mb-1">{isAr ? "مقاس الظرف" : "Envelope size"}</label>
        <select value={sizeId} onChange={(e) => setSizeId(e.target.value)} className={selectClassName()}>
          {ENVELOPE_PRODUCTS.map((p) => (
            <option key={p.id} value={p.id}>{isAr ? p.nameAr : p.nameEn}</option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-dark-400 mb-1">{isAr ? "نوع الطباعة" : "Print type"}</label>
          <select value={printingType} onChange={(e) => setPrintingType(e.target.value as "offset" | "inkjet")} className={selectClassName()}>
            <option value="offset">{isAr ? `أوفست (أقل ${ENVELOPE_OFFSET_MIN})` : `Offset (min ${ENVELOPE_OFFSET_MIN})`}</option>
            {supportsInkjet && <option value="inkjet">{isAr ? "إنك جيت" : "Inkjet"}</option>}
          </select>
        </div>
        <div>
          <label className="block text-xs text-dark-400 mb-1">{isAr ? "اللون" : "Color"}</label>
          <select value={colorOption} onChange={(e) => setColorOption(e.target.value as "one" | "full")} className={selectClassName()}>
            <option value="one">{isAr ? "لون واحد" : "One color"}</option>
            <option value="full">{isAr ? "4 ألوان" : "Full color"}</option>
          </select>
        </div>
      </div>

      <Input
        label={isAr ? "الكمية" : "Quantity"}
        type="number"
        min={printingType === "offset" ? ENVELOPE_OFFSET_MIN : 1}
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />

      {printingType === "offset" && pricing.tier && quantity !== pricing.tier && (
        <p className="text-xs text-sky-400">
          {isAr ? `سيتم احتساب السعر على شريحة ${pricing.tier} ظرف` : `Price based on tier ${pricing.tier}`}
        </p>
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
        onAddToCart={addToCart}
        disabled={!pricing.valid}
        productName={isAr ? product.nameAr : product.nameEn}
        productSlug={product.slug}
        pricingCategory="envelopes"
        configurationSummary={pricing.valid ? formatEnvelopeSummary(locale, { sizeNameAr: selectedProduct?.nameAr, sizeNameEn: selectedProduct?.nameEn, printingType, colorOption, tier: pricing.tier }) : undefined}
        configurationState={pricing.valid && selectedProduct ? {
          category: "envelopes",
          productSlug: product.slug,
          productName: isAr ? product.nameAr : product.nameEn,
          sizeId: selectedProduct.id,
          sizeLabel: isAr ? selectedProduct.nameAr : selectedProduct.nameEn,
          variant: printingType,
          variantLabel: printingType === "offset" ? (isAr ? "أوفست" : "Offset") : (isAr ? "إنك جيت" : "Inkjet"),
          quantity,
        } : undefined}
        onDesignFromAi={setDesignFromUrl}
      />
    </ConfiguratorShell>
  );
}
