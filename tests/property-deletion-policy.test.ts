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
};

const validRequest = {
  currentUserId: "user-owner",
  selectedHomeId: "home-1",
  credentialConfirmed: true,
  memberships: [owner],
};

test("allows the credential-confirmed sole owner and binds complete cleanup", () => {
  assert.deepEqual(decidePropertyDeletion(validRequest), {
    status: "deletion-allowed",
    homeId: "home-1",
    ownerMembershipId: "membership-owner",
    cleanupScopes: PROPERTY_DELETION_CLEANUP_SCOPES,
  });
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
          id: "membership-owner-2",
          userId: "user-owner-2",
          homeId: "home-1",
          role: "OWNER",
        },
      ],
    }),
    { status: "unavailable" },
  );
});

test("requires exact credential reconfirmation before authorization", () => {
  assert.deepEqual(
    decidePropertyDeletion({ ...validRequest, credentialConfirmed: false }),
    { status: "credential-confirmation-required" },
  );
  assert.deepEqual(
    decidePropertyDeletion({
      ...validRequest,
      credentialConfirmed: "true" as unknown as boolean,
    }),
    { status: "unavailable" },
  );
});

test("blocks deletion while another member remains", () => {
  assert.deepEqual(
    decidePropertyDeletion({
      ...validRequest,
      memberships: [
        owner,
        {
          id: "membership-adult",
          userId: "user-adult",
          homeId: "home-1",
          role: "ADULT",
        },
      ],
    }),
    { status: "members-remain" },
  );
});

test("fails closed for malformed, cross-property or duplicate evidence", () => {
  const malformedInputs: unknown[] = [
    null,
    { ...validRequest, currentUserId: " user-owner" },
    { ...validRequest, selectedHomeId: "home-1 " },
    { ...validRequest, memberships: null },
    { ...validRequest, memberships: [null] },
    { ...validRequest, memberships: [{ ...owner, id: "" }] },
    { ...validRequest, memberships: [{ ...owner, role: "ADMIN" }] },
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
        { ...owner, userId: "other-user", homeId: "other-home" },
      ],
    },
    { ...validRequest, memberships: [] },
  ];

  for (const input of malformedInputs) {
    assert.deepEqual(
      decidePropertyDeletion(input as typeof validRequest),
      { status: "unavailable" },
    );
  }
});

test("bounds the server-resolved membership set", () => {
  const memberships = Array.from({ length: 101 }, (_, index) => ({
    id: `membership-${index}`,
    userId: `user-${index}`,
    homeId: "home-1",
    role: index === 0 ? ("OWNER" as const) : ("ADULT" as const),
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
