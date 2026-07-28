import assert from "node:assert/strict";
import test from "node:test";

import {
  decidePropertyExportAccess,
  PROPERTY_EXPORT_KINDS,
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

const validRequest = {
  currentUserId: "user-1",
  identityVerified: true,
  selectedHomeId: "home-2",
  requestedExportKind: "inventory-csv" as const,
  memberships: [ownerProperty, adultProperty],
};

test("binds an allowed export to the exact identity, property and format", () => {
  assert.deepEqual(decidePropertyExportAccess(validRequest), {
    status: "export-allowed",
    userId: "user-1",
    homeId: "home-2",
    membershipId: "membership-adult",
    role: "ADULT",
    exportKind: "inventory-csv",
  });
});

test("preserves every approved read role for every current export kind", () => {
  for (const role of ["OWNER", "ADULT", "CHILD", "GUEST"] as const) {
    for (const requestedExportKind of PROPERTY_EXPORT_KINDS) {
      assert.deepEqual(
        decidePropertyExportAccess({
          ...validRequest,
          selectedHomeId: "home-1",
          requestedExportKind,
          memberships: [{ ...ownerProperty, role }],
        }),
        {
          status: "export-allowed",
          userId: "user-1",
          homeId: "home-1",
          membershipId: "membership-owner",
          role,
          exportKind: requestedExportKind,
        },
      );
    }
  }
});

test("requires exact verified-identity evidence", () => {
  assert.deepEqual(
    decidePropertyExportAccess({ ...validRequest, identityVerified: false }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decidePropertyExportAccess({
      ...validRequest,
      identityVerified: "true" as unknown as boolean,
    }),
    { status: "unavailable" },
  );
});

test("never falls back when selection or export kind is invalid", () => {
  assert.deepEqual(
    decidePropertyExportAccess({ ...validRequest, selectedHomeId: "" }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decidePropertyExportAccess({
      ...validRequest,
      selectedHomeId: "other-home",
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decidePropertyExportAccess({
      ...validRequest,
      requestedExportKind: "all-properties" as typeof validRequest.requestedExportKind,
    }),
    { status: "unavailable" },
  );
});

test("rejects malformed, foreign-user and invalid-role evidence without throwing", () => {
  const malformedInputs: unknown[] = [
    null,
    { ...validRequest, currentUserId: " user-1" },
    { ...validRequest, selectedHomeId: "home-2 " },
    { ...validRequest, memberships: null },
    { ...validRequest, memberships: [null] },
    { ...validRequest, memberships: [{ ...ownerProperty, id: "" }] },
    { ...validRequest, memberships: [{ ...ownerProperty, role: "ADMIN" }] },
    {
      ...validRequest,
      memberships: [
        ownerProperty,
        {
          id: "foreign-membership",
          userId: "user-2",
          homeId: "home-3",
          role: "OWNER",
        },
      ],
    },
  ];

  for (const input of malformedInputs) {
    assert.deepEqual(
      decidePropertyExportAccess(input as typeof validRequest),
      { status: "unavailable" },
    );
  }
});

test("fails closed for duplicate membership or property evidence", () => {
  assert.deepEqual(
    decidePropertyExportAccess({
      ...validRequest,
      memberships: [
        ownerProperty,
        { ...adultProperty, id: ownerProperty.id },
      ],
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decidePropertyExportAccess({
      ...validRequest,
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

test("bounds the complete server-resolved membership set", () => {
  const memberships = Array.from({ length: 101 }, (_, index) => ({
    id: `membership-${index}`,
    userId: "user-1",
    homeId: `home-${index}`,
    role: index === 0 ? ("OWNER" as const) : ("ADULT" as const),
  }));

  assert.deepEqual(
    decidePropertyExportAccess({
      ...validRequest,
      selectedHomeId: "home-0",
      memberships,
    }),
    { status: "unavailable" },
  );
});
