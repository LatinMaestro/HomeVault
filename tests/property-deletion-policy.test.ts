import assert from "node:assert/strict";
import test from "node:test";

import {
  decidePropertyDeletion,
  PROPERTY_DELETION_CLEANUP_SCOPES,
  type PropertyDeletionMembership,
} from "../src/lib/property-deletion-policy";

const owner: PropertyDeletionMembership = {
  id: "membership-owner",
  userId: "user-owner",
  homeId: "home-1",
  role: "OWNER",
  active: true,
  version: 4,
};

const now = new Date("2026-07-30T11:30:00.000Z");

const credentialConfirmation = {
  id: "confirmation-delete-1",
  userId: "user-owner",
  homeId: "home-1",
  operation: "delete-property",
  confirmedAt: new Date("2026-07-30T11:25:00.000Z"),
  expiresAt: new Date("2026-07-30T11:35:00.000Z"),
};

const validRequest = {
  currentUserId: "user-owner",
  selectedHomeId: "home-1",
  now,
  credentialConfirmation,
  memberships: [owner],
};

test("allows the freshly confirmed sole owner and binds complete cleanup", () => {
  const decision = decidePropertyDeletion(validRequest);

  assert.deepEqual(decision, {
    status: "deletion-allowed",
    homeId: "home-1",
    ownerMembershipId: "membership-owner",
    expectedOwnerMembershipVersion: 4,
    credentialConfirmationId: "confirmation-delete-1",
    cleanupScopes: PROPERTY_DELETION_CLEANUP_SCOPES,
  });
  assert.equal(Object.isFrozen(decision), true);
  assert.equal(Object.isFrozen(PROPERTY_DELETION_CLEANUP_SCOPES), true);
});

test("requires an explicit current-user membership in the selected property", () => {
  assert.deepEqual(
    decidePropertyDeletion({ ...validRequest, currentUserId: "" }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decidePropertyDeletion({ ...validRequest, selectedHomeId: "other-home" }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decidePropertyDeletion({
      ...validRequest,
      currentUserId: "unrelated-user",
    }),
    { status: "unavailable" },
  );
});

test("requires the selected property's sole OWNER", () => {
  assert.deepEqual(
    decidePropertyDeletion({
      ...validRequest,
      memberships: [{ ...owner, role: "ADULT" }],
    }),
    { status: "owner-required" },
  );
  assert.deepEqual(
    decidePropertyDeletion({
      ...validRequest,
      memberships: [
        owner,
        {
          ...owner,
          id: "membership-owner-2",
          userId: "user-owner-2",
        },
      ],
    }),
    { status: "unavailable" },
  );
});

test("blocks deletion while any ADULT, CHILD or GUEST remains", () => {
  for (const role of ["ADULT", "CHILD", "GUEST"] as const) {
    assert.deepEqual(
      decidePropertyDeletion({
        ...validRequest,
        memberships: [
          owner,
          {
            id: `membership-${role.toLowerCase()}`,
            userId: `user-${role.toLowerCase()}`,
            homeId: "home-1",
            role,
            active: true,
            version: 1,
          },
        ],
      }),
      { status: "members-remain" },
    );
  }
});

test("requires fresh operation-bound single-use confirmation evidence", () => {
  assert.deepEqual(
    decidePropertyDeletion({
      ...validRequest,
      credentialConfirmation: null,
    }),
    { status: "credential-confirmation-required" },
  );
  assert.deepEqual(
    decidePropertyDeletion({
      ...validRequest,
      credentialConfirmation: {
        ...credentialConfirmation,
        expiresAt: now,
      },
    }),
    { status: "credential-confirmation-required" },
  );
  assert.deepEqual(
    decidePropertyDeletion({
      ...validRequest,
      credentialConfirmation: {
        ...credentialConfirmation,
        confirmedAt: new Date("2026-07-30T11:31:00.000Z"),
      },
    }),
    { status: "credential-confirmation-required" },
  );
});

test("rejects substituted confirmation identity, property and operation", () => {
  for (const substituted of [
    { ...credentialConfirmation, userId: "other-user" },
    { ...credentialConfirmation, homeId: "other-home" },
    { ...credentialConfirmation, operation: "delete-account" },
  ]) {
    assert.deepEqual(
      decidePropertyDeletion({
        ...validRequest,
        credentialConfirmation: substituted,
      }),
      { status: "unavailable" },
    );
  }
});

test("fails closed for malformed, stale or duplicate membership evidence", () => {
  const malformedInputs: unknown[] = [
    null,
    [],
    { ...validRequest, currentUserId: "user owner" },
    { ...validRequest, selectedHomeId: "home\u200B1" },
    { ...validRequest, now: new Date("invalid") },
    { ...validRequest, memberships: null },
    { ...validRequest, memberships: [null] },
    { ...validRequest, memberships: [{ ...owner, id: "" }] },
    { ...validRequest, memberships: [{ ...owner, role: "ADMIN" }] },
    { ...validRequest, memberships: [{ ...owner, active: false }] },
    { ...validRequest, memberships: [{ ...owner, version: 0 }] },
    {
      ...validRequest,
      memberships: [
        owner,
        { ...owner, id: "membership-duplicate-user", role: "ADULT" },
      ],
    },
    {
      ...validRequest,
      memberships: [
        owner,
        {
          ...owner,
          id: "membership-other",
          userId: "other-user",
          homeId: "other-home",
        },
      ],
    },
    { ...validRequest, memberships: [] },
  ];

  for (const input of malformedInputs) {
    assert.deepEqual(
      decidePropertyDeletion(input),
      { status: "unavailable" },
    );
  }
});

test("fails closed without throwing for hostile runtime evidence", () => {
  const hostileInput = new Proxy(
    {},
    {
      getPrototypeOf() {
        throw new Error("hostile");
      },
    },
  );
  const hostileMembership = Object.defineProperty({}, "id", {
    get() {
      throw new Error("hostile");
    },
  });
  const hostileConfirmation = Object.defineProperty({}, "id", {
    get() {
      throw new Error("hostile");
    },
  });

  assert.deepEqual(decidePropertyDeletion(hostileInput), {
    status: "unavailable",
  });
  assert.deepEqual(
    decidePropertyDeletion({
      ...validRequest,
      memberships: [hostileMembership],
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decidePropertyDeletion({
      ...validRequest,
      credentialConfirmation: hostileConfirmation,
    }),
    { status: "unavailable" },
  );
});

test("bounds the complete server-resolved active membership set", () => {
  const memberships = Array.from({ length: 101 }, (_, index) => ({
    id: `membership-${index}`,
    userId: `user-${index}`,
    homeId: "home-1",
    role: index === 0 ? ("OWNER" as const) : ("ADULT" as const),
    active: true,
    version: 1,
  }));

  assert.deepEqual(
    decidePropertyDeletion({
      ...validRequest,
      currentUserId: "user-0",
      memberships,
    }),
    { status: "unavailable" },
  );
});
