import type { HouseholdAccessRole } from "@/lib/household-access";

export type PropertyExportMembership = {
  id: string;
  userId: string;
  homeId: string;
  role: HouseholdAccessRole;
};

export type PropertyExportDecision =
  | {
      status: "export-allowed";
      homeId: string;
      membershipId: string;
      role: HouseholdAccessRole;
    }
  | {
      status: "unavailable";
    };

export function decidePropertyExportAccess({
  currentUserId,
  selectedHomeId,
  memberships,
}: {
  currentUserId: string;
  selectedHomeId: string;
  memberships: readonly PropertyExportMembership[];
}): PropertyExportDecision {
  if (!currentUserId || !selectedHomeId || memberships.length === 0) {
    return { status: "unavailable" };
  }

  const malformedOrForeignMembership = memberships.some(
    (membership) =>
      !membership.id ||
      !membership.userId ||
      !membership.homeId ||
      membership.userId !== currentUserId,
  );

  const duplicateEvidence = memberships.some(
    (membership, index) =>
      memberships.findIndex(
        (candidate) =>
          candidate.id === membership.id ||
          candidate.homeId === membership.homeId,
      ) !== index,
  );

  if (malformedOrForeignMembership || duplicateEvidence) {
    return { status: "unavailable" };
  }

  const selectedMemberships = memberships.filter(
    (membership) => membership.homeId === selectedHomeId,
  );

  if (selectedMemberships.length !== 1) {
    return { status: "unavailable" };
  }

  const membership = selectedMemberships[0];

  return {
    status: "export-allowed",
    homeId: membership.homeId,
    membershipId: membership.id,
    role: membership.role,
  };
}
