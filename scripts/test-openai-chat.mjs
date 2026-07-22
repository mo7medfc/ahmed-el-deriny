import { readFileSync } from "fs";

const env = readFileSync(".env", "utf8");
const key = env.match(/OPENAI_API_KEY="([^"]+)"/)?.[1];
if (!key) throw new Error("No API key");

const model = process.argv[2] || "gpt-5.4";

const r = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model,
    messages: [{ role: "user", content: "say ok" }],
  }),
});

const d = await r.json();
console.log(model, r.status, d.error?.message || "OK");
