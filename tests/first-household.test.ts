import assert from "node:assert/strict";
import test from "node:test";

import { getFirstHouseholdId } from "../src/lib/first-household";

test("first household IDs are deterministic per immutable user", () => {
  assert.equal(getFirstHouseholdId("user-123"), "home-user-123");
  assert.equal(getFirstHouseholdId("user-123"), getFirstHouseholdId("user-123"));
  assert.notEqual(getFirstHouseholdId("user-123"), getFirstHouseholdId("user-456"));
});
