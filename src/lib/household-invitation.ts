import {
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

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
};

export type PreparedHouseholdInvitation = {
  inviteeEmail: string;
  invitedRole: HouseholdInvitationRole;
  token: string;
  tokenHash: string;
  expiresAt: Date;
};

export function isHouseholdInvitationRole(
  value: unknown,
): value is HouseholdInvitationRole {
  return value === "ADULT" || value === "CHILD" || value === "GUEST";
}

export function normalizeHouseholdInvitationEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function validateHouseholdInvitationEmail(value: unknown) {
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

export function verifyHouseholdInvitationToken(
  token: string,
  expectedHash: string,
) {
  if (
    typeof token !== "string" ||
    !/^[A-Za-z0-9_-]{43}$/.test(token) ||
    typeof expectedHash !== "string" ||
    !/^[a-f0-9]{64}$/.test(expectedHash)
  ) {
    return false;
  }

  const actual = Buffer.from(hashHouseholdInvitationToken(token), "hex");
  const expected = Buffer.from(expectedHash, "hex");

  return (
    actual.length === expected.length &&
    timingSafeEqual(actual, expected)
  );
}

export function getHouseholdInvitationExpiry(now: Date) {
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    throw new HouseholdInvitationInputError(
      "Invitation time is unavailable.",
    );
  }

  const expiresAt = new Date(now.getTime() + HOUSEHOLD_INVITATION_LIFETIME_MS);
  if (!Number.isFinite(expiresAt.getTime())) {
    throw new HouseholdInvitationInputError(
      "Invitation time is unavailable.",
    );
  }
  return expiresAt;
}

export function prepareHouseholdInvitation(
  input: PrepareHouseholdInvitationInput,
): PreparedHouseholdInvitation {
  const invitedRole = input.invitedRole;
  if (
    input.actorRole !== "OWNER" ||
    !isHouseholdInvitationRole(invitedRole) ||
    !canInviteHouseholdMember(input.actorRole, invitedRole)
  ) {
    throw new HouseholdInvitationInputError(
      "Only a household owner can invite an adult, child or guest.",
    );
  }

  const validationError = validateHouseholdInvitationEmail(input.inviteeEmail);
  if (validationError) {
    throw new HouseholdInvitationInputError(validationError);
  }

  if (validateHouseholdInvitationEmail(input.actorEmail)) {
    throw new HouseholdInvitationInputError(
      "Verified account email is unavailable.",
    );
  }

  const actorEmail = normalizeHouseholdInvitationEmail(input.actorEmail);
  const inviteeEmail = normalizeHouseholdInvitationEmail(input.inviteeEmail);
  if (actorEmail === inviteeEmail) {
    throw new HouseholdInvitationInputError(
      "Use the existing membership instead of inviting yourself.",
    );
  }

  const now = input.now ?? new Date();
  const expiresAt = getHouseholdInvitationExpiry(now);
  const token = createHouseholdInvitationToken();

  return {
    inviteeEmail,
    invitedRole,
    token,
    tokenHash: hashHouseholdInvitationToken(token),
    expiresAt,
  };
}
