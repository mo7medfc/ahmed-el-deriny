"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  Loader2,
  Wand2,
  RefreshCw,
  Package,
  ChevronLeft,
  ChevronRight,
  Bot,
  PenLine,
  X,
  ZoomIn,
  Check,
  Pencil,
} from "lucide-react";
import { isStaticHosting } from "@/lib/pricing-url";
import type { DesignChoiceResponse } from "@/lib/ai/design-choice-prompts";
import type { DesignConfigurationState } from "@/lib/ai/design-studio";
import { parseStampSizeId, resolveProductType } from "@/lib/ai/design-studio";
import { resolveDimensions } from "@/lib/ai/design-dimensions";
import { cn } from "@/lib/utils";

interface DesignStudioPanelProps {
  locale: string;
  productName: string;
  productSlug: string;
  pricingCategory?: string | null;
  configurationSummary?: string;
  configurationState?: DesignConfigurationState;
  onDesignReady: (url: string, filename: string) => void;
  onBriefChange?: (brief: string) => void;
}

type Phase = "intro" | "describe" | "question" | "ready" | "preview";

interface DesignVariant {
  url: string;
  dataUrl: string;
  filename: string;
}

function ImageLightbox({
  src,
  onClose,
  isAr,
}: {
  src: string;
  onClose: () => void;
  isAr: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 end-4 p-2 rounded-full bg-brand-50 text-brand-800 hover:bg-brand-100"
        aria-label={isAr ? "إغلاق" : "Close"}
      >
        <X className="w-5 h-5" />
      </button>
      <div className="relative max-w-[95vw] max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
        <Image
          src={src}
          alt="Design preview"
          fill
          className="object-contain"
          unoptimized
        />
      </div>
      <p className="absolute bottom-4 text-xs text-brand-500">
        {isAr ? "اضغط خارج الصورة للإغلاق" : "Click outside to close"}
      </p>
    </div>
  );
}

function AssistantBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-8 h-8 rounded-full bg-gold-500/15 border border-brand-300 flex items-center justify-center">
        <Bot className="w-4 h-4 text-gold-400" />
      </div>
      <div className="flex-1 p-4 rounded-sm border border-brand-200 bg-brand-50 border-r-4 border-r-gold-500/50">
        {children}
      </div>
    </div>
  );
}

