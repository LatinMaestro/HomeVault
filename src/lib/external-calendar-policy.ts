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

export const CALENDAR_SCOPES = ["EVENTS_WRITE_SELECTED_CALENDAR"] as const;

export const MAX_CALENDAR_AUTHORIZATION_TTL_MINUTES = 15;
export const MAX_CALENDAR_RECONFIRMATION_TTL_MINUTES = 15;
export const MAX_CALENDAR_MAPPINGS_PER_REVOCATION = 1_000;

const MAX_IDENTIFIER_LENGTH = 128;
const MAX_EXTERNAL_IDENTIFIER_LENGTH = 256;
const MIN_OPAQUE_KEY_LENGTH = 32;
const MAX_OPAQUE_KEY_LENGTH = 128;

export type CalendarConnectionProvider =
  (typeof CALENDAR_CONNECTION_PROVIDERS)[number];
export type CalendarSyncTopic = (typeof CALENDAR_SYNC_TOPICS)[number];
export type CalendarScope = (typeof CALENDAR_SCOPES)[number];

export type CalendarSessionEvidence = {
  id: string;
  userId: string;
  verified: boolean;
  expiresAt: Date;
};

export type CalendarMembershipEvidence = {
  id: string;
  userId: string;
  homeId: string;
  active: boolean;
};

export type CalendarCredentialEvidence = {
  id: string;
  userId: string;
  purpose: "calendar-connect" | "calendar-revoke";
  verifiedAt: Date;
  expiresAt: Date;
  consumed: boolean;
};

export type CalendarProviderApprovalEvidence = {
  provider: CalendarConnectionProvider;
  enabled: boolean;
  scopes: readonly CalendarScope[];
  encryptedCredentialStorageApproved: boolean;
};

export type CalendarOAuthAuthorizationEvidence = {
  kind: "OAUTH";
  id: string;
  userId: string;
  provider: "GOOGLE" | "MICROSOFT";
  externalCalendarId: string;
  scopes: readonly CalendarScope[];
  stateId: string;
  nonceId: string;
  pkceVerified: boolean;
  issuerVerified: boolean;
  audienceVerified: boolean;
  signatureVerified: boolean;
  issuedAt: Date;
  expiresAt: Date;
  consumed: boolean;
};

export type CalendarNativeAuthorizationEvidence = {
  kind: "NATIVE_PERMISSION";
  id: string;
  userId: string;
  provider: "DEVICE";
  externalCalendarId: string;
  scopes: readonly CalendarScope[];
  permissionGranted: boolean;
  issuedAt: Date;
  expiresAt: Date;
  consumed: boolean;
};

export type CalendarAuthorizationEvidence =
  | CalendarOAuthAuthorizationEvidence
  | CalendarNativeAuthorizationEvidence;

export type CalendarDuplicateEvidence = {
  key: string;
  exists: boolean;
};

export type CalendarConnection = {
  id: string;
  version: number;
  userId: string;
  homeId: string;
  membershipId: string;
  authorizationId: string;
  provider: CalendarConnectionProvider;
  externalCalendarId: string;
  scopes: readonly CalendarScope[];
  topics: readonly CalendarSyncTopic[];
  status: "ACTIVE" | "REVOKED" | "ERROR";
};

export type CalendarConnectionDecision =
  | {
      status: "connection-allowed";
      plan: {
        userId: string;
        homeId: string;
        membershipId: string;
        provider: CalendarConnectionProvider;
        externalCalendarId: string;
        scopes: readonly CalendarScope[];
        topics: readonly CalendarSyncTopic[];
        direction: "HOMEVAULT_TO_CALENDAR";
        authorizationId: string;
        consumeAuthorization: true;
        credentialEvidenceId: string;
        consumeCredentialEvidence: true;
        duplicateKey: string;
        encryptRefreshCredential: boolean;
      };
    }
  | { status: "unavailable" }
  | { status: "credential-confirmation-required" }
  | { status: "provider-not-approved" }
  | { status: "authorization-required" }
  | { status: "invalid-selection" }
  | { status: "duplicate-connection" };

export type CalendarRecordEvidence = {
  id: string;
  homeId: string;
  topic: CalendarSyncTopic;
  active: boolean;
  version: number;
  occurrenceAt: Date;
};

