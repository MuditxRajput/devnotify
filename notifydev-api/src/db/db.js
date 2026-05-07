import dotenv from "dotenv";
import prismaPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config();

const { PrismaClient } = prismaPkg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}