export const CALENDAR_CONNECTION_PROVIDERS = [
  "DEVICE",
  "GOOGLE",
  "MICROSOFT",
] as const;

export const CALENDAR_SYNC_TOPICS = [
  "MAINTENANCE",
  "REMINDER",
  "WARRANTY",
] as const;

export type CalendarConnectionProvider =
  (typeof CALENDAR_CONNECTION_PROVIDERS)[number];
export type CalendarSyncTopic = (typeof CALENDAR_SYNC_TOPICS)[number];

export type CalendarConnection = {
  id: string;
  userId: string;
  homeId: string;
  provider: CalendarConnectionProvider;
  externalCalendarId: string;
  topics: readonly CalendarSyncTopic[];
  status: "ACTIVE" | "REVOKED" | "ERROR";
};

export type CalendarConnectionDecision =
  | {
      status: "connection-allowed";
      userId: string;
      homeId: string;
      provider: CalendarConnectionProvider;
      externalCalendarId: string;
      topics: CalendarSyncTopic[];
      direction: "HOMEVAULT_TO_CALENDAR";
    }
  | { status: "unavailable" }
  | { status: "credential-confirmation-required" }
  | { status: "provider-not-approved" }
  | { status: "invalid-selection" }
  | { status: "duplicate-connection" };

export type CalendarEventMapping = {
  id: string;
  connectionId: string;
  homeId: string;
  recordId: string;
  occurrenceKey: string;
  topic: CalendarSyncTopic;
  externalEventId: string;
  homeVaultManaged: boolean;
};

export type CalendarSyncDecision =
  | {
      status: "create";
      connectionId: string;
      dedupeKey: string;
    }
  | {
      status: "update";
      connectionId: string;
      externalEventId: string;
      dedupeKey: string;
    }
  | {
      status: "delete";
      connectionId: string;
      externalEventId: string;
      dedupeKey: string;
    }
  | { status: "disabled" }
  | { status: "duplicate" }
  | { status: "unavailable" };

export type CalendarRevocationDecision =
  | {
      status: "revoke";
      connectionId: string;
      removeExternalEventIds: string[];
    }
  | { status: "unavailable" }
  | { status: "credential-confirmation-required" };

function isApprovedProvider(
  provider: string,
): provider is CalendarConnectionProvider {
  return CALENDAR_CONNECTION_PROVIDERS.includes(
    provider as CalendarConnectionProvider,
  );
}

function hasUniqueApprovedTopics(
  topics: readonly string[],
): topics is readonly CalendarSyncTopic[] {
  return (
    topics.length > 0 &&
    topics.every((topic) =>
      CALENDAR_SYNC_TOPICS.includes(topic as CalendarSyncTopic),
    ) &&
    new Set(topics).size === topics.length
  );
}

export function decideCalendarConnection({
  currentUserId,
  selectedHomeId,
  sessionVerified,
  credentialConfirmed,
  hasCurrentMembership,
  provider,
  externalCalendarId,
  topics,
  duplicateExists,
}: {
  currentUserId: string;
  selectedHomeId: string;
  sessionVerified: boolean;
  credentialConfirmed: boolean;
  hasCurrentMembership: boolean;
  provider: string;
  externalCalendarId: string;
  topics: readonly string[];
  duplicateExists: boolean;
}): CalendarConnectionDecision {
  const normalizedCalendarId = externalCalendarId.trim();

  if (
    !currentUserId ||
    !selectedHomeId ||
    !sessionVerified ||
    !hasCurrentMembership ||
    !normalizedCalendarId
  ) {
    return { status: "unavailable" };
  }

  if (!credentialConfirmed) {
    return { status: "credential-confirmation-required" };
  }

  if (!isApprovedProvider(provider)) {
    return { status: "provider-not-approved" };
  }

  if (!hasUniqueApprovedTopics(topics)) {
    return { status: "invalid-selection" };
  }

  if (duplicateExists) {
    return { status: "duplicate-connection" };
  }

  return {
    status: "connection-allowed",
    userId: currentUserId,
    homeId: selectedHomeId,
    provider,
    externalCalendarId: normalizedCalendarId,
    topics: [...topics],
    direction: "HOMEVAULT_TO_CALENDAR",
  };
}

