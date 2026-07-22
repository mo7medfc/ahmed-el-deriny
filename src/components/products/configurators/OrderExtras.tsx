"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { Upload, Check, ShoppingCart, Sparkles } from "lucide-react";
import { DesignStudioPanel } from "./DesignStudioPanel";
import type { DesignConfigurationState } from "@/lib/ai/design-studio";
import { cn } from "@/lib/utils";

export function useDesignUpload(isAr: boolean) {
  const [designFile, setDesignFile] = useState("");
  const [designFileName, setDesignFileName] = useState("");
  const [uploading, setUploading] = useState(false);

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

  const setDesignFromUrl = (url: string, filename: string) => {
    setDesignFile(url);
    setDesignFileName(filename);
  };

  return { designFile, designFileName, uploading, handleUpload, setDesignFromUrl };
}

type DesignMode = "upload" | "ai";

export function OrderExtras({
  locale,
  notes,
  onNotesChange,
  designFile,
  designFileName,
  uploading,
  onUpload,
  totalPrice,
  onAddToCart,
  disabled,
  productName,
  productSlug,
  pricingCategory,
  configurationSummary,
  configurationState,
  onDesignFromAi,
}: {
  locale: string;
  notes: string;
  onNotesChange: (v: string) => void;
  designFile: string;
  designFileName: string;
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  totalPrice: number;
  onAddToCart: () => void;
  disabled?: boolean;
  productName?: string;
  productSlug?: string;
  pricingCategory?: string | null;
  configurationSummary?: string;
  configurationState?: DesignConfigurationState;
  onDesignFromAi?: (url: string, filename: string) => void;
}) {
  const router = useRouter();
  const isAr = locale === "ar";
  const [added, setAdded] = useState(false);
  const [designMode, setDesignMode] = useState<DesignMode>("ai");
  const showAiStudio = Boolean(productName && productSlug && onDesignFromAi);

  const add = () => {
    onAddToCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <div>
        <p className="text-sm font-medium text-brand-700 mb-3">
          {isAr ? "التصميم" : "Design"}
        </p>

        {showAiStudio && (
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setDesignMode("upload")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-sm text-sm font-medium transition-all border",
                designMode === "upload"
                  ? "border-brand-500 bg-brand-50 text-brand-800"
                  : "border-brand-200 text-brand-600 hover:border-brand-400"
              )}
            >
              <Upload className="w-4 h-4" />
              {isAr ? "رفع ملف" : "Upload file"}
            </button>
            <button
              type="button"
              onClick={() => setDesignMode("ai")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-sm text-sm font-medium transition-all border",
                designMode === "ai"
                  ? "border-brand-500 bg-brand-50 text-brand-800"
                  : "border-brand-200 text-brand-600 hover:border-brand-400"
              )}
            >
              <Sparkles className="w-4 h-4" />
              {isAr ? "تصميم بالذكاء الاصطناعي" : "AI design"}
            </button>
          </div>
        )}

        {designMode === "ai" && showAiStudio ? (
          <DesignStudioPanel
            locale={locale}
            productName={productName!}
            productSlug={productSlug!}
            pricingCategory={pricingCategory}
            configurationSummary={configurationSummary}
            configurationState={configurationState}
            onDesignReady={onDesignFromAi!}
            onBriefChange={onNotesChange}
          />
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-brand-200 rounded-xl cursor-pointer hover:border-brand-500/50 transition-colors">
            <input type="file" className="hidden" accept=".pdf,.ai,.eps,.png,.jpg,.jpeg,.psd" onChange={onUpload} />
            {uploading ? (
              <p className="text-brand-500 text-sm">{isAr ? "جاري الرفع..." : "Uploading..."}</p>
            ) : designFile ? (
              <div className="flex items-center gap-2 text-brand-400">
                <Check className="w-5 h-5" />
                <span className="text-sm">{designFileName}</span>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-brand-500 mb-2" />
                <p className="text-sm text-brand-500">PDF, AI, EPS, PNG, JPG</p>
              </>
            )}
          </label>
        )}

        {designFile && designMode === "ai" && (
          <p className="text-xs text-brand-400 mt-2 flex items-center gap-1">
            <Check className="w-3 h-3" />
            {designFileName}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-700 mb-1.5">
          {isAr ? "ملاحظات إضافية" : "Notes"}
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          placeholder={isAr ? "تفاصيل التصميم أو تعليمات الطباعة..." : "Design details or print instructions..."}
          className="w-full px-4 py-3 rounded-sm bg-white border border-brand-200 text-brand-900 placeholder:text-brand-400 focus:border-gold-500/40 resize-none"
        />
      </div>

      <div className="flex items-center justify-between p-4 rounded-sm bg-white border border-brand-200">
        <span className="text-brand-700 font-medium">{isAr ? "السعر الإجمالي" : "Total price"}</span>
        <span className="text-2xl font-bold gradient-text">{formatPrice(totalPrice, locale)}</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={add} disabled={disabled} className="flex-1 gap-2" size="lg">
          {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
          {added ? (isAr ? "تمت الإضافة!" : "Added!") : isAr ? "أضف للسلة" : "Add to cart"}
        </Button>
        <Button variant="outline" size="lg" onClick={() => router.push("/cart")}>
          {isAr ? "عرض السلة" : "View cart"}
        </Button>
      </div>
    </>
  );
}

export function ConfiguratorShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="heritage-card rounded-sm p-6 lg:p-8 space-y-6">
      <h2 className="text-xl font-display font-bold text-brand-900">{title}</h2>
      {children}
    </div>
  );
}

export function selectClassName() {
  return "w-full px-4 py-3 rounded-sm bg-white border border-brand-200 text-brand-900 focus:border-gold-500/40 outline-none";
}

export function sectionTitle(text: string) {
  return <h3 className="text-sm font-bold text-brand-700">{text}</h3>;
}
