import assert from "node:assert/strict";
import test from "node:test";

import {
  decideMultiPropertyAccountDeletion,
  resolveRecoveredPropertyAccess,
  type AccountDeletionCredentialEvidence,
  type AccountPropertyMembership,
  type AccountRecoveryProofEvidence,
} from "../src/lib/multi-property-account-lifecycle";

const evaluatedAt = "2026-07-29T02:00:00.000Z";
const credential: AccountDeletionCredentialEvidence = {
  id: "credential-proof-1",
  userId: "user-1",
  purpose: "account-deletion",
  verified: true,
  confirmedAt: "2026-07-29T01:55:00.000Z",
  expiresAt: "2026-07-29T02:10:00.000Z",
  consumedAt: null,
};
const recoveryProof: AccountRecoveryProofEvidence = {
  id: "recovery-proof-1",
  userId: "user-1",
  purpose: "account-recovery",
  verified: true,
  issuedAt: "2026-07-29T01:45:00.000Z",
  expiresAt: "2026-07-29T02:15:00.000Z",
  consumedAt: null,
};
const ownedOnly: AccountPropertyMembership = {
  id: "membership-owner-only",
  userId: "user-1",
  homeId: "home-owned-only",
  role: "OWNER",
  memberCount: 1,
  ownerCount: 1,
  active: true,
};
const adultMembership: AccountPropertyMembership = {
  id: "membership-adult",
  userId: "user-1",
  homeId: "home-shared",
  role: "ADULT",
  memberCount: 2,
  ownerCount: 1,
  active: true,
};

test("binds deletion to the exact user, evidence, memberships and cleanup", () => {
  const decision = decideMultiPropertyAccountDeletion({
    currentUserId: "user-1",
    emailVerified: true,
    credential,
    evaluatedAt,
    memberships: [adultMembership, ownedOnly],
  });

  assert.equal(decision.status, "deletion-allowed");
  if (decision.status !== "deletion-allowed") {
    return;
  }
  assert.equal(decision.userId, "user-1");
  assert.equal(decision.credentialEvidenceId, credential.id);
  assert.deepEqual(decision.deleteHomeIds, ["home-owned-only"]);
  assert.deepEqual(decision.removeMembershipIds, ["membership-adult"]);
  assert.deepEqual(
    decision.expectedMemberships.map((membership) => membership.homeId),
    ["home-owned-only", "home-shared"],
  );
  assert.deepEqual(decision.cleanupScopes, [
    "account-identity-and-social-links",
    "relational-records-memberships-and-invitations",
    "private-files-and-pending-uploads",
    "devices-offline-keys-caches-and-queued-actions",
    "notification-tokens-schedules-and-deduplication",
    "calendar-connections-and-created-events",
    "email-ingestion-routes-and-quarantine",
    "ocr-ai-jobs-drafts-and-processor-copies",
    "sharing-grants",
    "provider-integrations",
  ]);
});

test("binds every required ownership transfer to its exact membership", () => {
  const sharedOwned = {
    ...ownedOnly,
    id: "membership-shared-owner",
    homeId: "home-shared-owned",
    memberCount: 3,
  };

  assert.deepEqual(
    decideMultiPropertyAccountDeletion({
      currentUserId: "user-1",
      emailVerified: true,
      credential,
      evaluatedAt,
      memberships: [sharedOwned, ownedOnly],
    }),
    {
      status: "ownership-transfer-required",
      userId: "user-1",
      properties: [
        {
          homeId: "home-shared-owned",
          ownerMembershipId: "membership-shared-owner",
        },
      ],
    },
  );
});

test("requires fresh account-deletion credential evidence", () => {
  const input = {
    currentUserId: "user-1",
    emailVerified: true,
    evaluatedAt,
    memberships: [ownedOnly],
  };

  assert.deepEqual(decideMultiPropertyAccountDeletion(input), {
    status: "credential-confirmation-required",
  });
  for (const invalidCredential of [
    { ...credential, verified: "true" },
    { ...credential, userId: "user-2" },
    { ...credential, purpose: "account-recovery" },
    { ...credential, expiresAt: "invalid" },
    { ...credential, consumedAt: evaluatedAt },
  ]) {
    assert.deepEqual(
      decideMultiPropertyAccountDeletion({
        ...input,
        credential: invalidCredential as AccountDeletionCredentialEvidence,
      }),
      { status: "unavailable" },
    );
  }
});

