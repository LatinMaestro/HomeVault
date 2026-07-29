import assert from "node:assert/strict";
import test from "node:test";

import {
  decideCalendarConnection,
  decideCalendarRevocation,
  decideCalendarSync,
  type CalendarAuthorizationEvidence,
  type CalendarConnection,
  type CalendarCredentialEvidence,
  type CalendarEventMapping,
  type CalendarMembershipEvidence,
  type CalendarRecordEvidence,
  type CalendarSessionEvidence,
} from "../src/external-calendar-policy";

const now = new Date("2026-07-29T05:00:00.000Z");
const sessionId = "c2Vzc2lvbl9jYWxlbmRhcl9leGFjdF8wMDE";
const credentialId = "Y3JlZGVudGlhbF9jYWxlbmRhcl8wMDE_";
const authorizationId = "YXV0aF9jYWxlbmRhcl9leGFjdF8wMDE_";
const stateId = "c3RhdGVfY2FsZW5kYXJfZXhhY3RfMDAx";
const nonceId = "bm9uY2VfY2FsZW5kYXJfZXhhY3RfMDAx";
const duplicateKey = "ZHVwbGljYXRlX2NhbGVuZGFyX2tleV8wMDE";
const occurrenceKey = "b2NjdXJyZW5jZV9jYWxlbmRhcl9rZXlfMDAx";
const operationKey = "b3BlcmF0aW9uX2NhbGVuZGFyX2tleV8wMDE";

const session: CalendarSessionEvidence = {
  id: sessionId,
  userId: "user-1",
  verified: true,
  expiresAt: new Date("2026-07-29T06:00:00.000Z"),
};

const membership: CalendarMembershipEvidence = {
  id: "member-1",
  userId: "user-1",
  homeId: "home-1",
  active: true,
};

const connectCredential: CalendarCredentialEvidence = {
  id: credentialId,
  userId: "user-1",
  purpose: "calendar-connect",
  verifiedAt: new Date("2026-07-29T04:55:00.000Z"),
  expiresAt: new Date("2026-07-29T05:10:00.000Z"),
  consumed: false,
};

const authorization: CalendarAuthorizationEvidence = {
  kind: "OAUTH",
  id: authorizationId,
  userId: "user-1",
  provider: "GOOGLE",
  externalCalendarId: "calendar-1",
  scopes: ["EVENTS_WRITE_SELECTED_CALENDAR"],
  stateId,
  nonceId,
  pkceVerified: true,
  issuerVerified: true,
  audienceVerified: true,
  signatureVerified: true,
  issuedAt: new Date("2026-07-29T04:55:00.000Z"),
  expiresAt: new Date("2026-07-29T05:10:00.000Z"),
  consumed: false,
};

function connect(overrides: Record<string, unknown> = {}) {
  return decideCalendarConnection({
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    session,
    membership,
    credential: connectCredential,
    approval: {
      provider: "GOOGLE",
      enabled: true,
      scopes: ["EVENTS_WRITE_SELECTED_CALENDAR"],
      encryptedCredentialStorageApproved: true,
    },
    authorization,
    provider: "GOOGLE",
    externalCalendarId: "calendar-1",
    topics: ["MAINTENANCE", "REMINDER"],
    duplicate: { key: duplicateKey, exists: false },
    now,
    ...overrides,
  } as Parameters<typeof decideCalendarConnection>[0]);
}

test("allows one explicit property and selected-calendar connection", () => {
  assert.deepEqual(connect(), {
    status: "connection-allowed",
    plan: {
      userId: "user-1",
      homeId: "home-1",
      membershipId: "member-1",
      provider: "GOOGLE",
      externalCalendarId: "calendar-1",
      scopes: ["EVENTS_WRITE_SELECTED_CALENDAR"],
      topics: ["MAINTENANCE", "REMINDER"],
      direction: "HOMEVAULT_TO_CALENDAR",
      authorizationId,
      consumeAuthorization: true,
      credentialEvidenceId: credentialId,
      consumeCredentialEvidence: true,
      duplicateKey,
      encryptRefreshCredential: true,
    },
  });
});

