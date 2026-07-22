import { readFileSync } from "fs";

const env = readFileSync(".env", "utf8");
const key = env.match(/OPENAI_API_KEY="([^"]+)"/)?.[1];
if (!key) throw new Error("No API key");

const models = [
  { label: "gpt-image-2 high", body: { model: "gpt-image-2", prompt: "Flat red circle on white", n: 1, size: "1024x1024", quality: "high" } },
  { label: "gpt-image-1.5 high", body: { model: "gpt-image-1.5", prompt: "Flat red circle on white", n: 1, size: "1024x1024", quality: "high" } },
  { label: "gpt-image-1", body: { model: "gpt-image-1", prompt: "Flat red circle on white", n: 1, size: "1024x1024" } },
  { label: "dall-e-3 hd", body: { model: "dall-e-3", prompt: "Flat red circle on white", n: 1, size: "1024x1024", quality: "hd" } },
];

for (const { label, body } of models) {
  const r = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const t = await r.text();
  let msg = t.slice(0, 300);
  try {
    const j = JSON.parse(t);
    msg = j.error?.message || (j.data ? "OK - image returned" : t.slice(0, 200));
  } catch {
    /* raw */
  }
  console.log(`${label}: ${r.status} — ${msg}`);
}
