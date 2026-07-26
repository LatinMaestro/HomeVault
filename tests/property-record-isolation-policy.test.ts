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

test("accepts an empty or complete collection scoped to the selected property", () => {
  assert.deepEqual(
    decidePropertyCollectionScope({
      selectedHomeId: "home-1",
      records: [],
    }),
    { status: "scoped", records: [] },
  );

  assert.deepEqual(
    decidePropertyCollectionScope({
      selectedHomeId: "home-1",
      records: [recordOne, recordTwo],
    }),
    { status: "scoped", records: [recordOne, recordTwo] },
  );
});

test("fails a complete collection when any record belongs to another property", () => {
  assert.deepEqual(
    decidePropertyCollectionScope({
      selectedHomeId: "home-1",
      records: [
        recordOne,
        {
          ...recordTwo,
          homeId: "home-2",
        },
      ],
    }),
    { status: "unavailable" },
  );
});

test("fails closed for missing scope, malformed records and duplicate IDs", () => {
  assert.deepEqual(
    decidePropertyCollectionScope({
      selectedHomeId: "",
      records: [recordOne],
    }),
    { status: "unavailable" },
  );

  assert.deepEqual(
    decidePropertyCollectionScope({
      selectedHomeId: "home-1",
      records: [{ ...recordOne, id: "" }],
    }),
    { status: "unavailable" },
  );

  assert.deepEqual(
    decidePropertyCollectionScope({
      selectedHomeId: "home-1",
      records: [recordOne, { ...recordOne }],
    }),
    { status: "unavailable" },
  );
});

test("allows current read roles to read records and private files", () => {
  for (const role of ["OWNER", "ADULT", "CHILD", "GUEST"] as const) {
    for (const operation of ["read", "file-read"] as const) {
      assert.deepEqual(
        decidePropertyRecordOperation({
          selectedHomeId: "home-1",
          role,
          operation,
          requestedRecordId: "record-1",
          records: [recordOne],
        }),
        { status: "operation-allowed", record: recordOne },
      );
    }
  }
});

test("allows only OWNER and ADULT write operations", () => {
  for (const role of ["OWNER", "ADULT"] as const) {
    for (const operation of ["write", "file-write"] as const) {
      assert.deepEqual(
        decidePropertyRecordOperation({
          selectedHomeId: "home-1",
          role,
          operation,
          requestedRecordId: "record-1",
          records: [recordOne],
        }),
        { status: "operation-allowed", record: recordOne },
      );
    }
  }

  for (const role of ["CHILD", "GUEST"] as const) {
    assert.deepEqual(
      decidePropertyRecordOperation({
        selectedHomeId: "home-1",
        role,
        operation: "write",
        requestedRecordId: "record-1",
        records: [recordOne],
      }),
      { status: "write-access-required" },
    );
  }
});

test("does not authorize unknown records or mixed-property query results", () => {
  assert.deepEqual(
    decidePropertyRecordOperation({
      selectedHomeId: "home-1",
      role: "OWNER",
      operation: "read",
      requestedRecordId: "unknown-record",
      records: [recordOne],
    }),
    { status: "unavailable" },
  );

  assert.deepEqual(
    decidePropertyRecordOperation({
      selectedHomeId: "home-1",
      role: "OWNER",
      operation: "file-read",
      requestedRecordId: "record-1",
      records: [{ ...recordOne, homeId: "home-2" }],
    }),
    { status: "unavailable" },
  );
});
