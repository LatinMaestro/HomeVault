import assert from "node:assert/strict";
import test from "node:test";

import { evaluateHouseholdOwnershipTransfer } from "../src/lib/household-ownership-transfer";

const validTransfer = {
  actorUserId: "owner-user",
  actorHomeId: "home-1",
  actorRole: "OWNER" as const,
  targetUserId: "adult-user",
  targetHomeId: "home-1",
  targetRole: "ADULT" as const,
  targetEmailVerified: true,
};

test("allows a verified adult in the same household to become owner", () => {
  assert.deepEqual(evaluateHouseholdOwnershipTransfer(validTransfer), {
    status: "allowed",
    previousOwnerRole: "ADULT",
    nextOwnerRole: "OWNER",
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

test("rejects cross-household, missing and self transfers", () => {
  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({
      ...validTransfer,
      targetHomeId: "home-2",
    }),
    { status: "error", reason: "different-household" },
  );

  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({
      ...validTransfer,
      targetUserId: "",
    }),
    { status: "error", reason: "invalid-member" },
  );

  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({
      ...validTransfer,
      targetUserId: "owner-user",
    }),
    { status: "error", reason: "same-member" },
  );
});

test("requires a verified adult target", () => {
  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({
      ...validTransfer,
      targetEmailVerified: false,
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
