import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_TOPICS,
  type NotificationChannel,
  type NotificationTopic,
} from "@/lib/notification-preferences-policy";

export const MAX_NOTIFICATION_DELIVERY_ATTEMPTS = 5;
export const MAX_NOTIFICATION_RETRY_DELAY_MINUTES = 60;
export const MAX_NOTIFICATION_SCHEDULE_HORIZON_DAYS = 366;
export const MAX_NOTIFICATION_DEEP_LINK_TTL_MINUTES = 15;

const MAX_IDENTIFIER_LENGTH = 128;
const MIN_OPAQUE_KEY_LENGTH = 32;
const MAX_OPAQUE_KEY_LENGTH = 128;

export type NotificationJobStatus =
  | "PENDING"
  | "PROCESSING"
  | "SENT"
  | "CANCELLED"
  | "FAILED";

export type NotificationMembershipEvidence = {
  id: string;
  userId: string;
  homeId: string;
  active: boolean;
};

export type NotificationPreferenceEvidence = {
  id: string;
  userId: string;
  homeId: string;
  revision: number;
  enabled: boolean;
  topics: readonly NotificationTopic[];
  channels: readonly NotificationChannel[];
};

export type NotificationPermissionEvidence = {
  deviceId: string;
  userId: string;
  homeId: string;
  channel: NotificationChannel;
  state: "GRANTED" | "DENIED" | "UNKNOWN";
  registrationActive: boolean;
};

export type NotificationRecordEvidence = {
  id: string;
  homeId: string;
  recipientUserId: string;
  topic: NotificationTopic;
  active: boolean;
  occurrenceAt: Date;
  version: number;
};

export type NotificationDedupeEvidence = {
  key: string;
  exists: boolean;
};

export type NotificationJob = {
  id: string;
  userId: string;
  homeId: string;
  membershipId: string;
  preferenceId: string;
  preferenceRevision: number;
  deviceId: string;
  recordId: string;
  recordVersion: number;
  topic: NotificationTopic;
  channel: NotificationChannel;
  occurrenceAt: Date;
  dedupeKey: string;
  status: NotificationJobStatus;
  attemptsCompleted: number;
  maxAttempts: number;
  nextAttemptAt: Date;
  createdAt: Date;
  leaseId?: string | null;
  leaseExpiresAt?: Date | null;
};

export type NotificationScheduleDecision =
  | {
      status: "schedule";
      job: Omit<
        NotificationJob,
        "id" | "status" | "attemptsCompleted" | "leaseId" | "leaseExpiresAt"
      >;
    }
  | { status: "unavailable" }
  | { status: "disabled" }
  | { status: "permission-required" }
  | { status: "duplicate" };

export type NotificationAttemptOutcome =
  | {
      kind: "SUCCESS";
      providerResponseClass: "ACCEPTED";
    }
  | {
      kind: "TRANSIENT_FAILURE";
      providerResponseClass: "TIMEOUT" | "RATE_LIMITED" | "UNAVAILABLE";
    }
  | {
      kind: "TERMINAL_FAILURE";
      providerResponseClass:
        | "INVALID_TOKEN"
        | "PERMISSION_DENIED"
        | "MALFORMED_PAYLOAD"
        | "POLICY_REJECTED";
    };

export type NotificationWorkerLeaseEvidence = {
  id: string;
  jobId: string;
  attemptNumber: number;
  expiresAt: Date;
};

export type NotificationRetryDecision =
  | {
      status: "sent";
      audit: NotificationDeliveryAuditPlan;
    }
  | { status: "cancel" }
  | {
      status: "failed-terminal";
      audit: NotificationDeliveryAuditPlan;
    }
  | {
      status: "failed-exhausted";
      audit: NotificationDeliveryAuditPlan;
    }
  | {
      status: "retry";
      delayMinutes: number;
      nextAttemptNumber: number;
      nextAttemptAt: Date;
      compareAndSet: {
        jobId: string;
        expectedStatus: "PROCESSING";
        expectedLeaseId: string;
        expectedAttemptsCompleted: number;
      };
      audit: NotificationDeliveryAuditPlan;
    }
  | { status: "unavailable" };

export type NotificationDeliveryAuditPlan = {
  jobId: string;
  userId: string;
  homeId: string;
  deviceId: string;
  attemptNumber: number;
  outcome: NotificationAttemptOutcome["kind"] | "EXHAUSTED";
  providerResponseClass:
    | NotificationAttemptOutcome["providerResponseClass"]
    | "RETRY_LIMIT";
  dedupeKey: string;
};