export type CalendarEventMapping = {
  id: string;
  version: number;
  connectionId: string;
  homeId: string;
  recordId: string;
  recordVersion: number;
  occurrenceKey: string;
  topic: CalendarSyncTopic;
  externalEventId: string;
  homeVaultManaged: boolean;
};

export type CalendarSyncDecision =
  | {
      status: "create" | "update" | "delete";
      plan: {
        connectionId: string;
        connectionVersion: number;
        membershipId: string;
        provider: CalendarConnectionProvider;
        externalCalendarId: string;
        recordId: string;
        recordVersion: number;
        occurrenceKey: string;
        topic: CalendarSyncTopic;
        externalEventId: string | null;
        mappingId: string | null;
        mappingVersion: number | null;
        dedupeKey: string;
        eventContentPolicy: "MINIMUM_HOMEVAULT_DETAILS";
        compareAndSet: {
          expectedConnectionStatus: "ACTIVE";
          expectedConnectionVersion: number;
          expectedMappingVersion: number | null;
        };
      };
    }
  | { status: "disabled" }
  | { status: "duplicate" }
  | { status: "unavailable" };

export type CalendarRevocationDecision =
  | {
      status: "revoke";
      plan: {
        connectionId: string;
        connectionVersion: number;
        membershipId: string;
        credentialEvidenceId: string;
        consumeCredentialEvidence: true;
        expectedConnectionStatus: "ACTIVE";
        revokeProviderCredential: true;
        revokeCredentialEvenIfEventCleanupFails: true;
        cancelPendingJobs: true;
        removeMappings: true;
        removeExternalEventIds: string[];
        retainExternalEvents: boolean;
      };
    }
  | { status: "unavailable" }
  | { status: "credential-confirmation-required" };

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

function isExternalIdentifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_EXTERNAL_IDENTIFIER_LENGTH &&
    value === value.trim() &&
    !/[\u0000-\u001f\u007f]/u.test(value)
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

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) > 0;
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function isProvider(value: unknown): value is CalendarConnectionProvider {
  return (
    typeof value === "string" &&
    CALENDAR_CONNECTION_PROVIDERS.includes(
      value as CalendarConnectionProvider,
    )
  );
}

function isTopic(value: unknown): value is CalendarSyncTopic {
  return (
    typeof value === "string" &&
    CALENDAR_SYNC_TOPICS.includes(value as CalendarSyncTopic)
  );
}

function isScope(value: unknown): value is CalendarScope {
  return (
    typeof value === "string" &&
    CALENDAR_SCOPES.includes(value as CalendarScope)
  );
}

function isUniqueSelection<T extends string>(
  value: unknown,
  approved: readonly T[],
  allowEmpty: boolean,
): value is readonly T[] {
  return (
    Array.isArray(value) &&
    (allowEmpty || value.length > 0) &&
    value.length <= approved.length &&
    value.every(
      (entry): entry is T =>
        typeof entry === "string" && approved.includes(entry as T),
    ) &&
    new Set(value).size === value.length
  );
}

