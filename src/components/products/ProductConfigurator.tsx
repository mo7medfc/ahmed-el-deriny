"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Input } from "@/components/ui/Input";
import { calculatePrice, formatPrice, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { StampsConfigurator } from "@/components/products/configurators/StampsConfigurator";
import { DafaterConfigurator } from "@/components/products/configurators/DafaterConfigurator";
import { NBBConfigurator } from "@/components/products/configurators/NBBConfigurator";
import { EnvelopesConfigurator } from "@/components/products/configurators/EnvelopesConfigurator";
import { NotebooksInvoicesConfigurator } from "@/components/products/configurators/NotebooksInvoicesConfigurator";
import { OrderExtras, useDesignUpload } from "@/components/products/configurators/OrderExtras";

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
  const addItem = useCartStore((s) => s.addItem);

  const [width, setWidth] = useState(product.minWidth);
  const [height, setHeight] = useState(product.minHeight);
  const [quantity, setQuantity] = useState(product.minQuantity);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const isAr = locale === "ar";
  const { designFile, designFileName, uploading, handleUpload, setDesignFromUrl } = useDesignUpload(isAr);

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
        productName={locale === "ar" ? product.nameAr : product.nameEn}
        productSlug={product.slug}
        pricingCategory={product.pricingCategory}
        configurationSummary={
          isDimensional
            ? `${width}×${height} cm · ${quantity} ${isAr ? "قطعة" : "pcs"}`
            : `${quantity} ${isAr ? "قطعة" : "pcs"}`
        }
        onDesignFromAi={setDesignFromUrl}
      />
    </div>
  );
}
