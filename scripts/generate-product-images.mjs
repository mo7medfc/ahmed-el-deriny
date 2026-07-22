/**
 * Generate photorealistic product montage images via GPT Image 2.
 * Run: npm run images:generate
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "images", "products");

const env = readFileSync(join(__dirname, "..", ".env"), "utf8");
const key = env.match(/OPENAI_API_KEY="([^"]+)"/)?.[1];
const model = env.match(/OPENAI_IMAGE_MODEL="([^"]+)"/)?.[1] || "gpt-image-2";
if (!key) throw new Error("OPENAI_API_KEY missing in .env");

/** Each file = literal product the shop sells — photorealistic hero montage */
const PRODUCTS = [
  {
    file: "outdoor-banner.jpg",
    prompt:
      "Ultra-realistic commercial product photograph of a large outdoor vinyl flex advertising banner (3 by 6 meters) with vivid colorful professional graphics, mounted on a shop building facade with metal grommets and ropes. Bright Egyptian street daylight, crisp PVC fabric texture, saturated CMYK print colors. Wide landscape hero shot, no people, professional advertising photography.",
  },
  {
    file: "indoor-print.jpg",
    prompt:
      "Ultra-realistic product photograph of glossy indoor poster and banner prints mounted on a modern office wall — large format photo print, matte poster, and foam board display. Clean interior, professional print shop showroom, sharp detail, landscape composition.",
  },
  {
    file: "rollup-100x200.jpg",
    prompt:
      "Ultra-realistic product photograph of a premium retractable roll-up banner stand 85x200cm at a trade exhibition, aluminum silver base, tall glossy vinyl banner with abstract blue and white corporate graphics. Full stand visible center frame, exhibition hall background softly blurred, commercial product photography.",
  },
  {
    file: "roll-up.jpg",
    prompt:
      "Ultra-realistic product photograph of a compact roll-up banner stand 80x200cm on white studio background, retractable stand with colorful printed vinyl graphic, professional e-commerce product shot, sharp focus, slight angle view.",
  },
  {
    file: "x-banner.jpg",
    prompt:
      "Ultra-realistic product photograph of an X-banner display stand (spider stand) with printed promotional vinyl graphic, lightweight metal frame, exhibition or retail setting, full product visible, professional commercial photography.",
  },
  {
    file: "pop-up.jpg",
    prompt:
      "Ultra-realistic product photograph of a curved pop-up exhibition display backdrop wall with printed graphics, portable trade show booth, 3x3 meter backdrop, professional event marketing product shot, wide angle.",
  },
  {
    file: "stamps.jpg",
    prompt:
      "Ultra-realistic product photograph of custom rubber stamps and self-inking office stamps on a clean white desk — wooden handle rubber stamp, round company seal stamp, automatic self-inking stamp with blue ink pad visible. Macro product photography, stationery items, sharp detail.",
  },
  {
    file: "dtf-tshirt.jpg",
    prompt:
      "Ultra-realistic product photograph of custom printed cotton t-shirts with vibrant full-color DTF heat-transfer graphics — three folded t-shirts flat lay on white surface showing vivid logo prints on chest. Apparel printing product showcase, studio lighting, fabric texture visible.",
  },
  {
    file: "business-cards.jpg",
    prompt:
      "Ultra-realistic product photograph of premium printed business cards fanned out on a dark desk — thick cardstock, matte and gloss finishes, elegant blue and white corporate design visible on cards. Professional print product photography, shallow depth of field.",
  },
  {
    file: "envelopes.jpg",
    prompt:
      "Ultra-realistic product photograph of custom printed corporate envelopes in multiple sizes stacked neatly — branded logo on flap, crisp offset print quality, white and kraft envelopes, office stationery product shot.",
  },
  {
    file: "notebooks.jpg",
    prompt:
      "Ultra-realistic product photograph of custom printed notebooks, invoice books and receipt pads stacked — spiral notebooks with branded covers, NCR carbon copy invoice book open showing printed forms. Print shop product photography.",
  },
  {
    file: "uv-printing.jpg",
    prompt:
      "Ultra-realistic product photograph of UV flatbed printing results — printed acrylic signs, phone cases, wooden plaques and promotional items with vivid full-color UV prints arranged on a table. Professional UV printing product showcase.",
  },
  {
    file: "safety-vest.jpg",
    prompt:
      "Ultra-realistic product photograph of high-visibility yellow safety vests with custom company logo and text printed on back and front. Reflective strips, workwear product photography, studio white background.",
  },
  {
    file: "promotional-gifts.jpg",
    prompt:
      "Ultra-realistic product photograph of promotional printed gift items — branded cotton tote bag, ceramic mug with logo, pens, and keychains arranged as product flat lay. Corporate gift printing showcase, clean studio lighting.",
  },
];

