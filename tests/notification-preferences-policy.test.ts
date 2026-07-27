import assert from "node:assert/strict";
import test from "node:test";

import {
  decideNotificationDelivery,
  decideNotificationPreferences,
  isWithinQuietHours,
  type NotificationPreferences,
} from "../src/lib/notification-preferences-policy";

const preferences: NotificationPreferences = {
  id: "notification-preferences-1",
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

test("accepts property-scoped preferences for the current member", () => {
  assert.deepEqual(
    decideNotificationPreferences({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      hasCurrentMembership: true,
      input: preferences,
    }),
    {
      status: "preferences-accepted",
      preferences,
    },
  );
});

test("rejects foreign property, invalid timezone and duplicate selections", () => {
  const input = {
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    hasCurrentMembership: true,
    input: preferences,
  };

  assert.deepEqual(
    decideNotificationPreferences({
      ...input,
      selectedHomeId: "other-home",
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideNotificationPreferences({
      ...input,
      input: { ...preferences, timezone: "Not/A-Timezone" },
    }),
    { status: "invalid-timezone" },
  );
  assert.deepEqual(
    decideNotificationPreferences({
      ...input,
      input: {
        ...preferences,
        topics: ["REMINDER", "REMINDER"],
      },
    }),
    { status: "invalid-selection" },
  );
});

test("requires complete unambiguous quiet-hour settings", () => {
  const input = {
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    hasCurrentMembership: true,
    input: preferences,
  };

  assert.deepEqual(
    decideNotificationPreferences({
      ...input,
      input: {
        ...preferences,
        quietStartMinute: 600,
        quietEndMinute: 600,
      },
    }),
    { status: "invalid-quiet-hours" },
  );
  assert.deepEqual(
    decideNotificationPreferences({
      ...input,
      input: {
        ...preferences,
        quietHoursEnabled: false,
      },
    }),
    { status: "invalid-quiet-hours" },
  );
  assert.deepEqual(
    decideNotificationPreferences({
      ...input,
      input: {
        ...preferences,
        quietHoursEnabled: false,
        quietStartMinute: null,
        quietEndMinute: null,
      },
    }).status,
    "preferences-accepted",
  );
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

test("defers during quiet hours and preserves the internal dedupe key", () => {
  assert.deepEqual(
    decideNotificationDelivery({
      preferences,
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      topic: "REMINDER",
      channel: "PUSH",
      localMinute: 23 * 60,
      permissionGranted: true,
      dedupeKey: "internal-dedupe-1",
      alreadyDelivered: false,
    }),
    {
      status: "defer-for-quiet-hours",
      channel: "PUSH",
      delayMinutes: 8 * 60,
      dedupeKey: "internal-dedupe-1",
    },
  );
});

test("delivers only when enabled, selected, permitted and not duplicated", () => {
  const delivery = {
    preferences: {
      ...preferences,
      quietHoursEnabled: false,
      quietStartMinute: null,
      quietEndMinute: null,
    },
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    topic: "REMINDER" as const,
    channel: "PUSH" as const,
    localMinute: 12 * 60,
    permissionGranted: true,
    dedupeKey: "internal-dedupe-1",
    alreadyDelivered: false,
  };

  assert.deepEqual(decideNotificationDelivery(delivery), {
    status: "deliver",
    channel: "PUSH",
    dedupeKey: "internal-dedupe-1",
  });
  assert.deepEqual(
    decideNotificationDelivery({
      ...delivery,
      preferences: { ...delivery.preferences, enabled: false },
    }),
    { status: "disabled" },
  );
  assert.deepEqual(
    decideNotificationDelivery({
      ...delivery,
      permissionGranted: false,
    }),
    { status: "permission-required" },
  );
  assert.deepEqual(
    decideNotificationDelivery({
      ...delivery,
      alreadyDelivered: true,
    }),
    { status: "duplicate" },
  );
  assert.deepEqual(
    decideNotificationDelivery({
      ...delivery,
      selectedHomeId: "other-home",
    }),
    { status: "unavailable" },
  );
});
