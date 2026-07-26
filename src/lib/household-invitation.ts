import { createHash, randomBytes } from "node:crypto";

import {
  canInviteHouseholdMember,
  type HouseholdAccessRole,
} from "@/lib/household-access";

export const HOUSEHOLD_INVITATION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

export type HouseholdInvitationRole = Exclude<HouseholdAccessRole, "OWNER">;

export class HouseholdInvitationInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HouseholdInvitationInputError";
  }
}

export type PrepareHouseholdInvitationInput = {
  actorRole: HouseholdAccessRole;
  actorEmail: string;
  inviteeEmail: string;
  invitedRole: HouseholdAccessRole;
  now?: Date;
  token?: string;
};

export type PreparedHouseholdInvitation = {
  inviteeEmail: string;
  invitedRole: HouseholdInvitationRole;
  token: string;
  tokenHash: string;
  expiresAt: Date;
};

export function normalizeHouseholdInvitationEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validateHouseholdInvitationEmail(value: string) {
  const email = normalizeHouseholdInvitationEmail(value);
  if (!email) return "Enter the household member's email address.";
  if (email.length > 254) return "Keep the email address to 254 characters or fewer.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email address.";
  }
  return null;
}

export function createHouseholdInvitationToken() {
  return randomBytes(32).toString("base64url");
}

export function hashHouseholdInvitationToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function getHouseholdInvitationExpiry(now: Date) {
  return new Date(now.getTime() + HOUSEHOLD_INVITATION_LIFETIME_MS);
}

export function prepareHouseholdInvitation(
  input: PrepareHouseholdInvitationInput,
): PreparedHouseholdInvitation {
  if (!canInviteHouseholdMember(input.actorRole, input.invitedRole)) {
    throw new HouseholdInvitationInputError(
      "Only a household owner can invite an adult, child or guest.",
    );
  }

  const validationError = validateHouseholdInvitationEmail(input.inviteeEmail);
  if (validationError) {
    throw new HouseholdInvitationInputError(validationError);
  }

  const actorEmail = normalizeHouseholdInvitationEmail(input.actorEmail);
  const inviteeEmail = normalizeHouseholdInvitationEmail(input.inviteeEmail);
  if (actorEmail && actorEmail === inviteeEmail) {
    throw new HouseholdInvitationInputError(
      "Use the existing membership instead of inviting yourself.",
    );
  }

  const token = input.token ?? createHouseholdInvitationToken();
  if (!token) {
    throw new HouseholdInvitationInputError("Invitation token generation failed.");
  }

  const now = input.now ?? new Date();
  return {
    inviteeEmail,
    invitedRole: input.invitedRole as HouseholdInvitationRole,
    token,
    tokenHash: hashHouseholdInvitationToken(token),
    expiresAt: getHouseholdInvitationExpiry(now),
  };
}
