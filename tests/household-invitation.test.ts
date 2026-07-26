import assert from "node:assert/strict";
import test from "node:test";

import {
  HOUSEHOLD_INVITATION_LIFETIME_MS,
  HouseholdInvitationInputError,
  createHouseholdInvitationToken,
  getHouseholdInvitationExpiry,
  hashHouseholdInvitationToken,
  normalizeHouseholdInvitationEmail,
  prepareHouseholdInvitation,
  validateHouseholdInvitationEmail,
  verifyHouseholdInvitationToken,
} from "../src/lib/household-invitation";

test("normalises and validates invitation email addresses", () => {
  assert.equal(
    normalizeHouseholdInvitationEmail("  Member@Example.COM  "),
    "member@example.com",
  );
  assert.equal(validateHouseholdInvitationEmail("member@example.com"), null);
  assert.equal(
    validateHouseholdInvitationEmail(""),
    "Enter the household member's email address.",
  );
  assert.equal(
    validateHouseholdInvitationEmail("member-at-example"),
    "Enter a valid email address.",
  );
});

test("creates high-entropy opaque invitation tokens and stores only their hash", () => {
  const token = createHouseholdInvitationToken();
  assert.match(token, /^[A-Za-z0-9_-]{43}$/);

  const tokenHash = hashHouseholdInvitationToken(token);
  assert.match(tokenHash, /^[a-f0-9]{64}$/);
  assert.notEqual(tokenHash, token);
  assert.equal(hashHouseholdInvitationToken(token), tokenHash);
});

test("verifies invitation tokens without accepting malformed values", () => {
  const token = createHouseholdInvitationToken();
  const tokenHash = hashHouseholdInvitationToken(token);

  assert.equal(verifyHouseholdInvitationToken(token, tokenHash), true);
  assert.equal(verifyHouseholdInvitationToken(token + "x", tokenHash), false);
  assert.equal(verifyHouseholdInvitationToken(token, "not-a-hash"), false);
  assert.equal(verifyHouseholdInvitationToken("", tokenHash), false);
});

test("invitation expiry is seven days after creation", () => {
  const now = new Date("2026-07-27T00:00:00.000Z");
  const expiresAt = getHouseholdInvitationExpiry(now);
  assert.equal(
    expiresAt.getTime() - now.getTime(),
    HOUSEHOLD_INVITATION_LIFETIME_MS,
  );
});

test("prepares a canonical non-owner invitation", () => {
  const now = new Date("2026-07-27T00:00:00.000Z");
  const prepared = prepareHouseholdInvitation({
    actorRole: "OWNER",
    actorEmail: "owner@example.com",
    inviteeEmail: "  ADULT@Example.com ",
    invitedRole: "ADULT",
    now,
  });

  assert.equal(prepared.inviteeEmail, "adult@example.com");
  assert.equal(prepared.invitedRole, "ADULT");
  assert.match(prepared.token, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(
    verifyHouseholdInvitationToken(prepared.token, prepared.tokenHash),
    true,
  );
  assert.deepEqual(
    prepared.expiresAt,
    new Date(now.getTime() + HOUSEHOLD_INVITATION_LIFETIME_MS),
  );
});

test("rejects non-owner actors and direct owner invitations", () => {
  assert.throws(
    () =>
      prepareHouseholdInvitation({
        actorRole: "ADULT",
        actorEmail: "adult@example.com",
        inviteeEmail: "guest@example.com",
        invitedRole: "GUEST",
      }),
    HouseholdInvitationInputError,
  );

  assert.throws(
    () =>
      prepareHouseholdInvitation({
        actorRole: "OWNER",
        actorEmail: "owner@example.com",
        inviteeEmail: "new-owner@example.com",
        invitedRole: "OWNER",
      }),
    HouseholdInvitationInputError,
  );
});

test("rejects self-invitations after canonicalising email", () => {
  assert.throws(
    () =>
      prepareHouseholdInvitation({
        actorRole: "OWNER",
        actorEmail: "OWNER@example.com",
        inviteeEmail: " owner@EXAMPLE.com ",
        invitedRole: "ADULT",
      }),
    /existing membership/,
  );
});
