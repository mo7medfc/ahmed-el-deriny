import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export function isServerlessRuntime() {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

/** Writable dir on Vercel/Lambda is /tmp only. */
export function getUploadDir() {
  if (isServerlessRuntime()) {
    return path.join("/tmp", "uploads");
  }
  return path.join(process.cwd(), "public", "uploads");
}

export async function saveUploadBuffer(
  buffer: Buffer,
  ext: string,
  prefix = "file"
): Promise<{ filename: string; publicPath: string | null; saved: boolean }> {
  const filename = `${prefix}-${uuidv4()}${ext.startsWith(".") ? ext : `.${ext}`}`;
  const uploadDir = getUploadDir();
  try {
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);
    return {
      filename,
      publicPath: isServerlessRuntime() ? null : `/uploads/${filename}`,
      saved: true,
    };
  } catch (error) {
    console.warn("Filesystem save skipped:", error);
    return { filename, publicPath: null, saved: false };
  }
}

export function toDataUrl(buffer: Buffer, mime = "image/png") {
  return `data:${mime};base64,${buffer.toString("base64")}`;
}
