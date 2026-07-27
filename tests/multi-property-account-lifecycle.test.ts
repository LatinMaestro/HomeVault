import assert from "node:assert/strict";
import test from "node:test";

import {
  decideMultiPropertyAccountDeletion,
  resolveRecoveredPropertyAccess,
  type AccountPropertyMembership,
} from "../src/lib/multi-property-account-lifecycle";

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

test("plans atomic deletion across sole-owned and non-owner properties", () => {
  assert.deepEqual(
    decideMultiPropertyAccountDeletion({
      currentUserId: "user-1",
      emailVerified: true,
      credentialConfirmed: true,
      memberships: [adultMembership, ownedOnly],
    }),
    {
      status: "deletion-allowed",
      deleteHomeIds: ["home-owned-only"],
      removeMembershipIds: ["membership-adult"],
    },
  );
});

test("requires every shared property ownership transfer before account deletion", () => {
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
      credentialConfirmed: true,
      memberships: [sharedOwned, ownedOnly],
    }),
    {
      status: "ownership-transfer-required",
      homeIds: ["home-shared-owned"],
    },
  );
});

test("rejects unverified, unreconfirmed, duplicate and orphaned evidence", () => {
  const input = {
    currentUserId: "user-1",
    emailVerified: true,
    credentialConfirmed: true,
    memberships: [ownedOnly],
  };

  assert.deepEqual(
    decideMultiPropertyAccountDeletion({
      ...input,
      emailVerified: false,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideMultiPropertyAccountDeletion({
      ...input,
      credentialConfirmed: false,
    }),
    { status: "credential-confirmation-required" },
  );
  assert.deepEqual(
    decideMultiPropertyAccountDeletion({
      ...input,
      memberships: [
        ownedOnly,
        { ...ownedOnly, id: "other-membership" },
      ],
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideMultiPropertyAccountDeletion({
      ...input,
      memberships: [{ ...adultMembership, ownerCount: 0 }],
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideMultiPropertyAccountDeletion({
      ...input,
      memberships: [{ ...adultMembership, userId: "other-user" }],
    }),
    { status: "unavailable" },
  );
});

test("requires explicit recovery selection when multiple properties remain", () => {
  assert.deepEqual(
    resolveRecoveredPropertyAccess({
      recoveredUserId: "user-1",
      recoveryProofVerified: true,
      currentMemberships: [ownedOnly, adultMembership],
    }),
    { status: "selection-required" },
  );

  assert.deepEqual(
    resolveRecoveredPropertyAccess({
      recoveredUserId: "user-1",
      recoveryProofVerified: true,
      requestedHomeId: "home-shared",
      currentMemberships: [ownedOnly, adultMembership],
    }),
    { status: "selected", membership: adultMembership },
  );
});

test("recovery never restores revoked, foreign or cached property access", () => {
  const revoked = {
    ...adultMembership,
    active: false,
  };

  assert.deepEqual(
    resolveRecoveredPropertyAccess({
      recoveredUserId: "user-1",
      recoveryProofVerified: true,
      requestedHomeId: revoked.homeId,
      currentMemberships: [revoked],
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    resolveRecoveredPropertyAccess({
      recoveredUserId: "user-1",
      recoveryProofVerified: true,
      requestedHomeId: "foreign-home",
      currentMemberships: [ownedOnly],
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    resolveRecoveredPropertyAccess({
      recoveredUserId: "user-1",
      recoveryProofVerified: false,
      currentMemberships: [ownedOnly],
    }),
    { status: "unavailable" },
  );
});

test("recovery without current memberships starts onboarding instead of reviving old access", () => {
  assert.deepEqual(
    resolveRecoveredPropertyAccess({
      recoveredUserId: "user-1",
      recoveryProofVerified: true,
      currentMemberships: [],
    }),
    { status: "onboarding-required" },
  );

  assert.deepEqual(
    resolveRecoveredPropertyAccess({
      recoveredUserId: "user-1",
      recoveryProofVerified: true,
      currentMemberships: [ownedOnly],
    }),
    { status: "selected", membership: ownedOnly },
  );
});