export type NotificationDeepLinkKind =
  | "MAINTENANCE"
  | "REMINDER"
  | "WARRANTY";

export type NotificationDeepLinkGrant = {
  id: string;
  userId: string;
  homeId: string;
  recordId: string;
  kind: NotificationDeepLinkKind;
  issuedAt: Date;
  expiresAt: Date;
  revokedAt?: Date | null;
};

export type NotificationSessionEvidence = {
  id: string;
  userId: string;
  verified: boolean;
  expiresAt: Date;
};

export type NotificationDeepLinkTargetEvidence = {
  id: string;
  homeId: string;
  kind: NotificationDeepLinkKind;
  exists: boolean;
};

export type NotificationDeepLinkDecision =
  | {
      status: "open";
      grantId: string;
      path: string;
    }
  | { status: "unavailable" }
  | { status: "expired" }
  | { status: "revoked" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isExactBoolean(value: unknown): value is boolean {
  return value === true || value === false;
}

function isCanonicalIdentifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_IDENTIFIER_LENGTH &&
    value === value.trim() &&
    !/[\u0000-\u001f\u007f]/u.test(value) &&
    /^[A-Za-z0-9][A-Za-z0-9._:-]*$/u.test(value)
  );
}

function isOpaqueKey(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= MIN_OPAQUE_KEY_LENGTH &&
    value.length <= MAX_OPAQUE_KEY_LENGTH &&
    /^[A-Za-z0-9_-]+$/u.test(value)
  );
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) > 0;
}

function isPositiveBoundedAttempts(value: unknown): value is number {
  return (
    Number.isInteger(value) &&
    (value as number) > 0 &&
    (value as number) <= MAX_NOTIFICATION_DELIVERY_ATTEMPTS
  );
}

function isNotificationTopic(value: unknown): value is NotificationTopic {
  return (
    typeof value === "string" &&
    NOTIFICATION_TOPICS.includes(value as NotificationTopic)
  );
}

function isNotificationChannel(value: unknown): value is NotificationChannel {
  return (
    typeof value === "string" &&
    NOTIFICATION_CHANNELS.includes(value as NotificationChannel)
  );
}

function isUniqueApprovedSelection<T extends string>(
  value: unknown,
  approved: readonly T[],
): value is readonly T[] {
  return (
    Array.isArray(value) &&
    value.length <= approved.length &&
    value.every(
      (entry): entry is T =>
        typeof entry === "string" && approved.includes(entry as T),
    ) &&
    new Set(value).size === value.length
  );
}

function parseMembershipEvidence(
  value: unknown,
): NotificationMembershipEvidence | null {
  if (
    !isRecord(value) ||
    !isCanonicalIdentifier(value.id) ||
    !isCanonicalIdentifier(value.userId) ||
    !isCanonicalIdentifier(value.homeId) ||
    !isExactBoolean(value.active)
  ) {
    return null;
  }

  return {
    id: value.id,
    userId: value.userId,
    homeId: value.homeId,
    active: value.active,
  };
}

function parsePreferenceEvidence(
  value: unknown,
): NotificationPreferenceEvidence | null {
  if (
    !isRecord(value) ||
    !isCanonicalIdentifier(value.id) ||
    !isCanonicalIdentifier(value.userId) ||
    !isCanonicalIdentifier(value.homeId) ||
    !isPositiveInteger(value.revision) ||
    !isExactBoolean(value.enabled) ||
    !isUniqueApprovedSelection(value.topics, NOTIFICATION_TOPICS) ||
    !isUniqueApprovedSelection(value.channels, NOTIFICATION_CHANNELS)
  ) {
    return null;
  }

  return {
    id: value.id,
    userId: value.userId,
    homeId: value.homeId,
    revision: value.revision,
    enabled: value.enabled,
    topics: value.topics,
    channels: value.channels,
  };
}

function parsePermissionEvidence(
  value: unknown,
): NotificationPermissionEvidence | null {
  if (
    !isRecord(value) ||
    !isCanonicalIdentifier(value.deviceId) ||
    !isCanonicalIdentifier(value.userId) ||
    !isCanonicalIdentifier(value.homeId) ||
    !isNotificationChannel(value.channel) ||
    !["GRANTED", "DENIED", "UNKNOWN"].includes(value.state as string) ||
    !isExactBoolean(value.registrationActive)
  ) {
    return null;
  }

  return {
    deviceId: value.deviceId,
    userId: value.userId,
    homeId: value.homeId,
    channel: value.channel,
    state: value.state as NotificationPermissionEvidence["state"],
    registrationActive: value.registrationActive,
  };
}

