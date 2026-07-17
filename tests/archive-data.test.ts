import assert from "node:assert/strict";
import test from "node:test";

import {
  isArchivedAsset,
  isArchivedMaintenanceTask,
  isArchivedReminder,
} from "../src/lib/archive-data";

test("archive status rules keep active records out", () => {
  assert.equal(isArchivedAsset("ACTIVE"), false);
  assert.equal(isArchivedMaintenanceTask("ACTIVE"), false);
  assert.equal(isArchivedReminder("PENDING"), false);
  assert.equal(isArchivedReminder("SNOOZED"), false);
});

test("archive status rules include recoverable inactive records", () => {
  assert.equal(isArchivedAsset("RETIRED"), true);
  assert.equal(isArchivedAsset("DISPOSED"), true);
  assert.equal(isArchivedMaintenanceTask("COMPLETED"), true);
  assert.equal(isArchivedMaintenanceTask("ARCHIVED"), true);
  assert.equal(isArchivedReminder("DONE"), true);
  assert.equal(isArchivedReminder("CANCELLED"), true);
});
