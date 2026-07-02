/**
 * Extract product catalog from abdo gded pricing JS modules.
 * Run: node scripts/extract-catalog.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LEGACY_JS = "C:\\Users\\mo7me\\OneDrive\\Desktop\\abdo gded\\site\\assets\\js";

const PRICING_FILES = readdirSync(LEGACY_JS).filter(
  (f) => f.endsWith("-pricing.js") && f !== "shippingPricingService.js"
);

function extractCategoryId(content) {
  const m = content.match(/CATEGORY_ID:\s*['"]([^'"]+)['"]/);
  return m ? m[1] : null;
}

function extractProducts(content) {
  const products = [];
  const productsMatch = content.match(/PRODUCTS:\s*\{([\s\S]*?)\n\s*\},?\n\s*(?:GROUP_ADDONS|SUB_CATEGORIES|getProduct|getAllProducts|DEFAULT|\/\*\*)/);
  if (!productsMatch) return products;

  const block = productsMatch[1];
  const productRegex = /['"]([^'"]+)['"]\s*:\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
  let match;

  while ((match = productRegex.exec(block)) !== null) {
    const id = match[1];
    const body = match[2];
    const nameAr = body.match(/nameAr:\s*['"]([^'"]+)['"]/)?.[1];
    const name = body.match(/name:\s*['"]([^'"]+)['"]/)?.[1];
    const groupId = body.match(/groupId:\s*['"]([^'"]+)['"]/)?.[1];
    const subCategoryId = body.match(/subCategoryId:\s*['"]([^'"]+)['"]/)?.[1];

    if (nameAr || name) {
      products.push({ id, nameAr: nameAr || name, nameEn: name || nameAr, groupId, subCategoryId });
    }
  }
  return products;
}

function extractGroups(content) {
  const groups = [];
  const groupsMatch = content.match(/GROUPS:\s*\{([\s\S]*?)\n\s*\},?\n\s*(?:PRODUCTS|GROUP_ADDONS)/);
  if (!groupsMatch) return groups;

  const block = groupsMatch[1];
  const groupRegex = /(\w+):\s*\{[^}]*id:\s*['"]([^'"]+)['"][^}]*nameAr:\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = groupRegex.exec(block)) !== null) {
    groups.push({ key: match[1], id: match[2], nameAr: match[3] });
  }
  return groups;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const catalog = { categories: [], generatedAt: new Date().toISOString() };

for (const file of PRICING_FILES) {
  const content = readFileSync(join(LEGACY_JS, file), "utf8");
  const moduleName = file.replace("-pricing.js", "");
  const categoryId = extractCategoryId(content);
  if (!categoryId) continue;

  const products = extractProducts(content);
  const groups = extractGroups(content);

  catalog.categories.push({
    module: moduleName,
    categoryId,
    slug: slugify(categoryId),
    file,
    groups,
    products,
    productCount: products.length,
  });
}

catalog.categories.sort((a, b) => a.categoryId.localeCompare(b.categoryId));
catalog.totalProducts = catalog.categories.reduce((s, c) => s + c.productCount, 0);

const outPath = join(__dirname, "..", "prisma", "catalog-export.json");
writeFileSync(outPath, JSON.stringify(catalog, null, 2), "utf8");

console.log(`✅ Extracted ${catalog.categories.length} categories, ${catalog.totalProducts} products`);
console.log(`   → ${outPath}`);