const ALIASES = [
  ["outdoor-banner.jpg", "vinyl-banner.jpg"],
  ["outdoor-banner.jpg", "vinyl-flex.jpg"],
  ["outdoor-banner.jpg", "flex-banner.jpg"],
  ["outdoor-banner.jpg", "banners.jpg"],
  ["outdoor-banner.jpg", "outdoor-banner-src.jpg"],
  ["outdoor-banner.jpg", "vinyl-roll.jpg"],
  ["indoor-print.jpg", "lamination.jpg"],
  ["indoor-print.jpg", "posters.jpg"],
  ["indoor-print.jpg", "tableaux.jpg"],
  ["indoor-print.jpg", "poster-a2.jpg"],
  ["rollup-100x200.jpg", "roll-ups.jpg"],
  ["rollup-100x200.jpg", "rollup-85x200.jpg"],
  ["roll-up.jpg", "rollup-85x200.jpg"],
  ["business-cards.jpg", "business-card.jpg"],
  ["business-cards.jpg", "brochures.jpg"],
  ["business-cards.jpg", "flyers.jpg"],
  ["business-cards.jpg", "flyer-a5.jpg"],
  ["notebooks.jpg", "catalogs.jpg"],
  ["notebooks.jpg", "dafater.jpg"],
  ["dtf-tshirt.jpg", "tshirt.jpg"],
  ["safety-vest.jpg", "safety-printing.jpg"],
  ["promotional-gifts.jpg", "sublimation-gifts.jpg"],
  ["promotional-gifts.jpg", "fabric-bag.jpg"],
  ["promotional-gifts.jpg", "paper-bags.jpg"],
  ["promotional-gifts.jpg", "kraft-bags.jpg"],
  ["uv-printing.jpg", "offset-printing.jpg"],
  ["uv-printing.jpg", "default-printing.jpg"],
  ["stamps.jpg", "self-ink-stamp.jpg"],
  ["stamps.jpg", "rubber-stamp.jpg"],
  ["stamps.jpg", "rosary-cards.jpg"],
];

mkdirSync(OUT_DIR, { recursive: true });

async function generate(file, prompt) {
  const body = {
    model,
    prompt: prompt.slice(0, 3900),
    n: 1,
    size: "1536x1024",
    quality: model === "gpt-image-2" || model === "gpt-image-1.5" ? "high" : undefined,
  };

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(JSON.parse(err)?.error?.message || err.slice(0, 200));
  }

  const data = await res.json();
  let b64 = data.data?.[0]?.b64_json;
  if (!b64 && data.data?.[0]?.url) {
    const imgRes = await fetch(data.data[0].url);
    b64 = Buffer.from(await imgRes.arrayBuffer()).toString("base64");
  }
  if (!b64) throw new Error("No image data returned");

  const outPath = join(OUT_DIR, file.replace(/\.jpg$/, ".png"));
  writeFileSync(outPath, Buffer.from(b64, "base64"));

  // Also save as .jpg path (PNG content, browsers handle it)
  const jpgPath = join(OUT_DIR, file);
  writeFileSync(jpgPath, Buffer.from(b64, "base64"));
  return jpgPath;
}

let ok = 0;
console.log(`Generating ${PRODUCTS.length} product images with ${model}...\n`);

for (const { file, prompt } of PRODUCTS) {
  try {
    process.stdout.write(`  ⏳ ${file}...`);
    await generate(file, prompt);
    console.log(" ✓");
    ok++;
    await new Promise((r) => setTimeout(r, 2500));
  } catch (e) {
    console.log(` ✗ ${e.message}`);
  }
}

for (const [src, dst] of ALIASES) {
  try {
    copyFileSync(join(OUT_DIR, src), join(OUT_DIR, dst));
    console.log(`  → ${dst}`);
  } catch {
    /* skip */
  }
}

console.log(`\nDone: ${ok}/${PRODUCTS.length} product montages → ${OUT_DIR}`);
