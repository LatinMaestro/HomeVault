import {
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import {
  canInviteHouseholdMember,
  type HouseholdRole,
} from "@/lib/household-access";

export const HOUSEHOLD_INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type HouseholdInvitationRole = Exclude<HouseholdRole, "OWNER">;

export type PreparedHouseholdInvitation = {
  householdId: string;
  invitedEmail: string;
  invitedRole: HouseholdInvitationRole;
  invitedByUserId: string;
  token: string;
  tokenHash: string;
  expiresAt: Date;
};

export type PrepareHouseholdInvitationInput = {
  actorRole: HouseholdRole;
  householdId: string;
  invitedByUserId: string;
  invitedEmail: string;
  invitedRole: HouseholdRole;
  actorEmail?: string | null;
  now?: Date;
};

export function normalizeInvitationEmail(email: string) {
  return email.trim().toLowerCase();
}

export function createHouseholdInvitationToken() {
  return randomBytes(32).toString("base64url");
}

export function hashHouseholdInvitationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function verifyHouseholdInvitationToken(
  token: string,
  expectedHash: string,
) {
  if (!token || !/^[a-f0-9]{64}$/.test(expectedHash)) {
    return false;
  }

  const actual = Buffer.from(hashHouseholdInvitationToken(token), "hex");
  const expected = Buffer.from(expectedHash, "hex");

  return (
    actual.length === expected.length &&
    timingSafeEqual(actual, expected)
  );
}

export function householdInvitationExpiresAt(now = new Date()) {
  return new Date(now.getTime() + HOUSEHOLD_INVITATION_TTL_MS);
}

export function prepareHouseholdInvitation(
  input: PrepareHouseholdInvitationInput,
): PreparedHouseholdInvitation {
  const invitedEmail = normalizeInvitationEmail(input.invitedEmail);

  if (!invitedEmail || !invitedEmail.includes("@")) {
    throw new Error("Enter a valid email address.");
  }

  const invitedRole = input.invitedRole;

  if (
    invitedRole === "OWNER" ||
    !canInviteHouseholdMember(input.actorRole, invitedRole)
  ) {
    throw new Error("You cannot invite a member with that role.");
  }

  if (
    input.actorEmail &&
    normalizeInvitationEmail(input.actorEmail) === invitedEmail
  ) {
    throw new Error("You are already a member of this household.");
  }

  const token = createHouseholdInvitationToken();
  const now = input.now ?? new Date();

  return {
    householdId: input.householdId,
    invitedEmail,
    invitedRole,
    invitedByUserId: input.invitedByUserId,
    token,
    tokenHash: hashHouseholdInvitationToken(token),
    expiresAt: householdInvitationExpiresAt(now),
  };
}
