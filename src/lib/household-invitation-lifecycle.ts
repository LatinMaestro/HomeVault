import type { HouseholdAccessRole } from "@/lib/household-access";
import {
  normalizeHouseholdInvitationEmail,
  validateHouseholdInvitationEmail,
  type HouseholdInvitationRole,
} from "@/lib/household-invitation";

export type StoredHouseholdInvitationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REVOKED";

export type EffectiveHouseholdInvitationStatus =
  | StoredHouseholdInvitationStatus
  | "EXPIRED"
  | "INVALID";

export type HouseholdInvitationLifecycle = {
  id: string;
  homeId: string;
  inviteeEmail: string;
  invitedRole: HouseholdInvitationRole;
  version: number;
  status: StoredHouseholdInvitationStatus;
  expiresAt: Date;
  acceptedAt?: Date | null;
  revokedAt?: Date | null;
};

export type HouseholdInvitationAcceptanceResult =
  | {
      status: "accepted";
      invitationId: string;
      homeId: string;
      invitedRole: HouseholdInvitationRole;
      expectedStatus: "PENDING";
      expectedVersion: number;
      acceptedByUserId: string;
      acceptedAt: Date;
    }
  | {
      status: "error";
      reason:
        | "invalid-account"
        | "email-unverified"
        | "email-mismatch"
        | "invalid-invitation"
        | "expired"
        | "already-accepted"
        | "revoked";
    };

export type HouseholdInvitationRevocationResult =
  | {
      status: "revoked";
      invitationId: string;
      homeId: string;
      expectedStatus: "PENDING";
      expectedVersion: number;
      revokedByUserId: string;
      revokedAt: Date;
    }
  | {
      status: "error";
      reason:
        | "invalid-actor"
        | "actor-not-owner"
        | "different-household"
        | "invalid-invitation"
        | "expired"
        | "already-accepted"
        | "revoked";
    };

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function isCanonicalIdentifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 191 &&
    value === value.trim() &&
    !/\s/.test(value)
  );
}

function isHouseholdInvitationRole(
  value: unknown,
): value is HouseholdInvitationRole {
  return value === "ADULT" || value === "CHILD" || value === "GUEST";
}

export function isValidHouseholdInvitationLifecycle(
  invitation: unknown,
): invitation is HouseholdInvitationLifecycle {
  if (typeof invitation !== "object" || invitation === null) return false;

  const candidate = invitation as Record<string, unknown>;
  if (
    !isCanonicalIdentifier(candidate.id) ||
    !isCanonicalIdentifier(candidate.homeId) ||
    typeof candidate.inviteeEmail !== "string" ||
    validateHouseholdInvitationEmail(candidate.inviteeEmail) ||
    !isHouseholdInvitationRole(candidate.invitedRole) ||
    !Number.isSafeInteger(candidate.version) ||
    (candidate.version as number) < 1 ||
    !["PENDING", "ACCEPTED", "REVOKED"].includes(
      candidate.status as StoredHouseholdInvitationStatus,
    ) ||
    !isValidDate(candidate.expiresAt)
  ) {
    return false;
  }

  const acceptedAt = candidate.acceptedAt ?? null;
  const revokedAt = candidate.revokedAt ?? null;

  if (
    (acceptedAt !== null && !isValidDate(acceptedAt)) ||
    (revokedAt !== null && !isValidDate(revokedAt))
  ) {
    return false;
  }

  if (candidate.status === "PENDING") {
    return acceptedAt === null && revokedAt === null;
  }

  if (candidate.status === "ACCEPTED") {
    return (
      acceptedAt !== null &&
      revokedAt === null &&
      acceptedAt.getTime() < candidate.expiresAt.getTime()
    );
  }

  return (
    revokedAt !== null &&
    acceptedAt === null &&
    revokedAt.getTime() < candidate.expiresAt.getTime()
  );
}

