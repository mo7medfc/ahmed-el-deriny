import { PrismaClient } from "@prisma/client";
import { resolveProductImage } from "../src/lib/product-images";

const prisma = new PrismaClient();

const products = await prisma.product.findMany({
  include: { category: true },
  orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
});

let lastCategory = "";
for (const p of products) {
  if (p.category.nameAr !== lastCategory) {
    lastCategory = p.category.nameAr;
    console.log(`\n== ${lastCategory} (/${p.category.slug}) [${p.category.pricingType}]`);
  }
  const image = resolveProductImage({
    slug: p.slug,
    image: p.image,
    pricingCategory: p.pricingCategory,
    legacyId: p.legacyId,
    categorySlug: p.category.slug,
    nameAr: p.nameAr,
    nameEn: p.nameEn,
  });
  console.log(
    [
      String(p.basePrice).padStart(6),
      p.unit.padEnd(6),
      p.pricingType.padEnd(9),
      p.featured ? "*" : " ",
      image.split("/").pop()?.padEnd(22),
      p.slug.padEnd(30),
      p.nameAr,
    ].join(" | ")
  );
}

console.log(`\nTotal: ${products.length} products`);
await prisma.$disconnect();
