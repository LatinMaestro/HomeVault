import { headers } from "next/headers";
import { cache } from "react";

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

export function canInviteHouseholdMember(
  actorRole: HouseholdAccessRole,
  invitedRole: HouseholdAccessRole,
) {
  return canAdministerHousehold(actorRole) && invitedRole !== "OWNER";
}

export function canChangeHouseholdMemberRole(
  actorRole: HouseholdAccessRole,
  currentRole: HouseholdAccessRole,
  nextRole: HouseholdAccessRole,
) {
  return (
    canAdministerHousehold(actorRole) &&
    currentRole !== "OWNER" &&
    nextRole !== "OWNER" &&
    currentRole !== nextRole
  );
}

export function canRemoveHouseholdMember(
  actorRole: HouseholdAccessRole,
  targetRole: HouseholdAccessRole,
  actorUserId: string,
  targetUserId: string,
) {
  if (!actorUserId || !targetUserId || targetRole === "OWNER") return false;

  if (actorUserId === targetUserId) {
    return actorRole === targetRole;
  }

  return canAdministerHousehold(actorRole);
}

export function requireMatchingHome(access: HouseholdAccess, requestedHomeId: string) {
  if (access.homeId !== requestedHomeId) {
    throw new HouseholdAccessError();
  }

  return access;
}

export type VerifiedSessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

export const getCurrentVerifiedSessionUser = cache(async function getCurrentVerifiedSessionUser(): Promise<VerifiedSessionUser | null> {
  if (!isAuthRuntimeConfigured()) return null;

  const [{ auth }, requestHeaders] = await Promise.all([import("@/lib/auth"), headers()]);
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.user?.id || !session.user.emailVerified) return null;

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };
});

async function resolveAuthenticatedAccess(): Promise<HouseholdAccess | null> {
  const user = await getCurrentVerifiedSessionUser();
  if (!user) return null;

  const membership = await getAuthDb().householdMember.findFirst({
    where: { userId: user.id },
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

export type HouseholdWriteContext = {
  access: HouseholdAccess;
  db: ReturnType<typeof getHouseholdDb>;
  homeId: string;
};

export const getCurrentHouseholdAccess = cache(async function getCurrentHouseholdAccess(): Promise<HouseholdAccess | null> {
  if (isAuthRuntimeConfigured()) {
    return resolveAuthenticatedAccess();
  }

  return resolvePreviewAccess();
});

export async function getCurrentHouseholdWriteContext(): Promise<HouseholdWriteContext | null> {
  const access = await getCurrentHouseholdAccess();
  if (!access || !canWriteHousehold(access.role)) return null;

  return {
    access,
    db: getHouseholdDb(access),
    homeId: access.homeId,
  };
}

export async function isCurrentHouseholdWritable() {
  return Boolean(await getCurrentHouseholdWriteContext());
}

export async function requireCurrentHouseholdAccess() {
  const access = await getCurrentHouseholdAccess();
  if (!access) throw new HouseholdAccessError();
  return access;
}