test("session and membership evidence are exact user/property bound", () => {
  assert.deepEqual(
    connect({ session: { ...session, userId: "user-2" } }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    connect({ membership: { ...membership, homeId: "home-2" } }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    connect({
      membership: {
        ...membership,
        active: "true" as unknown as boolean,
      },
    }),
    { status: "unavailable" },
  );
});

test("credential reconfirmation is short-lived, single-use and purpose-bound", () => {
  assert.deepEqual(
    connect({
      credential: { ...connectCredential, consumed: true },
    }),
    { status: "credential-confirmation-required" },
  );
  assert.deepEqual(
    connect({
      credential: {
        ...connectCredential,
        purpose: "calendar-revoke",
      },
    }),
    { status: "credential-confirmation-required" },
  );
  assert.deepEqual(
    connect({
      credential: {
        ...connectCredential,
        expiresAt: new Date("2026-07-29T05:16:00.000Z"),
      },
    }),
    { status: "credential-confirmation-required" },
  );
});

test("provider approval binds enablement, minimum scope and encrypted storage", () => {
  assert.deepEqual(
    connect({
      approval: {
        provider: "MICROSOFT",
        enabled: true,
        scopes: ["EVENTS_WRITE_SELECTED_CALENDAR"],
        encryptedCredentialStorageApproved: true,
      },
    }),
    { status: "provider-not-approved" },
  );
  assert.deepEqual(
    connect({
      approval: {
        provider: "GOOGLE",
        enabled: true,
        scopes: ["EVENTS_WRITE_SELECTED_CALENDAR"],
        encryptedCredentialStorageApproved: false,
      },
    }),
    { status: "provider-not-approved" },
  );
});

test("OAuth proof binds provider, calendar, state, nonce and exact verification", () => {
  assert.deepEqual(
    connect({
      authorization: {
        ...authorization,
        externalCalendarId: "calendar-2",
      },
    }),
    { status: "authorization-required" },
  );
  assert.deepEqual(
    connect({
      authorization: {
        ...authorization,
        pkceVerified: false,
      },
    }),
    { status: "authorization-required" },
  );
  assert.deepEqual(
    connect({
      authorization: {
        ...authorization,
        signatureVerified: "true" as unknown as boolean,
      },
    }),
    { status: "unavailable" },
  );
});

test("connection selection and deduplication fail closed at runtime", () => {
  assert.deepEqual(connect({ topics: ["REMINDER", "REMINDER"] }), {
    status: "invalid-selection",
  });
  assert.deepEqual(connect({ externalCalendarId: " calendar-1 " }), {
    status: "unavailable",
  });
  assert.deepEqual(
    connect({
      duplicate: { key: duplicateKey, exists: true },
    }),
    { status: "duplicate-connection" },
  );
  assert.deepEqual(
    connect({
      duplicate: {
        key: duplicateKey,
        exists: 1 as unknown as boolean,
      },
    }),
    { status: "unavailable" },
  );
});

const connection: CalendarConnection = {
  id: "calendar-connection-1",
  version: 4,
  userId: "user-1",
  homeId: "home-1",
  membershipId: "member-1",
  authorizationId,
  provider: "GOOGLE",
  externalCalendarId: "calendar-1",
  scopes: ["EVENTS_WRITE_SELECTED_CALENDAR"],
  topics: ["MAINTENANCE", "REMINDER"],
  status: "ACTIVE",
};

const record: CalendarRecordEvidence = {
  id: "reminder-1",
  homeId: "home-1",
  topic: "REMINDER",
  active: true,
  version: 9,
  occurrenceAt: new Date("2026-08-01T00:00:00.000Z"),
};

function sync(overrides: Record<string, unknown> = {}) {
  return decideCalendarSync({
    connection,
    membership,
    record,
    occurrenceKey,
    mapping: null,
    dedupe: { key: operationKey, exists: false },
    ...overrides,
  } as Parameters<typeof decideCalendarSync>[0]);
}

test("creates one minimum-content managed event with compare-and-set evidence", () => {
  assert.deepEqual(sync(), {
    status: "create",
    plan: {
      connectionId: "calendar-connection-1",
      connectionVersion: 4,
      membershipId: "member-1",
      provider: "GOOGLE",
      externalCalendarId: "calendar-1",
      recordId: "reminder-1",
      recordVersion: 9,
      occurrenceKey,
      topic: "REMINDER",
      externalEventId: null,
      mappingId: null,
      mappingVersion: null,
      dedupeKey: operationKey,
      eventContentPolicy: "MINIMUM_HOMEVAULT_DETAILS",
      compareAndSet: {
        expectedConnectionStatus: "ACTIVE",
        expectedConnectionVersion: 4,
        expectedMappingVersion: null,
      },
    },
  });
});

const mapping: CalendarEventMapping = {
  id: "mapping-1",
  version: 2,
  connectionId: "calendar-connection-1",
  homeId: "home-1",
  recordId: "reminder-1",
  recordVersion: 9,
  occurrenceKey,
  topic: "REMINDER",
  externalEventId: "provider-event-1",
  homeVaultManaged: true,
};

test("updates or deletes only an exact versioned HomeVault-managed mapping", () => {
  const update = sync({ mapping });
  assert.equal(update.status, "update");
  if (update.status === "update") {
    assert.equal(update.plan.externalEventId, "provider-event-1");
    assert.equal(update.plan.mappingVersion, 2);
  }

  const deletion = sync({
    mapping,
    record: { ...record, active: false },
  });
  assert.equal(deletion.status, "delete");

  assert.deepEqual(
    sync({
      mapping: { ...mapping, homeVaultManaged: false },
    }),
    { status: "unavailable" },
  );
});

test("every sync rechecks connection, membership, topic and record scope", () => {
  assert.deepEqual(
    sync({ membership: { ...membership, active: false } }),
    { status: "disabled" },
  );
  assert.deepEqual(
    sync({ connection: { ...connection, status: "REVOKED" } }),
    { status: "disabled" },
  );
  assert.deepEqual(
    sync({ record: { ...record, homeId: "home-2" } }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    sync({ record: { ...record, topic: "WARRANTY" } }),
    { status: "disabled" },
  );
});

test("mapping substitutions, stale versions and malformed evidence fail closed", () => {
  assert.deepEqual(
    sync({ mapping: { ...mapping, connectionId: "other-connection" } }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    sync({ mapping: { ...mapping, recordVersion: 8 } }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    sync({
      mapping: {
        ...mapping,
        homeVaultManaged: "true" as unknown as boolean,
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    sync({
      record: {
        ...record,
        occurrenceAt: "tomorrow" as unknown as Date,
      },
    }),
    { status: "unavailable" },
  );
});

test("duplicate operations and inactive unmapped records are non-destructive", () => {
  assert.deepEqual(
    sync({ dedupe: { key: operationKey, exists: true } }),
    { status: "duplicate" },
  );
  assert.deepEqual(sync({ record: { ...record, active: false } }), {
    status: "disabled",
  });
});

const revokeCredential: CalendarCredentialEvidence = {
  ...connectCredential,
  purpose: "calendar-revoke",
};

function revoke(overrides: Record<string, unknown> = {}) {
  return decideCalendarRevocation({
    connection,
    session,
    membership,
    credential: revokeCredential,
    removeManagedEvents: true,
    mappings: [mapping],
    now,
    ...overrides,
  } as Parameters<typeof decideCalendarRevocation>[0]);
}

test("revocation removes only exact mapped events and always revokes credentials", () => {
  assert.deepEqual(revoke(), {
    status: "revoke",
    plan: {
      connectionId: "calendar-connection-1",
      connectionVersion: 4,
      membershipId: "member-1",
      credentialEvidenceId: credentialId,
      consumeCredentialEvidence: true,
      expectedConnectionStatus: "ACTIVE",
      revokeProviderCredential: true,
      revokeCredentialEvenIfEventCleanupFails: true,
      cancelPendingJobs: true,
      removeMappings: true,
      removeExternalEventIds: ["provider-event-1"],
      retainExternalEvents: false,
    },
  });
});

test("users can retain external copies while HomeVault removes access and mappings", () => {
  const result = revoke({ removeManagedEvents: false });
  assert.equal(result.status, "revoke");
  if (result.status === "revoke") {
    assert.deepEqual(result.plan.removeExternalEventIds, []);
    assert.equal(result.plan.retainExternalEvents, true);
    assert.equal(result.plan.revokeProviderCredential, true);
    assert.equal(result.plan.removeMappings, true);
  }
});

test("revocation rechecks session, membership and purpose-bound credential evidence", () => {
  assert.deepEqual(
    revoke({ session: { ...session, verified: false } }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    revoke({ membership: { ...membership, active: false } }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    revoke({ credential: connectCredential }),
    { status: "credential-confirmation-required" },
  );
});

test("malformed, duplicate and foreign revocation mappings fail closed", () => {
  assert.deepEqual(
    revoke({ mappings: [{ ...mapping, homeId: "home-2" }] }),
    { status: "unavailable" },
  );
  assert.deepEqual(revoke({ mappings: [mapping, mapping] }), {
    status: "unavailable",
  });
  assert.deepEqual(
    revoke({
      removeManagedEvents: "true" as unknown as boolean,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    revoke({
      mappings: "not-an-array" as unknown as readonly CalendarEventMapping[],
    }),
    { status: "unavailable" },
  );
});
