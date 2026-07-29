import assert from "node:assert/strict";
import test from "node:test";

import {
  decideEmailChangeApplication,
  decideEmailChangeProof,
  decideEmailChangeRequest,
  getEffectiveEmailChangeStatus,
  type EmailChangeLifecycle,
  type EmailChangeProof,
} from "../src/lib/verified-email-change-policy";

const now = new Date("2026-07-29T00:00:00.000Z");
const expiry = new Date("2026-07-29T01:00:00.000Z");
const pendingChange: EmailChangeLifecycle = {
  id: "email-change-1",
  userId: "user-1",
  currentEmail: "owner@example.com",
  newEmail: "new-owner@example.com",
  status: "PENDING",
  expiresAt: expiry,
};

function token(proof: EmailChangeProof) {
  return {
    tokenId: proof === "current-email-approval" ? "token-old" : "token-new",
    changeId: pendingChange.id,
    userId: pendingChange.userId,
    email:
      proof === "current-email-approval"
        ? pendingChange.currentEmail
        : pendingChange.newEmail,
    proof,
    verified: true,
    expiresAt: expiry,
  };
}

test("normalizes an exactly verified and reconfirmed request", () => {
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

test("fails closed for malformed identities, emails and truthy booleans", () => {
  const request = {
    currentUserId: "user-1",
    currentEmail: "owner@example.com",
    emailVerified: true,
    credentialConfirmed: true,
    requestedEmail: "new-owner@example.com",
    requestedEmailAvailable: true,
  };
  assert.deepEqual(
    decideEmailChangeRequest({ ...request, currentUserId: " user-1" }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideEmailChangeRequest({ ...request, emailVerified: 1 as never }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideEmailChangeRequest({ ...request, credentialConfirmed: "yes" as never }),
    { status: "credential-confirmation-required" },
  );
  assert.deepEqual(
    decideEmailChangeRequest({ ...request, requestedEmail: 42 as never }),
    { status: "invalid-email" },
  );
  assert.deepEqual(
    decideEmailChangeRequest({ ...request, requestedEmailAvailable: 1 as never }),
    { status: "email-unavailable" },
  );
});

test("invalid lifecycle dates fail closed instead of becoming non-expiring", () => {
  assert.equal(
    getEffectiveEmailChangeStatus(
      { ...pendingChange, expiresAt: new Date("invalid") },
      now,
    ),
    "INVALID",
  );
  assert.equal(
    getEffectiveEmailChangeStatus(pendingChange, new Date("invalid")),
    "INVALID",
  );
  assert.equal(getEffectiveEmailChangeStatus(pendingChange, expiry), "EXPIRED");
});

test("accepts tokens bound to the exact request, user, address and purpose", () => {
  for (const proof of [
    "current-email-approval",
    "new-email-verification",
  ] as const) {
    const evidence = token(proof);
    assert.deepEqual(
      decideEmailChangeProof({
        change: pendingChange,
        currentUserId: "user-1",
        currentVerifiedEmail: "OWNER@example.com",
        sessionVerified: true,
        token: evidence,
        now,
      }),
      {
        status: "proof-accepted",
        changeId: "email-change-1",
        userId: "user-1",
        tokenId: evidence.tokenId,
        proof,
        acceptedAt: now,
      },
    );
  }
});

test("unknown, truthy, expired, consumed and misbound tokens fail closed", () => {
  const base = {
    change: pendingChange,
    currentUserId: "user-1",
    currentVerifiedEmail: "owner@example.com",
    sessionVerified: true,
    now,
  };
  const invalidTokens = [
    { ...token("new-email-verification"), proof: "other-purpose" as never },
    { ...token("new-email-verification"), verified: 1 as never },
    { ...token("new-email-verification"), changeId: "other-change" },
    { ...token("new-email-verification"), userId: "other-user" },
    { ...token("new-email-verification"), email: "other@example.com" },
    { ...token("new-email-verification"), expiresAt: now },
    { ...token("new-email-verification"), consumedAt: now },
  ];
  for (const evidence of invalidTokens) {
    assert.deepEqual(decideEmailChangeProof({ ...base, token: evidence }), {
      status: "invalid-proof",
    });
  }
});

test("an unverified or mismatched session cannot consume a proof", () => {
  const base = {
    change: pendingChange,
    currentUserId: "user-1",
    currentVerifiedEmail: "owner@example.com",
    sessionVerified: true,
    token: token("current-email-approval"),
    now,
  };
  assert.deepEqual(
    decideEmailChangeProof({ ...base, sessionVerified: 1 as never }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideEmailChangeProof({ ...base, currentUserId: "other-user" }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideEmailChangeProof({ ...base, currentVerifiedEmail: "changed@example.com" }),
    { status: "unavailable" },
  );
});

test("recorded proof timestamps and token IDs must be coherent and distinct", () => {
  const proven = {
    ...pendingChange,
    currentEmailApprovedAt: now,
    currentEmailApprovalTokenId: "token-old",
    newEmailVerifiedAt: now,
    newEmailVerificationTokenId: "token-new",
  };
  const base = {
    change: proven,
    currentUserId: "user-1",
    currentVerifiedEmail: "owner@example.com",
    sessionVerified: true,
    requestedEmailAvailable: true,
    now,
  };
  assert.equal(decideEmailChangeApplication(base).status, "application-allowed");
  assert.deepEqual(
    decideEmailChangeApplication({
      ...base,
      change: { ...proven, newEmailVerificationTokenId: "token-old" },
    }),
    { status: "proofs-required" },
  );
  assert.deepEqual(
    decideEmailChangeApplication({
      ...base,
      change: { ...proven, newEmailVerifiedAt: expiry },
    }),
    { status: "proofs-required" },
  );
});

test("application binds the atomic account, lifecycle and session plan", () => {
  const proven = {
    ...pendingChange,
    currentEmailApprovedAt: now,
    currentEmailApprovalTokenId: "token-old",
    newEmailVerifiedAt: now,
    newEmailVerificationTokenId: "token-new",
  };
  assert.deepEqual(
    decideEmailChangeApplication({
      change: proven,
      currentUserId: "user-1",
      currentVerifiedEmail: "owner@example.com",
      sessionVerified: true,
      requestedEmailAvailable: true,
      now,
    }),
    {
      status: "application-allowed",
      changeId: "email-change-1",
      userId: "user-1",
      oldEmail: "owner@example.com",
      newEmail: "new-owner@example.com",
      appliedAt: now,
      sessionPlan: {
        preserveCurrentSession: true,
        revokeOtherSessions: true,
      },
      lifecyclePlan: {
        markNewEmailVerified: true,
        supersedeSiblingRequests: true,
        notifyOldEmail: true,
      },
    },
  );
});

test("application rechecks terminal state, expiry, identity and availability", () => {
  const proven = {
    ...pendingChange,
    currentEmailApprovedAt: now,
    currentEmailApprovalTokenId: "token-old",
    newEmailVerifiedAt: now,
    newEmailVerificationTokenId: "token-new",
  };
  const base = {
    change: proven,
    currentUserId: "user-1",
    currentVerifiedEmail: "owner@example.com",
    sessionVerified: true,
    requestedEmailAvailable: true,
    now,
  };
  assert.deepEqual(
    decideEmailChangeApplication({ ...base, requestedEmailAvailable: false }),
    { status: "email-unavailable" },
  );
  assert.deepEqual(
    decideEmailChangeApplication({
      ...base,
      change: { ...proven, status: "APPLIED" },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(decideEmailChangeApplication({ ...base, now: expiry }), {
    status: "expired",
  });
  assert.deepEqual(
    decideEmailChangeApplication({ ...base, sessionVerified: 1 as never }),
    { status: "unavailable" },
  );
});
