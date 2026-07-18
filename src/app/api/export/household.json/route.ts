import { getHouseholdExport } from "@/lib/household-export";
import { getPrivateApiAccessError } from "@/lib/private-api-access";

export const dynamic = "force-dynamic";

export async function GET() {
  const accessError = await getPrivateApiAccessError();
  if (accessError) return accessError;

  const household = await getHouseholdExport();

  return Response.json(household, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": 'attachment; filename="homevault-household.json"',
    },
  });
}
