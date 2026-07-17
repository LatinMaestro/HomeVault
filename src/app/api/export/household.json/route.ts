import { getHouseholdExport } from "@/lib/household-export";

export const dynamic = "force-dynamic";

export async function GET() {
  const household = await getHouseholdExport();

  return Response.json(household, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": 'attachment; filename="homevault-household.json"',
    },
  });
}
