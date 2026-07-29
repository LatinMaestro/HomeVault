import assert from "node:assert/strict";
import test from "node:test";

import {
  CONTROLLED_SHARE_POLICY_VERSION,
  decideControlledShareAudit,
  decideControlledShareCleanup,
  decideControlledShareDownload,
  decideControlledShareExchange,
  decideControlledShareGrant,
  decideControlledShareRevocation,
  decideControlledShareView,
  type ControlledShareGrant,
  type ControlledShareRecord,
  type ControlledShareSession,
} from "../src/lib/controlled-sharing-policy";

const now = new Date("2026-07-28T07:00:00.000Z");

const record: ControlledShareRecord = {
  id: "document-1",
  homeId: "home-1",
  targetType: "DOCUMENT",
  revision: 4,
  status: "ACTIVE",
  availableFields: ["TITLE", "RECORD_TYPE", "SANITIZED_DESCRIPTION"],
  attachments: [
    {
      id: "attachment-1",
      homeId: "home-1",
      recordId: "document-1",
      contentDigest: "digest-attachment-1",
      storageKey: "private/home-1/document-1/attachment-1",
      status: "AVAILABLE",
      malwareDecision: "CLEAN",
      privateOnly: true,
    },
  ],
};

const grant: ControlledShareGrant = {
  id: "grant-1",
  idEntropyBytes: 16,
  homeId: "home-1",
  recordId: "document-1",
  recordRevision: 4,
  policyVersion: CONTROLLED_SHARE_POLICY_VERSION,
  createdByUserId: "user-1",
  createdAt: now,
  startsAt: now,
  expiresAt: new Date("2026-07-29T07:00:00.000Z"),
  revokedAt: null,
  status: "ACTIVE",
  audience: "PUBLIC_LINK",
  recipientEmailHash: null,
  tokenHash: "share-token-hash",
  selectedFields: ["TITLE", "RECORD_TYPE"],
  attachmentBindings: [
    {
      attachmentId: "attachment-1",
      contentDigest: "digest-attachment-1",
    },
  ],
  allowDownload: true,
};

const session: ControlledShareSession = {
  id: "session-1",
  version: 1,
  grantId: "grant-1",
  verifiedUserId: null,
  createdAt: now,
  expiresAt: new Date("2026-07-28T07:15:00.000Z"),
  revokedAt: null,
};

const publicSelectionBinding = JSON.stringify({
  homeId: "home-1",
  recordId: "document-1",
  recordRevision: 4,
  selectedFields: ["TITLE", "RECORD_TYPE"],
  attachmentBindings: [
    {
      attachmentId: "attachment-1",
      contentDigest: "digest-attachment-1",
    },
  ],
  allowDownload: true,
  audience: "PUBLIC_LINK",
  recipientEmailHash: null,
  startsAt: "2026-07-28T07:00:00.000Z",
  expiresAt: "2026-07-29T07:00:00.000Z",
});

const recipientSelectionBinding = JSON.stringify({
  homeId: "home-1",
  recordId: "document-1",
  recordRevision: 4,
  selectedFields: ["TITLE", "RECORD_TYPE"],
  attachmentBindings: [
    {
      attachmentId: "attachment-1",
      contentDigest: "digest-attachment-1",
    },
  ],
  allowDownload: true,
  audience: "VERIFIED_RECIPIENT",
  recipientEmailHash: "recipient-email-hash",
  startsAt: "2026-07-28T07:00:00.000Z",
  expiresAt: "2026-07-29T07:00:00.000Z",
});

