import assert from "node:assert/strict";
import test from "node:test";

import {
  PROVIDER_HANDOFF_POLICY_VERSION,
  decideProviderCancellation,
  decideProviderCleanup,
  decideProviderHandoffDraft,
  decideProviderHandoffSend,
  decideProviderProfileSave,
  decideProviderResponseReview,
  decideProviderWebhookIngress,
  type ProviderConnectorGate,
  type ProviderHandoffDraft,
  type ProviderHandoffResponse,
  type ProviderProfile,
  type ProviderTaskSnapshot,
} from "../src/lib/provider-handoff-policy";

const now = new Date("2026-07-28T08:00:00.000Z");

const task: ProviderTaskSnapshot = {
  id: "task-1",
  homeId: "home-1",
  revision: 3,
  status: "ACTIVE",
  serviceCategory: "Plumbing",
};

const emailProvider: ProviderProfile = {
  id: "provider-1",
  homeId: "home-1",
  revision: 2,
  status: "ACTIVE",
  displayName: "Fictional Plumbing",
  serviceCategories: ["Plumbing"],
  channel: {
    type: "USER_MEDIATED_EMAIL",
    emailAddress: "bookings@fictional-plumbing.example",
  },
};

const connectorProvider: ProviderProfile = {
  ...emailProvider,
  channel: {
    type: "APPROVED_CONNECTOR",
    connectorId: "connector-fictional",
    externalProviderAccountId: "provider-account-1",
  },
};

const disclosures = [
  {
    field: "SERVICE_CATEGORY" as const,
    value: "Plumbing",
    explicitlyConfirmed: true,
  },
  {
    field: "SANITIZED_TASK_SUMMARY" as const,
    value: "Please inspect a fictional dripping tap.",
    explicitlyConfirmed: true,
  },
  {
    field: "SUBURB_POSTCODE" as const,
    value: "Brisbane QLD 4000",
    explicitlyConfirmed: true,
  },
];

const draft: ProviderHandoffDraft = {
  id: "handoff-1",
  homeId: "home-1",
  taskId: "task-1",
  taskRevision: 3,
  providerId: "provider-1",
  providerRevision: 2,
  policyVersion: PROVIDER_HANDOFF_POLICY_VERSION,
  kind: "ENQUIRY",
  createdByUserId: "user-1",
  createdAt: now,
  status: "REVIEWED",
  disclosures,
  canonicalPayloadDigest: "payload-digest",
};

const connectorGate: ProviderConnectorGate = {
  providerApproved: true,
  accountApproved: true,
  costApproved: true,
  privacyApproved: true,
  approvedRegionConfigured: true,
  boundedRetentionConfigured: true,
  oauthScopes: ["messages:write", "responses:read"],
  credentialsServerHeld: true,
};

const sendInput = {
  currentUserId: "user-1",
  selectedHomeId: "home-1",
  sessionVerified: true,
  hasCurrentMembership: true,
  role: "ADULT" as const,
  task,
  provider: emailProvider,
  draft,
  canonicalPayloadDigestServerVerified: true,
  finalPreviewConfirmed: true,
  idempotencyKey: "handoff-idempotency-1",
  idempotencyKeyServerGenerated: true,
  connectorGate: null,
  now,
};

const response: ProviderHandoffResponse = {
  id: "response-1",
  handoffId: "handoff-1",
  homeId: "home-1",
  providerId: "provider-1",
  providerEventId: "provider-event-1",
  status: "RECEIVED",
  plainTextMessage: "Thanks, we will review this fictional request.",
  proposedStartAt: null,
  createdAt: new Date("2026-07-28T08:01:00.000Z"),
  reviewedAt: null,
};

test("saves only explicit property-scoped user-supplied provider profiles", () => {
  assert.deepEqual(
    decideProviderProfileSave({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      sessionVerified: true,
      hasCurrentMembership: true,
      role: "OWNER",
      profile: emailProvider,
      explicitConfirmation: true,
      connectorGate: null,
    }),
    {
      status: "profile-save-authorized",
      homeId: "home-1",
      providerId: "provider-1",
      providerRevision: 2,
      channelType: "USER_MEDIATED_EMAIL",
      userSuppliedProfile: true,
      advertisingProfile: false,
      trackingProfile: false,
    },
  );
  assert.deepEqual(
    decideProviderProfileSave({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      sessionVerified: true,
      hasCurrentMembership: true,
      role: "GUEST",
      profile: emailProvider,
      explicitConfirmation: true,
      connectorGate: null,
    }),
    { status: "read-only" },
  );
  assert.deepEqual(
    decideProviderProfileSave({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      sessionVerified: true,
      hasCurrentMembership: true,
      role: "OWNER",
      profile: connectorProvider,
      explicitConfirmation: true,
      connectorGate: null,
    }),
    { status: "unavailable" },
  );
});

