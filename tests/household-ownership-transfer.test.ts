import assert from "node:assert/strict";
import test from "node:test";

import { evaluateHouseholdOwnershipTransfer } from "../src/lib/household-ownership-transfer";

const validTransfer = {
  actorUserId: "owner-user",
  actorHomeId: "home-1",
  actorRole: "OWNER" as const,
  actorMembershipActive: true,
  targetUserId: "adult-user",
  targetHomeId: "home-1",
  targetRole: "ADULT" as const,
  targetMembershipActive: true,
  targetEmailVerified: true,
};

test("returns an identity-bound atomic transfer plan", () => {
  assert.deepEqual(evaluateHouseholdOwnershipTransfer(validTransfer), {
    status: "allowed",
    homeId: "home-1",
    previousOwner: {
      userId: "owner-user",
      expectedRole: "OWNER",
      nextRole: "ADULT",
    },
    nextOwner: {
      userId: "adult-user",
      expectedRole: "ADULT",
      nextRole: "OWNER",
    },
  });
});

test("requires the acting member to be the current owner", () => {
  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({
      ...validTransfer,
      actorRole: "ADULT",
    }),
    { status: "error", reason: "actor-not-owner" },
  );
});

test("rejects invalid, cross-household and self identities", () => {
  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({
      ...validTransfer,
      targetHomeId: "home-2",
    }),
    { status: "error", reason: "different-household" },
  );

  for (const actorHomeId of ["", " ", " home-1", "home 1"]) {
    assert.deepEqual(
      evaluateHouseholdOwnershipTransfer({
        ...validTransfer,
        actorHomeId,
      }),
      { status: "error", reason: "invalid-household" },
    );
  }

  for (const targetUserId of ["", " ", " adult-user", "adult user"]) {
    assert.deepEqual(
      evaluateHouseholdOwnershipTransfer({
        ...validTransfer,
        targetUserId,
      }),
      { status: "error", reason: "invalid-member" },
    );
  }

  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({
      ...validTransfer,
      targetUserId: "owner-user",
    }),
    { status: "error", reason: "same-member" },
  );
});

test("requires both memberships to remain active", () => {
  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({
      ...validTransfer,
      actorMembershipActive: false,
    }),
    { status: "error", reason: "inactive-member" },
  );

  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({
      ...validTransfer,
      targetMembershipActive: false,
    }),
    { status: "error", reason: "inactive-member" },
  );

  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({
      ...validTransfer,
      targetMembershipActive: "true" as unknown as boolean,
    }),
    { status: "error", reason: "inactive-member" },
  );
});

test("requires an exactly verified adult target", () => {
  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({
      ...validTransfer,
      targetEmailVerified: false,
    }),
    { status: "error", reason: "target-unverified" },
  );

  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({
      ...validTransfer,
      targetEmailVerified: "true" as unknown as boolean,
    }),
    { status: "error", reason: "target-unverified" },
  );

  for (const targetRole of ["OWNER", "CHILD", "GUEST"] as const) {
    assert.deepEqual(
      evaluateHouseholdOwnershipTransfer({
        ...validTransfer,
        targetRole,
      }),
      { status: "error", reason: "target-not-adult" },
    );
  }
});
