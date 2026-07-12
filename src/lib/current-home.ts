import { getDb } from "@/lib/db";

export async function getCurrentHomeId() {
  const home = await getDb().home.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  return home?.id ?? null;
}
