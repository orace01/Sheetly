import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// max: 1 because the app connects through Supabase's transaction-mode pooler
// (pgbouncer) — each serverless invocation should hold at most one
// connection; the pooler handles fan-out to Postgres itself.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 });

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
