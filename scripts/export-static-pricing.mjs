/**
 * Export public pricing payloads as static JSON for GitHub Pages.
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const outDir = path.join(process.cwd(), "public", "data", "pricing");

async function loadDocs(collection) {
  const records = await prisma.pricingRecord.findMany({ where: { collection } });
  return Object.fromEntries(records.map((record) => [record.docId, JSON.parse(record.data)]));
}

function writeCategory(filename, payload) {
  fs.writeFileSync(path.join(outDir, filename), JSON.stringify(payload));
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const stampRecords = await prisma.pricingRecord.findMany({
    where: {
      collection: "product_prices_sell",
      docId: { startsWith: "Stamps_" },
    },
  });
  writeCategory("Stamps.json", {
    categoryId: "Stamps",
    sellByDoc: Object.fromEntries(stampRecords.map((record) => [record.docId, JSON.parse(record.data)])),
  });

  const [dafaterSell, dafaterCost] = await Promise.all([
    loadDocs("dafater_prices_sell"),
    loadDocs("dafater_prices_cost"),
  ]);
  writeCategory("dafater.json", {
    categoryId: "dafater",
    sellConfig: dafaterSell,
    costConfig: dafaterCost,
  });

  const niSell = await loadDocs("notebooks_sell_prices");
  writeCategory("notebooks_invoices.json", {
    categoryId: "notebooks_invoices",
    sellConfig: niSell,
  });

  const nbbConfig = await loadDocs("notebooks_books_booklets_prices");
  writeCategory("notebooks_books_booklets.json", {
    categoryId: "notebooks_books_booklets",
    config: nbbConfig,
  });

  const envelopeSell = await loadDocs("envelopes_prices_sell");
  writeCategory("envelopes.json", {
    categoryId: "envelopes",
    sellByDoc: envelopeSell,
  });

  console.log(`✓ Exported pricing JSON to ${outDir}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
