import assert from "node:assert/strict";
import test from "node:test";

import {
  decideNotificationDelivery,
  decideNotificationPreferences,
  isWithinQuietHours,
  type NotificationDedupeEvidence,
  type NotificationMembershipEvidence,
  type NotificationPermissionEvidence,
  type NotificationPreferences,
} from "../src/notification-preferences-policy";

const membership: NotificationMembershipEvidence = {
  id: "membership-1",
  userId: "user-1",
  homeId: "home-1",
  active: true,
};
const preferences: NotificationPreferences = {
  id: "notification-preferences-1",
  revision: 4,
  userId: "user-1",
  homeId: "home-1",
  enabled: true,
  timezone: "Australia/Brisbane",
  topics: ["MAINTENANCE", "REMINDER", "WARRANTY"],
  channels: ["LOCAL", "PUSH"],
  quietHoursEnabled: true,
  quietStartMinute: 22 * 60,
  quietEndMinute: 7 * 60,
};
const permission: NotificationPermissionEvidence = {
  deviceId: "device-1",
  userId: "user-1",
  homeId: "home-1",
  channel: "PUSH",
  state: "GRANTED",
  registrationActive: true,
};
const dedupeKey = "e3V2c2twbHNEa3h6Qkh5YVZ4TFVfMDAx";
const dedupe: NotificationDedupeEvidence = {
  dedupeKey,
  consumed: false,
};

test("accepts property-scoped preferences bound to exact membership", () => {
  assert.deepEqual(
    decideNotificationPreferences({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      membership,
      input: preferences,
    }),
    {
      status: "preferences-accepted",
      userId: "user-1",
      homeId: "home-1",
      membershipId: "membership-1",
      expectedRevision: 4,
      preferences,
    },
  );
});

test("rejects foreign, inactive and truthy membership evidence", () => {
  for (const candidate of [
    { ...membership, userId: "other-user" },
    { ...membership, homeId: "other-home" },
    { ...membership, active: false },
    { ...membership, active: "true" },
  ]) {
    assert.deepEqual(
      decideNotificationPreferences({
        currentUserId: "user-1",
        selectedHomeId: "home-1",
        membership: candidate as NotificationMembershipEvidence,
        input: preferences,
      }),
      { status: "unavailable" },
    );
  }
});

test("rejects invalid timezone and malformed selections without throwing", () => {
  assert.deepEqual(
    decideNotificationPreferences({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      membership,
      input: { ...preferences, timezone: "Not/A-Timezone" },
    }),
    { status: "invalid-timezone" },
  );
  for (const selection of [
    { topics: ["REMINDER", "REMINDER"] },
    { topics: ["UNKNOWN"] },
    { channels: "PUSH" },
    { channels: ["EMAIL"] },
  ]) {
    assert.doesNotThrow(() => {
      assert.deepEqual(
        decideNotificationPreferences({
          currentUserId: "user-1",
          selectedHomeId: "home-1",
          membership,
          input: { ...preferences, ...selection },
        }),
        { status: "invalid-selection" },
      );
    });
  }
});

test("allows an empty explicit selection and complete opt-out", () => {
  const decision = decideNotificationPreferences({
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    membership,
    input: {
      ...preferences,
      enabled: false,
      topics: [],
      channels: [],
      quietHoursEnabled: false,
      quietStartMinute: null,
      quietEndMinute: null,
    },
  });
  assert.equal(decision.status, "preferences-accepted");
});

test("requires exact, unambiguous quiet-hour settings", () => {
  for (const quiet of [
    { quietStartMinute: 600, quietEndMinute: 600 },
    { quietStartMinute: -1 },
    { quietEndMinute: 1440 },
    { quietHoursEnabled: "true" },
    {
      quietHoursEnabled: false,
      quietStartMinute: 600,
      quietEndMinute: 700,
    },
  ]) {
    const decision = decideNotificationPreferences({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      membership,
      input: { ...preferences, ...quiet },
    });
    assert.ok(
      decision.status === "invalid-quiet-hours" ||
        decision.status === "unavailable",
    );
  }
});

test("evaluates overnight quiet hours with exact boundaries", () => {
  assert.equal(
    isWithinQuietHours({
      localMinute: 21 * 60 + 59,
      quietStartMinute: 22 * 60,
      quietEndMinute: 7 * 60,
    }),
    false,
  );
  assert.equal(
    isWithinQuietHours({
      localMinute: 22 * 60,
      quietStartMinute: 22 * 60,
      quietEndMinute: 7 * 60,
    }),
    true,
  );
  assert.equal(
    isWithinQuietHours({
      localMinute: 6 * 60 + 59,
      quietStartMinute: 22 * 60,
      quietEndMinute: 7 * 60,
    }),
    true,
  );
  assert.equal(
    isWithinQuietHours({
      localMinute: 7 * 60,
      quietStartMinute: 22 * 60,
      quietEndMinute: 7 * 60,
    }),
    false,
  );
});