function parseSession(value: unknown): CalendarSessionEvidence | null {
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

function parseMembership(value: unknown): CalendarMembershipEvidence | null {
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

function parseCredential(
  value: unknown,
): CalendarCredentialEvidence | null {
  if (
    !isRecord(value) ||
    !isOpaqueKey(value.id) ||
    !isCanonicalIdentifier(value.userId) ||
    !["calendar-connect", "calendar-revoke"].includes(value.purpose as string) ||
    !isValidDate(value.verifiedAt) ||
    !isValidDate(value.expiresAt) ||
    !isExactBoolean(value.consumed)
  ) {
    return null;
  }

  return {
    id: value.id,
    userId: value.userId,
    purpose: value.purpose as CalendarCredentialEvidence["purpose"],
    verifiedAt: value.verifiedAt,
    expiresAt: value.expiresAt,
    consumed: value.consumed,
  };
}

function validCredentialForPurpose({
  credential,
  userId,
  purpose,
  now,
}: {
  credential: CalendarCredentialEvidence;
  userId: string;
  purpose: CalendarCredentialEvidence["purpose"];
  now: Date;
}) {
  return (
    credential.userId === userId &&
    credential.purpose === purpose &&
    credential.consumed === false &&
    credential.verifiedAt.getTime() <= now.getTime() &&
    credential.expiresAt.getTime() > now.getTime() &&
    credential.expiresAt.getTime() > credential.verifiedAt.getTime() &&
    credential.expiresAt.getTime() - credential.verifiedAt.getTime() <=
      MAX_CALENDAR_RECONFIRMATION_TTL_MINUTES * 60 * 1000
  );
}

function parseApproval(
  value: unknown,
): CalendarProviderApprovalEvidence | null {
  if (
    !isRecord(value) ||
    !isProvider(value.provider) ||
    !isExactBoolean(value.enabled) ||
    !isUniqueSelection(value.scopes, CALENDAR_SCOPES, false) ||
    !isExactBoolean(value.encryptedCredentialStorageApproved)
  ) {
    return null;
  }

  return {
    provider: value.provider,
    enabled: value.enabled,
    scopes: value.scopes,
    encryptedCredentialStorageApproved:
      value.encryptedCredentialStorageApproved,
  };
}

function parseAuthorization(
  value: unknown,
): CalendarAuthorizationEvidence | null {
  if (
    !isRecord(value) ||
    !["OAUTH", "NATIVE_PERMISSION"].includes(value.kind as string) ||
    !isOpaqueKey(value.id) ||
    !isCanonicalIdentifier(value.userId) ||
    !isProvider(value.provider) ||
    !isExternalIdentifier(value.externalCalendarId) ||
    !isUniqueSelection(value.scopes, CALENDAR_SCOPES, false) ||
    !isValidDate(value.issuedAt) ||
    !isValidDate(value.expiresAt) ||
    !isExactBoolean(value.consumed)
  ) {
    return null;
  }

  if (
    value.kind === "OAUTH" &&
    (value.provider === "GOOGLE" || value.provider === "MICROSOFT") &&
    isOpaqueKey(value.stateId) &&
    isOpaqueKey(value.nonceId) &&
    isExactBoolean(value.pkceVerified) &&
    isExactBoolean(value.issuerVerified) &&
    isExactBoolean(value.audienceVerified) &&
    isExactBoolean(value.signatureVerified)
  ) {
    return {
      kind: "OAUTH",
      id: value.id,
      userId: value.userId,
      provider: value.provider,
      externalCalendarId: value.externalCalendarId,
      scopes: value.scopes,
      stateId: value.stateId,
      nonceId: value.nonceId,
      pkceVerified: value.pkceVerified,
      issuerVerified: value.issuerVerified,
      audienceVerified: value.audienceVerified,
      signatureVerified: value.signatureVerified,
      issuedAt: value.issuedAt,
      expiresAt: value.expiresAt,
      consumed: value.consumed,
    };
  }

  if (
    value.kind === "NATIVE_PERMISSION" &&
    value.provider === "DEVICE" &&
    isExactBoolean(value.permissionGranted)
  ) {
    return {
      kind: "NATIVE_PERMISSION",
      id: value.id,
      userId: value.userId,
      provider: "DEVICE",
      externalCalendarId: value.externalCalendarId,
      scopes: value.scopes,
      permissionGranted: value.permissionGranted,
      issuedAt: value.issuedAt,
      expiresAt: value.expiresAt,
      consumed: value.consumed,
    };
  }

  return null;
}

function validAuthorization({
  authorization,
  userId,
  provider,
  externalCalendarId,
  now,
}: {
  authorization: CalendarAuthorizationEvidence;
  userId: string;
  provider: CalendarConnectionProvider;
  externalCalendarId: string;
  now: Date;
}) {
  const baseValid =
    authorization.userId === userId &&
    authorization.provider === provider &&
    authorization.externalCalendarId === externalCalendarId &&
    authorization.consumed === false &&
    authorization.issuedAt.getTime() <= now.getTime() &&
    authorization.expiresAt.getTime() > now.getTime() &&
    authorization.expiresAt.getTime() > authorization.issuedAt.getTime() &&
    authorization.expiresAt.getTime() - authorization.issuedAt.getTime() <=
      MAX_CALENDAR_AUTHORIZATION_TTL_MINUTES * 60 * 1000 &&
    authorization.scopes.length === 1 &&
    authorization.scopes[0] === "EVENTS_WRITE_SELECTED_CALENDAR";

  if (!baseValid) {
    return false;
  }

  if (authorization.kind === "OAUTH") {
    return (
      authorization.pkceVerified === true &&
      authorization.issuerVerified === true &&
      authorization.audienceVerified === true &&
      authorization.signatureVerified === true
    );
  }

  return authorization.permissionGranted === true;
}

function parseDuplicate(
  value: unknown,
): CalendarDuplicateEvidence | null {
  if (
    !isRecord(value) ||
    !isOpaqueKey(value.key) ||
    !isExactBoolean(value.exists)
  ) {
    return null;
  }

  return { key: value.key, exists: value.exists };
}

export function decideCalendarConnection({
  currentUserId,
  selectedHomeId,
  session: rawSession,
  membership: rawMembership,
  credential: rawCredential,
  approval: rawApproval,
  authorization: rawAuthorization,
  provider,
  externalCalendarId,
  topics,
  duplicate: rawDuplicate,
  now = new Date(),
}: {
  currentUserId: string;
  selectedHomeId: string;
  session: CalendarSessionEvidence;
  membership: CalendarMembershipEvidence;
  credential: CalendarCredentialEvidence;
  approval: CalendarProviderApprovalEvidence;
  authorization: CalendarAuthorizationEvidence;
  provider: CalendarConnectionProvider;
  externalCalendarId: string;
  topics: readonly CalendarSyncTopic[];
  duplicate: CalendarDuplicateEvidence;
  now?: Date;
}): CalendarConnectionDecision {
  const session = parseSession(rawSession);
  const membership = parseMembership(rawMembership);
  const credential = parseCredential(rawCredential);
  const approval = parseApproval(rawApproval);
  const authorization = parseAuthorization(rawAuthorization);
  const duplicate = parseDuplicate(rawDuplicate);

  if (
    !isCanonicalIdentifier(currentUserId) ||
    !isCanonicalIdentifier(selectedHomeId) ||
    !isProvider(provider) ||
    !isExternalIdentifier(externalCalendarId) ||
    !session ||
    !membership ||
    !credential ||
    !approval ||
    !authorization ||
    !duplicate ||
    !isValidDate(now) ||
    session.userId !== currentUserId ||
    session.verified !== true ||
    session.expiresAt.getTime() <= now.getTime() ||
    membership.userId !== currentUserId ||
    membership.homeId !== selectedHomeId ||
    membership.active !== true
  ) {
    return { status: "unavailable" };
  }

  if (
    !validCredentialForPurpose({
      credential,
      userId: currentUserId,
      purpose: "calendar-connect",
      now,
    })
  ) {
    return { status: "credential-confirmation-required" };
  }

  if (
    approval.provider !== provider ||
    approval.enabled !== true ||
    approval.encryptedCredentialStorageApproved !== true ||
    approval.scopes.length !== 1 ||
    approval.scopes[0] !== "EVENTS_WRITE_SELECTED_CALENDAR"
  ) {
    return { status: "provider-not-approved" };
  }

  if (
    !validAuthorization({
      authorization,
      userId: currentUserId,
      provider,
      externalCalendarId,
      now,
    })
  ) {
    return { status: "authorization-required" };
  }

  if (!isUniqueSelection(topics, CALENDAR_SYNC_TOPICS, false)) {
    return { status: "invalid-selection" };
  }

  if (duplicate.exists) {
    return { status: "duplicate-connection" };
  }

  return {
    status: "connection-allowed",
    plan: {
      userId: currentUserId,
      homeId: selectedHomeId,
      membershipId: membership.id,
      provider,
      externalCalendarId,
      scopes: ["EVENTS_WRITE_SELECTED_CALENDAR"],
      topics: [...topics],
      direction: "HOMEVAULT_TO_CALENDAR",
      authorizationId: authorization.id,
      consumeAuthorization: true,
      credentialEvidenceId: credential.id,
      consumeCredentialEvidence: true,
      duplicateKey: duplicate.key,
      encryptRefreshCredential: provider !== "DEVICE",
    },
  };
}

function parseConnection(value: unknown): CalendarConnection | null {
  if (
    !isRecord(value) ||
    !isCanonicalIdentifier(value.id) ||
    !isPositiveInteger(value.version) ||
    !isCanonicalIdentifier(value.userId) ||
    !isCanonicalIdentifier(value.homeId) ||
    !isCanonicalIdentifier(value.membershipId) ||
    !isOpaqueKey(value.authorizationId) ||
    !isProvider(value.provider) ||
    !isExternalIdentifier(value.externalCalendarId) ||
    !isUniqueSelection(value.scopes, CALENDAR_SCOPES, false) ||
    !isUniqueSelection(value.topics, CALENDAR_SYNC_TOPICS, false) ||
    !["ACTIVE", "REVOKED", "ERROR"].includes(value.status as string)
  ) {
    return null;
  }

  return {
    id: value.id,
    version: value.version,
    userId: value.userId,
    homeId: value.homeId,
    membershipId: value.membershipId,
    authorizationId: value.authorizationId,
    provider: value.provider,
    externalCalendarId: value.externalCalendarId,
    scopes: value.scopes,
    topics: value.topics,
    status: value.status as CalendarConnection["status"],
  };
}

function parseCalendarRecord(
  value: unknown,
): CalendarRecordEvidence | null {
  if (
    !isRecord(value) ||
    !isCanonicalIdentifier(value.id) ||
    !isCanonicalIdentifier(value.homeId) ||
    !isTopic(value.topic) ||
    !isExactBoolean(value.active) ||
    !isPositiveInteger(value.version) ||
    !isValidDate(value.occurrenceAt)
  ) {
    return null;
  }

  return {
    id: value.id,
    homeId: value.homeId,
    topic: value.topic,
    active: value.active,
    version: value.version,
    occurrenceAt: value.occurrenceAt,
  };
}

function parseMapping(value: unknown): CalendarEventMapping | null {
  if (
    !isRecord(value) ||
    !isCanonicalIdentifier(value.id) ||
    !isPositiveInteger(value.version) ||
    !isCanonicalIdentifier(value.connectionId) ||
    !isCanonicalIdentifier(value.homeId) ||
    !isCanonicalIdentifier(value.recordId) ||
    !isPositiveInteger(value.recordVersion) ||
    !isOpaqueKey(value.occurrenceKey) ||
    !isTopic(value.topic) ||
    !isExternalIdentifier(value.externalEventId) ||
    !isExactBoolean(value.homeVaultManaged)
  ) {
    return null;
  }

  return {
    id: value.id,
    version: value.version,
    connectionId: value.connectionId,
    homeId: value.homeId,
    recordId: value.recordId,
    recordVersion: value.recordVersion,
    occurrenceKey: value.occurrenceKey,
    topic: value.topic,
    externalEventId: value.externalEventId,
    homeVaultManaged: value.homeVaultManaged,
  };
}

export function decideCalendarSync({
  connection: rawConnection,
  membership: rawMembership,
  record: rawRecord,
  occurrenceKey,
  mapping: rawMapping,
  dedupe: rawDedupe,
}: {
  connection: CalendarConnection;
  membership: CalendarMembershipEvidence;
  record: CalendarRecordEvidence;
  occurrenceKey: string;
  mapping?: CalendarEventMapping | null;
  dedupe: CalendarDuplicateEvidence;
}): CalendarSyncDecision {
  const connection = parseConnection(rawConnection);
  const membership = parseMembership(rawMembership);
  const record = parseCalendarRecord(rawRecord);
  const mapping =
    rawMapping === null || rawMapping === undefined
      ? null
      : parseMapping(rawMapping);
  const dedupe = parseDuplicate(rawDedupe);

  if (
    !connection ||
    !membership ||
    !record ||
    !isOpaqueKey(occurrenceKey) ||
    !dedupe ||
    (rawMapping !== null && rawMapping !== undefined && !mapping) ||
    membership.id !== connection.membershipId ||
    membership.userId !== connection.userId ||
    membership.homeId !== connection.homeId ||
    record.homeId !== connection.homeId ||
    connection.scopes.length !== 1 ||
    connection.scopes[0] !== "EVENTS_WRITE_SELECTED_CALENDAR"
  ) {
    return { status: "unavailable" };
  }

  if (
    membership.active !== true ||
    connection.status !== "ACTIVE" ||
    !connection.topics.includes(record.topic)
  ) {
    return { status: "disabled" };
  }

  if (dedupe.exists) {
    return { status: "duplicate" };
  }

  if (mapping) {
    if (
      mapping.homeVaultManaged !== true ||
      mapping.connectionId !== connection.id ||
      mapping.homeId !== connection.homeId ||
      mapping.recordId !== record.id ||
      mapping.recordVersion !== record.version ||
      mapping.occurrenceKey !== occurrenceKey ||
      mapping.topic !== record.topic
    ) {
      return { status: "unavailable" };
    }
  }

  if (!record.active && !mapping) {
    return { status: "disabled" };
  }

  const status = !mapping ? "create" : record.active ? "update" : "delete";

  return {
    status,
    plan: {
      connectionId: connection.id,
      connectionVersion: connection.version,
      membershipId: membership.id,
      provider: connection.provider,
      externalCalendarId: connection.externalCalendarId,
      recordId: record.id,
      recordVersion: record.version,
      occurrenceKey,
      topic: record.topic,
      externalEventId: mapping?.externalEventId ?? null,
      mappingId: mapping?.id ?? null,
      mappingVersion: mapping?.version ?? null,
      dedupeKey: dedupe.key,
      eventContentPolicy: "MINIMUM_HOMEVAULT_DETAILS",
      compareAndSet: {
        expectedConnectionStatus: "ACTIVE",
        expectedConnectionVersion: connection.version,
        expectedMappingVersion: mapping?.version ?? null,
      },
    },
  };
}

function parseMappings(
  value: unknown,
  connection: CalendarConnection,
): CalendarEventMapping[] | null {
  if (
    !Array.isArray(value) ||
    value.length > MAX_CALENDAR_MAPPINGS_PER_REVOCATION
  ) {
    return null;
  }

  const parsed: CalendarEventMapping[] = [];
  const ids = new Set<string>();
  const externalIds = new Set<string>();

  for (const candidate of value) {
    const mapping = parseMapping(candidate);
    if (
      !mapping ||
      mapping.homeVaultManaged !== true ||
      mapping.connectionId !== connection.id ||
      mapping.homeId !== connection.homeId ||
      ids.has(mapping.id) ||
      externalIds.has(mapping.externalEventId)
    ) {
      return null;
    }

    ids.add(mapping.id);
    externalIds.add(mapping.externalEventId);
    parsed.push(mapping);
  }

  return parsed;
}

export function decideCalendarRevocation({
  connection: rawConnection,
  session: rawSession,
  membership: rawMembership,
  credential: rawCredential,
  removeManagedEvents,
  mappings: rawMappings,
  now = new Date(),
}: {
  connection: CalendarConnection;
  session: CalendarSessionEvidence;
  membership: CalendarMembershipEvidence;
  credential: CalendarCredentialEvidence;
  removeManagedEvents: boolean;
  mappings: readonly CalendarEventMapping[];
  now?: Date;
}): CalendarRevocationDecision {
  const connection = parseConnection(rawConnection);
  const session = parseSession(rawSession);
  const membership = parseMembership(rawMembership);
  const credential = parseCredential(rawCredential);

  if (
    !connection ||
    !session ||
    !membership ||
    !credential ||
    !isExactBoolean(removeManagedEvents) ||
    !isValidDate(now) ||
    session.userId !== connection.userId ||
    session.verified !== true ||
    session.expiresAt.getTime() <= now.getTime() ||
    membership.id !== connection.membershipId ||
    membership.userId !== connection.userId ||
    membership.homeId !== connection.homeId ||
    membership.active !== true ||
    connection.status !== "ACTIVE"
  ) {
    return { status: "unavailable" };
  }

  if (
    !validCredentialForPurpose({
      credential,
      userId: connection.userId,
      purpose: "calendar-revoke",
      now,
    })
  ) {
    return { status: "credential-confirmation-required" };
  }

  const mappings = parseMappings(rawMappings, connection);
  if (!mappings) {
    return { status: "unavailable" };
  }

  return {
    status: "revoke",
    plan: {
      connectionId: connection.id,
      connectionVersion: connection.version,
      membershipId: membership.id,
      credentialEvidenceId: credential.id,
      consumeCredentialEvidence: true,
      expectedConnectionStatus: "ACTIVE",
      revokeProviderCredential: true,
      revokeCredentialEvenIfEventCleanupFails: true,
      cancelPendingJobs: true,
      removeMappings: true,
      removeExternalEventIds: removeManagedEvents
        ? mappings
            .map((mapping) => mapping.externalEventId)
            .sort((left, right) => left.localeCompare(right))
        : [],
      retainExternalEvents: !removeManagedEvents,
    },
  };
}
