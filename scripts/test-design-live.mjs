const BASE = process.env.AI_BASE || "https://ahmed-deriny.vercel.app";
const ORIGIN = "https://mo7medfc.github.io";

const product = {
  productName: "رول أب عرض 100 سم — بانر",
  productSlug: "stands-roll-up-100-banner",
  pricingCategory: "Stands",
  configurationSummary: "الكمية: 1",
  configurationState: {
    category: "Stands",
    productSlug: "stands-roll-up-100-banner",
    productName: "رول أب عرض 100 سم — بانر",
    pricingType: "stands",
    quantity: 1,
  },
};

const description =
  "رول أب لمطعم كشري اسمه كشري التحرير، شعار المطعم أصفر وأحمر، عايز صورة طبق كشري، والتليفون 01001234567، وعنوان: شارع الجمهورية - القاهرة";

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ORIGIN },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${path} ${res.status}: ${text.slice(0, 400)}`);
  return { json: JSON.parse(text), cors: res.headers.get("access-control-allow-origin") };
}

const t0 = Date.now();
const choices = await post("/api/design-choices", {
  ...product,
  description,
  selections: {},
  skip: true,
  locale: "ar",
});

console.log("CORS header:", choices.cors);
console.log("readyToGenerate:", choices.json.readyToGenerate, "| imageSize:", choices.json.imageSize);
console.log("\n--- designPrompt ---\n" + (choices.json.designPrompt || "(none)"));

const gen = await post("/api/design-generate", {
  ...product,
  designPrompt: choices.json.designPrompt,
  imageSize: choices.json.imageSize,
  productType: choices.json.productType,
  customerDescription: description,
  selections: {},
  locale: "ar",
  variantCount: 1,
});

console.log(`\nGenerated in ${((Date.now() - t0) / 1000).toFixed(0)}s | canvas ${gen.json.imageSize}`);

const b64 = gen.json.variants[0].dataUrl.split(",")[1];
const { writeFileSync } = await import("fs");
writeFileSync("tmp-rollup-test.png", Buffer.from(b64, "base64"));
console.log("saved tmp-rollup-test.png");
console.log("\n--- final image prompt (first 1200 chars) ---\n" + gen.json.lastPrompt.slice(0, 1200));
