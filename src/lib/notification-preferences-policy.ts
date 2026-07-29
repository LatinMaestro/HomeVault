export const NOTIFICATION_TOPICS = [
  "MAINTENANCE",
  "REMINDER",
  "WARRANTY",
] as const;

export const NOTIFICATION_CHANNELS = ["LOCAL", "PUSH"] as const;

export type NotificationTopic = (typeof NOTIFICATION_TOPICS)[number];
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export type NotificationMembershipEvidence = {
  id: string;
  userId: string;
  homeId: string;
  active: boolean;
};

export type NotificationPreferences = {
  id: string;
  revision: number;
  userId: string;
  homeId: string;
  enabled: boolean;
  timezone: string;
  topics: readonly NotificationTopic[];
  channels: readonly NotificationChannel[];
  quietHoursEnabled: boolean;
  quietStartMinute: number | null;
  quietEndMinute: number | null;
};

export type NotificationPermissionEvidence = {
  deviceId: string;
  userId: string;
  homeId: string;
  channel: NotificationChannel;
  state: "GRANTED" | "DENIED" | "NOT_DETERMINED";
  registrationActive: boolean;
};

export type NotificationDedupeEvidence = {
  dedupeKey: string;
  consumed: boolean;
};

export type NotificationPreferenceDecision =
  | {
      status: "preferences-accepted";
      userId: string;
      homeId: string;
      membershipId: string;
      expectedRevision: number;
      preferences: NotificationPreferences;
    }
  | { status: "unavailable" }
  | { status: "invalid-timezone" }
  | { status: "invalid-quiet-hours" }
  | { status: "invalid-selection" };

export type NotificationDeliveryPlan = {
  preferenceId: string;
  preferenceRevision: number;
  userId: string;
  homeId: string;
  membershipId: string;
  deviceId: string;
  occurrenceId: string;
  topic: NotificationTopic;
  channel: NotificationChannel;
  scheduledAt: string;
  dedupeKey: string;
};

export type NotificationDeliveryDecision =
  | {
      status: "deliver";
      delivery: NotificationDeliveryPlan;
    }
  | {
      status: "defer-for-quiet-hours";
      delayMinutes: number;
      delivery: NotificationDeliveryPlan;
    }
  | {
      status:
        | "disabled"
        | "topic-disabled"
        | "channel-disabled"
        | "permission-required"
        | "duplicate"
        | "unavailable";
    };

const MAX_ID_LENGTH = 128;
const MAX_DEDUPE_LENGTH = 128;
const OPAQUE_DEDUPE_PATTERN = /^[A-Za-z0-9_-]{32,128}$/u;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCanonicalId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_ID_LENGTH &&
    value === value.trim() &&
    !/[\u0000-\u001f\u007f]/u.test(value)
  );
}

function isOpaqueDedupeKey(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= MAX_DEDUPE_LENGTH &&
    OPAQUE_DEDUPE_PATTERN.test(value)
  );
}

function isApprovedTopic(value: unknown): value is NotificationTopic {
  return (
    typeof value === "string" &&
    NOTIFICATION_TOPICS.includes(value as NotificationTopic)
  );
}

function isApprovedChannel(value: unknown): value is NotificationChannel {
  return (
    typeof value === "string" &&
    NOTIFICATION_CHANNELS.includes(value as NotificationChannel)
  );
}

function parseApprovedSelection<T extends string>(
  value: unknown,
  approved: readonly T[],
): T[] | null {
  if (
    !Array.isArray(value) ||
    value.length > approved.length ||
    !value.every(
      (candidate): candidate is T =>
        typeof candidate === "string" &&
        approved.includes(candidate as T),
    ) ||
    new Set(value).size !== value.length
  ) {
    return null;
  }

  return [...value];
}

