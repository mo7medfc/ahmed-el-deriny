import { readFileSync } from "fs";

const env = readFileSync(".env", "utf8");
const key = env.match(/OPENAI_API_KEY="([^"]+)"/)?.[1];
if (!key) throw new Error("No API key");

async function test(label, body) {
  const r = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const t = await r.text();
  console.log(`\n=== ${label} (${r.status}) ===`);
  console.log(t.slice(0, 500));
}

await test("dall-e-3 hd", {
  model: "dall-e-3",
  prompt: "Flat red circle on white, print design",
  n: 1,
  size: "1024x1024",
  quality: "hd",
});

await test("dall-e-3 standard url", {
  model: "dall-e-3",
  prompt: "Flat red circle on white, print design",
  n: 1,
  size: "1024x1024",
});

await test("gpt-image-1", {
  model: "gpt-image-1",
  prompt: "Flat red circle on white, print design",
  n: 1,
  size: "1024x1024",
});
