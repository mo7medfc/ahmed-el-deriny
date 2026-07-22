import type { DesignConfigurationState } from "./design-studio";
import { resolveProductType } from "./design-studio";
import { TEXT_ON_IMAGE_RULE } from "./creative-director";
import {
  buildDimensionPromptBlock,
  resolveDimensions,
  enrichDesignPrompt,
} from "./design-dimensions";
import type { DesignImageSize, DesignProductType } from "./design-prompts";

export interface DesignChoiceOption {
  id: string;
  labelAr: string;
  labelEn: string;
}

export interface DesignChoiceResponse {
  message: string;
  stepType: "choices" | "text" | "ready";
  questionId: string | null;
  options: DesignChoiceOption[];
  placeholderAr?: string;
  placeholderEn?: string;
  required?: boolean;
  readyToGenerate: boolean;
  designPrompt: string | null;
  productType: DesignProductType;
  imageSize: DesignImageSize;
  designBrief: string | null;
}

export const DESIGN_CHOICE_SYSTEM_PROMPT = `You are a SENIOR creative director at "Ahmed El-Deriny Printing House" (مطابع أحمد الدريني), Egypt — est. 1918.

Your job: guide the customer through a PROFESSIONAL design wizard using ONLY choice buttons or short text inputs — NEVER free-form chat.

FLOW:
1. Customer describes what they want in their first message.
2. You analyze: product category from context + their description.
3. Ask ONE question at a time. Each question MUST have 2-6 clickable options in "options" array — except when exact custom text is unavoidable (names, phone, CR number) → use stepType "text".
4. Questions MUST be relevant to the product type. NEVER reuse the same question set for every product.

PRODUCT-SPECIFIC RULES:
- STAMP (ختم): focus on stamp imprint artwork — black ink on white, stamp face shape from order size, text layout inside stamp boundary, font style (formal/decorative), border. Do NOT ask about marketing banners or brochure folds.
- BANNER / ROLL-UP / OUTDOOR: focus on bold modern professional layout, headline hierarchy, brand colors, CTA zone, photo vs graphic style. Large readable typography.
- BROCHURE / FLYER / CATALOG: focus on text hierarchy, fold layout (tri-fold/bi-fold), sections, headline/subhead/body, color palette, imagery style. Flat unfolded layout.
- BUSINESS CARD: front face layout, logo placement, contact info structure, premium vs minimal.
- NOTEBOOK / DAFATER / INVOICE: cover layout, title placement, serial area, formal business style.
- ENVELOPE: logo + address block layout, window vs full face.

CONTEXT AWARENESS:
- Use "Current order options" (size, ink color, machine type, dimensions) — do NOT re-ask what customer already selected.
- If ink color already chosen as black, don't ask color again for stamps.
- CRITICAL: Customer already selected EXACT print dimensions in the order configurator. The design MUST match those dimensions precisely (width × height cm, shape, aspect ratio). Read "DIMENSIONS" in context — never ignore them.
- NEVER ask the customer about print size, width, height, or aspect ratio — they already chose it in the product configurator.
- When dimensions are present in context, go straight to creative questions (colors, style, headline text) or generate immediately.
- Ask 0-2 questions MAX after the description. Prefer ZERO questions if the description already has enough detail (name, text, style).
- After the customer answers ONE question, set readyToGenerate=true unless absolutely critical info is missing.
- NEVER ask more than 2 questions total. If in doubt, generate with smart defaults.

LANGUAGE: message field in customer's locale (Arabic or English).

When readyToGenerate=true:
- stepType must be "ready"
- options empty
${TEXT_ON_IMAGE_RULE}
- designPrompt in ENGLISH: rich creative brief for image AI.
  Extract print content from description (names, phones, titles) — do NOT put instruction sentences on the design.
  Include layout, colors, typography, dimensions. Creative premium quality. NO mockups.
- productType must match the product.
- imageSize: use the DIMENSIONS hint from context (landscape 1792x1024 for wide items, portrait 1024x1792 for tall, square 1024x1024 for round/square).

JSON ONLY:
{
  "message": "سؤال واحد واضح للعميل",
  "stepType": "choices",
  "questionId": "font_style",
  "options": [
    { "id": "formal", "labelAr": "خط رسمي", "labelEn": "Formal" },
    { "id": "decorative", "labelAr": "خط مزخرف", "labelEn": "Decorative" }
  ],
  "placeholderAr": null,
  "placeholderEn": null,
  "required": true,
  "readyToGenerate": false,
  "designPrompt": null,
  "productType": "stamp",
  "imageSize": "1024x1024",
  "designBrief": null
}`;

