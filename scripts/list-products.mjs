import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const products = await p.product.findMany({
  orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  include: { category: true },
});
for (const x of products) {
  console.log(
    [x.slug, x.nameAr, x.basePrice, x.costPrice, x.pricingType, x.category?.slug || "", x.category?.nameAr || ""].join(
      " | "
    )
  );
}
console.log("TOTAL", products.length);
await p.$disconnect();
