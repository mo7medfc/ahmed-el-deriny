import { NextRequest, NextResponse } from "next/server";
import type { DesignImageSize } from "@/lib/ai/design-prompts";
import { refineDesignPromptForImage } from "@/lib/ai/refine-prompt";
import type { DesignConfigurationState } from "@/lib/ai/design-studio";
import { enrichDesignPrompt } from "@/lib/ai/design-dimensions";
import { expandCreativeBrief } from "@/lib/ai/creative-director";
import { resolveProductType } from "@/lib/ai/design-studio";
import { isServerlessRuntime, saveUploadBuffer } from "@/lib/server-upload";

import { getImageModel } from "@/lib/ai/openai-models";
import { corsPreflight, withCors } from "@/lib/cors";

const OPENAI_IMAGE_URL = "https://api.openai.com/v1/images/generations";
const IMAGE_MODEL = getImageModel();

function toApiSize(imageSize: DesignImageSize): string {
  if (IMAGE_MODEL === "dall-e-3") return imageSize;
  const map: Record<DesignImageSize, string> = {
    "1024x1024": "1024x1024",
    "1792x1024": "1536x1024",
    "1024x1792": "1024x1536",
  };
  return map[imageSize] || "1024x1024";
}

function buildImageRequestBody(prompt: string, size: string) {
  if (IMAGE_MODEL === "dall-e-3") {
    return {
      model: "dall-e-3",
      prompt,
      n: 1,
      size,
      quality: "hd",
      response_format: "b64_json",
    };
  }
  if (IMAGE_MODEL === "gpt-image-2" || IMAGE_MODEL === "gpt-image-1.5") {
    return { model: IMAGE_MODEL, prompt, n: 1, size, quality: "high" };
  }
  return { model: IMAGE_MODEL, prompt, n: 1, size };
}

async function generateOneImage(
  apiKey: string,
  prompt: string,
  size: string,
  productType: string
) {
  const res = await fetch(OPENAI_IMAGE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildImageRequestBody(prompt.slice(0, 3900), size)),
  });

  if (!res.ok) {
    const err = await res.text();
    let detail = "Image generation failed";
    try {
      detail = JSON.parse(err)?.error?.message || detail;
    } catch {
      /* keep */
    }
    throw new Error(detail);
  }

  const data = await res.json();
  let b64 = data.data?.[0]?.b64_json as string | undefined;

  if (!b64 && data.data?.[0]?.url) {
    const imgRes = await fetch(data.data[0].url);
    if (imgRes.ok) {
      b64 = Buffer.from(await imgRes.arrayBuffer()).toString("base64");
    }
  }

  if (!b64) throw new Error("No image returned");

  const buffer = Buffer.from(b64, "base64");
  const saved = await saveUploadBuffer(buffer, ".png", `ai-${productType}`);
  const dataUrl = `data:image/png;base64,${b64}`;

  return {
    url:
      !isServerlessRuntime() && saved.publicPath
        ? saved.publicPath
        : dataUrl,
    dataUrl,
    filename: saved.filename,
  };
}

export function OPTIONS(request: NextRequest) {
  return corsPreflight(request.headers.get("origin"));
}

export async function POST(request: NextRequest) {
  return withCors(await handleGenerate(request), request.headers.get("origin"));
}

async function handleGenerate(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const designPrompt = String(body.designPrompt || "").trim();
    let imageSize = (body.imageSize || "1024x1024") as DesignImageSize;
    const configurationState = body.configurationState as DesignConfigurationState | undefined;
    const pricingCategory = body.pricingCategory ? String(body.pricingCategory) : null;
    const productType = resolveProductType(body.productType, pricingCategory);
    const customerDescription = String(body.customerDescription || "").trim();
    const selections = (body.selections || {}) as Record<string, string>;
    const locale = String(body.locale || "ar");
    const editMode = Boolean(body.editMode);
    const editInstructions = String(body.editInstructions || "").trim();
    const previousPrompt = String(body.previousPrompt || "").trim();
    const variantCount = editMode ? 1 : Math.min(Math.max(Number(body.variantCount) || 2, 1), 2);

    if (!designPrompt && !previousPrompt) {
      return NextResponse.json({ error: "designPrompt is required" }, { status: 400 });
    }

    const enriched = enrichDesignPrompt(designPrompt || previousPrompt, configurationState, pricingCategory);
    imageSize = enriched.imageSize;
    const size = toApiSize(imageSize);

    const buildPromptForVariant = async (variantIndex: number) => {
      const creativePrompt = await expandCreativeBrief(apiKey, {
        customerDescription: customerDescription || designPrompt,
        designPrompt: enriched.prompt,
        productType,
        selections,
        configurationState,
        pricingCategory,
        locale,
        variantIndex,
        variantTotal: variantCount,
        editMode,
        editInstructions,
        previousPrompt,
      });

      return refineDesignPromptForImage(
        apiKey,
        creativePrompt,
        productType,
        size,
        configurationState,
        pricingCategory,
        customerDescription
      );
    };

    const prompts = await Promise.all(
      Array.from({ length: variantCount }, (_, i) => buildPromptForVariant(i))
    );

    const lastPrompt = prompts[0];

    const variants = await Promise.all(
      prompts.map((p) => generateOneImage(apiKey, p, size, productType))
    );

    const first = variants[0];

    return NextResponse.json({
      variants,
      lastPrompt,
      url: first.url,
      dataUrl: first.dataUrl,
      filename: first.filename,
      imageSize: size,
    });
  } catch (error) {
    console.error("Design generate error:", error);
    const msg = error instanceof Error ? error.message : "Design generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
