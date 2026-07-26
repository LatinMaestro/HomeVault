import assert from "node:assert/strict";
import test from "node:test";

import {
  resolvePropertyMembershipSelection,
  type PropertyMembership,
} from "../src/lib/property-access-selection";

const homeOne: PropertyMembership = {
  id: "membership-1",
  userId: "user-1",
  homeId: "home-1",
  role: "OWNER",
};

const homeTwo: PropertyMembership = {
  id: "membership-2",
  userId: "user-1",
  homeId: "home-2",
  role: "ADULT",
};

test("selects the sole valid membership without stored selection", () => {
  assert.deepEqual(
    resolvePropertyMembershipSelection({
      currentUserId: "user-1",
      memberships: [homeOne],
    }),
    { status: "selected", membership: homeOne },
  );
});

test("requires explicit selection when multiple properties are available", () => {
  assert.deepEqual(
    resolvePropertyMembershipSelection({
      currentUserId: "user-1",
      memberships: [homeOne, homeTwo],
    }),
    { status: "selection-required" },
  );
});

test("selects only a requested property belonging to the current user", () => {
  assert.deepEqual(
    resolvePropertyMembershipSelection({
      currentUserId: "user-1",
      requestedHomeId: "home-2",
      memberships: [homeOne, homeTwo],
    }),
    { status: "selected", membership: homeTwo },
  );

  assert.deepEqual(
    resolvePropertyMembershipSelection({
      currentUserId: "user-1",
      requestedHomeId: "other-home",
      memberships: [homeOne, homeTwo],
    }),
    { status: "unavailable" },
  );
});

test("ignores memberships for another user and fails closed on duplicates", () => {
  assert.deepEqual(
    resolvePropertyMembershipSelection({
      currentUserId: "user-1",
      memberships: [
        {
          ...homeOne,
          id: "other-membership",
          userId: "user-2",
        },
      ],
    }),
    { status: "unavailable" },
  );

  assert.deepEqual(
    resolvePropertyMembershipSelection({
      currentUserId: "user-1",
      requestedHomeId: "home-1",
      memberships: [
        homeOne,
        {
          ...homeOne,
          id: "duplicate-membership",
        },
      ],
    }),
    { status: "unavailable" },
  );
});

test("fails closed for missing user or malformed membership identifiers", () => {
  assert.deepEqual(
    resolvePropertyMembershipSelection({
      currentUserId: "",
      memberships: [homeOne],
    }),
    { status: "unavailable" },
  );

  assert.deepEqual(
    resolvePropertyMembershipSelection({
      currentUserId: "user-1",
      memberships: [{ ...homeOne, homeId: "" }],
    }),
    { status: "unavailable" },
  );
});