export function DesignStudioPanel({
  locale,
  productName,
  productSlug,
  pricingCategory,
  configurationSummary,
  configurationState,
  onDesignReady,
  onBriefChange,
}: DesignStudioPanelProps) {
  const isAr = locale === "ar";

  const mergedConfig = useMemo<DesignConfigurationState>(() => {
    const parsed = parseStampSizeId(configurationState?.sizeId as string | undefined);
    return {
      category: pricingCategory,
      summary: configurationSummary,
      productSlug,
      productName,
      ...parsed,
      ...configurationState,
    };
  }, [pricingCategory, configurationSummary, configurationState, productSlug, productName]);

  const dims = useMemo(
    () => resolveDimensions(mergedConfig, pricingCategory),
    [mergedConfig, pricingCategory]
  );

  const [phase, setPhase] = useState<Phase>("intro");
  const [description, setDescription] = useState("");
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<{ questionId: string; label: string }[]>([]);
  const [current, setCurrent] = useState<DesignChoiceResponse | null>(null);
  const [readyPayload, setReadyPayload] = useState<DesignChoiceResponse | null>(null);
  const [textDraft, setTextDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [variants, setVariants] = useState<DesignVariant[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lastPrompt, setLastPrompt] = useState("");
  const [editInstructions, setEditInstructions] = useState("");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const selectedVariant = variants[selectedIndex];

  if (isStaticHosting()) {
    return (
      <p className="text-sm text-brand-500 p-4 border border-brand-200 rounded-sm">
        {isAr
          ? "استوديو التصميم متاح على النسخة الكاملة من الموقع."
          : "Design studio is available on the full site version."}
      </p>
    );
  }

  const fetchNextQuestion = async (
    desc: string,
    nextSelections: Record<string, string>,
    skip = false
  ): Promise<DesignChoiceResponse> => {
    const res = await fetch("/api/design-choices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: desc,
        selections: nextSelections,
        skip,
        productName,
        productSlug,
        pricingCategory,
        configurationSummary,
        configurationState: mergedConfig,
        locale,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "choices failed");
    return data as DesignChoiceResponse;
  };

  const submitDescription = async () => {
    const desc = description.trim();
    if (!desc) {
      setError(isAr ? "صف التصميم اللي عايزه" : "Describe what you want to design");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await fetchNextQuestion(desc, {});
      if (data.readyToGenerate || data.stepType === "ready") {
        setReadyPayload(data);
        setPhase("ready");
      } else {
        setCurrent(data);
        setPhase("question");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : isAr ? "فشل التحليل" : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const pickOption = async (optionId: string, label: string) => {
    if (!current?.questionId) return;
    const nextSelections = { ...selections, [current.questionId]: optionId };
    setSelections(nextSelections);
    setHistory((h) => [...h, { questionId: current.questionId!, label }]);
    setLoading(true);
    setError("");
    try {
      const data = await fetchNextQuestion(description, nextSelections);
      if (data.readyToGenerate || data.stepType === "ready") {
        setReadyPayload(data);
        setCurrent(null);
        setPhase("ready");
      } else {
        setCurrent(data);
        setTextDraft("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : isAr ? "فشل التحميل" : "Load failed");
    } finally {
      setLoading(false);
    }
  };

  const submitTextAnswer = async () => {
    if (!current?.questionId) return;
    const val = textDraft.trim();
    if (current.required !== false && !val) {
      setError(isAr ? "مطلوب إدخال نص" : "Text required");
      return;
    }
    const nextSelections = { ...selections, [current.questionId]: val };
    setSelections(nextSelections);
    if (val) setHistory((h) => [...h, { questionId: current.questionId!, label: val }]);
    setLoading(true);
    setError("");
    try {
      const data = await fetchNextQuestion(description, nextSelections);
      if (data.readyToGenerate || data.stepType === "ready") {
        setReadyPayload(data);
        setCurrent(null);
        setPhase("ready");
      } else {
        setCurrent(data);
        setTextDraft("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : isAr ? "فشل التحميل" : "Load failed");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (phase === "describe") {
      setPhase("intro");
      return;
    }
    if (phase === "question" && history.length === 0) {
      setPhase("describe");
      setCurrent(null);
      return;
    }
    if (phase === "ready") {
      setPhase("question");
      setReadyPayload(null);
      return;
    }
    if (history.length > 0) {
      const last = history[history.length - 1];
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      const next = { ...selections };
      delete next[last.questionId];
      setSelections(next);
      setLoading(true);
      fetchNextQuestion(description, next)
        .then((data) => {
          if (data.readyToGenerate || data.stepType === "ready") {
            setReadyPayload(data);
            setCurrent(null);
            setPhase("ready");
          } else {
            setCurrent(data);
            setPhase("question");
          }
        })
        .finally(() => setLoading(false));
    }
  };

  const callGenerate = async (opts?: {
    payload?: DesignChoiceResponse | null;
    edit?: boolean;
  }) => {
    const payload = opts?.payload ?? readyPayload;
    const isEdit = opts?.edit ?? false;

    if (!isEdit && !payload?.designPrompt) {
      setError(isAr ? "التصميم غير جاهز بعد" : "Design not ready yet");
      return;
    }
    if (isEdit && !editInstructions.trim()) {
      setError(isAr ? "اكتب التعديل المطلوب" : "Describe the edit");
      return;
    }
    if (isEdit && !lastPrompt) {
      setError(isAr ? "لا يوجد تصميم للتعديل" : "No design to edit");
      return;
    }

    setGenerating(true);
    setError("");
    setConfirmed(false);

    if (!isEdit && payload && onBriefChange && payload.designBrief) {
      onBriefChange(payload.designBrief);
    }

    try {
      const res = await fetch("/api/design-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          designPrompt: payload?.designPrompt || lastPrompt,
          imageSize: payload?.imageSize,
          productType: resolveProductType(
            payload?.productType || readyPayload?.productType,
            pricingCategory
          ),
          configurationState: mergedConfig,
          pricingCategory,
          customerDescription: description,
          selections,
          locale,
          variantCount: isEdit ? 1 : 2,
          editMode: isEdit,
          editInstructions: isEdit ? editInstructions.trim() : undefined,
          previousPrompt: isEdit ? lastPrompt : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "generate failed");

      const list: DesignVariant[] = data.variants?.length
        ? data.variants
        : [{ url: data.url, dataUrl: data.dataUrl, filename: data.filename }];

      setVariants(list);
      setSelectedIndex(0);
      setLastPrompt(data.lastPrompt || "");
      setPhase("preview");
      if (isEdit) setEditInstructions("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg && msg !== "generate failed"
          ? msg
          : isAr
            ? "فشل إنشاء التصميم"
            : "Design generation failed"
      );
    } finally {
      setGenerating(false);
    }
  };

  const generateDesign = (payloadOverride?: DesignChoiceResponse | null) =>
    callGenerate({ payload: payloadOverride });

  const applyEdit = () => callGenerate({ edit: true });

  const confirmSelection = () => {
    if (!selectedVariant) return;
    const url = selectedVariant.dataUrl || selectedVariant.url;
    onDesignReady(url, selectedVariant.filename);
    setConfirmed(true);
  };

  const skipAll = async () => {
    const desc = description.trim();
    if (!desc) {
      setError(isAr ? "اكتب وصف التصميم أولاً" : "Write a description first");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await fetchNextQuestion(desc, selections, true);
      if (!data.designPrompt) {
        setReadyPayload(data);
        setCurrent(null);
        setPhase("ready");
        setError(isAr ? "لم يكتمل التحليل، حاول مرة أخرى" : "Analysis incomplete, try again");
        return;
      }
      setReadyPayload(data);
      setCurrent(null);
      await generateDesign(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : isAr ? "فشل التخطي" : "Skip failed");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setPhase("intro");
    setDescription("");
    setSelections({});
    setHistory([]);
    setCurrent(null);
    setReadyPayload(null);
    setTextDraft("");
    setError("");
    setVariants([]);
    setSelectedIndex(0);
    setLastPrompt("");
    setEditInstructions("");
    setLightboxSrc(null);
    setConfirmed(false);
  };

  if (phase === "preview" && variants.length > 0) {
    return (
      <div className="space-y-4">
        {lightboxSrc && (
          <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} isAr={isAr} />
        )}

        <p className="text-sm text-brand-400 font-medium">
          {isAr ? "اختر التصميم المناسب (اضغط على الصورة للتكبير)" : "Pick your design (click to enlarge)"}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {variants.map((v, i) => (
            <button
              key={v.filename}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "relative rounded-sm overflow-hidden border-2 transition-all group text-start",
                selectedIndex === i
                  ? "border-gold-500 shadow-lg shadow-gold-500/20"
                  : "border-brand-200 hover:border-gold-500/50"
              )}
            >
              <div
                className="relative aspect-[4/3] bg-white cursor-zoom-in"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxSrc(v.dataUrl || v.url);
                }}
              >
                <Image src={v.dataUrl || v.url} alt={`Design ${i + 1}`} fill className="object-contain" unoptimized />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <ZoomIn className="w-8 h-8 text-white drop-shadow" />
                </div>
              </div>
              <div className="p-2 flex items-center justify-between bg-brand-50/80">
                <span className="text-xs text-brand-700">
                  {isAr ? `تصميم ${i + 1}` : `Design ${i + 1}`}
                  {i === 0 ? (isAr ? " — كلاسيكي" : " — Classic") : isAr ? " — عصري" : " — Modern"}
                </span>
                {selectedIndex === i && <Check className="w-4 h-4 text-gold-400" />}
              </div>
            </button>
          ))}
        </div>

        <Button onClick={confirmSelection} className="w-full gap-2" size="lg" disabled={confirmed}>
          <Check className="w-4 h-4" />
          {confirmed
            ? isAr
              ? "تم اختيار التصميم ✓"
              : "Design selected ✓"
            : isAr
              ? "اعتماد التصميم المختار"
              : "Use selected design"}
        </Button>

        <div className="p-4 rounded-sm border border-brand-200 bg-brand-50 space-y-3">
          <div className="flex items-center gap-2 text-gold-400">
            <Pencil className="w-4 h-4" />
            <p className="text-sm font-medium">{isAr ? "عدّل التصميم" : "Edit design"}</p>
          </div>
          <p className="text-xs text-brand-500">
            {isAr
              ? "اكتب التعديل المطلوب — مثال: غيّر اللون للأزرق، كبّر الخط، أضف إطار مزخرف"
              : "Describe changes — e.g. change color to blue, bigger font, add ornate border"}
          </p>
          <textarea
            value={editInstructions}
            onChange={(e) => setEditInstructions(e.target.value)}
            rows={2}
            placeholder={isAr ? "صف التعديل..." : "Describe edit..."}
            className="w-full px-3 py-2 rounded-sm bg-white border border-brand-200 text-brand-900 text-sm resize-none outline-none focus:border-gold-500/40"
          />
          <Button
            variant="outline"
            onClick={applyEdit}
            disabled={generating || !editInstructions.trim()}
            className="w-full gap-2"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
            {generating
              ? isAr
                ? "جاري التعديل..."
                : "Applying edit..."
              : isAr
                ? "تطبيق التعديل"
                : "Apply edit"}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => generateDesign()} disabled={generating} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {isAr ? "تصميمين جديدين" : "New 2 designs"}
          </Button>
          <Button variant="outline" size="sm" onClick={resetAll}>
            {isAr ? "ابدأ من جديد" : "Start over"}
          </Button>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }

  const stepCount = history.length + (phase === "describe" ? 0 : 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gold-400">
        <Sparkles className="w-5 h-5" />
        <p className="text-sm font-medium">{isAr ? "استوديو التصميم" : "Design Studio"}</p>
      </div>

      <div className="p-3 rounded-sm border border-brand-200 bg-brand-50 space-y-1">
        <div className="flex items-center gap-2 text-xs text-gold-400/90">
          <Package className="w-3.5 h-3.5" />
          {isAr ? "المنتج المختار" : "Selected product"}
        </div>
        <p className="text-sm text-brand-800 font-medium">{productName}</p>
        {configurationSummary && (
          <p className="text-xs text-brand-600">{configurationSummary}</p>
        )}
        {dims.widthCm && dims.heightCm && (
          <p className="text-xs text-gold-400/70">
            {isAr
              ? `مقاس التصميم: ${dims.widthCm} × ${dims.heightCm} سم (بالظبط)`
              : `Design size: ${dims.widthCm} × ${dims.heightCm} cm (exact)`}
          </p>
        )}
      </div>

      {stepCount > 0 && (
        <div className="flex gap-1.5">
          {Array.from({ length: Math.max(stepCount, 3) }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full",
                i < stepCount ? "bg-gold-500/70" : "bg-gold-500/15"
              )}
            />
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-1 max-h-24 overflow-y-auto">
          {history.map((h, i) => (
            <p key={i} className="text-xs text-brand-500 text-end">
              ✓ {h.label}
            </p>
          ))}
        </div>
      )}

      {phase === "intro" && (
        <>
          <AssistantBubble>
            <p className="text-sm text-brand-800">
              {dims.widthCm && dims.heightCm
                ? isAr
                  ? `المقاس ${dims.widthCm} × ${dims.heightCm} سم محدد من اختيارك. وصّف التصميم اللي عايزه (النص، الألوان، الأسلوب) — مش محتاج تذكر المقاس تاني.`
                  : `Size ${dims.widthCm} × ${dims.heightCm} cm is set from your order. Describe the design you want (text, colors, style) — no need to repeat the size.`
                : isAr
                  ? "اضغط «صمم الآن» ووصّف اللي عايزه — الأسئلة والاختيارات هتظهر حسب منتجك ووصفك."
                  : "Press Design Now and describe what you want — questions will adapt to your product."}
            </p>
          </AssistantBubble>
          <Button onClick={() => setPhase("describe")} className="w-full gap-2" size="lg">
            <Wand2 className="w-4 h-4" />
            {isAr ? "صمم الآن" : "Design now"}
          </Button>
        </>
      )}

      {phase === "describe" && (
        <>
          <AssistantBubble>
            <p className="text-sm text-brand-800">
              {dims.widthCm && dims.heightCm
                ? isAr
                  ? `وصّف التصميم على مقاس ${dims.widthCm}×${dims.heightCm} سم — مثال: بانر عصري لمطعم، أو شعار وعنوان واضح`
                  : `Describe your design for ${dims.widthCm}×${dims.heightCm} cm — e.g. modern restaurant banner, logo and bold headline`
                : isAr
                  ? "صف التصميم اللي عايزه بالتفصيل — مثال: ختم باسم أحمد وسجل تجاري، أو بانر عصري لمطعم، أو بروشور لشركة مقاولات"
                  : "Describe your design in detail — e.g. stamp with name and CR, modern restaurant banner, construction brochure"}
            </p>
          </AssistantBubble>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder={
              isAr
                ? "اكتب وصف التصميم هنا..."
                : "Write your design description here..."
            }
            className="w-full px-4 py-3 rounded-sm bg-white border border-brand-200 text-brand-900 placeholder:text-brand-400 focus:border-gold-500/40 outline-none text-sm resize-none"
          />
          <div className="flex gap-2">
            <Button onClick={submitDescription} disabled={loading || generating} className="flex-1 gap-2" size="lg">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenLine className="w-4 h-4" />}
              {loading
                ? isAr
                  ? "جاري تحليل الوصف..."
                  : "Analyzing..."
                : isAr
                  ? "التالي"
                  : "Next"}
            </Button>
            <Button
              variant="outline"
              onClick={skipAll}
              disabled={loading || generating || !description.trim()}
              className="gap-2"
              size="lg"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isAr ? "تخطي وصمم" : "Skip & design"}
            </Button>
          </div>
        </>
      )}

      {(phase === "question" || phase === "ready") && (current || readyPayload) && (
        <AssistantBubble>
          <p className="text-sm text-brand-800 leading-relaxed">
            {phase === "ready"
              ? readyPayload?.message ||
                (isAr ? "جاهز لإنشاء التصميم!" : "Ready to generate!")
              : current?.message}
          </p>
        </AssistantBubble>
      )}

      {phase === "question" && current?.stepType === "choices" && current.options.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {current.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                disabled={loading || generating}
                onClick={() => pickOption(opt.id, isAr ? opt.labelAr : opt.labelEn)}
                className="px-4 py-3 rounded-sm text-sm font-medium border border-brand-200 bg-brand-50 text-brand-800 hover:border-gold-500/50 hover:bg-gold-500/10 transition-all text-start disabled:opacity-50"
              >
                {isAr ? opt.labelAr : opt.labelEn}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={skipAll}
            disabled={loading || generating}
            className="w-full gap-2"
          >
            {loading || generating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {generating
              ? isAr
              ? "جاري إنشاء تصميمين..."
              : "Creating 2 designs..."
              : isAr
                ? "تخطي وصمم الآن"
                : "Skip & design now"}
          </Button>
        </>
      )}

      {phase === "question" && current?.stepType === "text" && (
        <div className="space-y-3">
          <input
            value={textDraft}
            onChange={(e) => setTextDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitTextAnswer()}
            placeholder={isAr ? current.placeholderAr : current.placeholderEn}
            className="w-full px-4 py-3 rounded-sm bg-white border border-brand-200 text-brand-900 placeholder:text-brand-400 focus:border-gold-500/40 outline-none text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <Button onClick={submitTextAnswer} disabled={loading || generating} className="flex-1 gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
              {isAr ? "التالي" : "Next"}
            </Button>
            <Button variant="outline" onClick={skipAll} disabled={loading || generating}>
              {isAr ? "تخطي" : "Skip"}
            </Button>
          </div>
        </div>
      )}

      {phase === "ready" && readyPayload && (
        <Button onClick={() => generateDesign()} disabled={generating} className="w-full gap-2" size="lg">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {generating
            ? isAr
              ? "جاري إنشاء تصميمين... (60-90 ث)"
              : "Creating 2 designs... (60-90s)"
            : isAr
              ? "إنشاء التصميم"
              : "Generate design"}
        </Button>
      )}

      {loading && phase === "question" && !current?.options.length && current?.stepType !== "text" && (
        <div className="flex items-center gap-2 text-sm text-brand-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          {isAr ? "جاري تجهيز السؤال التالي..." : "Preparing next question..."}
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {phase !== "intro" && (
        <button
          type="button"
          onClick={goBack}
          disabled={loading}
          className="flex items-center gap-1 text-xs text-brand-500 hover:text-gold-400 transition-colors disabled:opacity-40"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          {isAr ? "رجوع" : "Back"}
        </button>
      )}
    </div>
  );
}
