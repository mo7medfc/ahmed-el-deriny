import type { DesignConfigurationState } from "./design-studio";
import {
  buildDimensionPromptBlock,
  resolveDimensions,
  NEGATIVE_AVOID_BLOCK,
} from "./design-dimensions";
import { getCreativeModel, getMainChatModel } from "./openai-models";

const CREATIVE_URL = "https://api.openai.com/v1/chat/completions";

export interface CreativeBriefInput {
  customerDescription: string;
  designPrompt: string;
  productType: string;
  selections?: Record<string, string>;
  configurationState?: DesignConfigurationState;
  pricingCategory?: string | null;
  locale?: string;
  variantIndex?: number;
  variantTotal?: number;
  editMode?: boolean;
  editInstructions?: string;
  previousPrompt?: string;
}

export const TEXT_ON_IMAGE_RULE = `TEXT ON IMAGE — CRITICAL:
- Customer description = INSTRUCTIONS for the designer. Do NOT print the description itself on the artwork.
- Extract ONLY real print content: business names, person names, phone numbers, CR numbers, titles, slogans the customer wants VISIBLE.
- NEVER render meta/instruction phrases on the design, such as:
  "تصميم مريح", "إضافة إبداعية", "عصري واحترافي", "أريد", "عايز", "صمم لي", "design for me", "creative modern professional"
- Example: "بانر جمعية خيرية اسمها أعمال خيرية تليفون 010..." → ON image: "أعمال خيرية" + phone only. NOT the instruction sentence.`;

interface DesignAnalysis {
  printTexts: string[];
  mood: string;
  colorPalette: string[];
  layoutConcept: string;
  typography: string;
  decorativeElements: string;
  creativeVision: string;
}

const ANALYZE_SYSTEM = `You are the lead creative strategist at Ahmed El-Deriny Printing House (مطابع أحمد الدريني), Egypt's premier print studio since 1918.
Analyze the customer request and output JSON only.

${TEXT_ON_IMAGE_RULE}

Extract:
- printTexts: ONLY Arabic/English text that must appear ON the printed design (names, phones, titles). NOT instruction sentences.
- mood: emotional tone (e.g. "luxurious corporate", "warm charitable trust", "bold modern energy")
- colorPalette: 3-5 specific colors with hex codes
- layoutConcept: detailed layout description (zones, hierarchy, composition — be creative and specific)
- typography: exact Arabic font style recommendations
- decorativeElements: borders, patterns, icons, textures, geometric accents
- creativeVision: 2-3 sentences describing the stunning final design vision — magazine-quality, NOT generic template

JSON format:
{"printTexts":[],"mood":"","colorPalette":[],"layoutConcept":"","typography":"","decorativeElements":"","creativeVision":""}`;

const PROMPT_WRITER_SYSTEM = `You are an award-winning art director writing the FINAL image generation prompt for Ahmed El-Deriny print house.
You receive a creative analysis and must output ONE ultra-detailed prompt in ENGLISH (600-1000 words).

The prompt must produce a BREATHTAKING, PROFESSIONAL, UNIQUE print design — the quality of a top Cairo/Berlin design agency.

Include:
- Exact quoted print text in Arabic
- Precise layout with zones (header 20%, hero 40%, footer 15%, etc.)
- Every color with hex code and where it's used
- Typography: font style, weight, size relationships
- Decorative elements: patterns, borders, icons, gradients, textures
- Mood and atmosphere
- EXACT dimensions and aspect ratio from the brief
- FLAT 2D artwork, straight-on, NO mockup, NO device, NO watermark

STAMP: black ink on white cliche only.
Make it VISUALLY STUNNING — not boring, not template-like.`;

const EDIT_SYSTEM = `You are editing an existing print design. Apply ONLY requested changes.
Do NOT print the edit instruction on the design. Output ONE updated image prompt in ENGLISH.`;

