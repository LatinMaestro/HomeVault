import { getCurrentHouseholdAccess } from "@/lib/household-access";

export async function getCurrentHomeId() {
  const access = await getCurrentHouseholdAccess();
  return access?.homeId ?? null;
}