function deliveryInput() {
  return {
    preferences,
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    membership,
    occurrenceId: "occurrence-1",
    topic: "REMINDER" as const,
    channel: "PUSH" as const,
    scheduledAt: "2026-07-29T13:00:00.000Z",
    permission,
    dedupeKey,
    dedupe,
  };
}

test("derives property local time and binds a quiet-hours deferral plan", () => {
  assert.deepEqual(decideNotificationDelivery(deliveryInput()), {
    status: "defer-for-quiet-hours",
    delayMinutes: 8 * 60,
    delivery: {
      preferenceId: "notification-preferences-1",
      preferenceRevision: 4,
      userId: "user-1",
      homeId: "home-1",
      membershipId: "membership-1",
      deviceId: "device-1",
      occurrenceId: "occurrence-1",
      topic: "REMINDER",
      channel: "PUSH",
      scheduledAt: "2026-07-29T13:00:00.000Z",
      dedupeKey,
    },
  });
});

test("delivers outside quiet hours with the same exact evidence binding", () => {
  const input = deliveryInput();
  const decision = decideNotificationDelivery({
    ...input,
    scheduledAt: "2026-07-29T02:00:00.000Z",
  });
  assert.equal(decision.status, "deliver");
  if (decision.status === "deliver") {
    assert.equal(decision.delivery.preferenceRevision, 4);
    assert.equal(decision.delivery.occurrenceId, "occurrence-1");
    assert.equal(decision.delivery.deviceId, "device-1");
  }
});

test("permission and dedupe evidence must match the exact delivery", () => {
  const input = deliveryInput();
  assert.deepEqual(
    decideNotificationDelivery({
      ...input,
      permission: { ...permission, state: "DENIED" },
    }),
    { status: "permission-required" },
  );
  assert.deepEqual(
    decideNotificationDelivery({
      ...input,
      permission: { ...permission, registrationActive: false },
    }),
    { status: "permission-required" },
  );
  assert.deepEqual(
    decideNotificationDelivery({
      ...input,
      permission: { ...permission, userId: "other-user" },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideNotificationDelivery({
      ...input,
      dedupe: { ...dedupe, consumed: true },
    }),
    { status: "duplicate" },
  );
  assert.deepEqual(
    decideNotificationDelivery({
      ...input,
      dedupe: { ...dedupe, dedupeKey: `${dedupeKey}x` },
    }),
    { status: "unavailable" },
  );
});

test("corrupt stored preferences fail closed instead of bypassing quiet hours", () => {
  const input = deliveryInput();
  for (const corrupt of [
    null,
    { ...preferences, enabled: "true" },
    { ...preferences, topics: ["REMINDER", "REMINDER"] },
    { ...preferences, channels: ["PUSH", "EMAIL"] },
    {
      ...preferences,
      quietHoursEnabled: true,
      quietStartMinute: null,
    },
    { ...preferences, timezone: "Invalid/Timezone" },
  ]) {
    assert.doesNotThrow(() => {
      assert.deepEqual(
        decideNotificationDelivery({
          ...input,
          preferences: corrupt,
        }),
        { status: "unavailable" },
      );
    });
  }
});

test("unknown topics, channels, instants and non-opaque keys fail closed", () => {
  const input = deliveryInput();
  for (const override of [
    { topic: "ALERT" },
    { channel: "EMAIL" },
    { scheduledAt: "invalid" },
    { dedupeKey: "record-home-1-reminder-1" },
    { occurrenceId: " " },
  ]) {
    assert.deepEqual(
      decideNotificationDelivery({
        ...input,
        ...override,
      } as Parameters<typeof decideNotificationDelivery>[0]),
      { status: "unavailable" },
    );
  }
});

test("disabled topics and channels remain non-destructive", () => {
  const input = deliveryInput();
  assert.deepEqual(
    decideNotificationDelivery({
      ...input,
      preferences: { ...preferences, enabled: false },
    }),
    { status: "disabled" },
  );
  assert.deepEqual(
    decideNotificationDelivery({
      ...input,
      preferences: { ...preferences, topics: ["MAINTENANCE"] },
    }),
    { status: "topic-disabled" },
  );
  assert.deepEqual(
    decideNotificationDelivery({
      ...input,
      preferences: { ...preferences, channels: ["LOCAL"] },
    }),
    { status: "channel-disabled" },
  );
});
