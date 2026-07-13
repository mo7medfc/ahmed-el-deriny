const REFINE_URL = "https://api.openai.com/v1/chat/completions";

export async function refineDesignPromptForImage(
  apiKey: string,
  designPrompt: string,
  productType: string,
  imageSize: string
): Promise<string> {
  const res = await fetch(REFINE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_REFINE_MODEL || process.env.OPENAI_CHAT_MODEL || "gpt-4o",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `You are a senior graphic designer at a professional Egyptian print house (est. 1918).
Transform the brief into ONE ultra-detailed DALL-E 3 image prompt for a FLAT print-ready artwork.

Rules:
- Output ONLY the final prompt text, no JSON, no explanation.
- FLAT 2D design viewed straight-on (no mockups, no devices, no hands, no 3D room, no folded paper perspective).
- Specify: layout grid, visual hierarchy, exact headline/subhead/body text in quotes, color palette (hex or names), typography style (serif/sans, weight), decorative elements, margins/bleed, background treatment.
- For Arabic text mention "elegant Arabic RTL typography" when relevant.
- For brochures: tri-fold or bi-fold FLAT layout showing all panels side by side.
- For business cards: front face only, standard 9:5 ratio composition centered in frame.
- For banners/posters: bold headline zone, CTA area, brand block.
- Style: premium commercial print, crisp vector-like clarity, professional Egyptian/Gulf market aesthetic.
- End with: "Ultra high resolution flat print artwork, clean edges, no watermark, no mockup frame, no photograph of a product."`,
        },
        {
          role: "user",
          content: `Product type: ${productType}\nCanvas: ${imageSize}\nBrief:\n${designPrompt}`,
        },
      ],
    }),
  });

  if (!res.ok) return designPrompt;

  const data = await res.json();
  const refined = data.choices?.[0]?.message?.content?.trim();
  return refined || designPrompt;
}
