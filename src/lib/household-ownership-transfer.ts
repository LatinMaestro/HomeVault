import type { HouseholdAccessRole } from "@/lib/household-access";

export type HouseholdOwnershipTransferDecision =
  | {
      status: "allowed";
      homeId: string;
      previousOwner: {
        userId: string;
        expectedRole: "OWNER";
        nextRole: "ADULT";
      };
      nextOwner: {
        userId: string;
        expectedRole: "ADULT";
        nextRole: "OWNER";
      };
    }
  | {
      status: "error";
      reason:
        | "actor-not-owner"
        | "invalid-household"
        | "different-household"
        | "invalid-member"
        | "inactive-member"
        | "same-member"
        | "target-unverified"
        | "target-not-adult";
    };

function isCanonicalHouseholdIdentity(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    !/\s/.test(value)
  );
}

export function evaluateHouseholdOwnershipTransfer({
  actorUserId,
  actorHomeId,
  actorRole,
  actorMembershipActive,
  targetUserId,
  targetHomeId,
  targetRole,
  targetMembershipActive,
  targetEmailVerified,
}: {
  actorUserId: string;
  actorHomeId: string;
  actorRole: HouseholdAccessRole;
  actorMembershipActive: boolean;
  targetUserId: string;
  targetHomeId: string;
  targetRole: HouseholdAccessRole;
  targetMembershipActive: boolean;
  targetEmailVerified: boolean;
}): HouseholdOwnershipTransferDecision {
  if (actorRole !== "OWNER") {
    return { status: "error", reason: "actor-not-owner" };
  }

  if (
    !isCanonicalHouseholdIdentity(actorHomeId) ||
    !isCanonicalHouseholdIdentity(targetHomeId)
  ) {
    return { status: "error", reason: "invalid-household" };
  }

  if (actorHomeId !== targetHomeId) {
    return { status: "error", reason: "different-household" };
  }

  if (
    !isCanonicalHouseholdIdentity(actorUserId) ||
    !isCanonicalHouseholdIdentity(targetUserId)
  ) {
    return { status: "error", reason: "invalid-member" };
  }

  if (
    actorMembershipActive !== true ||
    targetMembershipActive !== true
  ) {
    return { status: "error", reason: "inactive-member" };
  }

  if (actorUserId === targetUserId) {
    return { status: "error", reason: "same-member" };
  }

  if (targetEmailVerified !== true) {
    return { status: "error", reason: "target-unverified" };
  }

  if (targetRole !== "ADULT") {
    return { status: "error", reason: "target-not-adult" };
  }

  return {
    status: "allowed",
    homeId: actorHomeId,
    previousOwner: {
      userId: actorUserId,
      expectedRole: "OWNER",
      nextRole: "ADULT",
    },
    nextOwner: {
      userId: targetUserId,
      expectedRole: "ADULT",
      nextRole: "OWNER",
    },
  };
}
