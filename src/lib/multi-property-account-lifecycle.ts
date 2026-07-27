import type { HouseholdAccessRole } from "@/lib/household-access";

export type AccountPropertyMembership = {
  id: string;
  userId: string;
  homeId: string;
  role: HouseholdAccessRole;
  memberCount: number;
  active: boolean;
};

export type MultiPropertyAccountDeletionDecision =
  | {
      status: "deletion-allowed";
      deleteHomeIds: string[];
      removeMembershipIds: string[];
    }
  | { status: "unavailable" }
  | { status: "credential-confirmation-required" }
  | {
      status: "ownership-transfer-required";
      homeIds: string[];
    };

export type RecoveredPropertyAccessDecision =
  | {
      status: "selected";
      membership: AccountPropertyMembership;
    }
  | { status: "selection-required" }
  | { status: "onboarding-required" }
  | { status: "unavailable" };

function hasValidMembershipEvidence(
  currentUserId: string,
  memberships: readonly AccountPropertyMembership[],
) {
  if (!currentUserId) {
    return false;
  }

  return memberships.every(
    (membership, index) =>
      Boolean(membership.id) &&
      Boolean(membership.homeId) &&
      membership.userId === currentUserId &&
      Number.isInteger(membership.memberCount) &&
      membership.memberCount > 0 &&
      memberships.findIndex(
        (candidate) =>
          candidate.id === membership.id ||
          candidate.homeId === membership.homeId,
      ) === index,
  );
}

export function decideMultiPropertyAccountDeletion({
  currentUserId,
  emailVerified,
  credentialConfirmed,
  memberships,
}: {
  currentUserId: string;
  emailVerified: boolean;
  credentialConfirmed: boolean;
  memberships: readonly AccountPropertyMembership[];
}): MultiPropertyAccountDeletionDecision {
  if (
    !emailVerified ||
    !hasValidMembershipEvidence(currentUserId, memberships)
  ) {
    return { status: "unavailable" };
  }

  const activeMemberships = memberships.filter(
    (membership) => membership.active,
  );

  if (activeMemberships.length !== memberships.length) {
    return { status: "unavailable" };
  }

  if (!credentialConfirmed) {
    return { status: "credential-confirmation-required" };
  }

  const invalidMembership = activeMemberships.some(
    (membership) =>
      (membership.role === "OWNER" && membership.memberCount < 1) ||
      (membership.role !== "OWNER" && membership.memberCount < 2),
  );

  if (invalidMembership) {
    return { status: "unavailable" };
  }

  const transferHomeIds = activeMemberships
    .filter(
      (membership) =>
        membership.role === "OWNER" && membership.memberCount > 1,
    )
    .map((membership) => membership.homeId)
    .sort();

  if (transferHomeIds.length > 0) {
    return {
      status: "ownership-transfer-required",
      homeIds: transferHomeIds,
    };
  }

  return {
    status: "deletion-allowed",
    deleteHomeIds: activeMemberships
      .filter(
        (membership) =>
          membership.role === "OWNER" && membership.memberCount === 1,
      )
      .map((membership) => membership.homeId)
      .sort(),
    removeMembershipIds: activeMemberships
      .filter((membership) => membership.role !== "OWNER")
      .map((membership) => membership.id)
      .sort(),
  };
}

export function resolveRecoveredPropertyAccess({
  recoveredUserId,
  recoveryProofVerified,
  requestedHomeId,
  currentMemberships,
}: {
  recoveredUserId: string;
  recoveryProofVerified: boolean;
  requestedHomeId?: string | null;
  currentMemberships: readonly AccountPropertyMembership[];
}): RecoveredPropertyAccessDecision {
  if (
    !recoveryProofVerified ||
    !hasValidMembershipEvidence(recoveredUserId, currentMemberships)
  ) {
    return { status: "unavailable" };
  }

  const activeMemberships = currentMemberships.filter(
    (membership) => membership.active,
  );

  if (requestedHomeId) {
    const matches = activeMemberships.filter(
      (membership) => membership.homeId === requestedHomeId,
    );

    return matches.length === 1
      ? { status: "selected", membership: matches[0] }
      : { status: "unavailable" };
  }

  if (activeMemberships.length === 0) {
    return { status: "onboarding-required" };
  }

  if (activeMemberships.length === 1) {
    return { status: "selected", membership: activeMemberships[0] };
  }

  return { status: "selection-required" };
}
