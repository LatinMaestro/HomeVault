import assert from "node:assert/strict";
import test from "node:test";

import {
  decideNotificationDeepLink,
  decideNotificationRetry,
  decideNotificationSchedule,
  type NotificationDeepLinkGrant,
  type NotificationJob,
  type NotificationMembershipEvidence,
  type NotificationPermissionEvidence,
  type NotificationPreferenceEvidence,
  type NotificationRecordEvidence,
  type NotificationSessionEvidence,
  type NotificationWorkerLeaseEvidence,
} from "../src/notification-delivery-policy";

const now = new Date("2026-07-29T04:00:00.000Z");
const occurrenceAt = new Date("2026-07-30T04:00:00.000Z");
const dedupeKey = "TnRxUDRzNmJ4bGZjTEdXVGpKZzNfMDAx";
const leaseId = "bGVhc2VfV3pNbHc0SEtPcWRHY0Ex_001";
const grantId = "Z3JhbnRfNEI1eHpabmNuS0sxM0Ew_001";
const sessionId = "c2Vzc2lvbl9OYU1zMWM2SDJGeHAw_001";

const membership: NotificationMembershipEvidence = {
  id: "member-1",
  userId: "user-1",
  homeId: "home-1",
  active: true,
};

const preferences: NotificationPreferenceEvidence = {
  id: "preference-1",
  userId: "user-1",
  homeId: "home-1",
  revision: 3,
  enabled: true,
  topics: ["REMINDER"],
  channels: ["PUSH"],
};

const permission: NotificationPermissionEvidence = {
  deviceId: "device-1",
  userId: "user-1",
  homeId: "home-1",
  channel: "PUSH",
  state: "GRANTED",
  registrationActive: true,
};

const record: NotificationRecordEvidence = {
  id: "reminder-1",
  homeId: "home-1",
  recipientUserId: "user-1",
  topic: "REMINDER",
  active: true,
  occurrenceAt,
  version: 7,
};

function schedule(overrides: Record<string, unknown> = {}) {
  return decideNotificationSchedule({
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    membership,
    preferences,
    permission,
    record,
    dedupe: { key: dedupeKey, exists: false },
    channel: "PUSH",
    scheduledAt: now,
    ...overrides,
  } as Parameters<typeof decideNotificationSchedule>[0]);
}

test("schedules one exact property-bound occurrence and evidence snapshot", () => {
  assert.deepEqual(schedule(), {
    status: "schedule",
    job: {
      userId: "user-1",
      homeId: "home-1",
      membershipId: "member-1",
      preferenceId: "preference-1",
      preferenceRevision: 3,
      deviceId: "device-1",
      recordId: "reminder-1",
      recordVersion: 7,
      topic: "REMINDER",
      channel: "PUSH",
      occurrenceAt,
      dedupeKey,
      maxAttempts: 5,
      nextAttemptAt: now,
      createdAt: now,
    },
  });
});

