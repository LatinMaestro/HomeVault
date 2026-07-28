import assert from "node:assert/strict";
import test from "node:test";

import {
  canRevokeHouseholdInvitation,
  evaluateHouseholdInvitationAcceptance,
  getEffectiveHouseholdInvitationStatus,
  isValidHouseholdInvitationLifecycle,
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
  const lifecycleAt = new Date("2026-07-28T00:00:00.000Z");

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
      invitation: pendingInvitation({
        status: "ACCEPTED",
        acceptedAt: lifecycleAt,
      }),
      verifiedEmail: "member@example.com",
      emailVerified: true,
    }),
    { status: "error", reason: "already-accepted" },
  );

  assert.deepEqual(
    evaluateHouseholdInvitationAcceptance({
      invitation: pendingInvitation({
        status: "REVOKED",
        revokedAt: lifecycleAt,
      }),
      verifiedEmail: "member@example.com",
      emailVerified: true,
    }),
    { status: "error", reason: "revoked" },
  );
});

test("fails closed for corrupt lifecycle dates, status timestamps and email", () => {
  const invalidExpiry = pendingInvitation({
    expiresAt: new Date("invalid"),
  });
  const acceptedWithoutTimestamp = pendingInvitation({
    status: "ACCEPTED",
  });
  const pendingWithAcceptedTimestamp = pendingInvitation({
    acceptedAt: new Date("2026-07-28T00:00:00.000Z"),
  });
  const invalidEmail = pendingInvitation({
    inviteeEmail: "not-an-email",
  });

  assert.equal(isValidHouseholdInvitationLifecycle(invalidExpiry), false);
  assert.equal(
    isValidHouseholdInvitationLifecycle(acceptedWithoutTimestamp),
    false,
  );
  assert.equal(
    isValidHouseholdInvitationLifecycle(pendingWithAcceptedTimestamp),
    false,
  );
  assert.equal(isValidHouseholdInvitationLifecycle(invalidEmail), false);

  assert.equal(
    getEffectiveHouseholdInvitationStatus(invalidExpiry),
    "INVALID",
  );
  assert.equal(
    getEffectiveHouseholdInvitationStatus(
      pendingInvitation(),
      new Date("invalid"),
    ),
    "INVALID",
  );
  assert.deepEqual(
    evaluateHouseholdInvitationAcceptance({
      invitation: invalidExpiry,
      verifiedEmail: "member@example.com",
      emailVerified: true,
    }),
    { status: "error", reason: "invalid-invitation" },
  );
  assert.equal(
    canRevokeHouseholdInvitation({
      actorRole: "OWNER",
      invitation: invalidExpiry,
    }),
    false,
  );
});

test("requires terminal timestamps to precede expiry", () => {
  assert.equal(
    isValidHouseholdInvitationLifecycle(
      pendingInvitation({
        status: "ACCEPTED",
        acceptedAt: expiresAt,
      }),
    ),
    false,
  );
  assert.equal(
    isValidHouseholdInvitationLifecycle(
      pendingInvitation({
        status: "REVOKED",
        revokedAt: new Date("2026-08-03T00:00:00.001Z"),
      }),
    ),
    false,
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
      invitation: pendingInvitation({
        status: "ACCEPTED",
        acceptedAt: now,
      }),
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
