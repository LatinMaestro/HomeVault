import assert from "node:assert/strict";
import test from "node:test";

import {
  decidePropertyDeletion,
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

test("allows the credential-confirmed sole owner to delete the explicitly selected property", () => {
  assert.deepEqual(decidePropertyDeletion(validRequest), {
    status: "deletion-allowed",
    homeId: "home-1",
    ownerMembershipId: "membership-owner",
  });
});

test("requires an explicit current-user membership in the selected property", () => {
  assert.deepEqual(
    decidePropertyDeletion({
      ...validRequest,
      currentUserId: "",
    }),
    { status: "unavailable" },
  );

  assert.deepEqual(
    decidePropertyDeletion({
      ...validRequest,
      selectedHomeId: "other-home",
    }),
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

test("requires credential reconfirmation before destructive authorization", () => {
  assert.deepEqual(
    decidePropertyDeletion({
      ...validRequest,
      credentialConfirmed: false,
    }),
    { status: "credential-confirmation-required" },
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

test("fails closed for malformed or duplicate membership evidence", () => {
  assert.deepEqual(
    decidePropertyDeletion({
      ...validRequest,
      memberships: [{ ...owner, id: "" }],
    }),
    { status: "unavailable" },
  );

  assert.deepEqual(
    decidePropertyDeletion({
      ...validRequest,
      memberships: [
        owner,
        {
          ...owner,
          id: "membership-duplicate-user",
          role: "ADULT",
        },
      ],
    }),
    { status: "unavailable" },
  );

  assert.deepEqual(
    decidePropertyDeletion({
      ...validRequest,
      memberships: [],
    }),
    { status: "unavailable" },
  );
});
