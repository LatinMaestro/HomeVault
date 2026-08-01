import assert from "node:assert/strict";
import test from "node:test";

import {
  HOUSEHOLD_INVITATION_LIFETIME_MS,
  HouseholdInvitationInputError,
  createHouseholdInvitationToken,
  getHouseholdInvitationExpiry,
  hashHouseholdInvitationToken,
  isHouseholdInvitationRole,
  normalizeHouseholdInvitationEmail,
  prepareHouseholdInvitation,
  validateHouseholdInvitationEmail,
  verifyHouseholdInvitationToken,
} from "../src/lib/household-invitation";
import type { HouseholdAccessRole } from "../src/lib/household-access";

const runtimeRole = (value: string) => value as HouseholdAccessRole;

test("accepts only explicit non-owner invitation roles at runtime", () => {
  assert.equal(isHouseholdInvitationRole("ADULT"), true);
  assert.equal(isHouseholdInvitationRole("CHILD"), true);
  assert.equal(isHouseholdInvitationRole("GUEST"), true);
  assert.equal(isHouseholdInvitationRole("OWNER"), false);
  assert.equal(isHouseholdInvitationRole("ADMIN"), false);
  assert.equal(isHouseholdInvitationRole(null), false);
});

test("normalises and validates invitation email addresses", () => {
  assert.equal(
    normalizeHouseholdInvitationEmail("  Member@Example.COM  "),
    "member@example.com",
  );
  assert.equal(normalizeHouseholdInvitationEmail(null), "");
  assert.equal(validateHouseholdInvitationEmail("member@example.com"), null);
  assert.equal(
    validateHouseholdInvitationEmail(""),
    "Enter the household member's email address.",
  );
  assert.equal(
    validateHouseholdInvitationEmail("member-at-example"),
    "Enter a valid email address.",
  );
  assert.equal(
    validateHouseholdInvitationEmail({}),
    "Enter the household member's email address.",
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

test("verifies only canonical bounded invitation tokens", () => {
  const token = createHouseholdInvitationToken();
  const tokenHash = hashHouseholdInvitationToken(token);

  assert.equal(verifyHouseholdInvitationToken(token, tokenHash), true);
  assert.equal(verifyHouseholdInvitationToken(token + "x", tokenHash), false);
  assert.equal(verifyHouseholdInvitationToken("a".repeat(100_000), tokenHash), false);
  assert.equal(verifyHouseholdInvitationToken(token, "not-a-hash"), false);
  assert.equal(verifyHouseholdInvitationToken("", tokenHash), false);
});

test("invitation expiry is seven days after a valid creation time", () => {
  const now = new Date("2026-07-27T00:00:00.000Z");
  const expiresAt = getHouseholdInvitationExpiry(now);
  assert.equal(
    expiresAt.getTime() - now.getTime(),
    HOUSEHOLD_INVITATION_LIFETIME_MS,
  );
});

test("invalid invitation times fail closed", () => {
  assert.throws(
    () => getHouseholdInvitationExpiry(new Date("invalid")),
    HouseholdInvitationInputError,
  );
  assert.throws(
    () => getHouseholdInvitationExpiry("2026-07-27" as unknown as Date),
    HouseholdInvitationInputError,
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

test("rejects non-owner actors and direct or unknown role invitations", () => {
  for (const [actorRole, invitedRole] of [
    ["ADULT", "GUEST"],
    ["OWNER", "OWNER"],
    ["OWNER", "ADMIN"],
    ["ADMIN", "GUEST"],
  ] as const) {
    assert.throws(
      () =>
        prepareHouseholdInvitation({
          actorRole: runtimeRole(actorRole),
          actorEmail: "owner@example.com",
          inviteeEmail: "guest@example.com",
          invitedRole: runtimeRole(invitedRole),
        }),
      HouseholdInvitationInputError,
    );
  }
});

test("rejects missing actor identity evidence", () => {
  assert.throws(
    () =>
      prepareHouseholdInvitation({
        actorRole: "OWNER",
        actorEmail: "",
        inviteeEmail: "guest@example.com",
        invitedRole: "GUEST",
      }),
    /Verified account email/,
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

test("preparation rejects invalid server time before returning a token", () => {
  assert.throws(
    () =>
      prepareHouseholdInvitation({
        actorRole: "OWNER",
        actorEmail: "owner@example.com",
        inviteeEmail: "guest@example.com",
        invitedRole: "GUEST",
        now: new Date("invalid"),
      }),
    /Invitation time/,
  );
});
