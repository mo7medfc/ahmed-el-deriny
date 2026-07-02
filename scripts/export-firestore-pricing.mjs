/**
 * Export all pricing collections from legacy Firebase project.
 * Run: node scripts/export-firestore-pricing.mjs
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ID = "abdohassan-62f83";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const COLLECTIONS = [
  "product_prices_sell",
  "product_prices_cost",
  "pricing_config",
  "business_cards_prices_sell",
  "business_cards_prices_cost",
  "safety_printing_prices_sell",
  "safety_printing_prices_cost",
  "envelopes_prices_sell",
  "envelopes_prices_cost",
  "notebooks_sell_prices",
  "notebooks_cost_prices",
  "digital_prices_sell",
  "digital_prices_cost",
  "paper_bags_prices_sell",
  "paper_bags_prices_cost",
  "brochures_prices_sell",
  "brochures_prices_cost",
  "catalogs_prices_sell",
  "catalogs_prices_cost",
  "acrylic_badge_prices_sell",
  "acrylic_badge_prices_cost",
  "card_rosary_prices_sell",
  "card_rosary_prices_cost",
  "annual_ads_prices_sell",
  "annual_ads_prices_cost",
  "cup_quran_bags_prices_sell",
  "cup_quran_bags_prices_cost",
  "boxes_prices_sell",
  "boxes_prices_cost",
  "cladding_letters_prices_sell",
  "cladding_letters_prices_cost",
  "kraft_bags_prices_sell",
  "kraft_bags_prices_cost",
  "dafater_prices_sell",
  "dafater_prices_cost",
  "notebooks_books_booklets_prices",
  "offers",
];

function parseFirestoreValue(value) {
  if (!value || typeof value !== "object") return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return parseInt(value.integerValue, 10);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("nullValue" in value) return null;
  if ("timestampValue" in value) return value.timestampValue;
  if ("mapValue" in value) {
    const out = {};
    const fields = value.mapValue.fields || {};
    for (const [k, v] of Object.entries(fields)) out[k] = parseFirestoreValue(v);
    return out;
  }
  if ("arrayValue" in value) {
    return (value.arrayValue.values || []).map(parseFirestoreValue);
  }
  return null;
}

function parseDocument(doc) {
  const name = doc.name || "";
  const docId = name.split("/").pop();
  const data = {};
  for (const [k, v] of Object.entries(doc.fields || {})) {
    data[k] = parseFirestoreValue(v);
  }
  return { docId, data };
}

async function fetchCollection(collectionName) {
  const docs = [];
  let pageToken = null;
  let pages = 0;

  do {
    const url = new URL(`${BASE}/${collectionName}`);
    url.searchParams.set("pageSize", "300");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString());
    if (!res.ok) {
      console.warn(`  ⚠ ${collectionName}: HTTP ${res.status}`);
      break;
    }

    const json = await res.json();
    for (const doc of json.documents || []) {
      docs.push(parseDocument(doc));
    }
    pageToken = json.nextPageToken || null;
    pages++;
  } while (pageToken);

  console.log(`  ✓ ${collectionName}: ${docs.length} docs (${pages} pages)`);
  return docs;
}

async function main() {
  console.log("Exporting Firestore pricing...\n");
  const exportData = { exportedAt: new Date().toISOString(), collections: {} };

  for (const coll of COLLECTIONS) {
    exportData.collections[coll] = await fetchCollection(coll);
  }

  const outPath = join(__dirname, "..", "prisma", "firestore-export.json");
  writeFileSync(outPath, JSON.stringify(exportData, null, 2), "utf8");

  const total = Object.values(exportData.collections).reduce((s, arr) => s + arr.length, 0);
  console.log(`\n✅ Exported ${total} documents → ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
