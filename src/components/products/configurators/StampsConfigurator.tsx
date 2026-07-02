"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
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
import { Upload, Check, ShoppingCart } from "lucide-react";

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
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const isAr = locale === "ar";

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
  const [designFile, setDesignFile] = useState("");
  const [designFileName, setDesignFileName] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch("/api/pricing/Stamps")
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setDesignFile(data.url);
        setDesignFileName(file.name);
      }
    } catch {
      alert(isAr ? "فشل رفع الملف" : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

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

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
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
      <h2 className="text-xl font-display font-bold text-heritage-50">
        {isAr ? "تخصيص الطلب" : "Configure order"}
      </h2>

      <div>
        <label className="block text-sm font-medium text-dark-200 mb-1.5">
          {isAr ? "النوع" : "Type"} <span className="text-red-400">*</span>
        </label>
        <select
          value={band}
          onChange={(e) => setBand(e.target.value as StampBand)}
          className="w-full px-4 py-3 rounded-sm bg-heritage-900 border border-gold-500/15 text-heritage-50 focus:border-gold-500/40 outline-none"
        >
          <option value="automatic_machine">{isAr ? "ماكينة أوتوماتيك" : "Automatic machine"}</option>
          <option value="wooden_handle">{isAr ? "مقبض خشبي" : "Wooden handle"}</option>
          <option value="cliche_only">{isAr ? "كليشيه فقط" : "Cliché only"}</option>
        </select>
      </div>

      {band !== "cliche_only" && (
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-1.5">
            {isAr ? "المقاس" : "Size"} <span className="text-red-400">*</span>
          </label>
          <select
            value={sizeDocId}
            onChange={(e) => setSizeDocId(e.target.value)}
            className="w-full px-4 py-3 rounded-sm bg-heritage-900 border border-gold-500/15 text-heritage-50 focus:border-gold-500/40 outline-none"
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
          <p className="text-sm font-medium text-dark-200 mb-3">{isAr ? "الخيار" : "Variant"}</p>
          <div className="flex flex-wrap gap-4">
            {(
              [
                { value: "only", label: variantOnlyLabel },
                { value: "stamp", label: variantStampLabel },
                { value: "serial", label: isAr ? "سيريال" : "Serial" },
              ] as const
            ).map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-heritage-100">
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
          <label className="block text-sm font-medium text-dark-200 mb-1.5">
            {isAr ? "لون الحبر" : "Ink color"}
          </label>
          <select
            value={inkColor}
            onChange={(e) => setInkColor(e.target.value as InkColor)}
            className="w-full px-4 py-3 rounded-sm bg-heritage-900 border border-gold-500/15 text-heritage-50 focus:border-gold-500/40 outline-none"
          >
            <option value="black">{isAr ? "أسود" : "Black"}</option>
            <option value="red">{isAr ? "أحمر" : "Red"}</option>
            <option value="green">{isAr ? "أخضر" : "Green"}</option>
          </select>
        </div>
      )}

      {band === "cliche_only" && (
        <div>
          <p className="text-sm font-medium text-dark-200 mb-3">
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
        <div className="rounded-sm bg-heritage-900 border border-gold-500/15 p-4 space-y-1 text-sm text-heritage-200">
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

      <div>
        <p className="text-sm font-medium text-dark-200 mb-3">{isAr ? "رفع التصميم" : "Upload design"}</p>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-dark-600 rounded-xl cursor-pointer hover:border-brand-500/50 transition-colors">
          <input type="file" className="hidden" accept=".pdf,.ai,.eps,.png,.jpg,.jpeg,.psd" onChange={handleUpload} />
          {uploading ? (
            <p className="text-dark-400 text-sm">{isAr ? "جاري الرفع..." : "Uploading..."}</p>
          ) : designFile ? (
            <div className="flex items-center gap-2 text-brand-400">
              <Check className="w-5 h-5" />
              <span className="text-sm">{designFileName}</span>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-dark-400 mb-2" />
              <p className="text-sm text-dark-400">PDF, AI, EPS, PNG, JPG</p>
            </>
          )}
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-200 mb-1.5">
          {isAr ? "ملاحظات إضافية" : "Notes"}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-sm bg-heritage-900 border border-gold-500/15 text-heritage-50 placeholder:text-heritage-200/30 focus:border-gold-500/40 resize-none"
        />
      </div>

      <div className="flex items-center justify-between p-4 rounded-sm bg-heritage-900 border border-gold-500/20">
        <span className="text-heritage-200 font-medium">{isAr ? "السعر الإجمالي" : "Total price"}</span>
        <span className="text-2xl font-bold gradient-text">
          {pricing.valid ? formatPrice(pricing.totalPrice, locale) : formatPrice(0, locale)}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleAddToCart}
          disabled={!pricing.valid}
          className="flex-1 gap-2"
          size="lg"
        >
          {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
          {added ? (isAr ? "تمت الإضافة!" : "Added!") : isAr ? "أضف للسلة" : "Add to cart"}
        </Button>
        <Button variant="outline" size="lg" onClick={() => router.push("/cart")}>
          {isAr ? "عرض السلة" : "View cart"}
        </Button>
      </div>
    </div>
  );
}
