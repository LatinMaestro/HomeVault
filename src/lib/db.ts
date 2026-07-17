import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function isPreviewDatabaseEnabled() {
  return (
    Boolean(process.env.DATABASE_URL) &&
    process.env.HOMEVAULT_PREVIEW_DATABASE_ACCESS === "enabled"
  );
}

export function getDb() {
  if (!isPreviewDatabaseEnabled()) {
    throw new Error(
      "Preview database access is disabled. Set both DATABASE_URL and HOMEVAULT_PREVIEW_DATABASE_ACCESS=enabled only for controlled non-sensitive review data.",
    );
  }

  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.prisma;
}
