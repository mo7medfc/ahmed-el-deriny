import { NextRequest, NextResponse } from "next/server";
import {
  buildDesignUserContext,
  DESIGN_SYSTEM_PROMPT,
  type DesignChatResponse,
  type DesignImageSize,
  type DesignProductType,
} from "@/lib/ai/design-prompts";
import { getChoicesModel } from "@/lib/ai/openai-models";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function parseDesignResponse(raw: string): DesignChatResponse {
  const fallback: DesignChatResponse = {
    message: raw,
    readyToGenerate: false,
    designPrompt: null,
    productType: "other",
    imageSize: "1024x1024",
    designBrief: null,
  };

  try {
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) return fallback;
    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as Partial<DesignChatResponse>;
    return {
      message: typeof parsed.message === "string" ? parsed.message : fallback.message,
      readyToGenerate: Boolean(parsed.readyToGenerate),
      designPrompt: typeof parsed.designPrompt === "string" ? parsed.designPrompt : null,
      productType: (parsed.productType as DesignProductType) || "other",
      imageSize: (parsed.imageSize as DesignImageSize) || "1024x1024",
      designBrief: typeof parsed.designBrief === "string" ? parsed.designBrief : null,
    };
  } catch {
    return fallback;
  }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const messages = (body.messages || []) as ChatMessage[];
    const productName = String(body.productName || "");
    const productSlug = String(body.productSlug || "");
    const pricingCategory = body.pricingCategory ? String(body.pricingCategory) : null;
    const configurationSummary = body.configurationSummary ? String(body.configurationSummary) : undefined;
    const locale = String(body.locale || "ar");

    if (!messages.length) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const context = buildDesignUserContext({
      productName,
      productSlug,
      pricingCategory,
      configurationSummary,
      locale,
    });

    const openaiMessages = [
      { role: "system", content: DESIGN_SYSTEM_PROMPT },
      { role: "system", content: `Design context:\n${context}` },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: getChoicesModel(),
        temperature: 0.65,
        response_format: { type: "json_object" },
        messages: openaiMessages,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI chat error:", err);
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    const parsed = parseDesignResponse(content);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Design chat error:", error);
    return NextResponse.json({ error: "Design chat failed" }, { status: 500 });
  }
}
