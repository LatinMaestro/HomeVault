import type {
  NotificationChannel,
  NotificationTopic,
} from "@/lib/notification-preferences-policy";

export const MAX_NOTIFICATION_DELIVERY_ATTEMPTS = 5;
export const MAX_NOTIFICATION_RETRY_DELAY_MINUTES = 60;

export type NotificationJobStatus =
  | "PENDING"
  | "PROCESSING"
  | "SENT"
  | "CANCELLED"
  | "FAILED";

export type NotificationJob = {
  id: string;
  userId: string;
  homeId: string;
  recordId: string;
  topic: NotificationTopic;
  channel: NotificationChannel;
  occurrenceAt: Date;
  dedupeKey: string;
  status: NotificationJobStatus;
  attemptsCompleted: number;
  maxAttempts: number;
};

export type NotificationScheduleDecision =
  | {
      status: "schedule";
      job: Omit<NotificationJob, "id" | "status" | "attemptsCompleted">;
    }
  | { status: "unavailable" }
  | { status: "disabled" }
  | { status: "duplicate" };

export type NotificationAttemptOutcome =
  | "SUCCESS"
  | "TRANSIENT_FAILURE"
  | "TERMINAL_FAILURE";

export type NotificationRetryDecision =
  | { status: "sent" }
  | { status: "cancel" }
  | { status: "failed-terminal" }
  | { status: "failed-exhausted" }
  | {
      status: "retry";
      delayMinutes: number;
      nextAttemptNumber: number;
    }
  | { status: "unavailable" };

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
  expiresAt: Date;
  revokedAt?: Date | null;
};

export type NotificationDeepLinkDecision =
  | {
      status: "open";
      path: string;
    }
  | { status: "unavailable" }
  | { status: "expired" }
  | { status: "revoked" };

function isPositiveBoundedAttempts(value: number) {
  return (
    Number.isInteger(value) &&
    value > 0 &&
    value <= MAX_NOTIFICATION_DELIVERY_ATTEMPTS
  );
}

export function decideNotificationSchedule({
  currentUserId,
  selectedHomeId,
  recordUserId,
  recordHomeId,
  recordId,
  topic,
  channel,
  occurrenceAt,
  dedupeKey,
  hasCurrentMembership,
  preferencesEnabled,
  channelEnabled,
  topicEnabled,
  recordActive,
  duplicateExists,
  maxAttempts = MAX_NOTIFICATION_DELIVERY_ATTEMPTS,
}: {
  currentUserId: string;
  selectedHomeId: string;
  recordUserId: string;
  recordHomeId: string;
  recordId: string;
  topic: NotificationTopic;
  channel: NotificationChannel;
  occurrenceAt: Date;
  dedupeKey: string;
  hasCurrentMembership: boolean;
  preferencesEnabled: boolean;
  channelEnabled: boolean;
  topicEnabled: boolean;
  recordActive: boolean;
  duplicateExists: boolean;
  maxAttempts?: number;
}): NotificationScheduleDecision {
  if (
    !currentUserId ||
    !selectedHomeId ||
    !recordId ||
    !dedupeKey ||
    recordUserId !== currentUserId ||
    recordHomeId !== selectedHomeId ||
    !hasCurrentMembership ||
    !Number.isFinite(occurrenceAt.getTime()) ||
    !isPositiveBoundedAttempts(maxAttempts)
  ) {
    return { status: "unavailable" };
  }

  if (
    !preferencesEnabled ||
    !channelEnabled ||
    !topicEnabled ||
    !recordActive
  ) {
    return { status: "disabled" };
  }

  if (duplicateExists) {
    return { status: "duplicate" };
  }

  return {
    status: "schedule",
    job: {
      userId: currentUserId,
      homeId: selectedHomeId,
      recordId,
      topic,
      channel,
      occurrenceAt,
      dedupeKey,
      maxAttempts,
    },
  };
}

function retryDelayMinutes(attemptsCompleted: number) {
  return Math.min(
    2 ** Math.max(0, attemptsCompleted - 1),
    MAX_NOTIFICATION_RETRY_DELAY_MINUTES,
  );
}

export function decideNotificationRetry({
  job,
  currentUserId,
  selectedHomeId,
  hasCurrentMembership,
  preferencesEnabled,
  tokenActive,
  recordActive,
  outcome,
}: {
  job: NotificationJob;
  currentUserId: string;
  selectedHomeId: string;
  hasCurrentMembership: boolean;
  preferencesEnabled: boolean;
  tokenActive: boolean;
  recordActive: boolean;
  outcome: NotificationAttemptOutcome;
}): NotificationRetryDecision {
  if (
    !job.id ||
    !job.dedupeKey ||
    job.userId !== currentUserId ||
    job.homeId !== selectedHomeId ||
    !isPositiveBoundedAttempts(job.maxAttempts) ||
    !Number.isInteger(job.attemptsCompleted) ||
    job.attemptsCompleted < 1
  ) {
    return { status: "unavailable" };
  }

  if (job.status === "SENT" || job.status === "CANCELLED") {
    return { status: "unavailable" };
  }

  if (
    !hasCurrentMembership ||
    !preferencesEnabled ||
    !tokenActive ||
    !recordActive
  ) {
    return { status: "cancel" };
  }

  if (outcome === "SUCCESS") {
    return { status: "sent" };
  }

  if (outcome === "TERMINAL_FAILURE") {
    return { status: "failed-terminal" };
  }

  if (job.attemptsCompleted >= job.maxAttempts) {
    return { status: "failed-exhausted" };
  }

  return {
    status: "retry",
    delayMinutes: retryDelayMinutes(job.attemptsCompleted),
    nextAttemptNumber: job.attemptsCompleted + 1,
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
  grant,
  currentUserId,
  selectedHomeId,
  sessionVerified,
  hasCurrentMembership,
  targetRecordExists,
  now = new Date(),
}: {
  grant: NotificationDeepLinkGrant;
  currentUserId: string;
  selectedHomeId: string;
  sessionVerified: boolean;
  hasCurrentMembership: boolean;
  targetRecordExists: boolean;
  now?: Date;
}): NotificationDeepLinkDecision {
  if (
    !grant.id ||
    !grant.recordId ||
    !currentUserId ||
    !selectedHomeId ||
    !sessionVerified ||
    !hasCurrentMembership ||
    !targetRecordExists ||
    grant.userId !== currentUserId ||
    grant.homeId !== selectedHomeId
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
    path: deepLinkPath(grant),
  };
}
