import assert from "node:assert/strict";
import test from "node:test";

import { getMaintenanceScheduleAfterCompletion } from "../src/lib/maintenance-schedule";

const utc = (value: string) => new Date(`${value}T00:00:00.000Z`);

test("one-off maintenance closes after completion", () => {
  const result = getMaintenanceScheduleAfterCompletion({
    frequency: "ONCE",
    customIntervalDays: null,
    completedAt: utc("2026-07-17"),
    nextDueDate: utc("2026-07-20"),
  });

  assert.deepEqual(result, {
    kind: "completed",
    nextDueDate: null,
    status: "COMPLETED",
  });
});

test("overdue weekly maintenance advances from completion", () => {
  const result = getMaintenanceScheduleAfterCompletion({
    frequency: "WEEKLY",
    customIntervalDays: null,
    completedAt: utc("2026-07-17"),
    nextDueDate: utc("2026-07-01"),
  });

  assert.equal(result.kind, "advanced");
  assert.equal(result.nextDueDate?.toISOString(), utc("2026-07-24").toISOString());
});

test("early monthly maintenance preserves cadence and clamps month end", () => {
  const result = getMaintenanceScheduleAfterCompletion({
    frequency: "MONTHLY",
    customIntervalDays: null,
    completedAt: utc("2027-01-20"),
    nextDueDate: utc("2027-01-31"),
  });

  assert.equal(result.kind, "advanced");
  assert.equal(result.nextDueDate?.toISOString(), utc("2027-02-28").toISOString());
});

test("yearly maintenance handles leap day safely", () => {
  const result = getMaintenanceScheduleAfterCompletion({
    frequency: "YEARLY",
    customIntervalDays: null,
    completedAt: utc("2028-02-29"),
    nextDueDate: null,
  });

  assert.equal(result.kind, "advanced");
  assert.equal(result.nextDueDate?.toISOString(), utc("2029-02-28").toISOString());
});

test("custom maintenance advances by its configured day interval", () => {
  const result = getMaintenanceScheduleAfterCompletion({
    frequency: "CUSTOM",
    customIntervalDays: 45,
    completedAt: utc("2026-07-17"),
    nextDueDate: null,
  });

  assert.equal(result.kind, "advanced");
  assert.equal(result.nextDueDate?.toISOString(), utc("2026-08-31").toISOString());
});

test("invalid legacy custom intervals preserve the current schedule", () => {
  const dueDate = utc("2026-08-10");
  const result = getMaintenanceScheduleAfterCompletion({
    frequency: "CUSTOM",
    customIntervalDays: null,
    completedAt: utc("2026-07-17"),
    nextDueDate: dueDate,
  });

  assert.deepEqual(result, {
    kind: "unchanged",
    nextDueDate: dueDate,
    status: null,
  });
});
