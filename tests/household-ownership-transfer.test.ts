import assert from "node:assert/strict";
import test from "node:test";

import { evaluateHouseholdOwnershipTransfer } from "../src/lib/household-ownership-transfer";

const now = new Date("2026-07-30T07:00:00.000Z");

const valid = {
  actorUserId: "owner-user",
  actorHomeId: "home-1",
  actorRole: "OWNER" as const,
  actorMembershipActive: true,
  actorEmailVerified: true,
  activeOwnerCount: 1,
  targetUserId: "adult-user",
  targetHomeId: "home-1",
  targetRole: "ADULT" as const,
  targetMembershipActive: true,
  targetEmailVerified: true,
  confirmation: {
    id: "confirmation-1",
    actorUserId: "owner-user",
    homeId: "home-1",
    targetUserId: "adult-user",
    confirmedAt: new Date("2026-07-30T06:55:00.000Z"),
    expiresAt: new Date("2026-07-30T07:05:00.000Z"),
  },
  now,
};

test("returns a plan bound to the exact household and members", () => {
  assert.deepEqual(evaluateHouseholdOwnershipTransfer(valid), {
    status: "allowed",
    homeId: "home-1",
    confirmationId: "confirmation-1",
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

test("requires the current owner", () => {
  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({ ...valid, actorRole: "ADULT" }),
    { status: "error", reason: "actor-not-owner" },
  );
});

test("requires both accounts to be exactly verified", () => {
  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({
      ...valid,
      actorEmailVerified: false,
    }),
    { status: "error", reason: "actor-unverified" },
  );
  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({
      ...valid,
      actorEmailVerified: "true" as unknown as boolean,
    }),
    { status: "error", reason: "actor-unverified" },
  );
});

test("rejects invalid and cross-household identities", () => {
  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({ ...valid, actorHomeId: " " }),
    { status: "error", reason: "invalid-household" },
  );
  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({ ...valid, targetUserId: " adult-user" }),
    { status: "error", reason: "invalid-member" },
  );
  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({ ...valid, targetHomeId: "home-2" }),
    { status: "error", reason: "different-household" },
  );
});

test("rejects inactive and self transfers", () => {
  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({
      ...valid,
      targetMembershipActive: false,
    }),
    { status: "error", reason: "inactive-member" },
  );
  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({
      ...valid,
      targetUserId: "owner-user",
    }),
    { status: "error", reason: "same-member" },
  );
});

test("requires exact verification and an adult target", () => {
  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({
      ...valid,
      targetEmailVerified: "true" as unknown as boolean,
    }),
    { status: "error", reason: "target-unverified" },
  );
  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({ ...valid, targetRole: "GUEST" }),
    { status: "error", reason: "target-not-adult" },
  );
});

test("requires exactly one active current owner", () => {
  for (const activeOwnerCount of [0, 2, -1, 1.5]) {
    assert.deepEqual(
      evaluateHouseholdOwnershipTransfer({
        ...valid,
        activeOwnerCount,
      }),
      { status: "error", reason: "invalid-owner-state" },
    );
  }

  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({
      ...valid,
      activeOwnerCount: "1" as unknown as number,
    }),
    { status: "error", reason: "invalid-owner-state" },
  );
});

test("requires fresh confirmation bound to the exact transfer", () => {
  assert.deepEqual(
    evaluateHouseholdOwnershipTransfer({
      ...valid,
      confirmation: null,
    }),
    { status: "error", reason: "confirmation-required" },
  );

  for (const confirmation of [
    { ...valid.confirmation, actorUserId: "other-owner" },
    { ...valid.confirmation, homeId: "home-2" },
    { ...valid.confirmation, targetUserId: "other-adult" },
    { ...valid.confirmation, id: " confirmation-1" },
    {
      ...valid.confirmation,
      expiresAt: new Date("2026-07-30T07:00:00.000Z"),
    },
    {
      ...valid.confirmation,
      confirmedAt: new Date("2026-07-30T07:01:00.000Z"),
    },
    {
      ...valid.confirmation,
      expiresAt: new Date("2026-07-30T07:06:00.001Z"),
    },
    {
      ...valid.confirmation,
      confirmedAt: new Date("invalid"),
    },
  ]) {
    assert.deepEqual(
      evaluateHouseholdOwnershipTransfer({
        ...valid,
        confirmation,
      }),
      { status: "error", reason: "confirmation-required" },
    );
  }
});
