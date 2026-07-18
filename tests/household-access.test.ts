import assert from "node:assert/strict";
import test from "node:test";

import {
  HouseholdAccessError,
  canAdministerHousehold,
  canWriteHousehold,
  requireMatchingHome,
  type HouseholdAccess,
} from "../src/lib/household-access";

const access: HouseholdAccess = {
  mode: "authenticated",
  userId: "user-1",
  homeId: "home-1",
  membershipId: "member-1",
  role: "OWNER",
};

test("owner and adult memberships can write household records", () => {
  assert.equal(canWriteHousehold("OWNER"), true);
  assert.equal(canWriteHousehold("ADULT"), true);
  assert.equal(canWriteHousehold("CHILD"), false);
  assert.equal(canWriteHousehold("GUEST"), false);
});

test("only owners can administer a household", () => {
  assert.equal(canAdministerHousehold("OWNER"), true);
  assert.equal(canAdministerHousehold("ADULT"), false);
  assert.equal(canAdministerHousehold("CHILD"), false);
  assert.equal(canAdministerHousehold("GUEST"), false);
});

test("matching-home checks do not reveal cross-household records", () => {
  assert.equal(requireMatchingHome(access, "home-1"), access);
  assert.throws(() => requireMatchingHome(access, "home-2"), HouseholdAccessError);
});