function parseRecordEvidence(
  value: unknown,
): NotificationRecordEvidence | null {
  if (
    !isRecord(value) ||
    !isCanonicalIdentifier(value.id) ||
    !isCanonicalIdentifier(value.homeId) ||
    !isCanonicalIdentifier(value.recipientUserId) ||
    !isNotificationTopic(value.topic) ||
    !isExactBoolean(value.active) ||
    !isValidDate(value.occurrenceAt) ||
    !isPositiveInteger(value.version)
  ) {
    return null;
  }

  return {
    id: value.id,
    homeId: value.homeId,
    recipientUserId: value.recipientUserId,
    topic: value.topic,
    active: value.active,
    occurrenceAt: value.occurrenceAt,
    version: value.version,
  };
}

function parseDedupeEvidence(
  value: unknown,
): NotificationDedupeEvidence | null {
  if (
    !isRecord(value) ||
    !isOpaqueKey(value.key) ||
    !isExactBoolean(value.exists)
  ) {
    return null;
  }

  return {
    key: value.key,
    exists: value.exists,
  };
}

export function decideNotificationSchedule({
  currentUserId,
  selectedHomeId,
  membership: rawMembership,
  preferences: rawPreferences,
  permission: rawPermission,
  record: rawRecord,
  dedupe: rawDedupe,
  channel,
  scheduledAt,
  maxAttempts = MAX_NOTIFICATION_DELIVERY_ATTEMPTS,
}: {
  currentUserId: string;
  selectedHomeId: string;
  membership: NotificationMembershipEvidence;
  preferences: NotificationPreferenceEvidence;
  permission: NotificationPermissionEvidence;
  record: NotificationRecordEvidence;
  dedupe: NotificationDedupeEvidence;
  channel: NotificationChannel;
  scheduledAt: Date;
  maxAttempts?: number;
}): NotificationScheduleDecision {
  const membership = parseMembershipEvidence(rawMembership);
  const preferences = parsePreferenceEvidence(rawPreferences);
  const permission = parsePermissionEvidence(rawPermission);
  const record = parseRecordEvidence(rawRecord);
  const dedupe = parseDedupeEvidence(rawDedupe);

  if (
    !isCanonicalIdentifier(currentUserId) ||
    !isCanonicalIdentifier(selectedHomeId) ||
    !membership ||
    !preferences ||
    !permission ||
    !record ||
    !dedupe ||
    !isNotificationChannel(channel) ||
    !isValidDate(scheduledAt) ||
    !isPositiveBoundedAttempts(maxAttempts) ||
    membership.userId !== currentUserId ||
    membership.homeId !== selectedHomeId ||
    preferences.userId !== currentUserId ||
    preferences.homeId !== selectedHomeId ||
    permission.userId !== currentUserId ||
    permission.homeId !== selectedHomeId ||
    permission.channel !== channel ||
    record.recipientUserId !== currentUserId ||
    record.homeId !== selectedHomeId ||
    record.occurrenceAt.getTime() < scheduledAt.getTime() ||
    record.occurrenceAt.getTime() - scheduledAt.getTime() >
      MAX_NOTIFICATION_SCHEDULE_HORIZON_DAYS * 24 * 60 * 60 * 1000
  ) {
    return { status: "unavailable" };
  }

  if (
    membership.active !== true ||
    preferences.enabled !== true ||
    record.active !== true ||
    !preferences.topics.includes(record.topic) ||
    !preferences.channels.includes(channel)
  ) {
    return { status: "disabled" };
  }

  if (
    permission.state !== "GRANTED" ||
    permission.registrationActive !== true
  ) {
    return { status: "permission-required" };
  }

  if (dedupe.exists) {
    return { status: "duplicate" };
  }

  return {
    status: "schedule",
    job: {
      userId: currentUserId,
      homeId: selectedHomeId,
      membershipId: membership.id,
      preferenceId: preferences.id,
      preferenceRevision: preferences.revision,
      deviceId: permission.deviceId,
      recordId: record.id,
      recordVersion: record.version,
      topic: record.topic,
      channel,
      occurrenceAt: new Date(record.occurrenceAt.getTime()),
      dedupeKey: dedupe.key,
      maxAttempts,
      nextAttemptAt: new Date(scheduledAt.getTime()),
      createdAt: new Date(scheduledAt.getTime()),
    },
  };
}

