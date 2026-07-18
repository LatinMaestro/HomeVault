import { headers } from "next/headers";

import { isAuthRuntimeConfigured } from "@/lib/auth-config";
import { getAuthDb, getDb, isPreviewDatabaseEnabled } from "@/lib/db";

export type HouseholdAccessRole = "OWNER" | "ADULT" | "CHILD" | "GUEST";

export type HouseholdAccess = {
  mode: "authenticated" | "preview";
  userId: string;
  homeId: string;
  membershipId: string;
  role: HouseholdAccessRole;
};

export class HouseholdAccessError extends Error {
  constructor() {
    super("Household access is unavailable.");
    this.name = "HouseholdAccessError";
  }
}

export function canWriteHousehold(role: HouseholdAccessRole) {
  return role === "OWNER" || role === "ADULT";
}

export function canAdministerHousehold(role: HouseholdAccessRole) {
  return role === "OWNER";
}

export function requireMatchingHome(access: HouseholdAccess, requestedHomeId: string) {
  if (access.homeId !== requestedHomeId) {
    throw new HouseholdAccessError();
  }

  return access;
}

async function resolveAuthenticatedAccess(): Promise<HouseholdAccess | null> {
  const [{ auth }, requestHeaders] = await Promise.all([import("@/lib/auth"), headers()]);
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.user?.id || !session.user.emailVerified) return null;

  const membership = await getAuthDb().householdMember.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      homeId: true,
      userId: true,
      role: true,
    },
  });

  if (!membership) return null;

  return {
    mode: "authenticated",
    userId: membership.userId,
    homeId: membership.homeId,
    membershipId: membership.id,
    role: membership.role,
  };
}

async function resolvePreviewAccess(): Promise<HouseholdAccess | null> {
  if (!isPreviewDatabaseEnabled()) return null;

  const membership = await getDb().householdMember.findFirst({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      homeId: true,
      userId: true,
      role: true,
    },
  });

  if (!membership) return null;

  return {
    mode: "preview",
    userId: membership.userId,
    homeId: membership.homeId,
    membershipId: membership.id,
    role: membership.role,
  };
}

export function getHouseholdDb(access: HouseholdAccess) {
  return access.mode === "authenticated" ? getAuthDb() : getDb();
}

export async function getCurrentHouseholdAccess(): Promise<HouseholdAccess | null> {
  if (isAuthRuntimeConfigured()) {
    return resolveAuthenticatedAccess();
  }

  return resolvePreviewAccess();
}

export async function requireCurrentHouseholdAccess() {
  const access = await getCurrentHouseholdAccess();
  if (!access) throw new HouseholdAccessError();
  return access;
}