function isSupportedTimezone(timezone: unknown): timezone is string {
  if (
    typeof timezone !== "string" ||
    timezone.length === 0 ||
    timezone.length > 100 ||
    timezone !== timezone.trim() ||
    /[\u0000-\u001f\u007f]/u.test(timezone)
  ) {
    return false;
  }

  try {
    new Intl.DateTimeFormat("en-AU", { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

function isMinuteOfDay(value: unknown): value is number {
  return (
    Number.isInteger(value) &&
    (value as number) >= 0 &&
    (value as number) < 24 * 60
  );
}

function hasValidQuietHoursShape({
  quietHoursEnabled,
  quietStartMinute,
  quietEndMinute,
}: {
  quietHoursEnabled: unknown;
  quietStartMinute: unknown;
  quietEndMinute: unknown;
}) {
  if (quietHoursEnabled === true) {
    return (
      isMinuteOfDay(quietStartMinute) &&
      isMinuteOfDay(quietEndMinute) &&
      quietStartMinute !== quietEndMinute
    );
  }

  return (
    quietHoursEnabled === false &&
    quietStartMinute === null &&
    quietEndMinute === null
  );
}

function parseMembership(
  value: unknown,
  userId: string,
  homeId: string,
): NotificationMembershipEvidence | null {
  if (
    !isRecord(value) ||
    !isCanonicalId(value.id) ||
    value.userId !== userId ||
    value.homeId !== homeId ||
    value.active !== true
  ) {
    return null;
  }

  return {
    id: value.id,
    userId,
    homeId,
    active: true,
  };
}

function parseStoredPreferences(
  value: unknown,
): NotificationPreferences | null {
  if (
    !isRecord(value) ||
    !isCanonicalId(value.id) ||
    !Number.isSafeInteger(value.revision) ||
    (value.revision as number) < 0 ||
    !isCanonicalId(value.userId) ||
    !isCanonicalId(value.homeId) ||
    typeof value.enabled !== "boolean" ||
    !isSupportedTimezone(value.timezone) ||
    typeof value.quietHoursEnabled !== "boolean"
  ) {
    return null;
  }

  const topics = parseApprovedSelection(
    value.topics,
    NOTIFICATION_TOPICS,
  );
  const channels = parseApprovedSelection(
    value.channels,
    NOTIFICATION_CHANNELS,
  );
  if (
    topics === null ||
    channels === null ||
    !hasValidQuietHoursShape({
      quietHoursEnabled: value.quietHoursEnabled,
      quietStartMinute: value.quietStartMinute,
      quietEndMinute: value.quietEndMinute,
    })
  ) {
    return null;
  }

  return {
    id: value.id,
    revision: value.revision as number,
    userId: value.userId,
    homeId: value.homeId,
    enabled: value.enabled,
    timezone: value.timezone,
    topics,
    channels,
    quietHoursEnabled: value.quietHoursEnabled,
    quietStartMinute:
      value.quietHoursEnabled === true
        ? (value.quietStartMinute as number)
        : null,
    quietEndMinute:
      value.quietHoursEnabled === true
        ? (value.quietEndMinute as number)
        : null,
  };
}

function parsePermissionEvidence({
  value,
  userId,
  homeId,
  channel,
}: {
  value: unknown;
  userId: string;
  homeId: string;
  channel: NotificationChannel;
}): NotificationPermissionEvidence | null {
  if (
    !isRecord(value) ||
    !isCanonicalId(value.deviceId) ||
    value.userId !== userId ||
    value.homeId !== homeId ||
    value.channel !== channel ||
    !["GRANTED", "DENIED", "NOT_DETERMINED"].includes(
      value.state as string,
    ) ||
    typeof value.registrationActive !== "boolean"
  ) {
    return null;
  }

  return {
    deviceId: value.deviceId,
    userId,
    homeId,
    channel,
    state: value.state as NotificationPermissionEvidence["state"],
    registrationActive: value.registrationActive,
  };
}

function parseDedupeEvidence(
  value: unknown,
  dedupeKey: string,
): NotificationDedupeEvidence | null {
  if (
    !isRecord(value) ||
    value.dedupeKey !== dedupeKey ||
    typeof value.consumed !== "boolean"
  ) {
    return null;
  }

  return {
    dedupeKey,
    consumed: value.consumed,
  };
}

function localMinuteForInstant(
  scheduledAt: unknown,
  timezone: string,
): number | null {
  if (typeof scheduledAt !== "string") {
    return null;
  }

  const instant = Date.parse(scheduledAt);
  if (!Number.isFinite(instant)) {
    return null;
  }

  try {
    const parts = new Intl.DateTimeFormat("en-AU", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(instant));
    const hour = Number(parts.find((part) => part.type === "hour")?.value);
    const minute = Number(
      parts.find((part) => part.type === "minute")?.value,
    );
    return Number.isInteger(hour) &&
      hour >= 0 &&
      hour < 24 &&
      Number.isInteger(minute) &&
      minute >= 0 &&
      minute < 60
      ? hour * 60 + minute
      : null;
  } catch {
    return null;
  }
}

export function decideNotificationPreferences({
  currentUserId,
  selectedHomeId,
  membership,
  input,
}: {
  currentUserId: string;
  selectedHomeId: string;
  membership: NotificationMembershipEvidence;
  input: unknown;
}): NotificationPreferenceDecision {
  if (
    !isCanonicalId(currentUserId) ||
    !isCanonicalId(selectedHomeId) ||
    parseMembership(
      membership,
      currentUserId,
      selectedHomeId,
    ) === null ||
    !isRecord(input) ||
    !isCanonicalId(input.id) ||
    !Number.isSafeInteger(input.revision) ||
    (input.revision as number) < 0 ||
    input.userId !== currentUserId ||
    input.homeId !== selectedHomeId ||
    typeof input.enabled !== "boolean" ||
    typeof input.quietHoursEnabled !== "boolean"
  ) {
    return { status: "unavailable" };
  }

  if (!isSupportedTimezone(input.timezone)) {
    return { status: "invalid-timezone" };
  }

  const topics = parseApprovedSelection(
    input.topics,
    NOTIFICATION_TOPICS,
  );
  const channels = parseApprovedSelection(
    input.channels,
    NOTIFICATION_CHANNELS,
  );
  if (topics === null || channels === null) {
    return { status: "invalid-selection" };
  }

  if (
    !hasValidQuietHoursShape({
      quietHoursEnabled: input.quietHoursEnabled,
      quietStartMinute: input.quietStartMinute,
      quietEndMinute: input.quietEndMinute,
    })
  ) {
    return { status: "invalid-quiet-hours" };
  }

  return {
    status: "preferences-accepted",
    userId: currentUserId,
    homeId: selectedHomeId,
    membershipId: membership.id,
    expectedRevision: input.revision as number,
    preferences: {
      id: input.id,
      revision: input.revision as number,
      userId: currentUserId,
      homeId: selectedHomeId,
      enabled: input.enabled,
      timezone: input.timezone,
      topics,
      channels,
      quietHoursEnabled: input.quietHoursEnabled,
      quietStartMinute:
        input.quietHoursEnabled === true
          ? (input.quietStartMinute as number)
          : null,
      quietEndMinute:
        input.quietHoursEnabled === true
          ? (input.quietEndMinute as number)
          : null,
    },
  };
}

export function isWithinQuietHours({
  localMinute,
  quietStartMinute,
  quietEndMinute,
}: {
  localMinute: number;
  quietStartMinute: number;
  quietEndMinute: number;
}) {
  if (
    !isMinuteOfDay(localMinute) ||
    !isMinuteOfDay(quietStartMinute) ||
    !isMinuteOfDay(quietEndMinute) ||
    quietStartMinute === quietEndMinute
  ) {
    return false;
  }

  return quietStartMinute < quietEndMinute
    ? localMinute >= quietStartMinute && localMinute < quietEndMinute
    : localMinute >= quietStartMinute || localMinute < quietEndMinute;
}

function minutesUntilQuietEnd(
  localMinute: number,
  quietEndMinute: number,
) {
  const delay = quietEndMinute - localMinute;
  return delay > 0 ? delay : delay + 24 * 60;
}

export function decideNotificationDelivery({
  preferences,
  currentUserId,
  selectedHomeId,
  membership,
  occurrenceId,
  topic,
  channel,
  scheduledAt,
  permission,
  dedupeKey,
  dedupe,
}: {
  preferences: unknown;
  currentUserId: string;
  selectedHomeId: string;
  membership: NotificationMembershipEvidence;
  occurrenceId: string;
  topic: NotificationTopic;
  channel: NotificationChannel;
  scheduledAt: string;
  permission: NotificationPermissionEvidence;
  dedupeKey: string;
  dedupe: NotificationDedupeEvidence;
}): NotificationDeliveryDecision {
  if (
    !isCanonicalId(currentUserId) ||
    !isCanonicalId(selectedHomeId) ||
    !isCanonicalId(occurrenceId) ||
    !isApprovedTopic(topic) ||
    !isApprovedChannel(channel) ||
    !isOpaqueDedupeKey(dedupeKey)
  ) {
    return { status: "unavailable" };
  }

  const parsedMembership = parseMembership(
    membership,
    currentUserId,
    selectedHomeId,
  );
  const parsedPreferences = parseStoredPreferences(preferences);
  const parsedPermission = parsePermissionEvidence({
    value: permission,
    userId: currentUserId,
    homeId: selectedHomeId,
    channel,
  });
  const parsedDedupe = parseDedupeEvidence(dedupe, dedupeKey);
  if (
    parsedMembership === null ||
    parsedPreferences === null ||
    parsedPermission === null ||
    parsedDedupe === null ||
    parsedPreferences.userId !== currentUserId ||
    parsedPreferences.homeId !== selectedHomeId
  ) {
    return { status: "unavailable" };
  }

  const localMinute = localMinuteForInstant(
    scheduledAt,
    parsedPreferences.timezone,
  );
  if (localMinute === null) {
    return { status: "unavailable" };
  }

  if (!parsedPreferences.enabled) {
    return { status: "disabled" };
  }

  if (!parsedPreferences.topics.includes(topic)) {
    return { status: "topic-disabled" };
  }

  if (!parsedPreferences.channels.includes(channel)) {
    return { status: "channel-disabled" };
  }

  if (
    parsedPermission.state !== "GRANTED" ||
    parsedPermission.registrationActive !== true
  ) {
    return { status: "permission-required" };
  }

  if (parsedDedupe.consumed) {
    return { status: "duplicate" };
  }

  const delivery: NotificationDeliveryPlan = {
    preferenceId: parsedPreferences.id,
    preferenceRevision: parsedPreferences.revision,
    userId: currentUserId,
    homeId: selectedHomeId,
    membershipId: parsedMembership.id,
    deviceId: parsedPermission.deviceId,
    occurrenceId,
    topic,
    channel,
    scheduledAt,
    dedupeKey,
  };

  if (
    parsedPreferences.quietHoursEnabled &&
    isWithinQuietHours({
      localMinute,
      quietStartMinute: parsedPreferences.quietStartMinute as number,
      quietEndMinute: parsedPreferences.quietEndMinute as number,
    })
  ) {
    return {
      status: "defer-for-quiet-hours",
      delayMinutes: minutesUntilQuietEnd(
        localMinute,
        parsedPreferences.quietEndMinute as number,
      ),
      delivery,
    };
  }

  return { status: "deliver", delivery };
}
