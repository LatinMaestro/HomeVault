import assert from "node:assert/strict";
import test from "node:test";

import {
  decideNotificationDeepLink,
  decideNotificationRetry,
  decideNotificationSchedule,
  type NotificationDeepLinkGrant,
  type NotificationJob,
} from "../src/lib/notification-delivery-policy";

const occurrenceAt = new Date("2026-07-28T00:00:00.000Z");

test("schedules one exact user/property/record occurrence", () => {
  assert.deepEqual(
    decideNotificationSchedule({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      recordUserId: "user-1",
      recordHomeId: "home-1",
      recordId: "reminder-1",
      topic: "REMINDER",
      channel: "PUSH",
      occurrenceAt,
      dedupeKey: "opaque-dedupe-1",
      hasCurrentMembership: true,
      preferencesEnabled: true,
      channelEnabled: true,
      topicEnabled: true,
      recordActive: true,
      duplicateExists: false,
    }),
    {
      status: "schedule",
      job: {
        userId: "user-1",
        homeId: "home-1",
        recordId: "reminder-1",
        topic: "REMINDER",
        channel: "PUSH",
        occurrenceAt,
        dedupeKey: "opaque-dedupe-1",
        maxAttempts: 5,
      },
    },
  );
});

test("rejects foreign, disabled and duplicate schedules", () => {
  const schedule = {
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    recordUserId: "user-1",
    recordHomeId: "home-1",
    recordId: "reminder-1",
    topic: "REMINDER" as const,
    channel: "PUSH" as const,
    occurrenceAt,
    dedupeKey: "opaque-dedupe-1",
    hasCurrentMembership: true,
    preferencesEnabled: true,
    channelEnabled: true,
    topicEnabled: true,
    recordActive: true,
    duplicateExists: false,
  };

  assert.deepEqual(
    decideNotificationSchedule({
      ...schedule,
      recordHomeId: "other-home",
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideNotificationSchedule({
      ...schedule,
      preferencesEnabled: false,
    }),
    { status: "disabled" },
  );
  assert.deepEqual(
    decideNotificationSchedule({
      ...schedule,
      duplicateExists: true,
    }),
    { status: "duplicate" },
  );
  assert.deepEqual(
    decideNotificationSchedule({
      ...schedule,
      maxAttempts: 100,
    }),
    { status: "unavailable" },
  );
});

const job: NotificationJob = {
  id: "job-1",
  userId: "user-1",
  homeId: "home-1",
  recordId: "reminder-1",
  topic: "REMINDER",
  channel: "PUSH",
  occurrenceAt,
  dedupeKey: "opaque-dedupe-1",
  status: "PROCESSING",
  attemptsCompleted: 1,
  maxAttempts: 5,
};

test("uses bounded exponential retry for transient failures", () => {
  assert.deepEqual(
    decideNotificationRetry({
      job,
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      hasCurrentMembership: true,
      preferencesEnabled: true,
      tokenActive: true,
      recordActive: true,
      outcome: "TRANSIENT_FAILURE",
    }),
    {
      status: "retry",
      delayMinutes: 1,
      nextAttemptNumber: 2,
    },
  );

  assert.deepEqual(
    decideNotificationRetry({
      job: { ...job, attemptsCompleted: 4 },
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      hasCurrentMembership: true,
      preferencesEnabled: true,
      tokenActive: true,
      recordActive: true,
      outcome: "TRANSIENT_FAILURE",
    }),
    {
      status: "retry",
      delayMinutes: 8,
      nextAttemptNumber: 5,
    },
  );
});

test("stops retries after opt-out, terminal failure or exhaustion", () => {
  const attempt = {
    job,
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    hasCurrentMembership: true,
    preferencesEnabled: true,
    tokenActive: true,
    recordActive: true,
    outcome: "TRANSIENT_FAILURE" as const,
  };

  assert.deepEqual(
    decideNotificationRetry({
      ...attempt,
      preferencesEnabled: false,
    }),
    { status: "cancel" },
  );
  assert.deepEqual(
    decideNotificationRetry({
      ...attempt,
      outcome: "TERMINAL_FAILURE",
    }),
    { status: "failed-terminal" },
  );
  assert.deepEqual(
    decideNotificationRetry({
      ...attempt,
      job: { ...job, attemptsCompleted: 5 },
    }),
    { status: "failed-exhausted" },
  );
  assert.deepEqual(
    decideNotificationRetry({
      ...attempt,
      outcome: "SUCCESS",
    }),
    { status: "sent" },
  );
});

const deepLink: NotificationDeepLinkGrant = {
  id: "deep-link-1",
  userId: "user-1",
  homeId: "home-1",
  recordId: "reminder/1",
  kind: "REMINDER",
  expiresAt: new Date("2026-07-28T01:00:00.000Z"),
};

test("opens an encoded route only after current server authorisation", () => {
  assert.deepEqual(
    decideNotificationDeepLink({
      grant: deepLink,
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      sessionVerified: true,
      hasCurrentMembership: true,
      targetRecordExists: true,
      now: occurrenceAt,
    }),
    {
      status: "open",
      path: "/maintenance/reminders/reminder%2F1",
    },
  );
});

test("deep links fail closed after expiry, revocation or access loss", () => {
  const open = {
    grant: deepLink,
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    sessionVerified: true,
    hasCurrentMembership: true,
    targetRecordExists: true,
    now: occurrenceAt,
  };

  assert.deepEqual(
    decideNotificationDeepLink({
      ...open,
      selectedHomeId: "other-home",
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideNotificationDeepLink({
      ...open,
      grant: { ...deepLink, revokedAt: occurrenceAt },
    }),
    { status: "revoked" },
  );
  assert.deepEqual(
    decideNotificationDeepLink({
      ...open,
      now: deepLink.expiresAt,
    }),
    { status: "expired" },
  );
  assert.deepEqual(
    decideNotificationDeepLink({
      ...open,
      targetRecordExists: false,
    }),
    { status: "unavailable" },
  );
});
