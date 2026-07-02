/**
 * Extract product catalog using VM evaluation of legacy pricing modules.
 * Run: node scripts/extract-catalog-vm.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import vm from "vm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LEGACY_JS = "C:\\Users\\mo7me\\OneDrive\\Desktop\\abdo gded\\site\\assets\\js";

const PRICING_FILES = readdirSync(LEGACY_JS).filter(
  (f) => f.endsWith("-pricing.js") && f !== "shippingPricingService.js"
);

function loadPricingModule(filePath) {
  const content = readFileSync(filePath, "utf8");
  const sandbox = { window: {}, console, Math, parseFloat, parseInt, Array, Object, String, Number, Boolean };
  vm.createContext(sandbox);
  vm.runInContext(content, sandbox);

  for (const val of Object.values(sandbox.window)) {
    if (val && typeof val === "object" && (val.CATEGORY_ID || val.PRODUCTS || val.GROUPS)) {
      return val;
    }
  }
  return null;
}

function serializeProducts(products) {
  if (!products) return [];
  const list = typeof products === "object" && !Array.isArray(products) ? Object.values(products) : products;
  return list.map((p) => ({
    id: p.id,
    nameAr: p.nameAr || p.name,
    nameEn: p.name || p.nameAr,
    groupId: p.groupId || null,
    subCategoryId: p.subCategoryId || null,
    hasLamination: p.hasLamination || false,
    widthCm: p.widthCm || null,
    heightCm: p.heightCm || null,
  }));
}

function serializeGroups(groups) {
  if (!groups) return [];
  const list = typeof groups === "object" && !Array.isArray(groups) ? Object.values(groups) : groups;
  return list.map((g) => ({
    id: g.id,
    nameAr: g.nameAr || g.name,
    nameEn: g.name || g.nameAr,
    products: g.products || [],
  }));
}

function serializeAddons(addons) {
  if (!addons) return {};
  if (Array.isArray(addons)) {
    return { default: addons.map((a) => ({ id: a.id, nameAr: a.nameAr, nameEn: a.name, unit: a.unit })) };
  }
  const out = {};
  for (const [key, list] of Object.entries(addons)) {
    if (!Array.isArray(list)) continue;
    out[key] = list.map((a) => ({
      id: a.id,
      nameAr: a.nameAr,
      nameEn: a.name,
      unit: a.unit,
      maxWidth: a.maxWidth ?? null,
    }));
  }
  return out;
}

const catalog = { categories: [], generatedAt: new Date().toISOString() };

for (const file of PRICING_FILES) {
  const mod = loadPricingModule(join(LEGACY_JS, file));
  if (!mod) continue;

  const categoryId =
    mod.CATEGORY_ID ||
    (file === "outdoor-pricing.js"
      ? "Outdoor"
      : file === "indoor-pricing.js"
        ? "Indoor"
        : file.replace("-pricing.js", "").replace(/-/g, "_"));

  const products = serializeProducts(mod.PRODUCTS || mod.TIERS || mod.SIZES);
  const groups = serializeGroups(mod.GROUPS || mod.SUB_CATEGORIES);
  const addons = serializeAddons(mod.GROUP_ADDONS);

  catalog.categories.push({
    module: file.replace("-pricing.js", ""),
    categoryId,
    slug: categoryId.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    file,
    groups,
    addons,
    products,
    defaults: {
      pricePerMeter: mod.DEFAULT_PRICE_PER_METER || null,
      clicheSellPerCm2: mod.DEFAULT_CLICHE_SELL_PER_CM2 || null,
      paperTypes: mod.DEFAULT_PAPER_TYPES || null,
      quantities: mod.DEFAULT_QUANTITIES || null,
    },
    productCount: products.length,
  });
}

catalog.categories.sort((a, b) => a.categoryId.localeCompare(b.categoryId));
catalog.totalProducts = catalog.categories.reduce((s, c) => s + c.productCount, 0);

const outPath = join(__dirname, "..", "prisma", "catalog-export.json");
writeFileSync(outPath, JSON.stringify(catalog, null, 2), "utf8");

console.log(`✅ Extracted ${catalog.categories.length} categories, ${catalog.totalProducts} products`);
for (const c of catalog.categories.filter((x) => x.productCount > 0).slice(0, 10)) {
  console.log(`   ${c.categoryId}: ${c.productCount} products`);
}
