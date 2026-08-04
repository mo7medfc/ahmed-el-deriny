import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { isServerlessRuntime, saveUploadBuffer, toDataUrl } from "@/lib/server-upload";
import { corsPreflight, withCors } from "@/lib/cors";

const MAX_SIZE = 25 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/postscript",
  "application/illustrator",
  "image/vnd.adobe.photoshop",
];

function mimeFromExt(ext: string) {
  const map: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".pdf": "application/pdf",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  return map[ext.toLowerCase()] || "application/octet-stream";
}

export function OPTIONS(request: NextRequest) {
  return corsPreflight(request.headers.get("origin"));
}

export async function POST(request: NextRequest) {
  return withCors(await handleUpload(request), request.headers.get("origin"));
}

async function handleUpload(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 400 });
    }

    const ext = path.extname(file.name) || ".bin";
    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = file.type || mimeFromExt(ext);
    const saved = await saveUploadBuffer(buffer, ext, "upload");
    const dataUrl = toDataUrl(buffer, mime);

    // On Vercel, filesystem is ephemeral — prefer data URL so the cart keeps the file.
    const url =
      !isServerlessRuntime() && saved.publicPath
        ? saved.publicPath
        : dataUrl;

    return NextResponse.json({
      url,
      dataUrl,
      filename: file.name,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
