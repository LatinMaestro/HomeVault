import type { HouseholdAccessRole } from "@/lib/household-access";

export type HouseholdOwnershipTransferDecision =
  | {
      status: "allowed";
      previousOwnerRole: "ADULT";
      nextOwnerRole: "OWNER";
    }
  | {
      status: "error";
      reason:
        | "actor-not-owner"
        | "different-household"
        | "invalid-member"
        | "same-member"
        | "target-unverified"
        | "target-not-adult";
    };

export function evaluateHouseholdOwnershipTransfer({
  actorUserId,
  actorHomeId,
  actorRole,
  targetUserId,
  targetHomeId,
  targetRole,
  targetEmailVerified,
}: {
  actorUserId: string;
  actorHomeId: string;
  actorRole: HouseholdAccessRole;
  targetUserId: string;
  targetHomeId: string;
  targetRole: HouseholdAccessRole;
  targetEmailVerified: boolean;
}): HouseholdOwnershipTransferDecision {
  if (actorRole !== "OWNER") {
    return { status: "error", reason: "actor-not-owner" };
  }

  if (!actorHomeId || actorHomeId !== targetHomeId) {
    return { status: "error", reason: "different-household" };
  }

  if (!actorUserId || !targetUserId) {
    return { status: "error", reason: "invalid-member" };
  }

  if (actorUserId === targetUserId) {
    return { status: "error", reason: "same-member" };
  }

  if (!targetEmailVerified) {
    return { status: "error", reason: "target-unverified" };
  }

  if (targetRole !== "ADULT") {
    return { status: "error", reason: "target-not-adult" };
  }

  return {
    status: "allowed",
    previousOwnerRole: "ADULT",
    nextOwnerRole: "OWNER",
  };
}
