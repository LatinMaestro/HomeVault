import { isAuthRuntimeConfigured } from "@/lib/auth-config";
import { getCurrentHouseholdAccess } from "@/lib/household-access";

export async function getPrivateApiAccessError() {
  if (!isAuthRuntimeConfigured()) return null;

  const access = await getCurrentHouseholdAccess();
  if (access) return null;

  return Response.json(
    { error: "Authentication required." },
    {
      status: 401,
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
