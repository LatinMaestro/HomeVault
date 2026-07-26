import type { HouseholdAccessRole } from "@/lib/household-access";
import { normalizeHouseholdInvitationEmail } from "@/lib/household-invitation";

export type StoredHouseholdInvitationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REVOKED";

export type EffectiveHouseholdInvitationStatus =
  | StoredHouseholdInvitationStatus
  | "EXPIRED";

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
        | "expired"
        | "already-accepted"
        | "revoked";
    };

export function getEffectiveHouseholdInvitationStatus(
  invitation: HouseholdInvitationLifecycle,
  now = new Date(),
): EffectiveHouseholdInvitationStatus {
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
  if (!emailVerified) {
    return { status: "error", reason: "email-unverified" };
  }

  if (
    normalizeHouseholdInvitationEmail(verifiedEmail) !==
    normalizeHouseholdInvitationEmail(invitation.inviteeEmail)
  ) {
    return { status: "error", reason: "email-mismatch" };
  }

  const invitationStatus = getEffectiveHouseholdInvitationStatus(
    invitation,
    now,
  );

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
