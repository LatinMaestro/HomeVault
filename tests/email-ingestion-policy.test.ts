import assert from "node:assert/strict";
import test from "node:test";

import {
  EMAIL_QUARANTINE_TTL_MS,
  decideEmailIngress,
  decideEmailIngestionCleanup,
  decideEmailQuarantine,
  decideEmailReview,
  decideEmailRouteProvision,
  type EmailIngestionRoute,
  type QuarantinedEmail,
} from "../src/lib/email-ingestion-policy";

const now = new Date("2026-07-28T06:00:00.000Z");

const route: EmailIngestionRoute = {
  id: "route-1",
  homeId: "home-1",
  tokenHash: "route-token-hash",
  version: 1,
  status: "ACTIVE",
  createdByUserId: "user-1",
  createdAt: new Date("2026-07-28T00:00:00.000Z"),
};

const senderAuthentication = {
  dkim: "PASS" as const,
  dmarc: "PASS" as const,
  spf: "PASS" as const,
  alignedDomain: "fictional-supplier.example",
};

const attachmentCandidate = {
  id: "attachment-1",
  fileName: "fictional-manual.pdf",
  mediaType: "application/pdf",
  sizeBytes: 500_000,
  contentDigest: "digest-attachment",
};

const ingressInput = {
  route,
  routeTokenHashMatchesConstantTime: true,
  providerEventId: "event-1",
  internetMessageId: "message-1@example.test",
  canonicalContentDigest: "digest-message",
  canonicalDigestVerified: true,
  envelopeFrom: "sender@fictional-supplier.example",
  headerFrom: "sender@fictional-supplier.example",
  senderAuthentication,
  senderAllowlisted: true,
  attachments: [attachmentCandidate],
  rawMessageBytes: 600_000,
  sanitizedBodyCharacters: 500,
  providerApproved: true,
  approvedRegionConfigured: true,
  boundedRetentionConfigured: true,
  webhookSecretConfigured: true,
  webhookSignatureValid: true,
  webhookTimestamp: new Date("2026-07-28T05:59:00.000Z"),
  now,
};

const email: QuarantinedEmail = {
  id: "email-1",
  homeId: "home-1",
  routeId: "route-1",
  providerEventId: "event-1",
  internetMessageId: "message-1@example.test",
  canonicalContentDigest: "digest-message",
  envelopeFrom: "sender@fictional-supplier.example",
  headerFrom: "sender@fictional-supplier.example",
  subject: "Fictional manual",
  receivedAt: now,
  expiresAt: new Date("2026-08-04T06:00:00.000Z"),
  status: "QUARANTINED",
  senderAuthentication,
  senderAllowlisted: true,
  bodySanitized: true,
  remoteContentRemoved: true,
  activeContentRemoved: true,
  containsFullPaymentCredentials: false,
  attachments: [
    {
      id: "attachment-1",
      homeId: "home-1",
      emailId: "email-1",
      fileName: "fictional-manual.pdf",
      mediaType: "application/pdf",
      sizeBytes: 500_000,
      contentDigest: "digest-attachment",
      status: "AVAILABLE",
      signatureValid: true,
      metadataSanitized: true,
      malwareDecision: "CLEAN",
      privateOnly: true,
      storageKey: "private/quarantine/email-1/attachment-1",
    },
  ],
};

test("provisions only owner-controlled high-entropy hashed routes", () => {
  assert.deepEqual(
    decideEmailRouteProvision({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      sessionVerified: true,
      hasCurrentMembership: true,
      role: "OWNER",
      credentialsReconfirmed: true,
      generatedTokenEntropyBytes: 32,
      generatedTokenHash: "route-token-hash",
    }),
    {
      status: "route-authorized",
      homeId: "home-1",
      tokenHash: "route-token-hash",
      storeRawToken: false,
      exposeRouteInExports: false,
      requireAtomicRotation: true,
      requireConstantTimeHashComparison: true,
    },
  );
  assert.deepEqual(
    decideEmailRouteProvision({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      sessionVerified: true,
      hasCurrentMembership: true,
      role: "ADULT",
      credentialsReconfirmed: true,
      generatedTokenEntropyBytes: 32,
      generatedTokenHash: "route-token-hash",
    }),
    { status: "read-only" },
  );
});

test("routes only signed fresh provider events to an exact active alias", () => {
  const decision = decideEmailIngress(ingressInput);
  assert.equal(decision.status, "quarantine-authorized");
  if (decision.status !== "quarantine-authorized") {
    return;
  }
  assert.equal(decision.homeId, "home-1");
  assert.equal(decision.routeId, "route-1");
  assert.equal(decision.senderTrust, "VERIFIED_ALLOWED");
  assert.equal(decision.privateOnly, true);
  assert.equal(decision.exposeProviderUrl, false);
  assert.equal(decision.loadRemoteContent, false);
  assert.equal(decision.executeActiveContent, false);
  assert.equal(decision.autoSaveAllowed, false);
});

