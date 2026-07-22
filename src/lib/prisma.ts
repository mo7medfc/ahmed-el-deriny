import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDatabaseUrl(): string | undefined {
  if (!process.env.VERCEL) {
    return process.env.DATABASE_URL;
  }

  const tmpDb = "/tmp/vercel.db";
  const candidates = [
    path.join(process.cwd(), "prisma", "vercel.db"),
    path.join(process.cwd(), "prisma", "dev.db"),
  ];

  try {
    if (!fs.existsSync(tmpDb)) {
      const source = candidates.find((p) => fs.existsSync(p));
      if (source) fs.copyFileSync(source, tmpDb);
    }
    if (fs.existsSync(tmpDb)) {
      return `file:${tmpDb}`;
    }
  } catch (error) {
    console.warn("Prisma serverless DB prepare failed:", error);
  }

  return process.env.DATABASE_URL;
}

const databaseUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