function retryDelayMinutes(attemptsCompleted: number) {
  return Math.min(
    2 ** Math.max(0, attemptsCompleted - 1),
    MAX_NOTIFICATION_RETRY_DELAY_MINUTES,
  );
}

function parseWorkerLeaseEvidence(
  value: unknown,
): NotificationWorkerLeaseEvidence | null {
  if (
    !isRecord(value) ||
    !isOpaqueKey(value.id) ||
    !isCanonicalIdentifier(value.jobId) ||
    !isPositiveInteger(value.attemptNumber) ||
    !isValidDate(value.expiresAt)
  ) {
    return null;
  }

  return {
    id: value.id,
    jobId: value.jobId,
    attemptNumber: value.attemptNumber,
    expiresAt: value.expiresAt,
  };
}

function parseOutcome(value: unknown): NotificationAttemptOutcome | null {
  if (!isRecord(value) || typeof value.kind !== "string") {
    return null;
  }

  if (
    value.kind === "SUCCESS" &&
    value.providerResponseClass === "ACCEPTED"
  ) {
    return {
      kind: "SUCCESS",
      providerResponseClass: "ACCEPTED",
    };
  }

  if (
    value.kind === "TRANSIENT_FAILURE" &&
    ["TIMEOUT", "RATE_LIMITED", "UNAVAILABLE"].includes(
      value.providerResponseClass as string,
    )
  ) {
    return {
      kind: "TRANSIENT_FAILURE",
      providerResponseClass:
        value.providerResponseClass as Extract<
          NotificationAttemptOutcome,
          { kind: "TRANSIENT_FAILURE" }
        >["providerResponseClass"],
    };
  }

  if (
    value.kind === "TERMINAL_FAILURE" &&
    [
      "INVALID_TOKEN",
      "PERMISSION_DENIED",
      "MALFORMED_PAYLOAD",
      "POLICY_REJECTED",
    ].includes(value.providerResponseClass as string)
  ) {
    return {
      kind: "TERMINAL_FAILURE",
      providerResponseClass:
        value.providerResponseClass as Extract<
          NotificationAttemptOutcome,
          { kind: "TERMINAL_FAILURE" }
        >["providerResponseClass"],
    };
  }

  return null;
}

function isRuntimeSafeJob(value: unknown): value is NotificationJob {
  if (
    !isRecord(value) ||
    !isCanonicalIdentifier(value.id) ||
    !isCanonicalIdentifier(value.userId) ||
    !isCanonicalIdentifier(value.homeId) ||
    !isCanonicalIdentifier(value.membershipId) ||
    !isCanonicalIdentifier(value.preferenceId) ||
    !isPositiveInteger(value.preferenceRevision) ||
    !isCanonicalIdentifier(value.deviceId) ||
    !isCanonicalIdentifier(value.recordId) ||
    !isPositiveInteger(value.recordVersion) ||
    !isNotificationTopic(value.topic) ||
    !isNotificationChannel(value.channel) ||
    !isValidDate(value.occurrenceAt) ||
    !isOpaqueKey(value.dedupeKey) ||
    !["PENDING", "PROCESSING", "SENT", "CANCELLED", "FAILED"].includes(
      value.status as string,
    ) ||
    !Number.isInteger(value.attemptsCompleted) ||
    (value.attemptsCompleted as number) < 0 ||
    !isPositiveBoundedAttempts(value.maxAttempts) ||
    (value.attemptsCompleted as number) > (value.maxAttempts as number) ||
    !isValidDate(value.nextAttemptAt) ||
    !isValidDate(value.createdAt) ||
    (value.leaseId !== null &&
      value.leaseId !== undefined &&
      !isOpaqueKey(value.leaseId)) ||
    (value.leaseExpiresAt !== null &&
      value.leaseExpiresAt !== undefined &&
      !isValidDate(value.leaseExpiresAt))
  ) {
    return false;
  }

  return true;
}

function auditPlan({
  job,
  outcome,
  providerResponseClass,
}: {
  job: NotificationJob;
  outcome: NotificationDeliveryAuditPlan["outcome"];
  providerResponseClass: NotificationDeliveryAuditPlan["providerResponseClass"];
}): NotificationDeliveryAuditPlan {
  return {
    jobId: job.id,
    userId: job.userId,
    homeId: job.homeId,
    deviceId: job.deviceId,
    attemptNumber: job.attemptsCompleted,
    outcome,
    providerResponseClass,
    dedupeKey: job.dedupeKey,
  };
}

