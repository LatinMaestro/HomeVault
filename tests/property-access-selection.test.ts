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

test("selects the sole exact membership without stored selection", () => {
  assert.deepEqual(
    resolvePropertyMembershipSelection({
      currentUserId: "user-1",
      memberships: [homeOne],
    }),
    { status: "selected", membership: homeOne },
  );
});

test("requires explicit selection for distinct valid properties", () => {
  assert.deepEqual(
    resolvePropertyMembershipSelection({
      currentUserId: "user-1",
      memberships: [homeOne, homeTwo],
    }),
    { status: "selection-required" },
  );
});

test("selects only an exact requested property", () => {
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

test("fails closed when the candidate set contains another user", () => {
  assert.deepEqual(
    resolvePropertyMembershipSelection({
      currentUserId: "user-1",
      memberships: [
        homeOne,
        { ...homeTwo, userId: "user-2" },
      ],
    }),
    { status: "unavailable" },
  );
});

test("fails closed on duplicate membership or property identifiers", () => {
  assert.deepEqual(
    resolvePropertyMembershipSelection({
      currentUserId: "user-1",
      memberships: [
        homeOne,
        { ...homeTwo, id: homeOne.id },
      ],
    }),
    { status: "unavailable" },
  );

  assert.deepEqual(
    resolvePropertyMembershipSelection({
      currentUserId: "user-1",
      memberships: [
        homeOne,
        { ...homeOne, id: "membership-duplicate" },
      ],
    }),
    { status: "unavailable" },
  );
});

test("fails closed on whitespace and malformed identifiers", () => {
  for (const currentUserId of ["", " user-1", "user-1 ", "   "]) {
    assert.deepEqual(
      resolvePropertyMembershipSelection({
        currentUserId,
        memberships: [homeOne],
      }),
      { status: "unavailable" },
    );
  }

  for (const requestedHomeId of ["", " home-1", "home-1 ", "   "]) {
    assert.deepEqual(
      resolvePropertyMembershipSelection({
        currentUserId: "user-1",
        requestedHomeId,
        memberships: [homeOne],
      }),
      { status: "unavailable" },
    );
  }
});

test("fails closed on empty memberships and invalid runtime roles", () => {
  assert.deepEqual(
    resolvePropertyMembershipSelection({
      currentUserId: "user-1",
      memberships: [],
    }),
    { status: "unavailable" },
  );

  assert.deepEqual(
    resolvePropertyMembershipSelection({
      currentUserId: "user-1",
      memberships: [
        { ...homeOne, role: "ADMIN" as PropertyMembership["role"] },
      ],
    }),
    { status: "unavailable" },
  );
});
