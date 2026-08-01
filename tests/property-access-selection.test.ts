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
  version: 3,
  active: true,
};

const homeTwo: PropertyMembership = {
  id: "membership-2",
  userId: "user-1",
  homeId: "home-2",
  role: "ADULT",
  version: 7,
  active: true,
};

test("binds implicit selection to exact membership evidence", () => {
  assert.deepEqual(
    resolvePropertyMembershipSelection({
      currentUserId: "user-1",
      memberships: [homeOne],
    }),
    {
      status: "selected",
      userId: "user-1",
      homeId: "home-1",
      membershipId: "membership-1",
      role: "OWNER",
      expectedMembershipVersion: 3,
      selection: "implicit",
    },
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

test("binds explicit selection to the exact requested property", () => {
  assert.deepEqual(
    resolvePropertyMembershipSelection({
      currentUserId: "user-1",
      requestedHomeId: "home-2",
      memberships: [homeOne, homeTwo],
    }),
    {
      status: "selected",
      userId: "user-1",
      homeId: "home-2",
      membershipId: "membership-2",
      role: "ADULT",
      expectedMembershipVersion: 7,
      selection: "explicit",
    },
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
      memberships: [homeOne, { ...homeTwo, userId: "user-2" }],
    }),
    { status: "unavailable" },
  );
});

test("fails closed on duplicate membership or property identifiers", () => {
  assert.deepEqual(
    resolvePropertyMembershipSelection({
      currentUserId: "user-1",
      memberships: [homeOne, { ...homeTwo, id: homeOne.id }],
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    resolvePropertyMembershipSelection({
      currentUserId: "user-1",
      memberships: [homeOne, { ...homeOne, id: "membership-duplicate" }],
    }),
    { status: "unavailable" },
  );
});

test("malformed runtime containers and rows never throw", () => {
  const sparseMemberships: unknown[] = [];
  sparseMemberships.length = 1;

  for (const input of [
    null,
    "selection",
    {},
    { currentUserId: "user-1", memberships: null },
    { currentUserId: "user-1", memberships: [null] },
    { currentUserId: "user-1", memberships: ["membership"] },
    { currentUserId: "user-1", memberships: sparseMemberships },
  ]) {
    assert.deepEqual(resolvePropertyMembershipSelection(input), {
      status: "unavailable",
    });
  }
});

test("identifiers must be canonical and bounded", () => {
  for (const currentUserId of [
    "",
    " user-1",
    "user-1 ",
    "user 1",
    "x".repeat(192),
  ]) {
    assert.deepEqual(
      resolvePropertyMembershipSelection({
        currentUserId,
        memberships: [homeOne],
      }),
      { status: "unavailable" },
    );
  }

  assert.deepEqual(
    resolvePropertyMembershipSelection({
      currentUserId: "user-1",
      requestedHomeId: "home 1",
      memberships: [homeOne],
    }),
    { status: "unavailable" },
  );
});

test("role, version and active state are exact runtime evidence", () => {
  for (const membership of [
    { ...homeOne, role: "ADMIN" },
    { ...homeOne, version: 0 },
    { ...homeOne, version: 1.5 },
    { ...homeOne, active: false },
    { ...homeOne, active: "true" },
  ]) {
    assert.deepEqual(
      resolvePropertyMembershipSelection({
        currentUserId: "user-1",
        memberships: [membership],
      }),
      { status: "unavailable" },
    );
  }
});

test("candidate sets are bounded", () => {
  const memberships = Array.from({ length: 101 }, (_, index) => ({
    ...homeOne,
    id: `membership-${index}`,
    homeId: `home-${index}`,
  }));

  assert.deepEqual(
    resolvePropertyMembershipSelection({
      currentUserId: "user-1",
      memberships,
    }),
    { status: "unavailable" },
  );
});
