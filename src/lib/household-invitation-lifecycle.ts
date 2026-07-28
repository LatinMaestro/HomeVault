import type { HouseholdAccessRole } from "@/lib/household-access";
import {
  normalizeHouseholdInvitationEmail,
  validateHouseholdInvitationEmail,
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
  inviteeEmail: string;
  status: StoredHouseholdInvitationStatus;
  expiresAt: Date;
  acceptedAt?: Date | null;
  revokedAt?: Date | null;
};

export type HouseholdInvitationAcceptanceResult =
  | {
      status: "accepted";
      acceptedAt: Date;
    }
  | {
      status: "error";
      reason:
        | "email-unverified"
        | "email-mismatch"
        | "invalid-invitation"
        | "expired"
        | "already-accepted"
        | "revoked";
    };

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

export function isValidHouseholdInvitationLifecycle(
  invitation: HouseholdInvitationLifecycle,
) {
  if (
    validateHouseholdInvitationEmail(invitation.inviteeEmail) ||
    !["PENDING", "ACCEPTED", "REVOKED"].includes(invitation.status) ||
    !isValidDate(invitation.expiresAt)
  ) {
    return false;
  }

  const acceptedAt = invitation.acceptedAt ?? null;
  const revokedAt = invitation.revokedAt ?? null;

  if (
    (acceptedAt !== null && !isValidDate(acceptedAt)) ||
    (revokedAt !== null && !isValidDate(revokedAt))
  ) {
    return false;
  }

  if (invitation.status === "PENDING") {
    return acceptedAt === null && revokedAt === null;
  }

  if (invitation.status === "ACCEPTED") {
    return (
      acceptedAt !== null &&
      revokedAt === null &&
      acceptedAt.getTime() < invitation.expiresAt.getTime()
    );
  }

  return (
    revokedAt !== null &&
    acceptedAt === null &&
    revokedAt.getTime() < invitation.expiresAt.getTime()
  );
}

export function getEffectiveHouseholdInvitationStatus(
  invitation: HouseholdInvitationLifecycle,
  now = new Date(),
): EffectiveHouseholdInvitationStatus {
  if (
    !isValidHouseholdInvitationLifecycle(invitation) ||
    !isValidDate(now)
  ) {
    return "INVALID";
  }

  if (invitation.status !== "PENDING") {
    return invitation.status;
  }

  return invitation.expiresAt.getTime() <= now.getTime()
    ? "EXPIRED"
    : "PENDING";
}

export function evaluateHouseholdInvitationAcceptance({
  invitation,
  verifiedEmail,
  emailVerified,
  now = new Date(),
}: {
  invitation: HouseholdInvitationLifecycle;
  verifiedEmail: string;
  emailVerified: boolean;
  now?: Date;
}): HouseholdInvitationAcceptanceResult {
  const invitationStatus = getEffectiveHouseholdInvitationStatus(
    invitation,
    now,
  );

  if (invitationStatus === "INVALID") {
    return { status: "error", reason: "invalid-invitation" };
  }

  if (!emailVerified) {
    return { status: "error", reason: "email-unverified" };
  }

  if (
    normalizeHouseholdInvitationEmail(verifiedEmail) !==
    normalizeHouseholdInvitationEmail(invitation.inviteeEmail)
  ) {
    return { status: "error", reason: "email-mismatch" };
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

  return { status: "accepted", acceptedAt: now };
}

export function canRevokeHouseholdInvitation({
  actorRole,
  invitation,
  now = new Date(),
}: {
  actorRole: HouseholdAccessRole;
  invitation: HouseholdInvitationLifecycle;
  now?: Date;
}) {
  return (
    actorRole === "OWNER" &&
    getEffectiveHouseholdInvitationStatus(invitation, now) === "PENDING"
  );
}
