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
  providerHandoffBindings,
  type ProviderConfirmationEvidence,
  type ProviderConnectorGate,
  type ProviderDraftSafetyEvidence,
  type ProviderHandoffDraft,
  type ProviderHandoffResponse,
  type ProviderProfile,
  type ProviderTaskSnapshot,
} from "../src/lib/provider-handoff-policy";

const now = new Date("2026-07-28T08:00:00.000Z");
const issuedAt = new Date("2026-07-28T07:55:00.000Z");
const expiresAt = new Date("2026-07-28T08:05:00.000Z");

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
  approvalId: "approval-1",
  approvalVersion: 1,
  connectorId: "connector-fictional",
  externalProviderAccountId: "provider-account-1",
  approvedAt: new Date("2026-07-28T07:00:00.000Z"),
  expiresAt: new Date("2026-08-27T07:00:00.000Z"),
  providerApproved: true,
  accountApproved: true,
  costApproved: true,
  privacyApproved: true,
  approvedRegionConfigured: true,
  boundedRetentionConfigured: true,
  oauthScopes: ["messages:write", "responses:read"],
  credentialsServerHeld: true,
};

const membershipEvidence = {
  userId: "user-1",
  homeId: "home-1",
  role: "ADULT" as const,
  active: true,
  membershipRevision: 4,
};

function confirmation(
  purpose: ProviderConfirmationEvidence["purpose"],
  subjectId: string,
  bindingDigest: string,
): ProviderConfirmationEvidence {
  return {
    id: `confirmation-${purpose.toLowerCase()}`,
    userId: "user-1",
    homeId: "home-1",
    purpose,
    subjectId,
    bindingDigest,
    issuedAt,
    expiresAt,
    consumed: false,
  };
}

const safetyEvidence: ProviderDraftSafetyEvidence = {
  homeId: "home-1",
  taskId: "task-1",
  providerId: "provider-1",
  disclosureDigest: providerHandoffBindings.disclosures(disclosures),
  policyVersion: PROVIDER_HANDOFF_POLICY_VERSION,
  scannedAt: issuedAt,
  containsPaymentCredentials: false,
  containsInsuranceClaimInstructions: false,
  containsBudgetOrValuationAdvice: false,
  containsAdvertisingOrTrackingData: false,
  containsUnrelatedHouseholdData: false,
  containsAttachmentOrPrivateUrl: false,
};

const idempotencyEvidence = {
  handoffId: "handoff-1",
  idempotencyKey: "handoff-idempotency-1",
  serverGenerated: true,
  consumed: false,
};

const payloadEvidence = {
  handoffId: "handoff-1",
  canonicalPayloadDigest: "payload-digest",
  serverRecomputed: true,
};

const draftRequestInput = {
  currentUserId: "user-1",
  selectedHomeId: "home-1",
  membershipEvidence,
  task,
  provider: emailProvider,
  kind: "ENQUIRY" as const,
  disclosures,
  confirmationEvidence: confirmation(
    "DRAFT_REVIEW",
    task.id,
    providerHandoffBindings.draft({
      task,
      provider: emailProvider,
      kind: "ENQUIRY",
      disclosures,
    }),
  ),
  safetyEvidence,
  now,
};

const sendInput = {
  currentUserId: "user-1",
  selectedHomeId: "home-1",
  membershipEvidence,
  task,
  provider: emailProvider,
  draft,
  payloadEvidence,
  confirmationEvidence: confirmation(
    "FINAL_PREVIEW",
    "handoff-1",
    providerHandoffBindings.send(draft, idempotencyEvidence),
  ),
  idempotencyEvidence,
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
      membershipEvidence: { ...membershipEvidence, role: "OWNER" },
      profile: emailProvider,
      confirmationEvidence: confirmation(
        "PROFILE_SAVE",
        emailProvider.id,
        providerHandoffBindings.profile(emailProvider),
      ),
      connectorGate: null,
      now,
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
      membershipEvidence: { ...membershipEvidence, role: "GUEST" },
      profile: emailProvider,
      confirmationEvidence: confirmation(
        "PROFILE_SAVE",
        emailProvider.id,
        providerHandoffBindings.profile(emailProvider),
      ),
      connectorGate: null,
      now,
    }),
    { status: "read-only" },
  );
  assert.deepEqual(
    decideProviderProfileSave({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      membershipEvidence: { ...membershipEvidence, role: "OWNER" },
      profile: connectorProvider,
      confirmationEvidence: confirmation(
        "PROFILE_SAVE",
        connectorProvider.id,
        providerHandoffBindings.profile(connectorProvider),
      ),
      connectorGate: null,
      now,
    }),
    { status: "unavailable" },
  );
});

