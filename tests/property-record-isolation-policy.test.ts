import assert from "node:assert/strict";
import test from "node:test";

import {
  decidePropertyCollectionScope,
  decidePropertyRecordOperation,
} from "../src/lib/property-record-isolation-policy";

const recordOne = {
  id: "record-1",
  homeId: "home-1",
  title: "Air conditioner",
};

const recordTwo = {
  id: "record-2",
  homeId: "home-1",
  title: "Hot water system",
};

const access = {
  currentUserId: "user-1",
  identityVerified: true,
  selectedHomeId: "home-1",
  membershipId: "membership-1",
  membershipUserId: "user-1",
  membershipHomeId: "home-1",
  role: "OWNER" as const,
};

test("accepts an empty or complete collection scoped to the selected property", () => {
  assert.deepEqual(
    decidePropertyCollectionScope({ selectedHomeId: "home-1", records: [] }),
    { status: "scoped", homeId: "home-1", records: [] },
  );
  assert.deepEqual(
    decidePropertyCollectionScope({
      selectedHomeId: "home-1",
      records: [recordOne, recordTwo],
    }),
    {
      status: "scoped",
      homeId: "home-1",
      records: [recordOne, recordTwo],
    },
  );
});

test("fails collections containing foreign, malformed or duplicate records", () => {
  const sparseRecords: unknown[] = [];
  sparseRecords.length = 1;
  const hostileRecord = new Proxy(
    {},
    {
      get() {
        throw new Error("hostile");
      },
    },
  );

  const invalidCollections: unknown[] = [
    null,
    { selectedHomeId: " home-1", records: [recordOne] },
    { selectedHomeId: "home-1", records: null },
    { selectedHomeId: "home-1", records: [null] },
    { selectedHomeId: "home-1", records: sparseRecords },
    { selectedHomeId: "home-1", records: [hostileRecord] },
    { selectedHomeId: "home-1", records: [{ ...recordOne, id: "" }] },
    {
      selectedHomeId: "home-1",
      records: [recordOne, { ...recordTwo, homeId: "home-2" }],
    },
    {
      selectedHomeId: "home-1",
      records: [recordOne, { ...recordOne }],
    },
  ];

  for (const input of invalidCollections) {
    assert.deepEqual(
      decidePropertyCollectionScope(
        input as { selectedHomeId: string; records: typeof recordOne[] },
      ),
      { status: "unavailable" },
    );
  }
});

test("binds allowed reads and file reads to exact access evidence", () => {
  for (const role of ["OWNER", "ADULT", "CHILD", "GUEST"] as const) {
    for (const operation of ["read", "file-read"] as const) {
      assert.deepEqual(
        decidePropertyRecordOperation({
          access: { ...access, role },
          operation,
          requestedRecordId: "record-1",
          records: [recordOne],
        }),
        {
          status: "operation-allowed",
          userId: "user-1",
          homeId: "home-1",
          membershipId: "membership-1",
          role,
          operation,
          record: recordOne,
        },
      );
    }
  }
});

test("allows only OWNER and ADULT writes", () => {
  for (const role of ["OWNER", "ADULT"] as const) {
    for (const operation of ["write", "file-write"] as const) {
      assert.equal(
        decidePropertyRecordOperation({
          access: { ...access, role },
          operation,
          requestedRecordId: "record-1",
          records: [recordOne],
        }).status,
        "operation-allowed",
      );
    }
  }

  for (const role of ["CHILD", "GUEST"] as const) {
    assert.deepEqual(
      decidePropertyRecordOperation({
        access: { ...access, role },
        operation: "write",
        requestedRecordId: "record-1",
        records: [recordOne],
      }),
      { status: "write-access-required" },
    );
  }
});

test("fails closed for unverified or mismatched access evidence", () => {
  const invalidAccess = [
    { ...access, identityVerified: false },
    { ...access, identityVerified: "true" as unknown as boolean },
    { ...access, currentUserId: " user-1" },
    { ...access, membershipUserId: "user-2" },
    { ...access, membershipHomeId: "home-2" },
    { ...access, membershipId: "" },
    { ...access, role: "ADMIN" as typeof access.role },
    new Proxy(access, {
      get() {
        throw new Error("hostile");
      },
    }),
  ];

  for (const candidate of invalidAccess) {
    assert.deepEqual(
      decidePropertyRecordOperation({
        access: candidate,
        operation: "read",
        requestedRecordId: "record-1",
        records: [recordOne],
      }),
      { status: "unavailable" },
    );
  }
});

test("rejects unknown operations instead of treating them as reads", () => {
  assert.deepEqual(
    decidePropertyRecordOperation({
      access,
      operation: "delete-everything" as "read",
      requestedRecordId: "record-1",
      records: [recordOne],
    }),
    { status: "unavailable" },
  );
});

test("does not authorize unknown records or mixed-property query results", () => {
  assert.deepEqual(
    decidePropertyRecordOperation({
      access,
      operation: "read",
      requestedRecordId: "unknown-record",
      records: [recordOne],
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decidePropertyRecordOperation({
      access,
      operation: "file-read",
      requestedRecordId: "record-1",
      records: [{ ...recordOne, homeId: "home-2" }],
    }),
    { status: "unavailable" },
  );
});

test("bounds complete collection evidence", () => {
  const records = Array.from({ length: 10_001 }, (_, index) => ({
    id: `record-${index}`,
    homeId: "home-1",
  }));

  assert.deepEqual(
    decidePropertyCollectionScope({ selectedHomeId: "home-1", records }),
    { status: "unavailable" },
  );
});