test("foreign, inactive and truthy membership evidence fails closed", () => {
  assert.deepEqual(
    schedule({ membership: { ...membership, homeId: "home-2" } }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    schedule({ membership: { ...membership, active: false } }),
    { status: "disabled" },
  );
  assert.deepEqual(
    schedule({
      membership: { ...membership, active: "true" as unknown as boolean },
    }),
    { status: "unavailable" },
  );
});

test("preferences, permission and record evidence bind to the same user and home", () => {
  assert.deepEqual(
    schedule({ preferences: { ...preferences, userId: "user-2" } }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    schedule({ permission: { ...permission, deviceId: " device-1 " } }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    schedule({ record: { ...record, recipientUserId: "user-2" } }),
    { status: "unavailable" },
  );
});

test("explicit opt-out and permission denial remain non-destructive", () => {
  assert.deepEqual(
    schedule({ preferences: { ...preferences, enabled: false } }),
    { status: "disabled" },
  );
  assert.deepEqual(
    schedule({ preferences: { ...preferences, topics: [] } }),
    { status: "disabled" },
  );
  assert.deepEqual(
    schedule({ permission: { ...permission, state: "DENIED" } }),
    { status: "permission-required" },
  );
});

test("deduplication evidence is opaque, exact and replay-safe", () => {
  assert.deepEqual(
    schedule({ dedupe: { key: dedupeKey, exists: true } }),
    { status: "duplicate" },
  );
  assert.deepEqual(schedule({ dedupe: { key: "short", exists: false } }), {
    status: "unavailable",
  });
  assert.deepEqual(
    schedule({
      dedupe: { key: dedupeKey, exists: 1 as unknown as boolean },
    }),
    { status: "unavailable" },
  );
});

test("invalid, past and excessive schedule horizons fail closed without throwing", () => {
  assert.deepEqual(
    schedule({
      record: { ...record, occurrenceAt: new Date("invalid") },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    schedule({
      record: {
        ...record,
        occurrenceAt: new Date("2026-07-29T03:59:59.000Z"),
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    schedule({
      record: {
        ...record,
        occurrenceAt: new Date("2027-08-01T04:00:00.000Z"),
      },
    }),
    { status: "unavailable" },
  );
});

const job: NotificationJob = {
  id: "job-1",
  userId: "user-1",
  homeId: "home-1",
  membershipId: "member-1",
  preferenceId: "preference-1",
  preferenceRevision: 3,
  deviceId: "device-1",
  recordId: "reminder-1",
  recordVersion: 7,
  topic: "REMINDER",
  channel: "PUSH",
  occurrenceAt,
  dedupeKey,
  status: "PROCESSING",
  attemptsCompleted: 1,
  maxAttempts: 5,
  nextAttemptAt: now,
  createdAt: now,
  leaseId,
  leaseExpiresAt: new Date("2026-07-29T04:05:00.000Z"),
};

const lease: NotificationWorkerLeaseEvidence = {
  id: leaseId,
  jobId: "job-1",
  attemptNumber: 1,
  expiresAt: new Date("2026-07-29T04:05:00.000Z"),
};

function retry(overrides: Record<string, unknown> = {}) {
  return decideNotificationRetry({
    job,
    membership,
    preferences,
    permission,
    record,
    lease,
    outcome: {
      kind: "TRANSIENT_FAILURE",
      providerResponseClass: "TIMEOUT",
    },
    now,
    ...overrides,
  } as Parameters<typeof decideNotificationRetry>[0]);
}

test("transient retry uses a bounded delay and exact compare-and-set lease", () => {
  assert.deepEqual(retry(), {
    status: "retry",
    delayMinutes: 1,
    nextAttemptNumber: 2,
    nextAttemptAt: new Date("2026-07-29T04:01:00.000Z"),
    compareAndSet: {
      jobId: "job-1",
      expectedStatus: "PROCESSING",
      expectedLeaseId: leaseId,
      expectedAttemptsCompleted: 1,
    },
    audit: {
      jobId: "job-1",
      userId: "user-1",
      homeId: "home-1",
      deviceId: "device-1",
      attemptNumber: 1,
      outcome: "TRANSIENT_FAILURE",
      providerResponseClass: "TIMEOUT",
      dedupeKey,
    },
  });
});

test("successful and terminal outcomes produce content-free audit plans", () => {
  assert.equal(
    retry({
      outcome: {
        kind: "SUCCESS",
        providerResponseClass: "ACCEPTED",
      },
    }).status,
    "sent",
  );
  assert.deepEqual(
    retry({
      outcome: {
        kind: "TERMINAL_FAILURE",
        providerResponseClass: "INVALID_TOKEN",
      },
    }),
    {
      status: "failed-terminal",
      audit: {
        jobId: "job-1",
        userId: "user-1",
        homeId: "home-1",
        deviceId: "device-1",
        attemptNumber: 1,
        outcome: "TERMINAL_FAILURE",
        providerResponseClass: "INVALID_TOKEN",
        dedupeKey,
      },
    },
  );
});

test("every attempt rechecks membership, preference revision, permission and record", () => {
  assert.deepEqual(
    retry({ membership: { ...membership, active: false } }),
    { status: "cancel" },
  );
  assert.deepEqual(
    retry({ preferences: { ...preferences, revision: 4 } }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    retry({ permission: { ...permission, registrationActive: false } }),
    { status: "cancel" },
  );
  assert.deepEqual(
    retry({ record: { ...record, version: 8 } }),
    { status: "unavailable" },
  );
});

test("expired, substituted and truthy worker leases cannot send or retry", () => {
  assert.deepEqual(
    retry({
      lease: {
        ...lease,
        id: "c3Vic3RpdHV0ZV9sZWFzZV9pZF8wMDE_001",
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    retry({
      lease: { ...lease, expiresAt: now },
      job: { ...job, leaseExpiresAt: now },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    retry({
      permission: {
        ...permission,
        registrationActive: "true" as unknown as boolean,
      },
    }),
    { status: "unavailable" },
  );
});

test("unknown outcomes and malformed runtime jobs fail closed", () => {
  assert.deepEqual(
    retry({
      outcome: {
        kind: "RETRY_EVERYTHING",
        providerResponseClass: "UNKNOWN",
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    retry({
      job: {
        ...job,
        occurrenceAt: "2026-07-30" as unknown as Date,
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    retry({
      job: { ...job, attemptsCompleted: 6 },
      lease: { ...lease, attemptNumber: 6 },
    }),
    { status: "unavailable" },
  );
});

test("retry exhaustion is terminal and bounded to the configured attempt limit", () => {
  const exhaustedJob = {
    ...job,
    attemptsCompleted: 5,
  };
  const exhaustedLease = {
    ...lease,
    attemptNumber: 5,
  };

  assert.deepEqual(
    retry({ job: exhaustedJob, lease: exhaustedLease }),
    {
      status: "failed-exhausted",
      audit: {
        jobId: "job-1",
        userId: "user-1",
        homeId: "home-1",
        deviceId: "device-1",
        attemptNumber: 5,
        outcome: "EXHAUSTED",
        providerResponseClass: "RETRY_LIMIT",
        dedupeKey,
      },
    },
  );
});

const session: NotificationSessionEvidence = {
  id: sessionId,
  userId: "user-1",
  verified: true,
  expiresAt: new Date("2026-07-29T05:00:00.000Z"),
};

const deepLink: NotificationDeepLinkGrant = {
  id: grantId,
  userId: "user-1",
  homeId: "home-1",
  recordId: "reminder:1",
  kind: "REMINDER",
  issuedAt: now,
  expiresAt: new Date("2026-07-29T04:15:00.000Z"),
};

function openDeepLink(overrides: Record<string, unknown> = {}) {
  return decideNotificationDeepLink({
    grant: deepLink,
    session,
    membership,
    target: {
      id: "reminder:1",
      homeId: "home-1",
      kind: "REMINDER",
      exists: true,
    },
    selectedHomeId: "home-1",
    now: new Date("2026-07-29T04:05:00.000Z"),
    ...overrides,
  } as Parameters<typeof decideNotificationDeepLink>[0]);
}

test("deep links resolve one allowlisted encoded route after exact authorization", () => {
  assert.deepEqual(openDeepLink(), {
    status: "open",
    grantId,
    path: "/maintenance/reminders/reminder%3A1",
  });
});

test("revoked and expired deep-link grants remain terminal", () => {
  assert.deepEqual(
    openDeepLink({
      grant: {
        ...deepLink,
        revokedAt: new Date("2026-07-29T04:01:00.000Z"),
      },
    }),
    { status: "revoked" },
  );
  assert.deepEqual(
    openDeepLink({
      now: deepLink.expiresAt,
    }),
    { status: "expired" },
  );
});

test("foreign, unverified, overlong and malformed deep-link evidence fails closed", () => {
  assert.deepEqual(
    openDeepLink({
      target: {
        id: "reminder:2",
        homeId: "home-1",
        kind: "REMINDER",
        exists: true,
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    openDeepLink({ session: { ...session, verified: false } }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    openDeepLink({
      grant: {
        ...deepLink,
        expiresAt: new Date("2026-07-29T04:16:00.000Z"),
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    openDeepLink({
      grant: {
        ...deepLink,
        expiresAt: "tomorrow" as unknown as Date,
      },
    }),
    { status: "unavailable" },
  );
});

test("deep-link authorization rejects truthy evidence and unsupported record kinds", () => {
  assert.deepEqual(
    openDeepLink({
      target: {
        id: "reminder:1",
        homeId: "home-1",
        kind: "REMINDER",
        exists: 1 as unknown as boolean,
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    openDeepLink({
      grant: {
        ...deepLink,
        kind: "RECEIPT" as unknown as NotificationDeepLinkGrant["kind"],
      },
    }),
    { status: "unavailable" },
  );
});
