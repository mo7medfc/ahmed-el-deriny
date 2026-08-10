import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const rows = await prisma.product.findMany({
  where: { pricingCategory: { in: ["DeskSets", "Nameplates"] } },
  select: {
    slug: true,
    nameAr: true,
    basePrice: true,
    image: true,
    featured: true,
    category: { select: { slug: true, nameAr: true } },
  },
});
console.log(JSON.stringify(rows, null, 2));
await prisma.$disconnect();
