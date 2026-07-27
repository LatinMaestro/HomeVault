import assert from "node:assert/strict";
import test from "node:test";

import {
  decideCalendarConnection,
  decideCalendarRevocation,
  decideCalendarSync,
  type CalendarConnection,
  type CalendarEventMapping,
} from "../src/lib/external-calendar-policy";

const connection: CalendarConnection = {
  id: "calendar-connection-1",
  userId: "user-1",
  homeId: "home-1",
  provider: "GOOGLE",
  externalCalendarId: "calendar-1",
  topics: ["MAINTENANCE", "REMINDER"],
  status: "ACTIVE",
};

test("allows an explicit one-way property calendar connection", () => {
  assert.deepEqual(
    decideCalendarConnection({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      sessionVerified: true,
      credentialConfirmed: true,
      hasCurrentMembership: true,
      provider: "GOOGLE",
      externalCalendarId: " calendar-1 ",
      topics: ["MAINTENANCE", "REMINDER"],
      duplicateExists: false,
    }),
    {
      status: "connection-allowed",
      userId: "user-1",
      homeId: "home-1",
      provider: "GOOGLE",
      externalCalendarId: "calendar-1",
      topics: ["MAINTENANCE", "REMINDER"],
      direction: "HOMEVAULT_TO_CALENDAR",
    },
  );
});

test("rejects foreign, unreconfirmed, unapproved and duplicate connections", () => {
  const input = {
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    sessionVerified: true,
    credentialConfirmed: true,
    hasCurrentMembership: true,
    provider: "GOOGLE",
    externalCalendarId: "calendar-1",
    topics: ["REMINDER"],
    duplicateExists: false,
  };

  assert.deepEqual(
    decideCalendarConnection({
      ...input,
      hasCurrentMembership: false,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideCalendarConnection({
      ...input,
      credentialConfirmed: false,
    }),
    { status: "credential-confirmation-required" },
  );
  assert.deepEqual(
    decideCalendarConnection({
      ...input,
      provider: "UNAPPROVED",
    }),
    { status: "provider-not-approved" },
  );
  assert.deepEqual(
    decideCalendarConnection({
      ...input,
      topics: ["REMINDER", "REMINDER"],
    }),
    { status: "invalid-selection" },
  );
  assert.deepEqual(
    decideCalendarConnection({
      ...input,
      duplicateExists: true,
    }),
    { status: "duplicate-connection" },
  );
});

test("creates one managed event for an enabled property record", () => {
  assert.deepEqual(
    decideCalendarSync({
      connection,
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      recordHomeId: "home-1",
      recordId: "reminder-1",
      topic: "REMINDER",
      recordActive: true,
      dedupeKey: "calendar-dedupe-1",
      duplicateOperation: false,
    }),
    {
      status: "create",
      connectionId: "calendar-connection-1",
      dedupeKey: "calendar-dedupe-1",
    },
  );
});

const mapping: CalendarEventMapping = {
  id: "mapping-1",
  connectionId: "calendar-connection-1",
  homeId: "home-1",
  recordId: "reminder-1",
  topic: "REMINDER",
  externalEventId: "external-event-1",
  homeVaultManaged: true,
};

test("updates or deletes only the exact HomeVault-managed event", () => {
  const sync = {
    connection,
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    recordHomeId: "home-1",
    recordId: "reminder-1",
    topic: "REMINDER" as const,
    recordActive: true,
    mapping,
    dedupeKey: "calendar-dedupe-1",
    duplicateOperation: false,
  };

  assert.deepEqual(decideCalendarSync(sync), {
    status: "update",
    connectionId: "calendar-connection-1",
    externalEventId: "external-event-1",
    dedupeKey: "calendar-dedupe-1",
  });
  assert.deepEqual(
    decideCalendarSync({ ...sync, recordActive: false }),
    {
      status: "delete",
      connectionId: "calendar-connection-1",
      externalEventId: "external-event-1",
      dedupeKey: "calendar-dedupe-1",
    },
  );
  assert.deepEqual(
    decideCalendarSync({
      ...sync,
      mapping: { ...mapping, homeVaultManaged: false },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideCalendarSync({
      ...sync,
      selectedHomeId: "other-home",
    }),
    { status: "unavailable" },
  );
});

test("deduplicates operations and disables unselected topics", () => {
  const sync = {
    connection,
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    recordHomeId: "home-1",
    recordId: "warranty-1",
    topic: "WARRANTY" as const,
    recordActive: true,
    dedupeKey: "calendar-dedupe-1",
    duplicateOperation: false,
  };

  assert.deepEqual(decideCalendarSync(sync), {
    status: "disabled",
  });
  assert.deepEqual(
    decideCalendarSync({
      ...sync,
      topic: "REMINDER",
      duplicateOperation: true,
    }),
    { status: "duplicate" },
  );
});

test("revocation optionally removes only mapped HomeVault events", () => {
  assert.deepEqual(
    decideCalendarRevocation({
      connection,
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      sessionVerified: true,
      credentialConfirmed: true,
      removeManagedEvents: true,
      mappings: [mapping],
    }),
    {
      status: "revoke",
      connectionId: "calendar-connection-1",
      removeExternalEventIds: ["external-event-1"],
    },
  );

  assert.deepEqual(
    decideCalendarRevocation({
      connection,
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      sessionVerified: true,
      credentialConfirmed: true,
      removeManagedEvents: true,
      mappings: [{ ...mapping, connectionId: "other-connection" }],
    }),
    { status: "unavailable" },
  );
});
