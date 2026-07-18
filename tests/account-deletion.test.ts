import assert from "node:assert/strict";
import test from "node:test";

import {
  OwnershipTransferRequiredError,
  getMembershipDeletionPlan,
} from "../src/lib/account-deletion";

test("sole-member households are deleted with the account", () => {
  assert.deepEqual(
    getMembershipDeletionPlan([
      { id: "member-1", homeId: "home-1", role: "OWNER", memberCount: 1 },
    ]),
    { homeIds: ["home-1"], membershipIds: [] },
  );
});

test("non-owner memberships are removed without deleting shared homes", () => {
  assert.deepEqual(
    getMembershipDeletionPlan([
      { id: "member-2", homeId: "home-2", role: "ADULT", memberCount: 3 },
    ]),
    { homeIds: [], membershipIds: ["member-2"] },
  );
});

test("owners cannot abandon a household with other members", () => {
  assert.throws(
    () =>
      getMembershipDeletionPlan([
        { id: "member-3", homeId: "home-3", role: "OWNER", memberCount: 2 },
      ]),
    OwnershipTransferRequiredError,
  );
});
