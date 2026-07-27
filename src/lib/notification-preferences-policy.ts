export const NOTIFICATION_TOPICS = [
  "MAINTENANCE",
  "REMINDER",
  "WARRANTY",
] as const;

export const NOTIFICATION_CHANNELS = ["LOCAL", "PUSH"] as const;

export type NotificationTopic = (typeof NOTIFICATION_TOPICS)[number];
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export type NotificationPreferences = {
  id: string;
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

export type NotificationPreferenceDecision =
  | {
      status: "preferences-accepted";
      preferences: NotificationPreferences;
    }
  | { status: "unavailable" }
  | { status: "invalid-timezone" }
  | { status: "invalid-quiet-hours" }
  | { status: "invalid-selection" };

export type NotificationDeliveryDecision =
  | {
      status: "deliver";
      channel: NotificationChannel;
      dedupeKey: string;
    }
  | {
      status: "defer-for-quiet-hours";
      channel: NotificationChannel;
      delayMinutes: number;
      dedupeKey: string;
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

function hasOnlyUniqueApprovedValues<T extends string>(
  values: readonly string[],
  approved: readonly T[],
): values is readonly T[] {
  return (
    values.length > 0 &&
    values.every((value) => approved.includes(value as T)) &&
    new Set(values).size === values.length
  );
}

function isSupportedTimezone(timezone: string) {
  if (!timezone || timezone.length > 100) {
    return false;
  }

  try {
    new Intl.DateTimeFormat("en-AU", { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

function isMinuteOfDay(value: number | null): value is number {
  return (
    value !== null &&
    Number.isInteger(value) &&
    value >= 0 &&
    value < 24 * 60
  );
}

export function decideNotificationPreferences({
  currentUserId,
  selectedHomeId,
  hasCurrentMembership,
  input,
}: {
  currentUserId: string;
  selectedHomeId: string;
  hasCurrentMembership: boolean;
  input: NotificationPreferences;
}): NotificationPreferenceDecision {
  if (
    !currentUserId ||
    !selectedHomeId ||
    !hasCurrentMembership ||
    !input.id ||
    input.userId !== currentUserId ||
    input.homeId !== selectedHomeId
  ) {
    return { status: "unavailable" };
  }

  if (!isSupportedTimezone(input.timezone)) {
    return { status: "invalid-timezone" };
  }

  if (
    !hasOnlyUniqueApprovedValues(input.topics, NOTIFICATION_TOPICS) ||
    !hasOnlyUniqueApprovedValues(input.channels, NOTIFICATION_CHANNELS)
  ) {
    return { status: "invalid-selection" };
  }

  if (input.quietHoursEnabled) {
    if (
      !isMinuteOfDay(input.quietStartMinute) ||
      !isMinuteOfDay(input.quietEndMinute) ||
      input.quietStartMinute === input.quietEndMinute
    ) {
      return { status: "invalid-quiet-hours" };
    }
  } else if (
    input.quietStartMinute !== null ||
    input.quietEndMinute !== null
  ) {
    return { status: "invalid-quiet-hours" };
  }

  return {
    status: "preferences-accepted",
    preferences: {
      ...input,
      topics: [...input.topics],
      channels: [...input.channels],
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
  topic,
  channel,
  localMinute,
  permissionGranted,
  dedupeKey,
  alreadyDelivered,
}: {
  preferences: NotificationPreferences;
  currentUserId: string;
  selectedHomeId: string;
  topic: NotificationTopic;
  channel: NotificationChannel;
  localMinute: number;
  permissionGranted: boolean;
  dedupeKey: string;
  alreadyDelivered: boolean;
}): NotificationDeliveryDecision {
  if (
    !currentUserId ||
    !selectedHomeId ||
    !dedupeKey ||
    preferences.userId !== currentUserId ||
    preferences.homeId !== selectedHomeId ||
    !isMinuteOfDay(localMinute)
  ) {
    return { status: "unavailable" };
  }

  if (!preferences.enabled) {
    return { status: "disabled" };
  }

  if (!preferences.topics.includes(topic)) {
    return { status: "topic-disabled" };
  }

  if (!preferences.channels.includes(channel)) {
    return { status: "channel-disabled" };
  }

  if (!permissionGranted) {
    return { status: "permission-required" };
  }

  if (alreadyDelivered) {
    return { status: "duplicate" };
  }

  if (
    preferences.quietHoursEnabled &&
    preferences.quietStartMinute !== null &&
    preferences.quietEndMinute !== null &&
    isWithinQuietHours({
      localMinute,
      quietStartMinute: preferences.quietStartMinute,
      quietEndMinute: preferences.quietEndMinute,
    })
  ) {
    return {
      status: "defer-for-quiet-hours",
      channel,
      delayMinutes: minutesUntilQuietEnd(
        localMinute,
        preferences.quietEndMinute,
      ),
      dedupeKey,
    };
  }

  return {
    status: "deliver",
    channel,
    dedupeKey,
  };
}
