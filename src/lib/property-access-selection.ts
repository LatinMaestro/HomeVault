import type { HouseholdAccessRole } from "@/lib/household-access";

export type PropertyMembership = {
  id: string;
  userId: string;
  homeId: string;
  role: HouseholdAccessRole;
};

export type PropertyMembershipSelection =
  | {
      status: "selected";
      membership: PropertyMembership;
    }
  | {
      status: "selection-required";
    }
  | {
      status: "unavailable";
    };

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
    value.trim() === value
  );
}

function isPropertyMembership(
  membership: PropertyMembership,
  currentUserId: string,
): membership is PropertyMembership {
  return (
    isCanonicalIdentifier(membership.id) &&
    isCanonicalIdentifier(membership.userId) &&
    membership.userId === currentUserId &&
    isCanonicalIdentifier(membership.homeId) &&
    PROPERTY_ROLES.has(membership.role)
  );
}

export function resolvePropertyMembershipSelection({
  currentUserId,
  requestedHomeId,
  memberships,
}: {
  currentUserId: string;
  requestedHomeId?: string | null;
  memberships: readonly PropertyMembership[];
}): PropertyMembershipSelection {
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
    memberships.length === 0 ||
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
      (candidate) => candidate.homeId === requestedHomeId,
    );

    return membership
      ? { status: "selected", membership }
      : { status: "unavailable" };
  }

  if (memberships.length === 1) {
    return { status: "selected", membership: memberships[0] };
  }

  return { status: "selection-required" };
}