const grantInput = {
  currentUserId: "user-1",
  selectedHomeId: "home-1",
  sessionVerified: true,
  membership: {
    userId: "user-1",
    homeId: "home-1",
    role: "ADULT" as const,
    active: true,
    revision: 2,
  },
  record,
  selectedFields: ["TITLE", "RECORD_TYPE"] as const,
  selectedAttachmentIds: ["attachment-1"],
  allowDownload: true,
  audience: "PUBLIC_LINK" as const,
  recipientEmailHash: null,
  recipientBindingEvidence: null,
  startsAt: now,
  expiresAt: new Date("2026-07-29T07:00:00.000Z"),
  generatedGrantId: "grant-1",
  generatedGrantIdEntropyBytes: 16,
  generatedTokenEntropyBytes: 32,
  generatedTokenHash: "share-token-hash",
  confirmationEvidence: {
    id: "confirmation-1",
    userId: "user-1",
    homeId: "home-1",
    recordId: "document-1",
    recordRevision: 4,
    selectionBinding: publicSelectionBinding,
    issuedAt: new Date("2026-07-28T06:59:00.000Z"),
    expiresAt: new Date("2026-07-28T07:09:00.000Z"),
    singleUse: true,
    consumed: false,
  },
  now,
};

const exchangeInput = {
  grant,
  record,
  routeGrantId: "grant-1",
  requestMethod: "POST" as const,
  tokenEvidence: {
    grantId: "grant-1",
    routeGrantId: "grant-1",
    tokenHash: "share-token-hash",
    matchedConstantTime: true,
  },
  rateLimitEvidence: {
    grantId: "grant-1",
    allowed: true,
  },
  recipientEvidence: null,
  now: new Date("2026-07-28T07:01:00.000Z"),
};

const accessInput = {
  grant,
  record,
  session,
  sessionEvidence: {
    grantId: "grant-1",
    sessionId: "session-1",
    matchedConstantTime: true,
  },
  recipientEvidence: null,
  now: new Date("2026-07-28T07:02:00.000Z"),
};

test("creates an explicit bounded same-property grant without storing the secret", () => {
  const decision = decideControlledShareGrant(grantInput);
  assert.equal(decision.status, "grant-authorized");
  if (decision.status !== "grant-authorized") return;
  assert.equal(decision.grantId, "grant-1");
  assert.equal(decision.grantIdEntropyBytes, 16);
  assert.equal(decision.homeId, "home-1");
  assert.equal(decision.recordRevision, 4);
  assert.equal(decision.createdByUserId, "user-1");
  assert.equal(decision.audience, "PUBLIC_LINK");
  assert.equal(decision.recipientEmailHash, null);
  assert.equal(decision.allowDownload, true);
  assert.equal(decision.tokenEntropyBytes, 32);
  assert.equal(decision.storeRawToken, false);
  assert.equal(decision.deliverRawTokenOnce, true);
  assert.equal(decision.secretPlacement, "URL_FRAGMENT");
  assert.equal(decision.requirePostExchange, true);
  assert.equal(decision.exposePrivateBlobUrl, false);
});

