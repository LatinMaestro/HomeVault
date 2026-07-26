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

export function resolvePropertyMembershipSelection({
  currentUserId,
  requestedHomeId,
  memberships,
}: {
  currentUserId: string;
  requestedHomeId?: string | null;
  memberships: readonly PropertyMembership[];
}): PropertyMembershipSelection {
  if (!currentUserId) {
    return { status: "unavailable" };
  }

  const validMemberships = memberships.filter(
    (membership) =>
      membership.id &&
      membership.homeId &&
      membership.userId === currentUserId,
  );

  if (requestedHomeId) {
    const matches = validMemberships.filter(
      (membership) => membership.homeId === requestedHomeId,
    );

    return matches.length === 1
      ? { status: "selected", membership: matches[0] }
      : { status: "unavailable" };
  }

  if (validMemberships.length === 1) {
    return { status: "selected", membership: validMemberships[0] };
  }

  return validMemberships.length > 1
    ? { status: "selection-required" }
    : { status: "unavailable" };
}
