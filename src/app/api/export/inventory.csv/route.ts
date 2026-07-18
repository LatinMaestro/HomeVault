import { getAssets } from "@/lib/home-data";
import { buildInventoryCsv } from "@/lib/inventory-csv";
import { getPrivateApiAccessError } from "@/lib/private-api-access";

export const dynamic = "force-dynamic";

export async function GET() {
  const accessError = await getPrivateApiAccessError();
  if (accessError) return accessError;

  const assets = await getAssets();
  const body = buildInventoryCsv(assets.data);

  return new Response(body, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": 'attachment; filename="homevault-inventory.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
