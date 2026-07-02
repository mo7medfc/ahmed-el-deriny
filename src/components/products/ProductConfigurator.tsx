"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { calculatePrice, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { Upload, Check, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { StampsConfigurator } from "@/components/products/configurators/StampsConfigurator";
import { DafaterConfigurator } from "@/components/products/configurators/DafaterConfigurator";
import { NBBConfigurator } from "@/components/products/configurators/NBBConfigurator";
import { EnvelopesConfigurator } from "@/components/products/configurators/EnvelopesConfigurator";
import { NotebooksInvoicesConfigurator } from "@/components/products/configurators/NotebooksInvoicesConfigurator";

interface ProductOption {
  id: string;
  nameAr: string;
  nameEn: string;
  priceAddon: number;
}

interface ProductConfiguratorProps {
  product: {
    id: string;
    slug: string;
    nameAr: string;
    nameEn: string;
    pricingType: string;
    pricingCategory: string | null;
    legacyId: string | null;
    basePrice: number;
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    minQuantity: number;
    options: ProductOption[];
  };
}

export function ProductConfigurator({ product }: ProductConfiguratorProps) {
  const cat = product.pricingCategory;

  if (product.pricingType === "stamps" || cat === "Stamps") {
    return <StampsConfigurator product={product} />;
  }
  if (cat === "dafater") {
    return <DafaterConfigurator product={product} />;
  }
  if (cat === "notebooks_books_booklets") {
    return <NBBConfigurator product={product} />;
  }
  if (cat === "notebooks_invoices") {
    return <NotebooksInvoicesConfigurator product={product} />;
  }
  if (cat === "envelopes") {
    return (
      <EnvelopesConfigurator
        product={product}
        defaultSizeId={product.legacyId}
      />
    );
  }

  return <GenericProductConfigurator product={product} />;
}

function GenericProductConfigurator({ product }: ProductConfiguratorProps) {
  const t = useTranslations("products");
  const locale = useLocale();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [width, setWidth] = useState(product.minWidth);
  const [height, setHeight] = useState(product.minHeight);
  const [quantity, setQuantity] = useState(product.minQuantity);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [designFile, setDesignFile] = useState<string>("");
  const [designFileName, setDesignFileName] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [added, setAdded] = useState(false);

  const isDimensional = product.pricingType === "per_sqm" || product.pricingType === "per_meter";

  const optionAddons = useMemo(() => {
    return product.options
      .filter((o) => selectedOptions.includes(o.id))
      .reduce((sum, o) => sum + o.priceAddon, 0);
  }, [product.options, selectedOptions]);

  const totalPrice = useMemo(() => {
    return calculatePrice(
      product.pricingType,
      product.basePrice,
      width,
      height,
      quantity,
      optionAddons
    );
  }, [product, width, height, quantity, optionAddons]);

  const unitPrice = totalPrice / quantity;

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

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
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAddToCart = () => {
    const selectedOpts = product.options
      .filter((o) => selectedOptions.includes(o.id))
      .map((o) => ({
        id: o.id,
        name: locale === "ar" ? o.nameAr : o.nameEn,
        priceAddon: o.priceAddon,
      }));

    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: locale === "ar" ? product.nameAr : product.nameEn,
      width: isDimensional ? width : undefined,
      height: isDimensional ? height : undefined,
      quantity,
      selectedOptions: selectedOpts,
      unitPrice,
      totalPrice,
      designFile: designFile || undefined,
      designFileName: designFileName || undefined,
      notes: notes || undefined,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="heritage-card rounded-sm p-6 lg:p-8 space-y-6">
      <h2 className="text-xl font-display font-bold text-heritage-50">{t("configure")}</h2>

      {isDimensional && (
        <div>
          <p className="text-sm font-medium text-dark-200 mb-3">{t("dimensions")}</p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("width")}
              type="number"
              min={product.minWidth}
              max={product.maxWidth}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
            />
            <Input
              label={t("height")}
              type="number"
              min={product.minHeight}
              max={product.maxHeight}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
            />
          </div>
          <p className="text-xs text-dark-400 mt-2">
            {t("minMax", { min: product.minWidth, max: product.maxWidth })}
          </p>
        </div>
      )}

      <Input
        label={t("quantity")}
        type="number"
        min={product.minQuantity}
        value={quantity}
        onChange={(e) => setQuantity(Math.max(product.minQuantity, Number(e.target.value)))}
      />

      {product.options.length > 0 && (
        <div>
          <p className="text-sm font-medium text-dark-200 mb-3">{t("options")}</p>
          <div className="space-y-2">
            {product.options.map((option) => (
              <label
                key={option.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                  selectedOptions.includes(option.id)
                    ? "border-brand-500 bg-brand-500/10"
                    : "border-dark-600 hover:border-dark-500"
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option.id)}
                    onChange={() => toggleOption(option.id)}
                    className="w-4 h-4 accent-brand-500"
                  />
                  <span className="text-sm text-white">
                    {locale === "ar" ? option.nameAr : option.nameEn}
                  </span>
                </div>
                {option.priceAddon > 0 && (
                  <span className="text-xs text-brand-400">
                    +{formatPrice(option.priceAddon, locale)}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-dark-200 mb-3">{t("uploadDesign")}</p>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-dark-600 rounded-xl cursor-pointer hover:border-brand-500/50 transition-colors">
          <input type="file" className="hidden" accept=".pdf,.ai,.eps,.png,.jpg,.jpeg,.psd" onChange={handleUpload} />
          {uploading ? (
            <p className="text-dark-400 text-sm">{t("calculating")}</p>
          ) : designFile ? (
            <div className="flex items-center gap-2 text-brand-400">
              <Check className="w-5 h-5" />
              <span className="text-sm">{designFileName}</span>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-dark-400 mb-2" />
              <p className="text-sm text-dark-400">{t("uploadHint")}</p>
            </>
          )}
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-200 mb-1.5">{t("notes")}</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("notesPlaceholder")}
          rows={3}
          className="w-full px-4 py-3 rounded-sm bg-heritage-900 border border-gold-500/15 text-heritage-50 placeholder:text-heritage-200/30 focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 transition-all resize-none"
        />
      </div>

      <div className="flex items-center justify-between p-4 rounded-sm bg-heritage-900 border border-gold-500/20">
        <span className="text-heritage-200 font-medium">{t("totalPrice")}</span>
        <span className="text-2xl font-bold gradient-text">{formatPrice(totalPrice, locale)}</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleAddToCart} className="flex-1 gap-2" size="lg">
          {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
          {added ? (locale === "ar" ? "تمت الإضافة!" : "Added!") : t("addToCart")}
        </Button>
        <Button variant="outline" size="lg" onClick={() => router.push("/cart")}>
          {locale === "ar" ? "عرض السلة" : "View Cart"}
        </Button>
      </div>
    </div>
  );
}
