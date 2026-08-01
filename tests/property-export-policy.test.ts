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
  active: true,
  version: 3,
};

const adultProperty: PropertyExportMembership = {
  id: "membership-adult",
  userId: "user-1",
  homeId: "home-2",
  role: "ADULT",
  active: true,
  version: 6,
};

const nowMs = 1_800_000_000_000;

const validRequest = {
  identity: {
    userId: "user-1",
    sessionId: "session-1",
    sessionVersion: 7,
    active: true,
    emailVerified: true,
    resolvedAtMs: nowMs - 10_000,
    expiresAtMs: nowMs + 60 * 60 * 1_000,
  },
  nowMs,
  selectedHomeId: "home-2",
  requestedExportKind: "inventory-csv" as const,
  memberships: [ownerProperty, adultProperty],
};

test("binds an allowed export to the exact identity, property and format", () => {
  const decision = decidePropertyExportAccess(validRequest);

  assert.deepEqual(decision, {
    status: "export-allowed",
    userId: "user-1",
    sessionId: "session-1",
    sessionVersion: 7,
    homeId: "home-2",
    membershipId: "membership-adult",
    membershipVersion: 6,
    role: "ADULT",
    exportKind: "inventory-csv",
  });
  assert.equal(Object.isFrozen(decision), true);
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
          sessionId: "session-1",
          sessionVersion: 7,
          homeId: "home-1",
          membershipId: "membership-owner",
          membershipVersion: 3,
          role,
          exportKind: requestedExportKind,
        },
      );
    }
  }
});

test("requires exact verified-identity evidence", () => {
  const invalidIdentityEvidence = [
    { ...validRequest.identity, active: false },
    { ...validRequest.identity, emailVerified: false },
    { ...validRequest.identity, userId: "user-2" },
    { ...validRequest.identity, sessionId: "session 1" },
    { ...validRequest.identity, sessionVersion: 0 },
    {
      ...validRequest.identity,
      resolvedAtMs: nowMs - 5 * 60 * 1_000 - 1,
    },
    { ...validRequest.identity, resolvedAtMs: nowMs + 1 },
    { ...validRequest.identity, expiresAtMs: nowMs },
  ];

  for (const identity of invalidIdentityEvidence) {
    assert.deepEqual(
      decidePropertyExportAccess({ ...validRequest, identity }),
      { status: "unavailable" },
    );
  }
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
    { ...validRequest, selectedHomeId: "home-2 " },
    { ...validRequest, selectedHomeId: "home 2" },
    { ...validRequest, selectedHomeId: "home-\u200b2" },
    { ...validRequest, memberships: null },
    { ...validRequest, memberships: [null] },
    { ...validRequest, memberships: [{ ...ownerProperty, id: "" }] },
    { ...validRequest, memberships: [{ ...ownerProperty, role: "ADMIN" }] },
   { ...validRequest, memberships: [{ ...ownerProperty, active: false }] },
   { ...validRequest, memberships: [{ ...ownerProperty, version: 0 }] },
    {
      ...validRequest,
      memberships: [
        ownerProperty,
        {
          id: "foreign-membership",
          userId: "user-2",
          homeId: "home-3",
          role: "OWNER",
          active: true,
          version: 1,
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

test("rejects accessors and hostile proxies without throwing", () => {
  const accessorInput = Object.defineProperty(
    { ...validRequest },
    "selectedHomeId",
    { enumerable: true, get: () => "home-2" },
  );
  const hostileInput = new Proxy(
    {},
    {
      getOwnPropertyDescriptor() {
        throw new Error("hostile descriptor");
      },
      getPrototypeOf() {
        throw new Error("hostile prototype");
      },
    },
  );

  assert.deepEqual(
    decidePropertyExportAccess(accessorInput),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decidePropertyExportAccess(hostileInput as typeof validRequest),
    { status: "unavailable" },
  );
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
    active: true,
    version: index + 1,
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
