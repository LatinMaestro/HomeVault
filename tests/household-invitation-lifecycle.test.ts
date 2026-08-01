import assert from "node:assert/strict";
import test from "node:test";

import {
  canRevokeHouseholdInvitation,
  evaluateHouseholdInvitationAcceptance,
  evaluateHouseholdInvitationRevocation,
  getEffectiveHouseholdInvitationStatus,
  isValidHouseholdInvitationLifecycle,
  type HouseholdInvitationLifecycle,
} from "../src/lib/household-invitation-lifecycle";

const expiresAt = new Date("2026-08-03T00:00:00.000Z");

function pending(
  overrides: Partial<HouseholdInvitationLifecycle> = {},
): HouseholdInvitationLifecycle {
  return {
    id: "invitation_123",
    homeId: "home_123",
    inviteeEmail: "member@example.com",
    invitedRole: "ADULT",
    version: 4,
    status: "PENDING",
    expiresAt,
    ...overrides,
  };
}

test("expires exactly at the server deadline", () => {
  assert.equal(
    getEffectiveHouseholdInvitationStatus(
      pending(),
      new Date("2026-08-02T23:59:59.999Z"),
    ),
    "PENDING",
  );
  assert.equal(getEffectiveHouseholdInvitationStatus(pending(), expiresAt), "EXPIRED");
});

test("accepts only a matching verified account", () => {
  const now = new Date("2026-07-28T00:00:00.000Z");
  assert.deepEqual(
    evaluateHouseholdInvitationAcceptance({
      invitation: pending(),
      verifiedEmail: " MEMBER@example.com ",
      verifiedUserId: "user_123",
      emailVerified: true,
      now,
    }),
    {
      status: "accepted",
      invitationId: "invitation_123",
      homeId: "home_123",
      invitedRole: "ADULT",
      expectedStatus: "PENDING",
      expectedVersion: 4,
      acceptedByUserId: "user_123",
      acceptedAt: now,
    },
  );
  assert.deepEqual(
    evaluateHouseholdInvitationAcceptance({
      invitation: pending(),
      verifiedEmail: "other@example.com",
      verifiedUserId: "user_123",
      emailVerified: true,
      now,
    }),
    { status: "error", reason: "email-mismatch" },
  );
});

test("rejects valid terminal states", () => {
  const lifecycleAt = new Date("2026-07-28T00:00:00.000Z");
  assert.deepEqual(
    evaluateHouseholdInvitationAcceptance({
      invitation: pending({ status: "ACCEPTED", acceptedAt: lifecycleAt }),
      verifiedEmail: "member@example.com",
      verifiedUserId: "user_123",
      emailVerified: true,
    }),
    { status: "error", reason: "already-accepted" },
  );
  assert.deepEqual(
    evaluateHouseholdInvitationAcceptance({
      invitation: pending({ status: "REVOKED", revokedAt: lifecycleAt }),
      verifiedEmail: "member@example.com",
      verifiedUserId: "user_123",
      emailVerified: true,
    }),
    { status: "error", reason: "revoked" },
  );
});

test("invalid expiry and server time fail closed", () => {
  const invalid = pending({ expiresAt: new Date("invalid") });
  assert.equal(getEffectiveHouseholdInvitationStatus(invalid), "INVALID");
  assert.equal(
    getEffectiveHouseholdInvitationStatus(pending(), new Date("invalid")),
    "INVALID",
  );
  assert.deepEqual(
    evaluateHouseholdInvitationAcceptance({
      invitation: invalid,
      verifiedEmail: "member@example.com",
      verifiedUserId: "user_123",
      emailVerified: true,
    }),
    { status: "error", reason: "invalid-invitation" },
  );
  assert.equal(
    canRevokeHouseholdInvitation({
      actorUserId: "owner_123",
      actorHomeId: "home_123",
      actorRole: "OWNER",
      invitation: invalid,
    }),
    false,
  );
});

test("status and terminal timestamps must be coherent", () => {
  assert.equal(
    isValidHouseholdInvitationLifecycle(pending({ status: "ACCEPTED" })),
    false,
  );
  assert.equal(
    isValidHouseholdInvitationLifecycle(
      pending({ acceptedAt: new Date("2026-07-28T00:00:00.000Z") }),
    ),
    false,
  );
  assert.equal(
    isValidHouseholdInvitationLifecycle(
      pending({ status: "ACCEPTED", acceptedAt: expiresAt }),
    ),
    false,
  );
});

test("rejects malformed identity, role, version, and runtime records", () => {
  assert.equal(isValidHouseholdInvitationLifecycle(null), false);
  assert.equal(isValidHouseholdInvitationLifecycle("invitation"), false);
  assert.equal(isValidHouseholdInvitationLifecycle(pending({ id: " bad " })), false);
  assert.equal(
    isValidHouseholdInvitationLifecycle(pending({ homeId: "home 123" })),
    false,
  );
  assert.equal(
    isValidHouseholdInvitationLifecycle(
      pending({ invitedRole: "OWNER" as HouseholdInvitationLifecycle["invitedRole"] }),
    ),
    false,
  );
  assert.equal(isValidHouseholdInvitationLifecycle(pending({ version: 0 })), false);
  assert.equal(
    isValidHouseholdInvitationLifecycle(pending({ version: 1.5 })),
    false,
  );
});

test("requires exact verified-account evidence", () => {
  assert.deepEqual(
    evaluateHouseholdInvitationAcceptance({
      invitation: pending(),
      verifiedEmail: "member@example.com",
      verifiedUserId: "user_123",
      emailVerified: "true",
    }),
    { status: "error", reason: "email-unverified" },
  );
  assert.deepEqual(
    evaluateHouseholdInvitationAcceptance({
      invitation: pending(),
      verifiedEmail: "member@example.com",
      verifiedUserId: " bad ",
      emailVerified: true,
    }),
    { status: "error", reason: "invalid-account" },
  );
});

test("revocation is owner-only and bound to household, actor, and version", () => {
  const now = new Date("2026-07-28T00:00:00.000Z");
  const input = {
    actorUserId: "owner_123",
    actorHomeId: "home_123",
    actorRole: "OWNER",
    invitation: pending(),
    now,
  } as const;

  assert.deepEqual(evaluateHouseholdInvitationRevocation(input), {
    status: "revoked",
    invitationId: "invitation_123",
    homeId: "home_123",
    expectedStatus: "PENDING",
    expectedVersion: 4,
    revokedByUserId: "owner_123",
    revokedAt: now,
  });
  assert.equal(canRevokeHouseholdInvitation(input), true);
  assert.deepEqual(
    evaluateHouseholdInvitationRevocation({ ...input, actorRole: "ADULT" }),
    { status: "error", reason: "actor-not-owner" },
  );
  assert.deepEqual(
    evaluateHouseholdInvitationRevocation({
      ...input,
      actorHomeId: "home_other",
    }),
    { status: "error", reason: "different-household" },
  );
});

test("revocation rejects expired and terminal invitations", () => {
  const base = {
    actorUserId: "owner_123",
    actorHomeId: "home_123",
    actorRole: "OWNER",
  } as const;
  assert.deepEqual(
    evaluateHouseholdInvitationRevocation({
      ...base,
      invitation: pending(),
      now: expiresAt,
    }),
    { status: "error", reason: "expired" },
  );
  assert.deepEqual(
    evaluateHouseholdInvitationRevocation({
      ...base,
      invitation: pending({
        status: "ACCEPTED",
        acceptedAt: new Date("2026-07-28T00:00:00.000Z"),
      }),
    }),
    { status: "error", reason: "already-accepted" },
  );
});
