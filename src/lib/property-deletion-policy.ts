import type { HouseholdAccessRole } from "@/lib/household-access";

export type PropertyDeletionMembership = {
  id: string;
  userId: string;
  homeId: string;
  role: HouseholdAccessRole;
};

export type PropertyDeletionDecision =
  | {
      status: "deletion-allowed";
      homeId: string;
      ownerMembershipId: string;
    }
  | {
      status: "unavailable";
    }
  | {
      status: "owner-required";
    }
  | {
      status: "credential-confirmation-required";
    }
  | {
      status: "members-remain";
    };

export function decidePropertyDeletion({
  currentUserId,
  selectedHomeId,
  credentialConfirmed,
  memberships,
}: {
  currentUserId: string;
  selectedHomeId: string;
  credentialConfirmed: boolean;
  memberships: readonly PropertyDeletionMembership[];
}): PropertyDeletionDecision {
  if (!currentUserId || !selectedHomeId || memberships.length === 0) {
    return { status: "unavailable" };
  }

  const malformedMembership = memberships.some(
    (membership) =>
      !membership.id ||
      !membership.userId ||
      !membership.homeId ||
      membership.homeId !== selectedHomeId,
  );

  const duplicateMembership = memberships.some(
    (membership, index) =>
      memberships.findIndex(
        (candidate) =>
          candidate.id === membership.id ||
          candidate.userId === membership.userId,
      ) !== index,
  );

  if (malformedMembership || duplicateMembership) {
    return { status: "unavailable" };
  }

  const currentMemberships = memberships.filter(
    (membership) => membership.userId === currentUserId,
  );

  if (currentMemberships.length !== 1) {
    return { status: "unavailable" };
  }

  const currentMembership = currentMemberships[0];

  if (currentMembership.role !== "OWNER") {
    return { status: "owner-required" };
  }

  const ownerCount = memberships.filter(
    (membership) => membership.role === "OWNER",
  ).length;

  if (ownerCount !== 1) {
    return { status: "unavailable" };
  }

  if (!credentialConfirmed) {
    return { status: "credential-confirmation-required" };
  }

  if (memberships.length > 1) {
    return { status: "members-remain" };
  }

  return {
    status: "deletion-allowed",
    homeId: selectedHomeId,
    ownerMembershipId: currentMembership.id,
  };
}