export function decideNotificationRetry({
  job,
  membership: rawMembership,
  preferences: rawPreferences,
  permission: rawPermission,
  record: rawRecord,
  lease: rawLease,
  outcome: rawOutcome,
  now = new Date(),
}: {
  job: NotificationJob;
  membership: NotificationMembershipEvidence;
  preferences: NotificationPreferenceEvidence;
  permission: NotificationPermissionEvidence;
  record: NotificationRecordEvidence;
  lease: NotificationWorkerLeaseEvidence;
  outcome: NotificationAttemptOutcome;
  now?: Date;
}): NotificationRetryDecision {
  const membership = parseMembershipEvidence(rawMembership);
  const preferences = parsePreferenceEvidence(rawPreferences);
  const permission = parsePermissionEvidence(rawPermission);
  const record = parseRecordEvidence(rawRecord);
  const lease = parseWorkerLeaseEvidence(rawLease);
  const outcome = parseOutcome(rawOutcome);

  if (
    !isRuntimeSafeJob(job) ||
    !membership ||
    !preferences ||
    !permission ||
    !record ||
    !lease ||
    !outcome ||
    !isValidDate(now) ||
    job.status !== "PROCESSING" ||
    job.attemptsCompleted < 1 ||
    !isOpaqueKey(job.leaseId) ||
    !isValidDate(job.leaseExpiresAt) ||
    lease.id !== job.leaseId ||
    lease.jobId !== job.id ||
    lease.attemptNumber !== job.attemptsCompleted ||
    lease.expiresAt.getTime() !== job.leaseExpiresAt.getTime() ||
    lease.expiresAt.getTime() <= now.getTime() ||
    membership.id !== job.membershipId ||
    membership.userId !== job.userId ||
    membership.homeId !== job.homeId ||
    preferences.id !== job.preferenceId ||
    preferences.userId !== job.userId ||
    preferences.homeId !== job.homeId ||
    preferences.revision !== job.preferenceRevision ||
    permission.deviceId !== job.deviceId ||
    permission.userId !== job.userId ||
    permission.homeId !== job.homeId ||
    permission.channel !== job.channel ||
    record.id !== job.recordId ||
    record.homeId !== job.homeId ||
    record.recipientUserId !== job.userId ||
    record.version !== job.recordVersion ||
    record.topic !== job.topic ||
    record.occurrenceAt.getTime() !== job.occurrenceAt.getTime()
  ) {
    return { status: "unavailable" };
  }

  if (
    membership.active !== true ||
    preferences.enabled !== true ||
    !preferences.channels.includes(job.channel) ||
    !preferences.topics.includes(job.topic) ||
    permission.state !== "GRANTED" ||
    permission.registrationActive !== true ||
    record.active !== true
  ) {
    return { status: "cancel" };
  }

  if (outcome.kind === "SUCCESS") {
    return {
      status: "sent",
      audit: auditPlan({
        job,
        outcome: outcome.kind,
        providerResponseClass: outcome.providerResponseClass,
      }),
    };
  }

  if (outcome.kind === "TERMINAL_FAILURE") {
    return {
      status: "failed-terminal",
      audit: auditPlan({
        job,
        outcome: outcome.kind,
        providerResponseClass: outcome.providerResponseClass,
      }),
    };
  }

  if (job.attemptsCompleted >= job.maxAttempts) {
    return {
      status: "failed-exhausted",
      audit: auditPlan({
        job,
        outcome: "EXHAUSTED",
        providerResponseClass: "RETRY_LIMIT",
      }),
    };
  }

  const delayMinutes = retryDelayMinutes(job.attemptsCompleted);

  return {
    status: "retry",
    delayMinutes,
    nextAttemptNumber: job.attemptsCompleted + 1,
    nextAttemptAt: new Date(now.getTime() + delayMinutes * 60 * 1000),
    compareAndSet: {
      jobId: job.id,
      expectedStatus: "PROCESSING",
      expectedLeaseId: lease.id,
      expectedAttemptsCompleted: job.attemptsCompleted,
    },
    audit: auditPlan({
      job,
      outcome: outcome.kind,
      providerResponseClass: outcome.providerResponseClass,
    }),
  };
}