test("fails closed for wrong routes, invalid webhooks and replay", () => {
  assert.deepEqual(
    decideEmailIngress({
      ...ingressInput,
      routeTokenHashMatchesConstantTime: false,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideEmailIngress({
      ...ingressInput,
      canonicalDigestVerified: false,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideEmailIngress({
      ...ingressInput,
      route: { ...route, version: 0 },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideEmailIngress({
      ...ingressInput,
      providerEventId: "x".repeat(201),
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideEmailIngress({ ...ingressInput, webhookSignatureValid: false }),
    { status: "provider-gate", reason: "webhook" },
  );
  assert.deepEqual(
    decideEmailIngress({
      ...ingressInput,
      webhookTimestamp: new Date("2026-07-28T05:54:59.000Z"),
    }),
    { status: "invalid-message", reason: "replay" },
  );
  assert.deepEqual(
    decideEmailIngress({
      ...ingressInput,
      senderAuthentication: {} as typeof senderAuthentication,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideEmailIngress({
      ...ingressInput,
      attachments: undefined as unknown as typeof ingressInput.attachments,
    }),
    { status: "unavailable" },
  );
});

test("keeps provider, region and retention as explicit gates", () => {
  assert.deepEqual(
    decideEmailIngress({ ...ingressInput, providerApproved: false }),
    { status: "provider-gate", reason: "provider" },
  );
  assert.deepEqual(
    decideEmailIngress({ ...ingressInput, approvedRegionConfigured: false }),
    { status: "provider-gate", reason: "region" },
  );
  assert.deepEqual(
    decideEmailIngress({ ...ingressInput, boundedRetentionConfigured: false }),
    { status: "provider-gate", reason: "retention" },
  );
});

test("rejects oversized, unsafe or duplicate attachment envelopes", () => {
  assert.deepEqual(
    decideEmailIngress({ ...ingressInput, rawMessageBytes: 25_000_001 }),
    { status: "invalid-message", reason: "size" },
  );
  assert.deepEqual(
    decideEmailIngress({
      ...ingressInput,
      attachments: [{ ...attachmentCandidate, fileName: "../manual.pdf" }],
    }),
    { status: "invalid-message", reason: "attachment" },
  );
  assert.deepEqual(
    decideEmailIngress({
      ...ingressInput,
      attachments: [
        attachmentCandidate,
        { ...attachmentCandidate, id: "attachment-2" },
      ],
    }),
    { status: "invalid-message", reason: "attachment" },
  );
});

test("deduplicates only within the exact routed property", () => {
  assert.deepEqual(
    decideEmailIngress({
      ...ingressInput,
      existingEmail: {
        id: "email-existing",
        homeId: "home-1",
        providerEventId: "event-1",
        internetMessageId: "different@example.test",
        canonicalContentDigest: "different",
      },
    }),
    { status: "duplicate", emailId: "email-existing" },
  );
  assert.deepEqual(
    decideEmailIngress({
      ...ingressInput,
      existingEmail: {
        id: "email-cross-property",
        homeId: "home-2",
        providerEventId: "event-1",
        internetMessageId: "message-1@example.test",
        canonicalContentDigest: "digest-message",
      },
    }),
    { status: "unavailable" },
  );
});

test("marks unauthenticated senders for explicit review without auto-save", () => {
  const decision = decideEmailIngress({
    ...ingressInput,
    senderAuthentication: {
      dkim: "FAIL",
      dmarc: "FAIL",
      spf: "NONE",
      alignedDomain: null,
    },
  });
  assert.equal(decision.status, "quarantine-authorized");
  if (decision.status === "quarantine-authorized") {
    assert.equal(decision.senderTrust, "UNVERIFIED");
    assert.equal(decision.autoSaveAllowed, false);
  }
});

test("publishes only sanitized clean private quarantine content to review", () => {
  assert.deepEqual(
    decideEmailQuarantine({
      email,
      rawMessageThreatDetected: false,
      now,
    }),
    {
      status: "review-ready",
      emailId: "email-1",
      senderWarningRequired: false,
      privateOnly: true,
      noRemoteContent: true,
      autoSaveAllowed: false,
    },
  );
  assert.deepEqual(
    decideEmailQuarantine({
      email: {
        ...email,
        senderAllowlisted: false,
      },
      rawMessageThreatDetected: false,
      now,
    }),
    {
      status: "review-ready",
      emailId: "email-1",
      senderWarningRequired: true,
      privateOnly: true,
      noRemoteContent: true,
      autoSaveAllowed: false,
    },
  );
});

test("rejects malformed or overlong quarantine envelopes", () => {
  assert.deepEqual(
    decideEmailQuarantine({
      email: { ...email, receivedAt: new Date("invalid") },
      rawMessageThreatDetected: false,
      now,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideEmailQuarantine({
      email: {
        ...email,
        expiresAt: new Date(
          email.receivedAt.getTime() + EMAIL_QUARANTINE_TTL_MS + 1,
        ),
      },
      rawMessageThreatDetected: false,
      now,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideEmailQuarantine({
      email: {
        ...email,
        attachments: [
          email.attachments[0],
          { ...email.attachments[0], storageKey: "private/duplicate" },
        ],
      },
      rawMessageThreatDetected: false,
      now,
    }),
    { status: "unavailable" },
  );
});

test("rejects threats and keeps scanner failures quarantined", () => {
  assert.deepEqual(
    decideEmailQuarantine({
      email,
      rawMessageThreatDetected: true,
      now,
    }),
    {
      status: "reject-and-delete",
      emailId: "email-1",
      deleteRawMessage: true,
      deleteAttachmentObjects: true,
    },
  );
  assert.deepEqual(
    decideEmailQuarantine({
      email: {
        ...email,
        attachments: [
          {
            ...email.attachments[0],
            status: "QUARANTINED",
            malwareDecision: "ERROR",
          },
        ],
      },
      rawMessageThreatDetected: false,
      now,
    }),
    {
      status: "quarantine",
      emailId: "email-1",
      retryAllowed: true,
    },
  );
});

test("requires authorised review and explicit final save", () => {
  const reviewEmail = { ...email, status: "REVIEW_READY" as const };
  const decision = decideEmailReview({
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    sessionVerified: true,
    hasCurrentMembership: true,
    role: "ADULT",
    email: reviewEmail,
    confirmation: {
      confirmSender: true,
      targetType: "DOCUMENT",
      title: "Fictional water-heater manual",
      selectedAttachmentIds: ["attachment-1"],
      includeSanitizedBody: true,
    },
    now,
  });
  assert.equal(decision.status, "review-save-authorized");
  if (decision.status !== "review-save-authorized") {
    return;
  }
  assert.equal(decision.useNormalRecordActions, true);
  assert.equal(decision.requireExplicitFinalSave, true);
  assert.equal(decision.createAutomatically, false);
  assert.equal(decision.runOcrAutomatically, false);
  assert.equal(decision.runAiAutomatically, false);
  assert.equal(decision.transcribePaymentCredentials, false);
});

test("blocks read-only, cross-property and payment-credential body review", () => {
  const input = {
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    sessionVerified: true,
    hasCurrentMembership: true,
    role: "OWNER" as const,
    email: { ...email, status: "REVIEW_READY" as const },
    confirmation: {
      confirmSender: true,
      targetType: "RECEIPT" as const,
      title: "Fictional receipt",
      selectedAttachmentIds: ["attachment-1"],
      includeSanitizedBody: true,
    },
    now,
  };
  assert.deepEqual(decideEmailReview({ ...input, role: "GUEST" }), {
    status: "read-only",
  });
  assert.deepEqual(
    decideEmailReview({ ...input, selectedHomeId: "home-2" }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideEmailReview({
      ...input,
      email: { ...input.email, containsFullPaymentCredentials: true },
    }),
    { status: "confirmation-required" },
  );
  assert.deepEqual(
    decideEmailReview({
      ...input,
      confirmation: {
        ...input.confirmation,
        selectedAttachmentIds: [],
        includeSanitizedBody: false,
      },
    }),
    { status: "confirmation-required" },
  );
  assert.deepEqual(
    decideEmailReview({
      ...input,
      confirmation: {
        ...input.confirmation,
        targetType: "UNKNOWN" as typeof input.confirmation.targetType,
      },
    }),
    { status: "confirmation-required" },
  );
});

test("cleanup covers routes, messages, objects and retryable provider deletion", () => {
  assert.deepEqual(decideEmailIngestionCleanup({ scope: "EMAIL" }), {
    revokeRoutes: false,
    deleteRawMessages: true,
    deleteSanitizedBodies: true,
    deleteQuarantineObjects: true,
    deleteAttachmentObjects: true,
    deleteRelationalMetadata: true,
    invalidateReviewSessions: true,
    preserveAcceptedRecordValues: true,
    requireRetryableCleanupLedger: true,
  });
  assert.equal(
    decideEmailIngestionCleanup({ scope: "PROPERTY" })
      .preserveAcceptedRecordValues,
    false,
  );
  assert.equal(
    decideEmailIngestionCleanup({ scope: "PROPERTY" }).revokeRoutes,
    true,
  );
});
