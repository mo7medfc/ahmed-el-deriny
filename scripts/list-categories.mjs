import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const cats = await p.category.findMany({ select: { slug: true, legacyId: true, nameAr: true }, orderBy: { sortOrder: "asc" } });
console.log(JSON.stringify(cats, null, 2));
await p.$disconnect();