test("builds a reviewed minimal-disclosure handoff draft", () => {
  const decision = decideProviderHandoffDraft({
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    sessionVerified: true,
    hasCurrentMembership: true,
    role: "ADULT",
    task,
    provider: emailProvider,
    kind: "ENQUIRY",
    disclosures,
    explicitDisclosureReview: true,
    containsPaymentCredentials: false,
    containsInsuranceClaimInstructions: false,
    containsBudgetOrValuationAdvice: false,
    containsAdvertisingOrTrackingData: false,
    containsUnrelatedHouseholdData: false,
    containsAttachmentOrPrivateUrl: false,
  });
  assert.equal(decision.status, "draft-authorized");
  if (decision.status !== "draft-authorized") return;
  assert.equal(decision.noAttachments, true);
  assert.equal(decision.noUnrelatedRecords, true);
  assert.equal(decision.noPaymentCredentials, true);
  assert.equal(decision.noInsuranceClaimAutomation, true);
  assert.equal(decision.noBudgetOrValuationAdvice, true);
  assert.equal(decision.noAdvertisingOrTrackingData, true);
  assert.equal(decision.requireFinalPreview, true);
});

test("denies read-only, cross-property and unreviewed drafts", () => {
  const input = {
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    sessionVerified: true,
    hasCurrentMembership: true,
    role: "ADULT" as const,
    task,
    provider: emailProvider,
    kind: "MESSAGE" as const,
    disclosures,
    explicitDisclosureReview: true,
    containsPaymentCredentials: false,
    containsInsuranceClaimInstructions: false,
    containsBudgetOrValuationAdvice: false,
    containsAdvertisingOrTrackingData: false,
    containsUnrelatedHouseholdData: false,
    containsAttachmentOrPrivateUrl: false,
  };
  assert.deepEqual(decideProviderHandoffDraft({ ...input, role: "CHILD" }), {
    status: "read-only",
  });
  assert.deepEqual(
    decideProviderHandoffDraft({
      ...input,
      provider: { ...emailProvider, homeId: "home-2" },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideProviderHandoffDraft({
      ...input,
      explicitDisclosureReview: false,
    }),
    { status: "confirmation-required" },
  );
});

test("rejects unconfirmed, duplicate and mismatched disclosure fields", () => {
  const input = {
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    sessionVerified: true,
    hasCurrentMembership: true,
    role: "OWNER" as const,
    task,
    provider: emailProvider,
    kind: "ENQUIRY" as const,
    disclosures,
    explicitDisclosureReview: true,
    containsPaymentCredentials: false,
    containsInsuranceClaimInstructions: false,
    containsBudgetOrValuationAdvice: false,
    containsAdvertisingOrTrackingData: false,
    containsUnrelatedHouseholdData: false,
    containsAttachmentOrPrivateUrl: false,
  };
  assert.deepEqual(
    decideProviderHandoffDraft({
      ...input,
      disclosures: [
        ...disclosures,
        { ...disclosures[1], explicitlyConfirmed: false },
      ],
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideProviderHandoffDraft({
      ...input,
      containsPaymentCredentials: true,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideProviderHandoffDraft({
      ...input,
      containsBudgetOrValuationAdvice: true,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideProviderHandoffDraft({
      ...input,
      containsAdvertisingOrTrackingData: true,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideProviderHandoffDraft({
      ...input,
      disclosures: [
        { ...disclosures[0], value: "Electrical" },
        disclosures[1],
      ],
    }),
    { status: "unavailable" },
  );
});

test("fails closed on unknown kinds, states and malformed runtime values", () => {
  const draftInput = {
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    sessionVerified: true,
    hasCurrentMembership: true,
    role: "OWNER" as const,
    task,
    provider: emailProvider,
    kind: "ENQUIRY" as const,
    disclosures,
    explicitDisclosureReview: true,
    containsPaymentCredentials: false,
    containsInsuranceClaimInstructions: false,
    containsBudgetOrValuationAdvice: false,
    containsAdvertisingOrTrackingData: false,
    containsUnrelatedHouseholdData: false,
    containsAttachmentOrPrivateUrl: false,
  };
  assert.deepEqual(
    decideProviderHandoffDraft({
      ...draftInput,
      kind: "AUTOMATED_PURCHASE" as never,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideProviderHandoffSend({
      ...sendInput,
      draft: {
        ...draft,
        status: "BYPASS_REVIEW" as never,
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideProviderHandoffSend({
      ...sendInput,
      now: "2026-07-28T08:00:00.000Z" as never,
    }),
    { status: "unavailable" },
  );
});

test("opens user email only after final preview without claiming it sent", () => {
  assert.deepEqual(decideProviderHandoffSend(sendInput), {
    status: "user-mediated-handoff-authorized",
    handoffId: "handoff-1",
    openUserEmailClient: true,
    sendFromHomeVaultServer: false,
    markSentAutomatically: false,
    requireUserOutcomeConfirmation: true,
    exposeInternalIdsInUri: false,
    exposePrivateFiles: false,
  });
  assert.deepEqual(
    decideProviderHandoffSend({
      ...sendInput,
      finalPreviewConfirmed: false,
    }),
    { status: "confirmation-required" },
  );
  assert.deepEqual(
    decideProviderHandoffSend({
      ...sendInput,
      idempotencyKeyServerGenerated: false,
    }),
    { status: "unavailable" },
  );
});

test("fails closed when the task or provider changed after review", () => {
  assert.deepEqual(
    decideProviderHandoffSend({
      ...sendInput,
      task: { ...task, revision: 4 },
    }),
    { status: "stale" },
  );
  assert.deepEqual(
    decideProviderHandoffSend({
      ...sendInput,
      provider: { ...emailProvider, revision: 3 },
    }),
    { status: "stale" },
  );
});

test("keeps every connector approval as an explicit gate", () => {
  const input = {
    ...sendInput,
    provider: connectorProvider,
    connectorGate,
  };
  assert.deepEqual(
    decideProviderHandoffSend({
      ...input,
      connectorGate: { ...connectorGate, providerApproved: false },
    }),
    { status: "connector-gate", reason: "provider" },
  );
  assert.deepEqual(
    decideProviderHandoffSend({
      ...input,
      connectorGate: { ...connectorGate, costApproved: false },
    }),
    { status: "connector-gate", reason: "cost" },
  );
  assert.deepEqual(
    decideProviderHandoffSend({
      ...input,
      connectorGate: { ...connectorGate, privacyApproved: false },
    }),
    { status: "connector-gate", reason: "privacy" },
  );
});

test("authorizes least-privilege idempotent connector sends without payment", () => {
  const decision = decideProviderHandoffSend({
    ...sendInput,
    provider: connectorProvider,
    connectorGate,
  });
  assert.equal(decision.status, "connector-send-authorized");
  if (decision.status !== "connector-send-authorized") return;
  assert.deepEqual(decision.allowedScopes, [
    "messages:write",
    "responses:read",
  ]);
  assert.equal(decision.markSentOnlyAfterProviderAck, true);
  assert.equal(decision.discloseOnlyReviewedPayload, true);
  assert.equal(decision.exposePrivateFiles, false);
  assert.equal(decision.automatedPaymentAllowed, false);
});

test("rejects over-scoped or client-held connector credentials", () => {
  const input = {
    ...sendInput,
    provider: connectorProvider,
    connectorGate,
  };
  assert.deepEqual(
    decideProviderHandoffSend({
      ...input,
      connectorGate: {
        ...connectorGate,
        oauthScopes: [...connectorGate.oauthScopes, "household:read"],
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideProviderHandoffSend({
      ...input,
      connectorGate: { ...connectorGate, credentialsServerHeld: false },
    }),
    { status: "unavailable" },
  );
});

test("quarantines only signed fresh scoped provider responses", () => {
  const input = {
    handoff: { ...draft, status: "SENT" as const },
    provider: connectorProvider,
    providerEventId: "provider-event-1",
    responseStatus: "RECEIVED" as const,
    plainTextMessage: "Fictional response received.",
    proposedStartAt: null,
    connectorGate,
    webhookSecretConfigured: true,
    webhookSignatureValid: true,
    webhookTimestamp: new Date("2026-07-28T07:59:00.000Z"),
    connectorScopeAllowed: true,
    now,
  };
  assert.deepEqual(decideProviderWebhookIngress(input), {
    status: "response-quarantine-authorized",
    handoffId: "handoff-1",
    providerEventId: "provider-event-1",
    reviewRequired: true,
    updateHouseholdRecordAutomatically: false,
    createBookingAutomatically: false,
    automatedPaymentAllowed: false,
    loadExternalUrls: false,
  });
  assert.deepEqual(
    decideProviderWebhookIngress({
      ...input,
      webhookSignatureValid: false,
    }),
    { status: "provider-gate", reason: "webhook" },
  );
  assert.deepEqual(
    decideProviderWebhookIngress({
      ...input,
      webhookTimestamp: new Date("2026-07-28T07:54:59.000Z"),
    }),
    { status: "invalid-response", reason: "replay" },
  );
  assert.deepEqual(
    decideProviderWebhookIngress({
      ...input,
      handoff: {
        ...input.handoff,
        canonicalPayloadDigest: "",
      },
    }),
    { status: "unavailable" },
  );
});

test("deduplicates exact responses and rejects cross-property collisions", () => {
  const input = {
    handoff: { ...draft, status: "SENT" as const },
    provider: connectorProvider,
    providerEventId: "provider-event-1",
    responseStatus: "RECEIVED" as const,
    plainTextMessage: null,
    proposedStartAt: null,
    connectorGate,
    webhookSecretConfigured: true,
    webhookSignatureValid: true,
    webhookTimestamp: now,
    connectorScopeAllowed: true,
    now,
    existingResponse: {
      id: "response-existing",
      handoffId: "handoff-1",
      homeId: "home-1",
      providerId: "provider-1",
      providerEventId: "provider-event-1",
    },
  };
  assert.deepEqual(decideProviderWebhookIngress(input), {
    status: "duplicate",
    responseId: "response-existing",
  });
  assert.deepEqual(
    decideProviderWebhookIngress({
      ...input,
      existingResponse: { ...input.existingResponse, homeId: "home-2" },
    }),
    { status: "unavailable" },
  );
});

test("keeps provider responses review-only and uses normal task updates", () => {
  const decision = decideProviderResponseReview({
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    sessionVerified: true,
    hasCurrentMembership: true,
    role: "OWNER",
    handoff: { ...draft, status: "SENT" as const },
    task,
    provider: connectorProvider,
    response,
    explicitConfirmation: true,
    now: new Date("2026-07-28T08:02:00.000Z"),
  });
  assert.equal(decision.status, "response-review-authorized");
  if (decision.status !== "response-review-authorized") return;
  assert.equal(decision.updateMaintenanceAutomatically, false);
  assert.equal(decision.requireNormalTaskUpdate, true);
  assert.equal(decision.confirmedAppointment, false);
  assert.equal(decision.automatedPaymentAllowed, false);
  assert.deepEqual(
    decideProviderResponseReview({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      sessionVerified: true,
      hasCurrentMembership: true,
      role: "OWNER",
      handoff: { ...draft, status: "SENT" as const },
      task,
      provider: emailProvider,
      response,
      explicitConfirmation: true,
      now: new Date("2026-07-28T08:02:00.000Z"),
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideProviderResponseReview({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      sessionVerified: true,
      hasCurrentMembership: true,
      role: "OWNER",
      handoff: { ...draft, status: "SENT" as const },
      task,
      provider: connectorProvider,
      response: { ...response, status: "AUTO_BOOKED" as never },
      explicitConfirmation: true,
      now: new Date("2026-07-28T08:02:00.000Z"),
    }),
    { status: "unavailable" },
  );
});

test("cancellation never claims external completion or automates refunds", () => {
  const sentDraft = { ...draft, status: "SENT" as const };
  assert.deepEqual(
    decideProviderCancellation({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      sessionVerified: true,
      hasCurrentMembership: true,
      role: "ADULT",
      handoff: sentDraft,
      provider: connectorProvider,
    }),
    {
      status: "cancellation-authorized",
      handoffId: "handoff-1",
      sendCancellationRequest: true,
      markExternallyCancelledImmediately: false,
      requireProviderOrUserConfirmation: true,
      automatedRefundAllowed: false,
      automatedPaymentAllowed: false,
    },
  );
  assert.deepEqual(
    decideProviderCancellation({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      sessionVerified: true,
      hasCurrentMembership: true,
      role: "ADULT",
      handoff: { ...sentDraft, disclosures: [] },
      provider: connectorProvider,
    }),
    { status: "unavailable" },
  );
});

test("lifecycle cleanup removes integrations without deleting tasks by default", () => {
  assert.deepEqual(decideProviderCleanup({ scope: "PROVIDER", now }), {
    status: "cleanup-authorized",
    scope: "PROVIDER",
    archiveProviderProfile: true,
    revokeConnectorCredentials: true,
    removeWebhookSubscription: true,
    cancelPendingHandoffs: true,
    deleteDraftPayloads: true,
    deleteProviderResponses: true,
    deleteAuditAfter: new Date("2026-08-27T08:00:00.000Z"),
    deleteHouseholdTask: false,
    requireRetryableCleanupLedger: true,
  });
  const propertyCleanup = decideProviderCleanup({ scope: "PROPERTY", now });
  assert.equal(propertyCleanup.status, "cleanup-authorized");
  if (propertyCleanup.status !== "cleanup-authorized") return;
  assert.equal(propertyCleanup.deleteHouseholdTask, true);
  assert.deepEqual(
    decideProviderCleanup({
      scope: "EVERYTHING" as never,
      now,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideProviderCleanup({
      scope: "PROPERTY",
      now: new Date("invalid"),
    }),
    { status: "unavailable" },
  );
});