export function getEffectiveHouseholdInvitationStatus(
  invitation: unknown,
  now = new Date(),
): EffectiveHouseholdInvitationStatus {
  if (!isValidHouseholdInvitationLifecycle(invitation) || !isValidDate(now)) {
    return "INVALID";
  }

  if (invitation.status !== "PENDING") return invitation.status;
  return invitation.expiresAt.getTime() <= now.getTime() ? "EXPIRED" : "PENDING";
}

export function evaluateHouseholdInvitationAcceptance({
  invitation,
  verifiedEmail,
  verifiedUserId,
  emailVerified,
  now = new Date(),
}: {
  invitation: unknown;
  verifiedEmail: unknown;
  verifiedUserId: unknown;
  emailVerified: unknown;
  now?: Date;
}): HouseholdInvitationAcceptanceResult {
  if (!isValidHouseholdInvitationLifecycle(invitation) || !isValidDate(now)) {
    return { status: "error", reason: "invalid-invitation" };
  }
  const invitationStatus = getEffectiveHouseholdInvitationStatus(invitation, now);
  if (!isCanonicalIdentifier(verifiedUserId) || typeof verifiedEmail !== "string") {
    return { status: "error", reason: "invalid-account" };
  }
  if (emailVerified !== true) {
    return { status: "error", reason: "email-unverified" };
  }
  if (
    normalizeHouseholdInvitationEmail(verifiedEmail) !==
    normalizeHouseholdInvitationEmail(invitation.inviteeEmail)
  ) {
    return { status: "error", reason: "email-mismatch" };
  }
  if (invitationStatus === "EXPIRED") return { status: "error", reason: "expired" };
  if (invitationStatus === "ACCEPTED") {
    return { status: "error", reason: "already-accepted" };
  }
  if (invitationStatus === "REVOKED") return { status: "error", reason: "revoked" };
  return {
    status: "accepted",
    invitationId: invitation.id,
    homeId: invitation.homeId,
    invitedRole: invitation.invitedRole,
    expectedStatus: "PENDING",
    expectedVersion: invitation.version,
    acceptedByUserId: verifiedUserId,
    acceptedAt: now,
  };
}

export function evaluateHouseholdInvitationRevocation({
  actorUserId,
  actorHomeId,
  actorRole,
  invitation,
  now = new Date(),
}: {
  actorUserId: unknown;
  actorHomeId: unknown;
  actorRole: unknown;
  invitation: unknown;
  now?: Date;
}): HouseholdInvitationRevocationResult {
  if (!isValidHouseholdInvitationLifecycle(invitation) || !isValidDate(now)) {
    return { status: "error", reason: "invalid-invitation" };
  }
  const invitationStatus = getEffectiveHouseholdInvitationStatus(invitation, now);
  if (
    !isCanonicalIdentifier(actorUserId) ||
    !isCanonicalIdentifier(actorHomeId)
  ) {
    return { status: "error", reason: "invalid-actor" };
  }
  if (actorRole !== ("OWNER" satisfies HouseholdAccessRole)) {
    return { status: "error", reason: "actor-not-owner" };
  }
  if (actorHomeId !== invitation.homeId) {
    return { status: "error", reason: "different-household" };
  }
  if (invitationStatus === "EXPIRED") {
    return { status: "error", reason: "expired" };
  }
  if (invitationStatus === "ACCEPTED") {
    return { status: "error", reason: "already-accepted" };
  }
  if (invitationStatus === "REVOKED") {
    return { status: "error", reason: "revoked" };
  }
  return {
    status: "revoked",
    invitationId: invitation.id,
    homeId: invitation.homeId,
    expectedStatus: "PENDING",
    expectedVersion: invitation.version,
    revokedByUserId: actorUserId,
    revokedAt: now,
  };
}

export function canRevokeHouseholdInvitation(
  input: Parameters<typeof evaluateHouseholdInvitationRevocation>[0],
) {
  return evaluateHouseholdInvitationRevocation(input).status === "revoked";
}
