import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type { DesignImageSize } from "@/lib/ai/design-prompts";
import { refineDesignPromptForImage } from "@/lib/ai/refine-prompt";

const OPENAI_IMAGE_URL = "https://api.openai.com/v1/images/generations";

const VALID_SIZES = new Set<DesignImageSize>(["1024x1024", "1792x1024", "1024x1792"]);

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
    const designPrompt = String(body.designPrompt || "").trim();
    const imageSize = (body.imageSize || "1024x1024") as DesignImageSize;
    const productType = String(body.productType || "design");

    if (!designPrompt) {
      return NextResponse.json({ error: "designPrompt is required" }, { status: 400 });
    }

    const size = VALID_SIZES.has(imageSize) ? imageSize : "1024x1024";
    const refinedPrompt = await refineDesignPromptForImage(apiKey, designPrompt, productType, size);

    const res = await fetch(OPENAI_IMAGE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL || "dall-e-3",
        prompt: refinedPrompt,
        style: "natural",
        n: 1,
        size,
        quality: "hd",
        response_format: "b64_json",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI image error:", err);
      return NextResponse.json({ error: "Image generation failed" }, { status: 502 });
    }

    const data = await res.json();
    const b64 = data.data?.[0]?.b64_json as string | undefined;
    if (!b64) {
      return NextResponse.json({ error: "No image returned" }, { status: 502 });
    }

    const filename = `ai-${productType}-${uuidv4()}.png`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), Buffer.from(b64, "base64"));

    return NextResponse.json({
      url: `/uploads/${filename}`,
      dataUrl: `data:image/png;base64,${b64}`,
      filename,
      imageSize: size,
    });
  } catch (error) {
    console.error("Design generate error:", error);
    return NextResponse.json({ error: "Design generation failed" }, { status: 500 });
  }
}
