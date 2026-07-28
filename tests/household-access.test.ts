import assert from "node:assert/strict";
import test from "node:test";

import {
  HouseholdAccessError,
  canAdministerHousehold,
  canChangeHouseholdMemberRole,
  canInviteHouseholdMember,
  canRemoveHouseholdMember,
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

test("owners can invite non-owner roles but cannot create another owner", () => {
  assert.equal(canInviteHouseholdMember("OWNER", "ADULT"), true);
  assert.equal(canInviteHouseholdMember("OWNER", "CHILD"), true);
  assert.equal(canInviteHouseholdMember("OWNER", "GUEST"), true);
  assert.equal(canInviteHouseholdMember("OWNER", "OWNER"), false);
  assert.equal(canInviteHouseholdMember("ADULT", "GUEST"), false);
});

test("generic role changes cannot alter or create ownership", () => {
  assert.equal(canChangeHouseholdMemberRole("OWNER", "ADULT", "CHILD"), true);
  assert.equal(canChangeHouseholdMemberRole("OWNER", "GUEST", "ADULT"), true);
  assert.equal(canChangeHouseholdMemberRole("OWNER", "ADULT", "ADULT"), false);
  assert.equal(canChangeHouseholdMemberRole("OWNER", "OWNER", "ADULT"), false);
  assert.equal(canChangeHouseholdMemberRole("OWNER", "ADULT", "OWNER"), false);
  assert.equal(canChangeHouseholdMemberRole("ADULT", "GUEST", "ADULT"), false);
});

test("owners can remove non-owners and non-owners can leave themselves", () => {
  assert.equal(
    canRemoveHouseholdMember("OWNER", "ADULT", "owner-1", "adult-1"),
    true,
  );
  assert.equal(
    canRemoveHouseholdMember("OWNER", "CHILD", "owner-1", "child-1"),
    true,
  );
  assert.equal(
    canRemoveHouseholdMember("ADULT", "ADULT", "adult-1", "adult-1"),
    true,
  );
  assert.equal(
    canRemoveHouseholdMember("GUEST", "GUEST", "guest-1", "guest-1"),
    true,
  );
  assert.equal(
    canRemoveHouseholdMember("ADULT", "GUEST", "adult-1", "guest-1"),
    false,
  );
});

test("self-departure is derived from authenticated and target user identities", () => {
  assert.equal(
    canRemoveHouseholdMember("ADULT", "ADULT", "adult-1", "adult-2"),
    false,
  );
  assert.equal(
    canRemoveHouseholdMember("GUEST", "GUEST", "", "guest-1"),
    false,
  );
});

test("owners cannot be removed through the generic membership path", () => {
  assert.equal(
    canRemoveHouseholdMember("OWNER", "OWNER", "owner-1", "member-2"),
    false,
  );
  assert.equal(
    canRemoveHouseholdMember("OWNER", "OWNER", "owner-1", "owner-1"),
    false,
  );
});

test("matching-home checks do not reveal cross-household records", () => {
  assert.equal(requireMatchingHome(access, "home-1"), access);
  assert.throws(() => requireMatchingHome(access, "home-2"), HouseholdAccessError);
});
