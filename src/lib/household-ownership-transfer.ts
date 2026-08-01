import type { HouseholdAccessRole } from "@/lib/household-access";

export type HouseholdOwnershipTransferDecision =
  | {
      status: "allowed";
      homeId: string;
      confirmationId: string;
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
        | "actor-unverified"
        | "target-unverified"
        | "target-not-adult"
        | "invalid-owner-state"
        | "confirmation-required";
    };

export type HouseholdOwnershipTransferConfirmation = {
  id: string;
  actorUserId: string;
  homeId: string;
  targetUserId: string;
  confirmedAt: Date;
  expiresAt: Date;
};

const MAXIMUM_CONFIRMATION_LIFETIME_MS = 10 * 60 * 1000;

function isCanonicalHouseholdIdentity(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    !/\s/.test(value)
  );
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function isValidTransferConfirmation({
  confirmation,
  actorUserId,
  homeId,
  targetUserId,
  now,
}: {
  confirmation: HouseholdOwnershipTransferConfirmation | null;
  actorUserId: string;
  homeId: string;
  targetUserId: string;
  now: Date;
}) {
  if (
    !confirmation ||
    !isCanonicalHouseholdIdentity(confirmation.id) ||
    confirmation.actorUserId !== actorUserId ||
    confirmation.homeId !== homeId ||
    confirmation.targetUserId !== targetUserId ||
    !isValidDate(confirmation.confirmedAt) ||
    !isValidDate(confirmation.expiresAt) ||
    !isValidDate(now)
  ) {
    return false;
  }

  const confirmedAt = confirmation.confirmedAt.getTime();
  const expiresAt = confirmation.expiresAt.getTime();
  const nowTime = now.getTime();

  return (
    confirmedAt <= nowTime &&
    expiresAt > nowTime &&
    expiresAt > confirmedAt &&
    expiresAt - confirmedAt <= MAXIMUM_CONFIRMATION_LIFETIME_MS
  );
}

export function evaluateHouseholdOwnershipTransfer({
  actorUserId,
  actorHomeId,
  actorRole,
  actorMembershipActive,
  actorEmailVerified,
  activeOwnerCount,
  targetUserId,
  targetHomeId,
  targetRole,
  targetMembershipActive,
  targetEmailVerified,
  confirmation,
  now = new Date(),
}: {
  actorUserId: string;
  actorHomeId: string;
  actorRole: HouseholdAccessRole;
  actorMembershipActive: boolean;
  actorEmailVerified: boolean;
  activeOwnerCount: number;
  targetUserId: string;
  targetHomeId: string;
  targetRole: HouseholdAccessRole;
  targetMembershipActive: boolean;
  targetEmailVerified: boolean;
  confirmation: HouseholdOwnershipTransferConfirmation | null;
  now?: Date;
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
  if (actorMembershipActive !== true || targetMembershipActive !== true) {
    return { status: "error", reason: "inactive-member" };
  }
  if (actorUserId === targetUserId) {
    return { status: "error", reason: "same-member" };
  }
  if (actorEmailVerified !== true) {
    return { status: "error", reason: "actor-unverified" };
  }
  if (targetEmailVerified !== true) {
    return { status: "error", reason: "target-unverified" };
  }
  if (targetRole !== "ADULT") {
    return { status: "error", reason: "target-not-adult" };
  }
  if (activeOwnerCount !== 1) {
    return { status: "error", reason: "invalid-owner-state" };
  }
  const confirmationId = confirmation?.id;
  if (
    !isValidTransferConfirmation({
      confirmation,
      actorUserId,
      homeId: actorHomeId,
      targetUserId,
      now,
    }) ||
    !confirmationId
  ) {
    return { status: "error", reason: "confirmation-required" };
  }
  return {
    status: "allowed",
    homeId: actorHomeId,
    confirmationId,
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
