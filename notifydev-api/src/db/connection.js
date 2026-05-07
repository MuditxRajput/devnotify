import { prisma } from "./db.js";

export async function connectDB() {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connected");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
}

export async function disconnectDB() {
  await prisma.$disconnect();
  console.log("Database disconnected");
}

export async function checkDBConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
