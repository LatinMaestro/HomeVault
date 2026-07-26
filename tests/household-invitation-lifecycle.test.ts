import assert from "node:assert/strict";
import test from "node:test";

import {
  canRevokeHouseholdInvitation,
  evaluateHouseholdInvitationAcceptance,
  getEffectiveHouseholdInvitationStatus,
  type HouseholdInvitationLifecycle,
} from "../src/lib/household-invitation-lifecycle";

const expiresAt = new Date("2026-08-03T00:00:00.000Z");

function pendingInvitation(
  overrides: Partial<HouseholdInvitationLifecycle> = {},
): HouseholdInvitationLifecycle {
  return {
    inviteeEmail: "member@example.com",
    status: "PENDING",
    expiresAt,
    ...overrides,
  };
}

test("derives expiry at the exact server-side deadline", () => {
  const invitation = pendingInvitation();

  assert.equal(
    getEffectiveHouseholdInvitationStatus(
      invitation,
      new Date("2026-08-02T23:59:59.999Z"),
    ),
    "PENDING",
  );
  assert.equal(
    getEffectiveHouseholdInvitationStatus(invitation, expiresAt),
    "EXPIRED",
  );
});

test("accepts only the matching verified email while pending", () => {
  const now = new Date("2026-07-28T00:00:00.000Z");

  assert.deepEqual(
    evaluateHouseholdInvitationAcceptance({
      invitation: pendingInvitation(),
      verifiedEmail: " MEMBER@Example.com ",
      emailVerified: true,
      now,
    }),
    { status: "accepted", acceptedAt: now },
  );

  assert.deepEqual(
    evaluateHouseholdInvitationAcceptance({
      invitation: pendingInvitation(),
      verifiedEmail: "member@example.com",
      emailVerified: false,
      now,
    }),
    { status: "error", reason: "email-unverified" },
  );

  assert.deepEqual(
    evaluateHouseholdInvitationAcceptance({
      invitation: pendingInvitation(),
      verifiedEmail: "other@example.com",
      emailVerified: true,
      now,
    }),
    { status: "error", reason: "email-mismatch" },
  );
});

test("rejects expired, accepted and revoked invitations", () => {
  assert.deepEqual(
    evaluateHouseholdInvitationAcceptance({
      invitation: pendingInvitation(),
      verifiedEmail: "member@example.com",
      emailVerified: true,
      now: expiresAt,
    }),
    { status: "error", reason: "expired" },
  );

  assert.deepEqual(
    evaluateHouseholdInvitationAcceptance({
      invitation: pendingInvitation({ status: "ACCEPTED" }),
      verifiedEmail: "member@example.com",
      emailVerified: true,
    }),
    { status: "error", reason: "already-accepted" },
  );

  assert.deepEqual(
    evaluateHouseholdInvitationAcceptance({
      invitation: pendingInvitation({ status: "REVOKED" }),
      verifiedEmail: "member@example.com",
      emailVerified: true,
    }),
    { status: "error", reason: "revoked" },
  );
});

test("allows only an owner to revoke an unexpired pending invitation", () => {
  const now = new Date("2026-07-28T00:00:00.000Z");
  const invitation = pendingInvitation();

  assert.equal(
    canRevokeHouseholdInvitation({ actorRole: "OWNER", invitation, now }),
    true,
  );
  assert.equal(
    canRevokeHouseholdInvitation({ actorRole: "ADULT", invitation, now }),
    false,
  );
  assert.equal(
    canRevokeHouseholdInvitation({
      actorRole: "OWNER",
      invitation: pendingInvitation({ status: "ACCEPTED" }),
      now,
    }),
    false,
  );
  assert.equal(
    canRevokeHouseholdInvitation({
      actorRole: "OWNER",
      invitation,
      now: expiresAt,
    }),
    false,
  );
});
