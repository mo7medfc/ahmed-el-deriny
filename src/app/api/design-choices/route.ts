import { NextRequest, NextResponse } from "next/server";
import type { DesignConfigurationState } from "@/lib/ai/design-studio";
import {
  buildChoiceUserContext,
  DESIGN_CHOICE_SYSTEM_PROMPT,
  DESIGN_SKIP_PROMPT,
  parseDesignChoiceResponse,
  applyDimensionEnrichment,
} from "@/lib/ai/design-choice-prompts";
import { getChoicesModel } from "@/lib/ai/openai-models";
import { corsPreflight, withCors } from "@/lib/cors";
import { describeOpenAiError } from "@/lib/ai/openai-errors";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export function OPTIONS(request: NextRequest) {
  return corsPreflight(request.headers.get("origin"));
}

export async function POST(request: NextRequest) {
  return withCors(await handleChoices(request), request.headers.get("origin"));
}

async function handleChoices(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const description = String(body.description || "").trim();
    const selections = (body.selections || {}) as Record<string, string>;
    const productName = String(body.productName || "");
    const productSlug = String(body.productSlug || "");
    const pricingCategory = body.pricingCategory ? String(body.pricingCategory) : null;
    const configurationSummary = body.configurationSummary ? String(body.configurationSummary) : undefined;
    const configurationState = body.configurationState as DesignConfigurationState | undefined;
    const locale = String(body.locale || "ar");
    const skip = Boolean(body.skip);

    if (!description) {
      return NextResponse.json({ error: "description is required" }, { status: 400 });
    }

    const context = buildChoiceUserContext({
      productName,
      productSlug,
      pricingCategory,
      configurationSummary,
      configurationState,
      locale,
      description,
      selections,
    });

    const selectionLines = Object.entries(selections)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join("\n");

    const answeredCount = Object.keys(selections).length;

    let userPrompt: string;
    if (skip) {
      userPrompt = DESIGN_SKIP_PROMPT;
    } else if (selectionLines) {
      userPrompt =
        answeredCount >= 1
          ? `Customer already answered ${answeredCount} question(s):\n${selectionLines}\n\nYou MUST set readyToGenerate=true now with a complete designPrompt. Do NOT ask more questions.`
          : `Based on the context and these answers:\n${selectionLines}\n\nReturn the NEXT single question as choices, or readyToGenerate if enough info. Prefer readyToGenerate if description is detailed.`;
    } else {
      userPrompt =
        "Customer just described what they want. If description has enough detail (name, text, purpose), set readyToGenerate=true immediately. Otherwise return ONE optional question only.";
    }

    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: getChoicesModel(),
        temperature: 0.55,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: DESIGN_CHOICE_SYSTEM_PROMPT },
          { role: "system", content: `Design context:\n${context}` },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI design-choices error:", err);
      const described = describeOpenAiError(err, res.status);
      return NextResponse.json(
        { error: described.error, code: described.code },
        { status: described.status }
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    const parsed = parseDesignChoiceResponse(content);
    const enriched = applyDimensionEnrichment(
      parsed,
      configurationState,
      pricingCategory
    );

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Design choices error:", error);
    return NextResponse.json({ error: "Design choices failed" }, { status: 500 });
  }
}
