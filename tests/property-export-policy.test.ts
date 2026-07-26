import assert from "node:assert/strict";
import test from "node:test";

import {
  decidePropertyExportAccess,
  type PropertyExportMembership,
} from "../src/lib/property-export-policy";

const ownerProperty: PropertyExportMembership = {
  id: "membership-owner",
  userId: "user-1",
  homeId: "home-1",
  role: "OWNER",
};

const adultProperty: PropertyExportMembership = {
  id: "membership-adult",
  userId: "user-1",
  homeId: "home-2",
  role: "ADULT",
};

test("exports only the explicitly selected current-user property", () => {
  assert.deepEqual(
    decidePropertyExportAccess({
      currentUserId: "user-1",
      selectedHomeId: "home-2",
      memberships: [ownerProperty, adultProperty],
    }),
    {
      status: "export-allowed",
      homeId: "home-2",
      membershipId: "membership-adult",
      role: "ADULT",
    },
  );
});

test("preserves the current read-access role contract", () => {
  for (const role of ["OWNER", "ADULT", "CHILD", "GUEST"] as const) {
    assert.deepEqual(
      decidePropertyExportAccess({
        currentUserId: "user-1",
        selectedHomeId: "home-1",
        memberships: [{ ...ownerProperty, role }],
      }),
      {
        status: "export-allowed",
        homeId: "home-1",
        membershipId: "membership-owner",
        role,
      },
    );
  }
});

test("never falls back when selection is missing or unknown", () => {
  assert.deepEqual(
    decidePropertyExportAccess({
      currentUserId: "user-1",
      selectedHomeId: "",
      memberships: [ownerProperty],
    }),
    { status: "unavailable" },
  );

  assert.deepEqual(
    decidePropertyExportAccess({
      currentUserId: "user-1",
      selectedHomeId: "other-home",
      memberships: [ownerProperty],
    }),
    { status: "unavailable" },
  );
});

test("rejects foreign-user or malformed membership evidence", () => {
  assert.deepEqual(
    decidePropertyExportAccess({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      memberships: [
        ownerProperty,
        {
          id: "foreign-membership",
          userId: "user-2",
          homeId: "home-3",
          role: "OWNER",
        },
      ],
    }),
    { status: "unavailable" },
  );

  assert.deepEqual(
    decidePropertyExportAccess({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      memberships: [{ ...ownerProperty, id: "" }],
    }),
    { status: "unavailable" },
  );
});

test("fails closed for duplicate membership or property evidence", () => {
  assert.deepEqual(
    decidePropertyExportAccess({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      memberships: [
        ownerProperty,
        {
          ...adultProperty,
          id: ownerProperty.id,
        },
      ],
    }),
    { status: "unavailable" },
  );

  assert.deepEqual(
    decidePropertyExportAccess({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      memberships: [
        ownerProperty,
        {
          ...adultProperty,
          id: "duplicate-home-membership",
          homeId: "home-1",
        },
      ],
    }),
    { status: "unavailable" },
  );
});
