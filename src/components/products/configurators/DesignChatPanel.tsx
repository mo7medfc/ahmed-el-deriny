"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Sparkles, Send, Loader2, Wand2, RefreshCw } from "lucide-react";
import type { DesignChatResponse } from "@/lib/ai/design-prompts";
import { isStaticHosting } from "@/lib/pricing-url";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface DesignChatPanelProps {
  locale: string;
  productName: string;
  productSlug: string;
  pricingCategory?: string | null;
  configurationSummary?: string;
  onDesignReady: (url: string, filename: string) => void;
  onBriefChange?: (brief: string) => void;
}

export function DesignChatPanel({
  locale,
  productName,
  productSlug,
  pricingCategory,
  configurationSummary,
  onDesignReady,
  onBriefChange,
}: DesignChatPanelProps) {
  const isAr = locale === "ar";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [readyState, setReadyState] = useState<Pick<
    DesignChatResponse,
    "designPrompt" | "productType" | "imageSize" | "designBrief"
  > | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, generating]);

  if (isStaticHosting()) {
    return (
      <p className="text-sm text-heritage-200/50 p-4 border border-gold-500/10 rounded-sm">
        {isAr
          ? "استوديو التصميم بالذكاء الاصطناعي متاح على النسخة الكاملة من الموقع."
          : "AI design studio is available on the full site version."}
      </p>
    );
  }

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/design-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          productName,
          productSlug,
          pricingCategory,
          configurationSummary,
          locale,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "chat failed");

      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);

      if (data.designBrief && onBriefChange) {
        onBriefChange(data.designBrief);
      }

      if (data.readyToGenerate && data.designPrompt) {
        setReadyState({
          designPrompt: data.designPrompt,
          productType: data.productType,
          imageSize: data.imageSize,
          designBrief: data.designBrief,
        });
      }
    } catch {
      setError(isAr ? "تعذر الاتصال بمساعد التصميم" : "Could not reach design assistant");
    } finally {
      setLoading(false);
    }
  };

  const generateDesign = async () => {
    if (!readyState?.designPrompt || generating) return;

    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/design-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          designPrompt: readyState.designPrompt,
          imageSize: readyState.imageSize,
          productType: readyState.productType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "generate failed");

      const imageUrl = data.dataUrl || data.url;
      setPreviewUrl(imageUrl);
      onDesignReady(imageUrl, data.filename || "ai-design.png");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg && msg !== "generate failed"
          ? msg
          : isAr
            ? "فشل إنشاء التصميم، حاول مرة أخرى"
            : "Design generation failed, try again"
      );
    } finally {
      setGenerating(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setReadyState(null);
    setPreviewUrl("");
    setError("");
    setInput("");
  };

  const starterPrompts = isAr
    ? ["عايز بروشور A4 لمحل ملابس", "كرت شخصي لطبيب أسنان", "بانر افتتاح مطعم"]
    : ["Brochure A4 for a clothing store", "Business card for a dentist", "Restaurant opening banner"];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gold-400">
        <Sparkles className="w-5 h-5" />
        <p className="text-sm font-medium">
          {isAr ? "استوديو التصميم بالذكاء الاصطناعي" : "AI Design Studio"}
        </p>
      </div>

      <p className="text-xs text-heritage-200/50">
        {isAr
          ? "صف اللي عايزه بالكلام — بروشور، كرت، بانر، أي مطبوع — والمساعد هيسألك ويصمم فعلياً."
          : "Describe what you need — brochure, card, banner, any print item — and the assistant will ask questions and create a real design."}
      </p>

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              className="px-3 py-1.5 text-xs rounded-full border border-gold-500/20 text-heritage-200/70 hover:border-gold-500/40 hover:text-gold-300 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="h-64 overflow-y-auto rounded-sm border border-gold-500/15 bg-heritage-950/60 p-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-heritage-200/40 text-center py-8">
            {isAr ? "ابدأ بوصف التصميم اللي محتاجه..." : "Start by describing the design you need..."}
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === "user"
                ? "ms-8 p-3 rounded-sm bg-gold-500/10 text-heritage-50"
                : "me-8 p-3 rounded-sm bg-heritage-900 text-heritage-200/80"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-heritage-200/50 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            {isAr ? "المساعد بيفكر..." : "Assistant is thinking..."}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {readyState?.designPrompt && !previewUrl && (
        <div className="p-4 rounded-sm border border-gold-500/25 bg-gold-500/5 space-y-3">
          <p className="text-sm text-heritage-100">
            {isAr
              ? "جاهزين نصمم! اضغط الزر عشان يتولد التصميم الفعلي."
              : "Ready to design! Click to generate the actual artwork."}
          </p>
          {readyState.designBrief && (
            <p className="text-xs text-heritage-200/60">{readyState.designBrief}</p>
          )}
          <Button onClick={generateDesign} disabled={generating} className="gap-2 w-full">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {generating
              ? isAr
                ? "جاري إنشاء التصميم..."
                : "Creating design..."
              : isAr
                ? "إنشاء التصميم الآن"
                : "Generate design now"}
          </Button>
        </div>
      )}

      {previewUrl && (
        <div className="space-y-3">
          <p className="text-sm text-brand-400 font-medium">
            {isAr ? "تم إنشاء التصميم بنجاح" : "Design created successfully"}
          </p>
          <div className="relative aspect-[4/3] rounded-sm overflow-hidden border border-gold-500/20">
            <Image src={previewUrl} alt="AI design" fill className="object-contain bg-heritage-950" unoptimized />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={generateDesign} disabled={generating} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              {isAr ? "إعادة التصميم" : "Redesign"}
            </Button>
            <Button variant="outline" size="sm" onClick={resetChat}>
              {isAr ? "تصميم جديد" : "New design"}
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder={isAr ? "اكتب وصف التصميم..." : "Describe your design..."}
          className="flex-1 px-4 py-3 rounded-sm bg-heritage-900 border border-gold-500/15 text-heritage-50 placeholder:text-heritage-200/30 focus:border-gold-500/40 outline-none text-sm"
        />
        <Button onClick={() => sendMessage()} disabled={loading || !input.trim()} size="lg" className="px-4">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