test("malformed or inconsistent membership evidence fails closed", () => {
  const input = {
    currentUserId: "user-1",
    emailVerified: true,
    credential,
    evaluatedAt,
  };
  for (const memberships of [
    null,
    {},
    [null],
    [{ ...ownedOnly, id: " " }],
    [{ ...ownedOnly, userId: "user-2" }],
    [{ ...ownedOnly, role: "ADMIN" }],
    [{ ...ownedOnly, active: "true" }],
    [{ ...ownedOnly, memberCount: Number.NaN }],
    [ownedOnly, { ...ownedOnly, id: "membership-duplicate-home" }],
    [{ ...adultMembership, memberCount: 1 }],
  ]) {
    assert.doesNotThrow(() => {
      assert.deepEqual(
        decideMultiPropertyAccountDeletion({
          ...input,
          memberships,
        }),
        { status: "unavailable" },
      );
    });
  }
});

test("truthy identity evidence and non-canonical account IDs fail closed", () => {
  assert.deepEqual(
    decideMultiPropertyAccountDeletion({
      currentUserId: "user-1",
      emailVerified: "true" as unknown as boolean,
      credential,
      evaluatedAt,
      memberships: [ownedOnly],
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideMultiPropertyAccountDeletion({
      currentUserId: " user-1 ",
      emailVerified: true,
      credential,
      evaluatedAt,
      memberships: [ownedOnly],
    }),
    { status: "unavailable" },
  );
});

test("recovery selection binds the proof and current membership set", () => {
  assert.deepEqual(
    resolveRecoveredPropertyAccess({
      recoveredUserId: "user-1",
      recoveryProof,
      evaluatedAt,
      currentMemberships: [ownedOnly, adultMembership],
    }),
    {
      status: "selection-required",
      recovery: {
        userId: "user-1",
        consumeRecoveryProofId: "recovery-proof-1",
        revokeExistingSessions: true,
        replaceOfflinePropertyKeys: true,
      },
      homeIds: ["home-owned-only", "home-shared"],
    },
  );

  const selected = resolveRecoveredPropertyAccess({
    recoveredUserId: "user-1",
    recoveryProof,
    evaluatedAt,
    requestedHomeId: "home-shared",
    currentMemberships: [ownedOnly, adultMembership],
  });
  assert.equal(selected.status, "selected");
  if (selected.status === "selected") {
    assert.deepEqual(selected.membership, adultMembership);
  }
});

test("recovery proof substitutions, replay and invalid dates fail closed", () => {
  for (const proof of [
    { ...recoveryProof, verified: "true" },
    { ...recoveryProof, userId: "user-2" },
    { ...recoveryProof, purpose: "account-deletion" },
    { ...recoveryProof, issuedAt: "invalid" },
    { ...recoveryProof, expiresAt: "2026-07-29T01:59:59.000Z" },
    { ...recoveryProof, consumedAt: "2026-07-29T01:59:00.000Z" },
  ]) {
    assert.deepEqual(
      resolveRecoveredPropertyAccess({
        recoveredUserId: "user-1",
        recoveryProof: proof as AccountRecoveryProofEvidence,
        evaluatedAt,
        currentMemberships: [ownedOnly],
      }),
      { status: "unavailable" },
    );
  }
});

test("recovery never restores revoked, foreign or cached property access", () => {
  const revoked = { ...adultMembership, active: false };

  assert.deepEqual(
    resolveRecoveredPropertyAccess({
      recoveredUserId: "user-1",
      recoveryProof,
      evaluatedAt,
      requestedHomeId: revoked.homeId,
      currentMemberships: [revoked],
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    resolveRecoveredPropertyAccess({
      recoveredUserId: "user-1",
      recoveryProof,
      evaluatedAt,
      requestedHomeId: "foreign-home",
      currentMemberships: [ownedOnly],
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    resolveRecoveredPropertyAccess({
      recoveredUserId: "user-1",
      recoveryProof,
      evaluatedAt,
      requestedHomeId: " ",
      currentMemberships: [ownedOnly],
    }),
    { status: "unavailable" },
  );
});

test("recovery with no active membership starts fresh onboarding", () => {
  const decision = resolveRecoveredPropertyAccess({
    recoveredUserId: "user-1",
    recoveryProof,
    evaluatedAt,
    currentMemberships: [{ ...ownedOnly, active: false }],
  });
  assert.equal(decision.status, "onboarding-required");
  if (decision.status === "onboarding-required") {
    assert.equal(decision.recovery.consumeRecoveryProofId, recoveryProof.id);
  }
});

test("recovery membership parsing is runtime safe and fail closed", () => {
  for (const currentMemberships of [
    null,
    {},
    [null],
    [{ ...ownedOnly, role: "ADMIN" }],
    [{ ...ownedOnly, active: 1 }],
    [ownedOnly, { ...ownedOnly, id: "another-membership" }],
  ]) {
    assert.doesNotThrow(() => {
      assert.deepEqual(
        resolveRecoveredPropertyAccess({
          recoveredUserId: "user-1",
          recoveryProof,
          evaluatedAt,
          currentMemberships,
        }),
        { status: "unavailable" },
      );
    });
  }
});