export function decideCalendarSync({
  connection,
  currentUserId,
  selectedHomeId,
  recordHomeId,
  recordId,
  occurrenceKey,
  topic,
  recordActive,
  mapping,
  dedupeKey,
  duplicateOperation,
}: {
  connection: CalendarConnection;
  currentUserId: string;
  selectedHomeId: string;
  recordHomeId: string;
  recordId: string;
  occurrenceKey: string;
  topic: CalendarSyncTopic;
  recordActive: boolean;
  mapping?: CalendarEventMapping | null;
  dedupeKey: string;
  duplicateOperation: boolean;
}): CalendarSyncDecision {
  if (
    !connection.id ||
    !currentUserId ||
    !selectedHomeId ||
    !recordId ||
    !occurrenceKey ||
    !dedupeKey ||
    connection.userId !== currentUserId ||
    connection.homeId !== selectedHomeId ||
    recordHomeId !== selectedHomeId
  ) {
    return { status: "unavailable" };
  }

  if (
    connection.status !== "ACTIVE" ||
    !connection.topics.includes(topic)
  ) {
    return { status: "disabled" };
  }

  if (duplicateOperation) {
    return { status: "duplicate" };
  }

  if (mapping) {
    if (
      !mapping.id ||
      !mapping.externalEventId ||
      !mapping.recordId ||
      !mapping.occurrenceKey ||
      !mapping.homeVaultManaged ||
      mapping.connectionId !== connection.id ||
      mapping.homeId !== selectedHomeId ||
      mapping.recordId !== recordId ||
      mapping.occurrenceKey !== occurrenceKey ||
      mapping.topic !== topic
    ) {
      return { status: "unavailable" };
    }

    return recordActive
      ? {
          status: "update",
          connectionId: connection.id,
          externalEventId: mapping.externalEventId,
          dedupeKey,
        }
      : {
          status: "delete",
          connectionId: connection.id,
          externalEventId: mapping.externalEventId,
          dedupeKey,
        };
  }

  return recordActive
    ? {
        status: "create",
        connectionId: connection.id,
        dedupeKey,
      }
    : { status: "disabled" };
}

export function decideCalendarRevocation({
  connection,
  currentUserId,
  selectedHomeId,
  sessionVerified,
  credentialConfirmed,
  removeManagedEvents,
  mappings,
}: {
  connection: CalendarConnection;
  currentUserId: string;
  selectedHomeId: string;
  sessionVerified: boolean;
  credentialConfirmed: boolean;
  removeManagedEvents: boolean;
  mappings: readonly CalendarEventMapping[];
}): CalendarRevocationDecision {
  if (
    !connection.id ||
    !currentUserId ||
    !selectedHomeId ||
    !sessionVerified ||
    connection.userId !== currentUserId ||
    connection.homeId !== selectedHomeId ||
    connection.status !== "ACTIVE"
  ) {
    return { status: "unavailable" };
  }

  if (!credentialConfirmed) {
    return { status: "credential-confirmation-required" };
  }

  const malformedMapping = mappings.some(
    (mapping, index) =>
      !mapping.id ||
      !mapping.externalEventId ||
      !mapping.recordId ||
      !mapping.occurrenceKey ||
      !mapping.homeVaultManaged ||
      mapping.connectionId !== connection.id ||
      mapping.homeId !== selectedHomeId ||
      mappings.findIndex(
        (candidate) =>
          candidate.id === mapping.id ||
          candidate.externalEventId === mapping.externalEventId,
      ) !== index,
  );

  if (malformedMapping) {
    return { status: "unavailable" };
  }

  return {
    status: "revoke",
    connectionId: connection.id,
    removeExternalEventIds: removeManagedEvents
      ? mappings.map((mapping) => mapping.externalEventId).sort()
      : [],
  };
}
