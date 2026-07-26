import assert from "node:assert/strict";
import test from "node:test";

import {
  decideEmailChangeApplication,
  decideEmailChangeProof,
  decideEmailChangeRequest,
  getEffectiveEmailChangeStatus,
  type EmailChangeLifecycle,
} from "../src/lib/verified-email-change-policy";

const now = new Date("2026-07-27T00:00:00.000Z");

const pendingChange: EmailChangeLifecycle = {
  id: "email-change-1",
  userId: "user-1",
  currentEmail: "owner@example.com",
  newEmail: "new-owner@example.com",
  status: "PENDING",
  expiresAt: new Date("2026-07-27T01:00:00.000Z"),
};

test("normalizes a verified credential-confirmed email change request", () => {
  assert.deepEqual(
    decideEmailChangeRequest({
      currentUserId: "user-1",
      currentEmail: " Owner@Example.com ",
      emailVerified: true,
      credentialConfirmed: true,
      requestedEmail: " New-Owner@Example.com ",
      requestedEmailAvailable: true,
    }),
    {
      status: "request-allowed",
      userId: "user-1",
      currentEmail: "owner@example.com",
      newEmail: "new-owner@example.com",
    },
  );
});

test("rejects unverified, unconfirmed, invalid, unchanged or unavailable requests", () => {
  const request = {
    currentUserId: "user-1",
    currentEmail: "owner@example.com",
    emailVerified: true,
    credentialConfirmed: true,
    requestedEmail: "new-owner@example.com",
    requestedEmailAvailable: true,
  };

  assert.deepEqual(
    decideEmailChangeRequest({ ...request, emailVerified: false }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideEmailChangeRequest({ ...request, credentialConfirmed: false }),
    { status: "credential-confirmation-required" },
  );
  assert.deepEqual(
    decideEmailChangeRequest({ ...request, requestedEmail: "invalid" }),
    { status: "invalid-email" },
  );
  assert.deepEqual(
    decideEmailChangeRequest({
      ...request,
      requestedEmail: "OWNER@example.com",
    }),
    { status: "unchanged-email" },
  );
  assert.deepEqual(
    decideEmailChangeRequest({
      ...request,
      requestedEmailAvailable: false,
    }),
    { status: "email-unavailable" },
  );
});

test("expires a pending change at the exact deadline", () => {
  assert.equal(
    getEffectiveEmailChangeStatus(
      pendingChange,
      new Date("2026-07-27T00:59:59.999Z"),
    ),
    "PENDING",
  );
  assert.equal(
    getEffectiveEmailChangeStatus(
      pendingChange,
      new Date("2026-07-27T01:00:00.000Z"),
    ),
    "EXPIRED",
  );
});

test("accepts separate old-address approval and new-address verification proofs", () => {
  for (const proof of [
    "current-email-approval",
    "new-email-verification",
  ] as const) {
    assert.deepEqual(
      decideEmailChangeProof({
        change: pendingChange,
        currentUserId: "user-1",
        currentVerifiedEmail: "OWNER@example.com",
        proof,
        tokenVerified: true,
        now,
      }),
      { status: "proof-accepted", proof, acceptedAt: now },
    );
  }
});

test("rejects invalid, replayed, expired and identity-mismatched proofs", () => {
  assert.deepEqual(
    decideEmailChangeProof({
      change: pendingChange,
      currentUserId: "user-1",
      currentVerifiedEmail: "owner@example.com",
      proof: "new-email-verification",
      tokenVerified: false,
      now,
    }),
    { status: "invalid-proof" },
  );

  assert.deepEqual(
    decideEmailChangeProof({
      change: { ...pendingChange, newEmailVerifiedAt: now },
      currentUserId: "user-1",
      currentVerifiedEmail: "owner@example.com",
      proof: "new-email-verification",
      tokenVerified: true,
      now,
    }),
    { status: "already-confirmed" },
  );

  assert.deepEqual(
    decideEmailChangeProof({
      change: pendingChange,
      currentUserId: "user-1",
      currentVerifiedEmail: "owner@example.com",
      proof: "current-email-approval",
      tokenVerified: true,
      now: pendingChange.expiresAt,
    }),
    { status: "expired" },
  );

  assert.deepEqual(
    decideEmailChangeProof({
      change: pendingChange,
      currentUserId: "other-user",
      currentVerifiedEmail: "owner@example.com",
      proof: "current-email-approval",
      tokenVerified: true,
      now,
    }),
    { status: "unavailable" },
  );
});

test("applies only after both proofs while the current identity is unchanged", () => {
  const provenChange = {
    ...pendingChange,
    currentEmailApprovedAt: now,
    newEmailVerifiedAt: now,
  };

  assert.deepEqual(
    decideEmailChangeApplication({
      change: pendingChange,
      currentUserId: "user-1",
      currentVerifiedEmail: "owner@example.com",
      requestedEmailAvailable: true,
      now,
    }),
    { status: "proofs-required" },
  );

  assert.deepEqual(
    decideEmailChangeApplication({
      change: provenChange,
      currentUserId: "user-1",
      currentVerifiedEmail: "owner@example.com",
      requestedEmailAvailable: true,
      now,
    }),
    {
      status: "application-allowed",
      userId: "user-1",
      newEmail: "new-owner@example.com",
      appliedAt: now,
    },
  );

  assert.deepEqual(
    decideEmailChangeApplication({
      change: provenChange,
      currentUserId: "user-1",
      currentVerifiedEmail: "changed@example.com",
      requestedEmailAvailable: true,
      now,
    }),
    { status: "unavailable" },
  );
});

test("rechecks email availability and blocks terminal or expired replay", () => {
  const provenChange = {
    ...pendingChange,
    currentEmailApprovedAt: now,
    newEmailVerifiedAt: now,
  };

  assert.deepEqual(
    decideEmailChangeApplication({
      change: provenChange,
      currentUserId: "user-1",
      currentVerifiedEmail: "owner@example.com",
      requestedEmailAvailable: false,
      now,
    }),
    { status: "email-unavailable" },
  );

  assert.deepEqual(
    decideEmailChangeApplication({
      change: { ...provenChange, status: "APPLIED" },
      currentUserId: "user-1",
      currentVerifiedEmail: "owner@example.com",
      requestedEmailAvailable: true,
      now,
    }),
    { status: "unavailable" },
  );

  assert.deepEqual(
    decideEmailChangeApplication({
      change: provenChange,
      currentUserId: "user-1",
      currentVerifiedEmail: "owner@example.com",
      requestedEmailAvailable: true,
      now: provenChange.expiresAt,
    }),
    { status: "expired" },
  );
});