export const DESIGN_SKIP_PROMPT = `Customer pressed SKIP — skip ALL remaining questions immediately.

Use the customer description + product context + order options + any selections already made.
Fill in reasonable professional defaults for anything not specified (font, colors, layout).
Set readyToGenerate=true, stepType="ready", options=[].
Build a complete designPrompt in ENGLISH for flat print artwork.
START with customer description — design EXACTLY what they asked for, creatively and professionally.
MUST use EXACT dimensions from context.
STAMP = black ink on white only. NO generic colored square template.
NO mockups.`;

export function buildChoiceUserContext(input: {
  productName: string;
  productSlug: string;
  pricingCategory?: string | null;
  configurationSummary?: string;
  configurationState?: DesignConfigurationState;
  locale: string;
  description: string;
  selections: Record<string, string>;
}) {
  const lines = [
    `Product page: ${input.productName} (${input.productSlug})`,
    input.pricingCategory ? `Category: ${input.pricingCategory}` : null,
    input.configurationSummary ? `Current order options: ${input.configurationSummary}` : null,
    input.configurationState
      ? buildDimensionPromptBlock(
          resolveDimensions(input.configurationState, input.pricingCategory),
          input.pricingCategory
        )
      : null,
    `Customer locale: ${input.locale}`,
    `Customer description: ${input.description}`,
    Object.keys(input.selections).length
      ? `Selections so far: ${JSON.stringify(input.selections)}`
      : "Selections so far: none",
  ].filter(Boolean);

  return lines.join("\n");
}

export function parseDesignChoiceResponse(raw: string): DesignChoiceResponse {
  const fallback: DesignChoiceResponse = {
    message: raw,
    stepType: "choices",
    questionId: null,
    options: [],
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
    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as Partial<DesignChoiceResponse>;

    const options = Array.isArray(parsed.options)
      ? parsed.options
          .filter((o) => o && typeof o.id === "string")
          .map((o) => ({
            id: String(o.id),
            labelAr: String(o.labelAr || o.id),
            labelEn: String(o.labelEn || o.id),
          }))
      : [];

    return {
      message: typeof parsed.message === "string" ? parsed.message : fallback.message,
      stepType:
        parsed.stepType === "text" || parsed.stepType === "ready" || parsed.stepType === "choices"
          ? parsed.stepType
          : parsed.readyToGenerate
            ? "ready"
            : "choices",
      questionId: typeof parsed.questionId === "string" ? parsed.questionId : null,
      options,
      placeholderAr: typeof parsed.placeholderAr === "string" ? parsed.placeholderAr : undefined,
      placeholderEn: typeof parsed.placeholderEn === "string" ? parsed.placeholderEn : undefined,
      required: parsed.required !== false,
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

export function applyDimensionEnrichment(
  response: DesignChoiceResponse,
  configurationState?: DesignConfigurationState,
  pricingCategory?: string | null
): DesignChoiceResponse {
  if (!response.readyToGenerate || !response.designPrompt) return response;
  const enriched = enrichDesignPrompt(response.designPrompt, configurationState, pricingCategory);
  return {
    ...response,
    designPrompt: enriched.prompt,
    imageSize: enriched.imageSize,
    productType: resolveProductType(response.productType, pricingCategory) as DesignChoiceResponse["productType"],
  };
}