async function chatComplete(
  apiKey: string,
  system: string,
  user: string,
  opts?: { json?: boolean; temperature?: number; model?: string }
) {
  const res = await fetch(CREATIVE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: opts?.model || getCreativeModel(),
      temperature: opts?.temperature ?? 0.7,
      ...(opts?.json ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function analyzeBrief(
  apiKey: string,
  input: CreativeBriefInput,
  dimBlock: string
): Promise<DesignAnalysis | null> {
  const selectionText = input.selections
    ? Object.entries(input.selections).map(([k, v]) => `${k}: ${v}`).join("\n")
    : "none";

  const raw = await chatComplete(
    apiKey,
    ANALYZE_SYSTEM,
    [
      `Product: ${input.productType}`,
      `Locale: ${input.locale || "ar"}`,
      dimBlock,
      `Customer description:\n${input.customerDescription}`,
      `Selections: ${selectionText}`,
      `Analyze and return JSON.`,
    ].join("\n\n"),
    { json: true, temperature: 0.4, model: getMainChatModel() }
  );

  if (!raw) return null;

  try {
    return JSON.parse(raw) as DesignAnalysis;
  } catch {
    return null;
  }
}

async function writeImagePrompt(
  apiKey: string,
  analysis: DesignAnalysis,
  input: CreativeBriefInput,
  dimBlock: string,
  variantHint: string
): Promise<string | null> {
  return chatComplete(
    apiKey,
    PROMPT_WRITER_SYSTEM,
    [
      `Product: ${input.productType}`,
      variantHint,
      dimBlock,
      NEGATIVE_AVOID_BLOCK,
      `Creative analysis:`,
      JSON.stringify(analysis, null, 2),
      `Draft brief: ${input.designPrompt}`,
      `Write the final stunning image generation prompt now.`,
    ]
      .filter(Boolean)
      .join("\n\n"),
    { temperature: 0.65, model: getMainChatModel() }
  );
}

export async function expandCreativeBrief(
  apiKey: string,
  input: CreativeBriefInput
): Promise<string> {
  if (input.editMode && input.editInstructions && input.previousPrompt) {
    return expandEditBrief(apiKey, input);
  }

  const dims = resolveDimensions(input.configurationState, input.pricingCategory);
  const dimBlock = buildDimensionPromptBlock(dims, input.pricingCategory);

  const variantHint =
    input.variantTotal && input.variantTotal > 1
      ? input.variantIndex === 0
        ? "VARIANT A: timeless elegant — refined classical Arabic aesthetics, gold accents, ornamental sophistication."
        : "VARIANT B: cutting-edge modern — dynamic asymmetric layout, bold contemporary Arabic typography, fresh creative energy."
      : "";

  const analysis = await analyzeBrief(apiKey, input, dimBlock);

  if (analysis) {
    const prompt = await writeImagePrompt(apiKey, analysis, input, dimBlock, variantHint);
    if (prompt) return prompt;
  }

  const fallback = await chatComplete(
    apiKey,
    PROMPT_WRITER_SYSTEM,
    [
      `Product: ${input.productType}`,
      variantHint,
      dimBlock,
      `Customer description:\n${input.customerDescription}`,
      NEGATIVE_AVOID_BLOCK,
      `Write the final image prompt.`,
    ].join("\n\n"),
    { temperature: 0.7, model: getMainChatModel() }
  );

  return fallback || input.designPrompt;
}

async function expandEditBrief(
  apiKey: string,
  input: CreativeBriefInput
): Promise<string> {
  const result = await chatComplete(
    apiKey,
    EDIT_SYSTEM,
    [
      `Original prompt:\n${input.previousPrompt}`,
      `Edit request:\n${input.editInstructions}`,
      TEXT_ON_IMAGE_RULE,
      `Write updated prompt.`,
    ].join("\n\n"),
    { temperature: 0.55, model: getMainChatModel() }
  );

  return result || input.previousPrompt || input.designPrompt;
}
