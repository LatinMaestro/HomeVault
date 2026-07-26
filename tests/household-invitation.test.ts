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
} from "../src/lib/household-invitation";

test("normalises and validates invitation email addresses", () => {
  assert.equal(
    normalizeHouseholdInvitationEmail("  Member@Example.COM  "),
    "member@example.com",
  );
  assert.equal(validateHouseholdInvitationEmail("member@example.com"), null);
  assert.equal(validateHouseholdInvitationEmail(""), "Enter the household member's email address.");
  assert.equal(validateHouseholdInvitationEmail("member-at-example"), "Enter a valid email address.");
});

test("creates high-entropy opaque invitation tokens and stores only their hash", () => {
  const token = createHouseholdInvitationToken();
  assert.match(token, /^[A-Za-z0-9_-]{43}$/);

  const tokenHash = hashHouseholdInvitationToken(token);
  assert.match(tokenHash, /^[a-f0-9]{64}$/);
  assert.notEqual(tokenHash, token);
  assert.equal(hashHouseholdInvitationToken(token), tokenHash);
});

test("invitation expiry is seven days after creation", () => {
  const now = new Date("2026-07-27T00:00:00.000Z");
  const expiresAt = getHouseholdInvitationExpiry(now);
  assert.equal(expiresAt.getTime() - now.getTime(), HOUSEHOLD_INVITATION_LIFETIME_MS);
});

test("prepares a canonical non-owner invitation", () => {
  const now = new Date("2026-07-27T00:00:00.000Z");
  const prepared = prepareHouseholdInvitation({
    actorRole: "OWNER",
    actorEmail: "owner@example.com",
    inviteeEmail: "  ADULT@Example.com ",
    invitedRole: "ADULT",
    now,
    token: "fixed-test-token",
  });

  assert.deepEqual(prepared, {
    inviteeEmail: "adult@example.com",
    invitedRole: "ADULT",
    token: "fixed-test-token",
    tokenHash: hashHouseholdInvitationToken("fixed-test-token"),
    expiresAt: new Date(now.getTime() + HOUSEHOLD_INVITATION_LIFETIME_MS),
  });
});

test("rejects non-owner actors and direct owner invitations", () => {
  assert.throws(
    () =>
      prepareHouseholdInvitation({
        actorRole: "ADULT",
        actorEmail: "adult@example.com",
        inviteeEmail: "guest@example.com",
        invitedRole: "GUEST",
        token: "test-token",
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
        token: "test-token",
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
        token: "test-token",
      }),
    /existing membership/,
  );
});