test("denies read-only, cross-property and unconfirmed grant creation", () => {
  assert.deepEqual(
    decideControlledShareGrant({
      ...grantInput,
      membership: { ...grantInput.membership, role: "GUEST" },
    }),
    { status: "read-only" },
  );
  assert.deepEqual(
    decideControlledShareGrant({
      ...grantInput,
      selectedHomeId: "home-2",
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideControlledShareGrant({
      ...grantInput,
      confirmationEvidence: {
        ...grantInput.confirmationEvidence,
        consumed: true,
      },
    }),
    { status: "confirmation-required" },
  );
});

test("binds grant confirmation to exact membership and selected content", () => {
  assert.deepEqual(
    decideControlledShareGrant({
      ...grantInput,
      membership: { ...grantInput.membership, userId: "user-2" },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideControlledShareGrant({
      ...grantInput,
      confirmationEvidence: {
        ...grantInput.confirmationEvidence,
        selectionBinding: `${publicSelectionBinding}-substituted`,
      },
    }),
    { status: "confirmation-required" },
  );
  assert.deepEqual(
    decideControlledShareGrant({
      ...grantInput,
      confirmationEvidence: {
        ...grantInput.confirmationEvidence,
        expiresAt: now,
      },
    }),
    { status: "confirmation-required" },
  );
});

test("enforces TTL, entropy, field and clean attachment bounds", () => {
  assert.deepEqual(
    decideControlledShareGrant({
      ...grantInput,
      startsAt: new Date("invalid"),
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideControlledShareGrant({
      ...grantInput,
      expiresAt: new Date("2026-08-04T07:00:00.001Z"),
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideControlledShareGrant({
      ...grantInput,
      generatedGrantIdEntropyBytes: 15,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideControlledShareGrant({
      ...grantInput,
      generatedTokenEntropyBytes: 31,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideControlledShareGrant({
      ...grantInput,
      selectedFields: ["EXPIRY_DATE"],
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideControlledShareGrant({
      ...grantInput,
      record: {
        ...record,
        attachments: [
          {
            ...record.attachments[0],
            malwareDecision: "PENDING",
          },
        ],
      },
    }),
    { status: "unavailable" },
  );
});

test("rejects malformed runtime grant inputs", () => {
  assert.deepEqual(
    decideControlledShareGrant({
      ...grantInput,
      audience: "UNKNOWN" as typeof grantInput.audience,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideControlledShareGrant({
      ...grantInput,
      record: {
        ...record,
        targetType: "UNKNOWN" as ControlledShareRecord["targetType"],
      },
    }),
    { status: "unavailable" },
  );
});

test("requires a server-verified recipient binding when recipient-scoped", () => {
  assert.deepEqual(
    decideControlledShareGrant({
      ...grantInput,
      audience: "VERIFIED_RECIPIENT",
      recipientEmailHash: "recipient-email-hash",
      recipientBindingEvidence: {
        userId: "user-1",
        homeId: "home-1",
        recordId: "document-1",
        recipientEmailHash: "recipient-email-hash",
        serverVerified: false,
      },
      confirmationEvidence: {
        ...grantInput.confirmationEvidence,
        selectionBinding: recipientSelectionBinding,
      },
    }),
    { status: "unavailable" },
  );
  const decision = decideControlledShareGrant({
    ...grantInput,
    audience: "VERIFIED_RECIPIENT",
    recipientEmailHash: "recipient-email-hash",
    recipientBindingEvidence: {
      userId: "user-1",
      homeId: "home-1",
      recordId: "document-1",
      recipientEmailHash: "recipient-email-hash",
      serverVerified: true,
    },
    confirmationEvidence: {
      ...grantInput.confirmationEvidence,
      selectionBinding: recipientSelectionBinding,
    },
  });
  assert.equal(decision.status, "grant-authorized");
});

test("exchanges only a POSTed fragment secret using constant-time matching", () => {
  const decision = decideControlledShareExchange(exchangeInput);
  assert.equal(decision.status, "session-authorized");
  if (decision.status !== "session-authorized") return;
  assert.equal(decision.cookie.httpOnly, true);
  assert.equal(decision.cookie.secure, true);
  assert.equal(decision.cookie.sameSite, "strict");
  assert.equal(decision.clearFragmentSecret, true);
  assert.equal(decision.exposePrivateBlobUrl, false);
  assert.deepEqual(
    decideControlledShareExchange({
      ...exchangeInput,
      requestMethod: "GET",
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideControlledShareExchange({
      ...exchangeInput,
      tokenEvidence: {
        ...exchangeInput.tokenEvidence,
        matchedConstantTime: false,
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideControlledShareExchange({
      ...exchangeInput,
      rateLimitEvidence: {
        ...exchangeInput.rateLimitEvidence,
        allowed: false,
      },
    }),
    { status: "unavailable" },
  );
});

test("rejects substituted token and rate-limit evidence", () => {
  assert.deepEqual(
    decideControlledShareExchange({
      ...exchangeInput,
      tokenEvidence: {
        ...exchangeInput.tokenEvidence,
        grantId: "grant-2",
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideControlledShareExchange({
      ...exchangeInput,
      tokenEvidence: {
        ...exchangeInput.tokenEvidence,
        tokenHash: "other-token-hash",
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideControlledShareExchange({
      ...exchangeInput,
      rateLimitEvidence: {
        ...exchangeInput.rateLimitEvidence,
        grantId: "grant-2",
      },
    }),
    { status: "unavailable" },
  );
});

test("requires the exact verified recipient at every recipient exchange", () => {
  const recipientGrant: ControlledShareGrant = {
    ...grant,
    audience: "VERIFIED_RECIPIENT",
    recipientEmailHash: "recipient-email-hash",
  };
  assert.deepEqual(
    decideControlledShareExchange({
      ...exchangeInput,
      grant: recipientGrant,
    }),
    { status: "recipient-verification-required" },
  );
  const decision = decideControlledShareExchange({
    ...exchangeInput,
    grant: recipientGrant,
    recipientEvidence: {
      grantId: "grant-1",
      verifiedUserId: "recipient-user",
      recipientEmailHash: "recipient-email-hash",
      matchedConstantTime: true,
    },
  });
  assert.equal(decision.status, "session-authorized");
});

test("fails closed for expired, revoked and stale grants", () => {
  assert.deepEqual(
    decideControlledShareExchange({
      ...exchangeInput,
      now: grant.expiresAt,
    }),
    { status: "expired-or-revoked" },
  );
  assert.deepEqual(
    decideControlledShareExchange({
      ...exchangeInput,
      grant: {
        ...grant,
        status: "REVOKED",
        revokedAt: new Date("2026-07-28T07:00:30.000Z"),
      },
    }),
    { status: "expired-or-revoked" },
  );
  assert.deepEqual(
    decideControlledShareExchange({
      ...exchangeInput,
      record: { ...record, revision: 5 },
    }),
    { status: "stale" },
  );
});

test("exposes only selected record fields and protected attachment handles", () => {
  assert.deepEqual(decideControlledShareView(accessInput), {
    status: "view-authorized",
    grantId: "grant-1",
    recordId: "document-1",
    selectedFields: ["TITLE", "RECORD_TYPE"],
    attachmentIds: ["attachment-1"],
    allowDownload: true,
    responseHeaders: {
      cacheControl: "private, no-store",
      robotsTag: "noindex, nofollow, noarchive",
      referrerPolicy: "no-referrer",
      frameAncestors: "'none'",
    },
    exposeHouseholdNavigation: false,
    exposePrivateBlobUrl: false,
  });
});

test("revalidates the share session, grant and recipient on every view", () => {
  assert.deepEqual(
    decideControlledShareView({
      ...accessInput,
      sessionEvidence: {
        ...accessInput.sessionEvidence,
        matchedConstantTime: false,
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideControlledShareView({
      ...accessInput,
      session: { ...session, grantId: "grant-2" },
    }),
    { status: "unavailable" },
  );
  const recipientGrant: ControlledShareGrant = {
    ...grant,
    audience: "VERIFIED_RECIPIENT",
    recipientEmailHash: "recipient-email-hash",
  };
  assert.deepEqual(
    decideControlledShareView({
      ...accessInput,
      grant: recipientGrant,
      session: { ...session, verifiedUserId: "recipient-user" },
      recipientEvidence: {
        grantId: "grant-1",
        verifiedUserId: "recipient-user",
        recipientEmailHash: "recipient-email-hash",
        matchedConstantTime: false,
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideControlledShareView({
      ...accessInput,
      grant: recipientGrant,
      session: { ...session, verifiedUserId: "recipient-user" },
      recipientEvidence: {
        grantId: "grant-1",
        verifiedUserId: "other-user",
        recipientEmailHash: "recipient-email-hash",
        matchedConstantTime: true,
      },
    }),
    { status: "unavailable" },
  );
});

test("rejects substituted or malformed session evidence", () => {
  assert.deepEqual(
    decideControlledShareView({
      ...accessInput,
      sessionEvidence: {
        ...accessInput.sessionEvidence,
        sessionId: "session-2",
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideControlledShareView({
      ...accessInput,
      session: { ...session, version: 0 },
    }),
    { status: "unavailable" },
  );
});

test("streams allowed downloads through the authorized server route", () => {
  assert.deepEqual(
    decideControlledShareDownload({
      ...accessInput,
      attachmentId: "attachment-1",
    }),
    {
      status: "stream-authorized",
      grantId: "grant-1",
      attachmentId: "attachment-1",
      internalStorageKey: "private/home-1/document-1/attachment-1",
      streamThroughAuthorizedServerRoute: true,
      redirectToStorageProvider: false,
      exposePrivateBlobUrl: false,
      cacheControl: "private, no-store",
    },
  );
  assert.deepEqual(
    decideControlledShareDownload({
      ...accessInput,
      grant: { ...grant, allowDownload: false },
      attachmentId: "attachment-1",
    }),
    { status: "download-disabled" },
  );
  assert.deepEqual(
    decideControlledShareDownload({
      ...accessInput,
      attachmentId: "attachment-other",
    }),
    { status: "unavailable" },
  );
});

test("lets owners revoke any property grant and adults revoke only their own", () => {
  const input = {
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    sessionVerified: true,
    membership: {
      userId: "user-1",
      homeId: "home-1",
      role: "ADULT" as const,
      active: true,
      revision: 2,
    },
    grant,
  };
  assert.equal(
    decideControlledShareRevocation(input).status,
    "revocation-authorized",
  );
  assert.deepEqual(
    decideControlledShareRevocation({
      ...input,
      currentUserId: "user-2",
      membership: { ...input.membership, userId: "user-2" },
    }),
    { status: "read-only" },
  );
  assert.equal(
    decideControlledShareRevocation({
      ...input,
      currentUserId: "owner-2",
      membership: {
        ...input.membership,
        userId: "owner-2",
        role: "OWNER",
      },
    }).status,
    "revocation-authorized",
  );
  assert.deepEqual(
    decideControlledShareRevocation({
      ...input,
      selectedHomeId: "home-2",
      membership: {
        ...input.membership,
        homeId: "home-2",
        role: "OWNER",
      },
    }),
    { status: "unavailable" },
  );
});

test("records bounded privacy-safe share audit events", () => {
  const decision = decideControlledShareAudit({
    grantId: "grant-1",
    event: "DOWNLOAD_SUCCEEDED",
    occurredAt: now,
    actorUserId: null,
  });
  assert.equal(decision.status, "audit-authorized");
  if (decision.status !== "audit-authorized") return;
  assert.equal(decision.storeRawToken, false);
  assert.equal(decision.storePrivateBlobUrl, false);
  assert.equal(decision.storeRequestBody, false);
  assert.equal(decision.storeIpAddress, false);
  assert.equal(decision.storeUserAgent, false);
  assert.equal(
    decision.retainUntil.toISOString(),
    "2026-08-27T07:00:00.000Z",
  );
  assert.deepEqual(
    decideControlledShareAudit({
      grantId: "grant-1",
      event: "UNKNOWN" as Parameters<typeof decideControlledShareAudit>[0]["event"],
      occurredAt: now,
      actorUserId: null,
    }),
    { status: "unavailable" },
  );
});

test("revokes lifecycle shares and cleans scoped data without deleting records by default", () => {
  assert.deepEqual(decideControlledShareCleanup({ scope: "GRANT", now }), {
    status: "cleanup-authorized",
    revokeMatchingGrants: true,
    deleteTokenHashes: true,
    invalidateSessions: true,
    deleteShareViews: true,
    purgeBrowserAndCdnCaches: true,
    deleteDeviceAndOfflineCopies: true,
    deleteQueuedShareActions: true,
    deleteNotificationReferences: true,
    removeAuditPayloads: true,
    deleteAuditAfter: new Date("2026-08-27T07:00:00.000Z"),
    deleteAcceptedRecord: false,
    deletePrivateAttachment: false,
    requireRetryableCleanupLedger: true,
  });
  const propertyCleanup = decideControlledShareCleanup({
    scope: "PROPERTY",
    now,
  });
  assert.equal(propertyCleanup.status, "cleanup-authorized");
  if (propertyCleanup.status !== "cleanup-authorized") return;
  assert.equal(propertyCleanup.deleteAcceptedRecord, true);
  assert.equal(propertyCleanup.deletePrivateAttachment, true);
  assert.deepEqual(
    decideControlledShareCleanup({
      scope: "GRANT",
      now: new Date("invalid"),
    }),
    { status: "unavailable" },
  );
});
