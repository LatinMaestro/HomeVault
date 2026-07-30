import type { HouseholdAccessRole } from "@/lib/household-access";

export type PropertyMembership = {
  id: string;
  userId: string;
  homeId: string;
  role: HouseholdAccessRole;
  version: number;
  active: true;
};

export type PropertyMembershipSelection =
  | {
      status: "selected";
      userId: string;
      homeId: string;
      membershipId: string;
      role: HouseholdAccessRole;
      expectedMembershipVersion: number;
      selection: "implicit" | "explicit";
    }
  | {
      status: "selection-required";
    }
  | {
      status: "unavailable";
    };

const MAX_PROPERTY_MEMBERSHIPS = 100;
const PROPERTY_ROLES = new Set<HouseholdAccessRole>([
  "OWNER",
  "ADULT",
  "CHILD",
  "GUEST",
]);

function isCanonicalIdentifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 191 &&
    value.trim() === value &&
    !/\s/.test(value)
  );
}

function isPropertyMembership(
  membership: unknown,
  currentUserId: string,
): membership is PropertyMembership {
  if (typeof membership !== "object" || membership === null) return false;

  const candidate = membership as Record<string, unknown>;
  return (
    isCanonicalIdentifier(candidate.id) &&
    isCanonicalIdentifier(candidate.userId) &&
    candidate.userId === currentUserId &&
    isCanonicalIdentifier(candidate.homeId) &&
    PROPERTY_ROLES.has(candidate.role as HouseholdAccessRole) &&
    Number.isSafeInteger(candidate.version) &&
    (candidate.version as number) >= 1 &&
    candidate.active === true
  );
}

function selectedMembership(
  membership: PropertyMembership,
  selection: "implicit" | "explicit",
): PropertyMembershipSelection {
  return {
    status: "selected",
    userId: membership.userId,
    homeId: membership.homeId,
    membershipId: membership.id,
    role: membership.role,
    expectedMembershipVersion: membership.version,
    selection,
  };
}

export function resolvePropertyMembershipSelection(
  input: unknown,
): PropertyMembershipSelection {
  if (typeof input !== "object" || input === null) {
    return { status: "unavailable" };
  }

  const candidate = input as Record<string, unknown>;
  const currentUserId = candidate.currentUserId;
  const requestedHomeId = candidate.requestedHomeId;
  const memberships = candidate.memberships;

  if (!isCanonicalIdentifier(currentUserId)) {
    return { status: "unavailable" };
  }

  if (
    requestedHomeId !== undefined &&
    requestedHomeId !== null &&
    !isCanonicalIdentifier(requestedHomeId)
  ) {
    return { status: "unavailable" };
  }

  if (
    !Array.isArray(memberships) ||
    memberships.length === 0 ||
    memberships.length > MAX_PROPERTY_MEMBERSHIPS ||
    memberships.some(
      (membership) => !isPropertyMembership(membership, currentUserId),
    )
  ) {
    return { status: "unavailable" };
  }

  const membershipIds = new Set<string>();
  const homeIds = new Set<string>();

  for (const membership of memberships) {
    if (
      membershipIds.has(membership.id) ||
      homeIds.has(membership.homeId)
    ) {
      return { status: "unavailable" };
    }

    membershipIds.add(membership.id);
    homeIds.add(membership.homeId);
  }

  if (requestedHomeId !== undefined && requestedHomeId !== null) {
    const membership = memberships.find(
      (membership) => membership.homeId === requestedHomeId,
    );

    return membership
      ? selectedMembership(membership, "explicit")
      : { status: "unavailable" };
  }

  if (memberships.length === 1) {
    return selectedMembership(memberships[0], "implicit");
  }

  return { status: "selection-required" };
}
