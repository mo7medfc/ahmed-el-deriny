const REFINE_URL = "https://api.openai.com/v1/chat/completions";

import type { DesignConfigurationState } from "./design-studio";
import {
  buildDimensionPromptBlock,
  resolveDimensions,
  NEGATIVE_AVOID_BLOCK,
} from "./design-dimensions";
import { getRefineModel } from "./openai-models";

export async function refineDesignPromptForImage(
  apiKey: string,
  designPrompt: string,
  productType: string,
  imageSize: string,
  configurationState?: DesignConfigurationState,
  pricingCategory?: string | null,
  customerDescription?: string
): Promise<string> {
  const dims = resolveDimensions(configurationState, pricingCategory);
  const dimBlock = buildDimensionPromptBlock(dims, pricingCategory);
  const isStamp = dims.isStamp || productType === "stamp";

  const res = await fetch(REFINE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getRefineModel(),
      temperature: 0.45,
      messages: [
        {
          role: "system",
          content: `You are the final quality gate — senior art director at Ahmed El-Deriny print house (est. 1918).
Polish into the PERFECT gpt-image-2 image prompt (highest quality print artwork). Output ONLY the prompt text.

ENHANCE: richer colors (hex), sharper layout zones, more decorative flair, stunning typography.
Make it BREATHTAKING — world-class print design, NOT generic template.
Preserve all Arabic print text exactly. Preserve exact dimensions.
FLAT 2D, no mockup.
${isStamp ? "STAMP: black ink on white cliche only." : ""}
${NEGATIVE_AVOID_BLOCK}
End with: "Masterpiece flat print artwork, exact aspect ratio, ultra high resolution, no watermark."`,
        },
        {
          role: "user",
          content: [
            `Product: ${productType}`,
            `Canvas: ${imageSize}`,
            customerDescription ? `Customer said: ${customerDescription}` : "",
            dimBlock,
            `Creative prompt to polish:\n${designPrompt}`,
          ]
            .filter(Boolean)
            .join("\n\n"),
        },
      ],
    }),
  });

  if (!res.ok) return designPrompt;

  const data = await res.json();
  const refined = data.choices?.[0]?.message?.content?.trim();
  return refined || designPrompt;
}