function isDeepLinkKind(value: unknown): value is NotificationDeepLinkKind {
  return ["MAINTENANCE", "REMINDER", "WARRANTY"].includes(value as string);
}

function parseDeepLinkGrant(value: unknown): NotificationDeepLinkGrant | null {
  if (
    !isRecord(value) ||
    !isOpaqueKey(value.id) ||
    !isCanonicalIdentifier(value.userId) ||
    !isCanonicalIdentifier(value.homeId) ||
    !isCanonicalIdentifier(value.recordId) ||
    !isDeepLinkKind(value.kind) ||
    !isValidDate(value.issuedAt) ||
    !isValidDate(value.expiresAt) ||
    (value.revokedAt !== null &&
      value.revokedAt !== undefined &&
      !isValidDate(value.revokedAt))
  ) {
    return null;
  }

  return {
    id: value.id,
    userId: value.userId,
    homeId: value.homeId,
    recordId: value.recordId,
    kind: value.kind,
    issuedAt: value.issuedAt,
    expiresAt: value.expiresAt,
    revokedAt: value.revokedAt as Date | null | undefined,
  };
}

function parseSessionEvidence(
  value: unknown,
): NotificationSessionEvidence | null {
  if (
    !isRecord(value) ||
    !isOpaqueKey(value.id) ||
    !isCanonicalIdentifier(value.userId) ||
    !isExactBoolean(value.verified) ||
    !isValidDate(value.expiresAt)
  ) {
    return null;
  }

  return {
    id: value.id,
    userId: value.userId,
    verified: value.verified,
    expiresAt: value.expiresAt,
  };
}

function parseDeepLinkTargetEvidence(
  value: unknown,
): NotificationDeepLinkTargetEvidence | null {
  if (
    !isRecord(value) ||
    !isCanonicalIdentifier(value.id) ||
    !isCanonicalIdentifier(value.homeId) ||
    !isDeepLinkKind(value.kind) ||
    !isExactBoolean(value.exists)
  ) {
    return null;
  }

  return {
    id: value.id,
    homeId: value.homeId,
    kind: value.kind,
    exists: value.exists,
  };
}

function deepLinkPath(grant: NotificationDeepLinkGrant) {
  const id = encodeURIComponent(grant.recordId);

  switch (grant.kind) {
    case "MAINTENANCE":
      return `/maintenance/${id}`;
    case "REMINDER":
      return `/maintenance/reminders/${id}`;
    case "WARRANTY":
      return `/warranties/${id}`;
  }
}

export function decideNotificationDeepLink({
  grant: rawGrant,
  session: rawSession,
  membership: rawMembership,
  target: rawTarget,
  selectedHomeId,
  now = new Date(),
}: {
  grant: NotificationDeepLinkGrant;
  session: NotificationSessionEvidence;
  membership: NotificationMembershipEvidence;
  target: NotificationDeepLinkTargetEvidence;
  selectedHomeId: string;
  now?: Date;
}): NotificationDeepLinkDecision {
  const grant = parseDeepLinkGrant(rawGrant);
  const session = parseSessionEvidence(rawSession);
  const membership = parseMembershipEvidence(rawMembership);
  const target = parseDeepLinkTargetEvidence(rawTarget);

  if (
    !grant ||
    !session ||
    !membership ||
    !target ||
    !isCanonicalIdentifier(selectedHomeId) ||
    !isValidDate(now) ||
    session.userId !== grant.userId ||
    membership.userId !== grant.userId ||
    membership.homeId !== grant.homeId ||
    selectedHomeId !== grant.homeId ||
    target.id !== grant.recordId ||
    target.homeId !== grant.homeId ||
    target.kind !== grant.kind ||
    session.verified !== true ||
    membership.active !== true ||
    target.exists !== true ||
    session.expiresAt.getTime() <= now.getTime() ||
    grant.expiresAt.getTime() <= grant.issuedAt.getTime() ||
    grant.expiresAt.getTime() - grant.issuedAt.getTime() >
      MAX_NOTIFICATION_DEEP_LINK_TTL_MINUTES * 60 * 1000 ||
    grant.issuedAt.getTime() > now.getTime()
  ) {
    return { status: "unavailable" };
  }

  if (grant.revokedAt) {
    return { status: "revoked" };
  }

  if (grant.expiresAt.getTime() <= now.getTime()) {
    return { status: "expired" };
  }

  return {
    status: "open",
    grantId: grant.id,
    path: deepLinkPath(grant),
  };
}