test("rejects substituted or truthy membership evidence", () => {
  const input = {
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    membershipEvidence: { ...membershipEvidence, role: "OWNER" as const },
    profile: emailProvider,
    confirmationEvidence: confirmation(
      "PROFILE_SAVE",
      emailProvider.id,
      providerHandoffBindings.profile(emailProvider),
    ),
    connectorGate: null,
    now,
  };
  assert.deepEqual(
    decideProviderProfileSave({
      ...input,
      membershipEvidence: { ...input.membershipEvidence, userId: "user-2" },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideProviderProfileSave({
      ...input,
      membershipEvidence: {
        ...input.membershipEvidence,
        active: "true" as never,
      },
    }),
    { status: "unavailable" },
  );
});

test("builds a reviewed minimal-disclosure handoff draft", () => {
  const decision = decideProviderHandoffDraft(draftRequestInput);
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

test("binds disclosure confirmation and safety evidence to the exact draft", () => {
  assert.deepEqual(
    decideProviderHandoffDraft({
      ...draftRequestInput,
      confirmationEvidence: {
        ...draftRequestInput.confirmationEvidence,
        subjectId: "task-2",
      },
    }),
    { status: "confirmation-required" },
  );
  assert.deepEqual(
    decideProviderHandoffDraft({
      ...draftRequestInput,
      safetyEvidence: {
        ...safetyEvidence,
        disclosureDigest: "substituted",
      },
    }),
    { status: "unavailable" },
  );
});

test("denies read-only, cross-property and unreviewed drafts", () => {
  const input = draftRequestInput;
  assert.deepEqual(decideProviderHandoffDraft({
    ...input,
    membershipEvidence: { ...membershipEvidence, role: "CHILD" },
  }), {
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
      confirmationEvidence: {
        ...input.confirmationEvidence,
        bindingDigest: "substituted",
      },
    }),
    { status: "confirmation-required" },
  );
});

test("rejects unconfirmed, duplicate and mismatched disclosure fields", () => {
  const input = {
    ...draftRequestInput,
    membershipEvidence: { ...membershipEvidence, role: "OWNER" as const },
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
      safetyEvidence: {
        ...safetyEvidence,
        containsPaymentCredentials: true,
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideProviderHandoffDraft({
      ...input,
      safetyEvidence: {
        ...safetyEvidence,
        containsBudgetOrValuationAdvice: true,
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideProviderHandoffDraft({
      ...input,
      safetyEvidence: {
        ...safetyEvidence,
        containsAdvertisingOrTrackingData: true,
      },
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
  const draftInput = draftRequestInput;
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
      confirmationEvidence: {
        ...sendInput.confirmationEvidence,
        consumed: true,
      },
    }),
    { status: "confirmation-required" },
  );
  assert.deepEqual(
    decideProviderHandoffSend({
      ...sendInput,
      idempotencyEvidence: {
        ...idempotencyEvidence,
        serverGenerated: false,
      },
    }),
    { status: "unavailable" },
  );
});

test("rejects replayed or substituted send evidence", () => {
  assert.deepEqual(
    decideProviderHandoffSend({
      ...sendInput,
      confirmationEvidence: {
        ...sendInput.confirmationEvidence,
        expiresAt: now,
      },
    }),
    { status: "confirmation-required" },
  );
  assert.deepEqual(
    decideProviderHandoffSend({
      ...sendInput,
      payloadEvidence: {
        ...payloadEvidence,
        canonicalPayloadDigest: "substituted",
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideProviderHandoffSend({
      ...sendInput,
      idempotencyEvidence: {
        ...idempotencyEvidence,
        handoffId: "handoff-2",
      },
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

test("binds connector approval to the exact external account and lifetime", () => {
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
        externalProviderAccountId: "provider-account-2",
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideProviderHandoffSend({
      ...input,
      connectorGate: { ...connectorGate, expiresAt: now },
    }),
    { status: "unavailable" },
  );
});

test("quarantines only signed fresh scoped provider responses", () => {
  const sentHandoff = { ...draft, status: "SENT" as const };
  const input = {
    handoff: sentHandoff,
    provider: connectorProvider,
    providerEventId: "provider-event-1",
    responseStatus: "RECEIVED" as const,
    plainTextMessage: "Fictional response received.",
    proposedStartAt: null,
    connectorGate,
    webhookEvidence: {
      handoffId: "handoff-1",
      homeId: "home-1",
      providerId: "provider-1",
      connectorId: "connector-fictional",
      externalProviderAccountId: "provider-account-1",
      providerEventId: "provider-event-1",
      responseDigest: providerHandoffBindings.webhookResponse({
        handoff: sentHandoff,
        providerEventId: "provider-event-1",
        responseStatus: "RECEIVED",
        plainTextMessage: "Fictional response received.",
        proposedStartAt: null,
      }),
      receivedAt: new Date("2026-07-28T07:59:00.000Z"),
      secretConfigured: true,
      signatureValid: true,
      responseScopeAllowed: true,
    },
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
      webhookEvidence: {
        ...input.webhookEvidence,
        signatureValid: false,
      },
    }),
    { status: "provider-gate", reason: "webhook" },
  );
  assert.deepEqual(
    decideProviderWebhookIngress({
      ...input,
      webhookEvidence: {
        ...input.webhookEvidence,
        receivedAt: new Date("2026-07-28T07:54:59.000Z"),
      },
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
  const sentHandoff = { ...draft, status: "SENT" as const };
  const input = {
    handoff: sentHandoff,
    provider: connectorProvider,
    providerEventId: "provider-event-1",
    responseStatus: "RECEIVED" as const,
    plainTextMessage: null,
    proposedStartAt: null,
    connectorGate,
    webhookEvidence: {
      handoffId: "handoff-1",
      homeId: "home-1",
      providerId: "provider-1",
      connectorId: "connector-fictional",
      externalProviderAccountId: "provider-account-1",
      providerEventId: "provider-event-1",
      responseDigest: providerHandoffBindings.webhookResponse({
        handoff: sentHandoff,
        providerEventId: "provider-event-1",
        responseStatus: "RECEIVED",
        plainTextMessage: null,
        proposedStartAt: null,
      }),
      receivedAt: now,
      secretConfigured: true,
      signatureValid: true,
      responseScopeAllowed: true,
    },
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

test("rejects substituted webhook identity and response evidence", () => {
  const sentHandoff = { ...draft, status: "SENT" as const };
  const input = {
    handoff: sentHandoff,
    provider: connectorProvider,
    providerEventId: "provider-event-1",
    responseStatus: "RECEIVED" as const,
    plainTextMessage: "Fictional response received.",
    proposedStartAt: null,
    connectorGate,
    webhookEvidence: {
      handoffId: "handoff-1",
      homeId: "home-1",
      providerId: "provider-1",
      connectorId: "connector-fictional",
      externalProviderAccountId: "provider-account-1",
      providerEventId: "provider-event-1",
      responseDigest: "substituted",
      receivedAt: now,
      secretConfigured: true,
      signatureValid: true,
      responseScopeAllowed: true,
    },
    now,
  };
  assert.deepEqual(decideProviderWebhookIngress(input), {
    status: "provider-gate",
    reason: "webhook",
  });
  assert.deepEqual(
    decideProviderWebhookIngress({
      ...input,
      webhookEvidence: {
        ...input.webhookEvidence,
        responseDigest: providerHandoffBindings.webhookResponse({
          handoff: sentHandoff,
          providerEventId: "provider-event-1",
          responseStatus: "RECEIVED",
          plainTextMessage: "Fictional response received.",
          proposedStartAt: null,
        }),
        providerId: "provider-2",
      },
    }),
    { status: "provider-gate", reason: "webhook" },
  );
});

test("keeps provider responses review-only and uses normal task updates", () => {
  const responseNow = new Date("2026-07-28T08:02:00.000Z");
  const sentHandoff = { ...draft, status: "SENT" as const };
  const reviewConfirmation = confirmation(
    "RESPONSE_REVIEW",
    response.id,
    providerHandoffBindings.response(sentHandoff, response),
  );
  const decision = decideProviderResponseReview({
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    membershipEvidence: { ...membershipEvidence, role: "OWNER" },
    handoff: sentHandoff,
    task,
    provider: connectorProvider,
    response,
    confirmationEvidence: reviewConfirmation,
    now: responseNow,
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
      membershipEvidence: { ...membershipEvidence, role: "OWNER" },
      handoff: sentHandoff,
      task,
      provider: emailProvider,
      response,
      confirmationEvidence: reviewConfirmation,
      now: responseNow,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideProviderResponseReview({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      membershipEvidence: { ...membershipEvidence, role: "OWNER" },
      handoff: sentHandoff,
      task,
      provider: connectorProvider,
      response: { ...response, status: "AUTO_BOOKED" as never },
      confirmationEvidence: reviewConfirmation,
      now: responseNow,
    }),
    { status: "unavailable" },
  );
});

test("cancellation never claims external completion or automates refunds", () => {
  const sentDraft = { ...draft, status: "SENT" as const };
  const cancellationConfirmation = confirmation(
    "CANCELLATION",
    sentDraft.id,
    providerHandoffBindings.cancellation(sentDraft, connectorProvider),
  );
  assert.deepEqual(
    decideProviderCancellation({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      membershipEvidence,
      handoff: sentDraft,
      provider: connectorProvider,
      confirmationEvidence: cancellationConfirmation,
      now,
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
      membershipEvidence,
      handoff: { ...sentDraft, disclosures: [] },
      provider: connectorProvider,
      confirmationEvidence: cancellationConfirmation,
      now,
    }),
    { status: "unavailable" },
  );
});

test("lifecycle cleanup removes integrations without deleting tasks by default", () => {
  const providerCleanupEvidence = {
    scope: "PROVIDER" as const,
    homeId: "home-1",
    subjectId: "provider-1",
    issuedAt,
    expiresAt,
    serverAuthorized: true,
  };
  assert.deepEqual(decideProviderCleanup({
    evidence: providerCleanupEvidence,
    expectedHomeId: "home-1",
    expectedSubjectId: "provider-1",
    now,
  }), {
    status: "cleanup-authorized",
    scope: "PROVIDER",
    archiveProviderProfile: true,
    revokeConnectorCredentials: true,
    removeWebhookSubscription: true,
    cancelPendingHandoffs: true,
    deleteDraftPayloads: true,
    deleteProviderResponses: true,
    deleteProviderCopies: true,
    deleteWebhookQueues: true,
    deleteIdempotencyKeys: true,
    deleteServerCaches: true,
    deleteDeviceOfflineCopies: true,
    deleteQueuedActions: true,
    deleteNotificationReferences: true,
    redactSensitiveAuditPayloads: true,
    deleteAuditAfter: new Date("2026-08-27T08:00:00.000Z"),
    deleteHouseholdTask: false,
    requireRetryableCleanupLedger: true,
  });
  const propertyCleanup = decideProviderCleanup({
    evidence: {
      ...providerCleanupEvidence,
      scope: "PROPERTY",
      subjectId: "home-1",
    },
    expectedHomeId: "home-1",
    expectedSubjectId: "home-1",
    now,
  });
  assert.equal(propertyCleanup.status, "cleanup-authorized");
  if (propertyCleanup.status !== "cleanup-authorized") return;
  assert.equal(propertyCleanup.deleteHouseholdTask, true);
  assert.deepEqual(
    decideProviderCleanup({
      evidence: {
        ...providerCleanupEvidence,
        scope: "EVERYTHING" as never,
      },
      expectedHomeId: "home-1",
      expectedSubjectId: "provider-1",
      now,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideProviderCleanup({
      evidence: {
        ...providerCleanupEvidence,
        scope: "PROPERTY",
        subjectId: "home-1",
      },
      expectedHomeId: "home-1",
      expectedSubjectId: "home-1",
      now: new Date("invalid"),
    }),
    { status: "unavailable" },
  );
});

test("binds cleanup authorization to exact scope, property and subject", () => {
  const evidence = {
    scope: "PROVIDER" as const,
    homeId: "home-1",
    subjectId: "provider-1",
    issuedAt,
    expiresAt,
    serverAuthorized: true,
  };
  assert.deepEqual(
    decideProviderCleanup({
      evidence,
      expectedHomeId: "home-2",
      expectedSubjectId: "provider-1",
      now,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideProviderCleanup({
      evidence: { ...evidence, serverAuthorized: "true" as never },
      expectedHomeId: "home-1",
      expectedSubjectId: "provider-1",
      now,
    }),
    { status: "unavailable" },
  );
});
