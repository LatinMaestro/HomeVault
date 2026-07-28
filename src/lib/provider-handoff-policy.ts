export const PROVIDER_HANDOFF_POLICY_VERSION = "homevault-provider-handoff-v1";
export const PROVIDER_WEBHOOK_MAX_AGE_MS = 5 * 60 * 1000;
export const PROVIDER_HANDOFF_DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const PROVIDER_HANDOFF_MAX_MESSAGE_CHARACTERS = 2_000;
export const PROVIDER_HANDOFF_MAX_WINDOWS = 5;
export const PROVIDER_HANDOFF_AUDIT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export const PROVIDER_DISCLOSURE_FIELDS = [
  "SERVICE_CATEGORY",
  "SANITIZED_TASK_SUMMARY",
  "PREFERRED_CONTACT_METHOD",
  "CONTACT_NAME",
  "CONTACT_EMAIL",
  "CONTACT_PHONE",
  "SUBURB_POSTCODE",
  "SERVICE_ADDRESS",
  "AVAILABILITY_WINDOWS",
] as const;

export const PROVIDER_CONNECTOR_SCOPES = [
  "booking:write",
  "messages:write",
  "responses:read",
] as const;

const PROVIDER_HANDOFF_ROLES = ["OWNER", "ADULT", "CHILD", "GUEST"] as const;
const PROVIDER_HANDOFF_KINDS = [
  "ENQUIRY",
  "MESSAGE",
  "BOOKING_REQUEST",
] as const;
const PROVIDER_HANDOFF_STATUSES = [
  "DRAFT",
  "REVIEWED",
  "SENDING",
  "SENT",
  "ACKNOWLEDGED",
  "DECLINED",
  "CANCELLATION_PENDING",
  "CANCELLED",
  "FAILED",
] as const;
const PROVIDER_RESPONSE_STATUSES = [
  "RECEIVED",
  "PROPOSED_TIME",
  "ACKNOWLEDGED",
  "DECLINED",
  "CANCELLED",
] as const;
const PROVIDER_CLEANUP_SCOPES = [
  "HANDOFF",
  "PROVIDER",
  "TASK",
  "PROPERTY",
  "ACCOUNT",
] as const;

export type ProviderDisclosureField =
  (typeof PROVIDER_DISCLOSURE_FIELDS)[number];
export type ProviderConnectorScope =
  (typeof PROVIDER_CONNECTOR_SCOPES)[number];
export type ProviderHandoffRole = "OWNER" | "ADULT" | "CHILD" | "GUEST";
export type ProviderHandoffKind = "ENQUIRY" | "MESSAGE" | "BOOKING_REQUEST";

export type ProviderProfile = {
  id: string;
  homeId: string;
  revision: number;
  status: "ACTIVE" | "ARCHIVED";
  displayName: string;
  serviceCategories: readonly string[];
  channel:
    | {
        type: "USER_MEDIATED_EMAIL";
        emailAddress: string;
      }
    | {
        type: "APPROVED_CONNECTOR";
        connectorId: string;
        externalProviderAccountId: string;
      };
};

export type ProviderTaskSnapshot = {
  id: string;
  homeId: string;
  revision: number;
  status: "ACTIVE" | "ARCHIVED" | "DELETED";
  serviceCategory: string;
};

export type ProviderDisclosure = {
  field: ProviderDisclosureField;
  value: string;
  explicitlyConfirmed: boolean;
};

export type ProviderHandoffDraft = {
  id: string;
  homeId: string;
  taskId: string;
  taskRevision: number;
  providerId: string;
  providerRevision: number;
  policyVersion: typeof PROVIDER_HANDOFF_POLICY_VERSION;
  kind: ProviderHandoffKind;
  createdByUserId: string;
  createdAt: Date;
  status:
    | "DRAFT"
    | "REVIEWED"
    | "SENDING"
    | "SENT"
    | "ACKNOWLEDGED"
    | "DECLINED"
    | "CANCELLATION_PENDING"
    | "CANCELLED"
    | "FAILED";
  disclosures: readonly ProviderDisclosure[];
  canonicalPayloadDigest: string;
};

export type ProviderConnectorGate = {
  providerApproved: boolean;
  accountApproved: boolean;
  costApproved: boolean;
  privacyApproved: boolean;
  approvedRegionConfigured: boolean;
  boundedRetentionConfigured: boolean;
  oauthScopes: readonly string[];
  credentialsServerHeld: boolean;
};

export type ProviderHandoffResponse = {
  id: string;
  handoffId: string;
  homeId: string;
  providerId: string;
  providerEventId: string;
  status:
    | "RECEIVED"
    | "PROPOSED_TIME"
    | "ACKNOWLEDGED"
    | "DECLINED"
    | "CANCELLED";
  plainTextMessage: string | null;
  proposedStartAt: Date | null;
  createdAt: Date;
  reviewedAt: Date | null;
};

export type ProviderProfileDecision =
  | {
      status: "profile-save-authorized";
      homeId: string;
      providerId: string;
      providerRevision: number;
      channelType: ProviderProfile["channel"]["type"];
      userSuppliedProfile: true;
      advertisingProfile: false;
      trackingProfile: false;
    }
  | { status: "confirmation-required" }
  | { status: "read-only" }
  | { status: "unavailable" };

export type ProviderHandoffDraftDecision =
  | {
      status: "draft-authorized";
      homeId: string;
      taskId: string;
      taskRevision: number;
      providerId: string;
      providerRevision: number;
      kind: ProviderHandoffKind;
      disclosures: ProviderDisclosure[];
      noAttachments: true;
      noUnrelatedRecords: true;
      noPaymentCredentials: true;
      noInsuranceClaimAutomation: true;
      noBudgetOrValuationAdvice: true;
      noAdvertisingOrTrackingData: true;
      requireFinalPreview: true;
    }
  | { status: "confirmation-required" }
  | { status: "read-only" }
  | { status: "unavailable" };

export type ProviderHandoffSendDecision =
  | {
      status: "user-mediated-handoff-authorized";
      handoffId: string;
      openUserEmailClient: true;
      sendFromHomeVaultServer: false;
      markSentAutomatically: false;
      requireUserOutcomeConfirmation: true;
      exposeInternalIdsInUri: false;
      exposePrivateFiles: false;
    }
  | {
      status: "connector-send-authorized";
      handoffId: string;
      idempotencyKey: string;
      canonicalPayloadDigest: string;
      allowedScopes: ProviderConnectorScope[];
      markSentOnlyAfterProviderAck: true;
      discloseOnlyReviewedPayload: true;
      exposePrivateFiles: false;
      automatedPaymentAllowed: false;
    }
  | {
      status: "connector-gate";
      reason: "provider" | "account" | "cost" | "privacy" | "region" | "retention";
    }
  | { status: "confirmation-required" }
  | { status: "read-only" }
  | { status: "stale" }
  | { status: "unavailable" };

export type ProviderWebhookDecision =
  | {
      status: "response-quarantine-authorized";
      handoffId: string;
      providerEventId: string;
      reviewRequired: true;
      updateHouseholdRecordAutomatically: false;
      createBookingAutomatically: false;
      automatedPaymentAllowed: false;
      loadExternalUrls: false;
    }
  | { status: "duplicate"; responseId: string }
  | {
      status: "provider-gate";
      reason:
        | "provider"
        | "account"
        | "cost"
        | "privacy"
        | "region"
        | "retention"
        | "webhook"
        | "scope";
    }
  | { status: "invalid-response"; reason: "replay" | "schema" }
  | { status: "unavailable" };

export type ProviderResponseReviewDecision =
  | {
      status: "response-review-authorized";
      handoffId: string;
      responseId: string;
      acknowledgedStatus: ProviderHandoffResponse["status"];
      preserveProviderProvenance: true;
      updateMaintenanceAutomatically: false;
      requireNormalTaskUpdate: true;
      confirmedAppointment: false;
      automatedPaymentAllowed: false;
    }
  | { status: "confirmation-required" }
  | { status: "read-only" }
  | { status: "stale" }
  | { status: "unavailable" };

export type ProviderCancellationDecision =
  | {
      status: "cancellation-authorized";
      handoffId: string;
      sendCancellationRequest: boolean;
      markExternallyCancelledImmediately: false;
      requireProviderOrUserConfirmation: true;
      automatedRefundAllowed: false;
      automatedPaymentAllowed: false;
    }
  | { status: "read-only" }
  | { status: "unavailable" };

export type ProviderCleanupDecision =
  | {
      status: "cleanup-authorized";
      scope: "HANDOFF" | "PROVIDER" | "TASK" | "PROPERTY" | "ACCOUNT";
      archiveProviderProfile: boolean;
      revokeConnectorCredentials: boolean;
      removeWebhookSubscription: boolean;
      cancelPendingHandoffs: true;
      deleteDraftPayloads: true;
      deleteProviderResponses: true;
      deleteAuditAfter: Date;
      deleteHouseholdTask: boolean;
      requireRetryableCleanupLedger: true;
    }
  | { status: "unavailable" };

function hasWriteRole(role: ProviderHandoffRole) {
  return role === "OWNER" || role === "ADULT";
}

function validRole(value: ProviderHandoffRole) {
  return PROVIDER_HANDOFF_ROLES.includes(value);
}

function validText(value: unknown, maximum: number) {
  if (typeof value !== "string") return false;
  const normalized = value.trim();
  return (
    normalized.length > 0 &&
    normalized.length <= maximum &&
    !normalized.includes("\0") &&
    !normalized.includes("\r") &&
    !normalized.includes("\n")
  );
}

function validDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function validEmailAddress(value: string) {
  if (!validText(value, 254)) return false;
  const parts = value.trim().toLowerCase().split("@");
  return (
    parts.length === 2 &&
    parts[0].length > 0 &&
    parts[0].length <= 64 &&
    parts[1].includes(".") &&
    !parts[1].startsWith(".") &&
    !parts[1].endsWith(".")
  );
}

function uniqueValues<T>(values: readonly T[]) {
  return new Set(values).size === values.length;
}

function validProvider(provider: ProviderProfile) {
  if (
    typeof provider !== "object" ||
    provider === null ||
    !Array.isArray(provider.serviceCategories) ||
    typeof provider.channel !== "object" ||
    provider.channel === null
  ) {
    return false;
  }
  return (
    validText(provider.id, 200) &&
    validText(provider.homeId, 200) &&
    validText(provider.displayName, 200) &&
    Number.isInteger(provider.revision) &&
    provider.revision >= 1 &&
    provider.status === "ACTIVE" &&
    provider.serviceCategories.length > 0 &&
    uniqueValues(provider.serviceCategories) &&
    provider.serviceCategories.every((category) => validText(category, 100)) &&
    (provider.channel.type === "USER_MEDIATED_EMAIL"
      ? validEmailAddress(provider.channel.emailAddress)
      : provider.channel.type === "APPROVED_CONNECTOR" &&
        validText(provider.channel.connectorId, 200) &&
        validText(provider.channel.externalProviderAccountId, 200))
  );
}

function validTask(task: ProviderTaskSnapshot) {
  if (typeof task !== "object" || task === null) return false;
  return (
    validText(task.id, 200) &&
    validText(task.homeId, 200) &&
    validText(task.serviceCategory, 100) &&
    Number.isInteger(task.revision) &&
    task.revision >= 1 &&
    task.status === "ACTIVE"
  );
}

function validDisclosureValue(disclosure: ProviderDisclosure) {
  switch (disclosure.field) {
    case "CONTACT_EMAIL":
      return validEmailAddress(disclosure.value);
    case "CONTACT_PHONE":
      return (
        validText(disclosure.value, 30) &&
        /^[+()\d .-]+$/.test(disclosure.value)
      );
    case "SUBURB_POSTCODE":
      return validText(disclosure.value, 120);
    case "SERVICE_ADDRESS":
      return validText(disclosure.value, 300);
    case "AVAILABILITY_WINDOWS":
      return (
        validText(disclosure.value, 800) &&
        disclosure.value.split("|").length <= PROVIDER_HANDOFF_MAX_WINDOWS
      );
    case "SANITIZED_TASK_SUMMARY":
      return validText(
        disclosure.value,
        PROVIDER_HANDOFF_MAX_MESSAGE_CHARACTERS,
      );
    case "SERVICE_CATEGORY":
    case "PREFERRED_CONTACT_METHOD":
    case "CONTACT_NAME":
      return validText(disclosure.value, 200);
  }
}

function validDisclosures(disclosures: readonly ProviderDisclosure[]) {
  return (
    Array.isArray(disclosures) &&
    disclosures.length > 0 &&
    uniqueValues(disclosures.map((disclosure) => disclosure.field)) &&
    disclosures.every(
      (disclosure) =>
        typeof disclosure === "object" &&
        disclosure !== null &&
        PROVIDER_DISCLOSURE_FIELDS.includes(disclosure.field) &&
        disclosure.explicitlyConfirmed === true &&
        validDisclosureValue(disclosure),
    )
  );
}

function validDraftEnvelope(draft: ProviderHandoffDraft) {
  if (
    typeof draft !== "object" ||
    draft === null ||
    !Array.isArray(draft.disclosures)
  ) {
    return false;
  }
  return (
    validText(draft.id, 200) &&
    validText(draft.homeId, 200) &&
    validText(draft.taskId, 200) &&
    validText(draft.providerId, 200) &&
    validText(draft.createdByUserId, 200) &&
    validText(draft.canonicalPayloadDigest, 256) &&
    validDate(draft.createdAt) &&
    Number.isInteger(draft.taskRevision) &&
    draft.taskRevision >= 1 &&
    Number.isInteger(draft.providerRevision) &&
    draft.providerRevision >= 1 &&
    draft.policyVersion === PROVIDER_HANDOFF_POLICY_VERSION &&
    PROVIDER_HANDOFF_KINDS.includes(draft.kind) &&
    PROVIDER_HANDOFF_STATUSES.includes(draft.status) &&
    validDisclosures(draft.disclosures)
  );
}

function validConnectorGateShape(gate: ProviderConnectorGate) {
  return (
    typeof gate === "object" &&
    gate !== null &&
    Array.isArray(gate.oauthScopes) &&
    gate.oauthScopes.every((scope) => validText(scope, 100))
  );
}

function exactDraftDependencies(
  draft: ProviderHandoffDraft,
  task: ProviderTaskSnapshot,
  provider: ProviderProfile,
) {
  return (
    validDraftEnvelope(draft) &&
    validTask(task) &&
    validProvider(provider) &&
    draft.homeId === task.homeId &&
    draft.homeId === provider.homeId &&
    draft.taskId === task.id &&
    draft.taskRevision === task.revision &&
    draft.providerId === provider.id &&
    draft.providerRevision === provider.revision &&
    draft.disclosures.some(
      (disclosure) =>
        disclosure.field === "SERVICE_CATEGORY" &&
        disclosure.value.trim().toLowerCase() ===
          task.serviceCategory.trim().toLowerCase(),
    )
  );
}

function connectorGateReason(
  gate: ProviderConnectorGate,
):
  | "provider"
  | "account"
  | "cost"
  | "privacy"
  | "region"
  | "retention"
  | null {
  if (!validConnectorGateShape(gate) || gate.providerApproved !== true) {
    return "provider";
  }
  if (gate.accountApproved !== true) return "account";
  if (gate.costApproved !== true) return "cost";
  if (gate.privacyApproved !== true) return "privacy";
  if (gate.approvedRegionConfigured !== true) return "region";
  if (gate.boundedRetentionConfigured !== true) return "retention";
  return null;
}

export function decideProviderProfileSave({
  currentUserId,
  selectedHomeId,
  sessionVerified,
  hasCurrentMembership,
  role,
  profile,
  explicitConfirmation,
  connectorGate,
}: {
  currentUserId: string;
  selectedHomeId: string;
  sessionVerified: boolean;
  hasCurrentMembership: boolean;
  role: ProviderHandoffRole;
  profile: ProviderProfile;
  explicitConfirmation: boolean;
  connectorGate: ProviderConnectorGate | null;
}): ProviderProfileDecision {
  if (
    !validText(currentUserId, 200) ||
    !validText(selectedHomeId, 200) ||
    sessionVerified !== true ||
    hasCurrentMembership !== true ||
    !validRole(role) ||
    !validProvider(profile) ||
    profile.homeId !== selectedHomeId
  ) {
    return { status: "unavailable" };
  }
  if (!hasWriteRole(role)) return { status: "read-only" };
  if (explicitConfirmation !== true) {
    return { status: "confirmation-required" };
  }
  if (profile.channel.type === "APPROVED_CONNECTOR") {
    if (connectorGate === null) return { status: "unavailable" };
    if (
      connectorGateReason(connectorGate) !== null ||
      connectorGate.credentialsServerHeld !== true ||
      !uniqueValues(connectorGate.oauthScopes) ||
      connectorGate.oauthScopes.some(
        (scope) =>
          !PROVIDER_CONNECTOR_SCOPES.includes(scope as ProviderConnectorScope),
      )
    ) {
      return { status: "unavailable" };
    }
  }
  return {
    status: "profile-save-authorized",
    homeId: selectedHomeId,
    providerId: profile.id,
    providerRevision: profile.revision,
    channelType: profile.channel.type,
    userSuppliedProfile: true,
    advertisingProfile: false,
    trackingProfile: false,
  };
}

export function decideProviderHandoffDraft({
  currentUserId,
  selectedHomeId,
  sessionVerified,
  hasCurrentMembership,
  role,
  task,
  provider,
  kind,
  disclosures,
  explicitDisclosureReview,
  containsPaymentCredentials,
  containsInsuranceClaimInstructions,
  containsBudgetOrValuationAdvice,
  containsAdvertisingOrTrackingData,
  containsUnrelatedHouseholdData,
  containsAttachmentOrPrivateUrl,
}: {
  currentUserId: string;
  selectedHomeId: string;
  sessionVerified: boolean;
  hasCurrentMembership: boolean;
  role: ProviderHandoffRole;
  task: ProviderTaskSnapshot;
  provider: ProviderProfile;
  kind: ProviderHandoffKind;
  disclosures: readonly ProviderDisclosure[];
  explicitDisclosureReview: boolean;
  containsPaymentCredentials: boolean;
  containsInsuranceClaimInstructions: boolean;
  containsBudgetOrValuationAdvice: boolean;
  containsAdvertisingOrTrackingData: boolean;
  containsUnrelatedHouseholdData: boolean;
  containsAttachmentOrPrivateUrl: boolean;
}): ProviderHandoffDraftDecision {
  if (
    !validText(currentUserId, 200) ||
    !validText(selectedHomeId, 200) ||
    sessionVerified !== true ||
    hasCurrentMembership !== true ||
    !validRole(role) ||
    !PROVIDER_HANDOFF_KINDS.includes(kind) ||
    !validTask(task) ||
    !validProvider(provider) ||
    task.homeId !== selectedHomeId ||
    provider.homeId !== selectedHomeId ||
    !provider.serviceCategories.includes(task.serviceCategory)
  ) {
    return { status: "unavailable" };
  }
  if (!hasWriteRole(role)) return { status: "read-only" };
  if (explicitDisclosureReview !== true) {
    return { status: "confirmation-required" };
  }
  if (
    !validDisclosures(disclosures) ||
    containsPaymentCredentials !== false ||
    containsInsuranceClaimInstructions !== false ||
    containsBudgetOrValuationAdvice !== false ||
    containsAdvertisingOrTrackingData !== false ||
    containsUnrelatedHouseholdData !== false ||
    containsAttachmentOrPrivateUrl !== false
  ) {
    return { status: "unavailable" };
  }
  const category = disclosures.find(
    (disclosure) => disclosure.field === "SERVICE_CATEGORY",
  );
  if (
    !category ||
    category.value.trim().toLowerCase() !==
      task.serviceCategory.trim().toLowerCase()
  ) {
    return { status: "unavailable" };
  }
  return {
    status: "draft-authorized",
    homeId: selectedHomeId,
    taskId: task.id,
    taskRevision: task.revision,
    providerId: provider.id,
    providerRevision: provider.revision,
    kind,
    disclosures: disclosures.map((disclosure) => ({ ...disclosure })),
    noAttachments: true,
    noUnrelatedRecords: true,
    noPaymentCredentials: true,
    noInsuranceClaimAutomation: true,
    noBudgetOrValuationAdvice: true,
    noAdvertisingOrTrackingData: true,
    requireFinalPreview: true,
  };
}

export function decideProviderHandoffSend({
  currentUserId,
  selectedHomeId,
  sessionVerified,
  hasCurrentMembership,
  role,
  task,
  provider,
  draft,
  canonicalPayloadDigestServerVerified,
  finalPreviewConfirmed,
  idempotencyKey,
  idempotencyKeyServerGenerated,
  connectorGate,
  now,
}: {
  currentUserId: string;
  selectedHomeId: string;
  sessionVerified: boolean;
  hasCurrentMembership: boolean;
  role: ProviderHandoffRole;
  task: ProviderTaskSnapshot;
  provider: ProviderProfile;
  draft: ProviderHandoffDraft;
  canonicalPayloadDigestServerVerified: boolean;
  finalPreviewConfirmed: boolean;
  idempotencyKey: string;
  idempotencyKeyServerGenerated: boolean;
  connectorGate: ProviderConnectorGate | null;
  now: Date;
}): ProviderHandoffSendDecision {
  if (
    !validText(currentUserId, 200) ||
    !validText(selectedHomeId, 200) ||
    sessionVerified !== true ||
    hasCurrentMembership !== true ||
    !validRole(role) ||
    !validDraftEnvelope(draft) ||
    draft.homeId !== selectedHomeId ||
    draft.createdByUserId !== currentUserId ||
    draft.status !== "REVIEWED" ||
    !validDate(draft.createdAt) ||
    !validDate(now) ||
    draft.createdAt > now ||
    now.getTime() - draft.createdAt.getTime() >
      PROVIDER_HANDOFF_DRAFT_MAX_AGE_MS
  ) {
    return { status: "unavailable" };
  }
  if (!hasWriteRole(role)) return { status: "read-only" };
  if (!exactDraftDependencies(draft, task, provider)) {
    return { status: "stale" };
  }
  if (
    canonicalPayloadDigestServerVerified !== true ||
    !validText(draft.canonicalPayloadDigest, 256) ||
    !validText(idempotencyKey, 200) ||
    idempotencyKeyServerGenerated !== true
  ) {
    return { status: "unavailable" };
  }
  if (finalPreviewConfirmed !== true) {
    return { status: "confirmation-required" };
  }
  if (provider.channel.type === "USER_MEDIATED_EMAIL") {
    return {
      status: "user-mediated-handoff-authorized",
      handoffId: draft.id,
      openUserEmailClient: true,
      sendFromHomeVaultServer: false,
      markSentAutomatically: false,
      requireUserOutcomeConfirmation: true,
      exposeInternalIdsInUri: false,
      exposePrivateFiles: false,
    };
  }
  if (connectorGate === null) {
    return { status: "connector-gate", reason: "provider" };
  }
  const reason = connectorGateReason(connectorGate);
  if (reason) return { status: "connector-gate", reason };
  if (
    connectorGate.credentialsServerHeld !== true ||
    !uniqueValues(connectorGate.oauthScopes) ||
    connectorGate.oauthScopes.some(
      (scope) =>
        !PROVIDER_CONNECTOR_SCOPES.includes(scope as ProviderConnectorScope),
    )
  ) {
    return { status: "unavailable" };
  }
  const requiredScopes: ProviderConnectorScope[] =
    draft.kind === "BOOKING_REQUEST"
      ? ["booking:write", "responses:read"]
      : ["messages:write", "responses:read"];
  if (
    requiredScopes.some(
      (requiredScope) => !connectorGate.oauthScopes.includes(requiredScope),
    )
  ) {
    return { status: "unavailable" };
  }
  return {
    status: "connector-send-authorized",
    handoffId: draft.id,
    idempotencyKey,
    canonicalPayloadDigest: draft.canonicalPayloadDigest,
    allowedScopes: requiredScopes,
    markSentOnlyAfterProviderAck: true,
    discloseOnlyReviewedPayload: true,
    exposePrivateFiles: false,
    automatedPaymentAllowed: false,
  };
}

export function decideProviderWebhookIngress({
  handoff,
  provider,
  providerEventId,
  responseStatus,
  plainTextMessage,
  proposedStartAt,
  connectorGate,
  webhookSecretConfigured,
  webhookSignatureValid,
  webhookTimestamp,
  connectorScopeAllowed,
  existingResponse,
  now,
}: {
  handoff: ProviderHandoffDraft;
  provider: ProviderProfile;
  providerEventId: string;
  responseStatus: ProviderHandoffResponse["status"];
  plainTextMessage: string | null;
  proposedStartAt: Date | null;
  connectorGate: ProviderConnectorGate;
  webhookSecretConfigured: boolean;
  webhookSignatureValid: boolean;
  webhookTimestamp: Date;
  connectorScopeAllowed: boolean;
  existingResponse?: Pick<
    ProviderHandoffResponse,
    "id" | "handoffId" | "homeId" | "providerId" | "providerEventId"
  >;
  now: Date;
}): ProviderWebhookDecision {
  if (
    !validConnectorGateShape(connectorGate) ||
    !validDate(now) ||
    !validDate(webhookTimestamp) ||
    !validDraftEnvelope(handoff) ||
    !validProvider(provider) ||
    handoff.providerId !== provider.id ||
    handoff.homeId !== provider.homeId ||
    handoff.providerRevision !== provider.revision ||
    handoff.policyVersion !== PROVIDER_HANDOFF_POLICY_VERSION ||
    !["SENDING", "SENT", "ACKNOWLEDGED", "CANCELLATION_PENDING"].includes(
      handoff.status,
    ) ||
    provider.channel.type !== "APPROVED_CONNECTOR" ||
    !validText(providerEventId, 200)
  ) {
    return { status: "unavailable" };
  }
  const gateReason = connectorGateReason(connectorGate);
  if (gateReason) return { status: "provider-gate", reason: gateReason };
  if (
    connectorGate.credentialsServerHeld !== true ||
    !connectorGate.oauthScopes.includes("responses:read")
  ) {
    return { status: "provider-gate", reason: "scope" };
  }
  if (
    webhookSecretConfigured !== true ||
    webhookSignatureValid !== true
  ) {
    return { status: "provider-gate", reason: "webhook" };
  }
  if (connectorScopeAllowed !== true) {
    return { status: "provider-gate", reason: "scope" };
  }
  const webhookAge = now.getTime() - webhookTimestamp.getTime();
  if (webhookAge < 0 || webhookAge > PROVIDER_WEBHOOK_MAX_AGE_MS) {
    return { status: "invalid-response", reason: "replay" };
  }
  if (
    !PROVIDER_RESPONSE_STATUSES.includes(responseStatus) ||
    (plainTextMessage !== null &&
      !validText(plainTextMessage, PROVIDER_HANDOFF_MAX_MESSAGE_CHARACTERS)) ||
    (proposedStartAt !== null &&
      (!validDate(proposedStartAt) || proposedStartAt <= now)) ||
    (responseStatus === "PROPOSED_TIME" && proposedStartAt === null) ||
    (responseStatus !== "PROPOSED_TIME" && proposedStartAt !== null)
  ) {
    return { status: "invalid-response", reason: "schema" };
  }
  if (existingResponse) {
    if (
      !validText(existingResponse.id, 200) ||
      !validText(existingResponse.providerEventId, 200) ||
      existingResponse.handoffId !== handoff.id ||
      existingResponse.homeId !== handoff.homeId ||
      existingResponse.providerId !== provider.id
    ) {
      return { status: "unavailable" };
    }
    if (existingResponse.providerEventId === providerEventId) {
      return { status: "duplicate", responseId: existingResponse.id };
    }
  }
  return {
    status: "response-quarantine-authorized",
    handoffId: handoff.id,
    providerEventId,
    reviewRequired: true,
    updateHouseholdRecordAutomatically: false,
    createBookingAutomatically: false,
    automatedPaymentAllowed: false,
    loadExternalUrls: false,
  };
}

export function decideProviderResponseReview({
  currentUserId,
  selectedHomeId,
  sessionVerified,
  hasCurrentMembership,
  role,
  handoff,
  task,
  provider,
  response,
  explicitConfirmation,
  now,
}: {
  currentUserId: string;
  selectedHomeId: string;
  sessionVerified: boolean;
  hasCurrentMembership: boolean;
  role: ProviderHandoffRole;
  handoff: ProviderHandoffDraft;
  task: ProviderTaskSnapshot;
  provider: ProviderProfile;
  response: ProviderHandoffResponse;
  explicitConfirmation: boolean;
  now: Date;
}): ProviderResponseReviewDecision {
  if (
    !validText(currentUserId, 200) ||
    !validText(selectedHomeId, 200) ||
    sessionVerified !== true ||
    hasCurrentMembership !== true ||
    !validRole(role) ||
    !validDate(now) ||
    typeof response !== "object" ||
    response === null ||
    !validDraftEnvelope(handoff) ||
    !validProvider(provider) ||
    response.homeId !== selectedHomeId ||
    response.handoffId !== handoff.id ||
    response.providerId !== provider.id ||
    response.reviewedAt !== null ||
    !["SENT", "ACKNOWLEDGED", "CANCELLATION_PENDING"].includes(
      handoff.status,
    ) ||
    provider.channel.type !== "APPROVED_CONNECTOR"
  ) {
    return { status: "unavailable" };
  }
  if (!hasWriteRole(role)) return { status: "read-only" };
  if (!exactDraftDependencies(handoff, task, provider)) {
    return { status: "stale" };
  }
  if (explicitConfirmation !== true) {
    return { status: "confirmation-required" };
  }
  if (
    !validText(response.id, 200) ||
    !validText(response.providerEventId, 200) ||
    !validDate(response.createdAt) ||
    !PROVIDER_RESPONSE_STATUSES.includes(response.status) ||
    response.createdAt < handoff.createdAt ||
    response.createdAt > now ||
    (response.plainTextMessage !== null &&
      !validText(
        response.plainTextMessage,
        PROVIDER_HANDOFF_MAX_MESSAGE_CHARACTERS,
      )) ||
    (response.status === "PROPOSED_TIME" &&
      (response.proposedStartAt === null ||
        !validDate(response.proposedStartAt) ||
        response.proposedStartAt <= now)) ||
    (response.status !== "PROPOSED_TIME" &&
      response.proposedStartAt !== null)
  ) {
    return { status: "unavailable" };
  }
  return {
    status: "response-review-authorized",
    handoffId: handoff.id,
    responseId: response.id,
    acknowledgedStatus: response.status,
    preserveProviderProvenance: true,
    updateMaintenanceAutomatically: false,
    requireNormalTaskUpdate: true,
    confirmedAppointment: false,
    automatedPaymentAllowed: false,
  };
}

export function decideProviderCancellation({
  currentUserId,
  selectedHomeId,
  sessionVerified,
  hasCurrentMembership,
  role,
  handoff,
  provider,
}: {
  currentUserId: string;
  selectedHomeId: string;
  sessionVerified: boolean;
  hasCurrentMembership: boolean;
  role: ProviderHandoffRole;
  handoff: ProviderHandoffDraft;
  provider: ProviderProfile;
}): ProviderCancellationDecision {
  if (
    !validText(currentUserId, 200) ||
    !validText(selectedHomeId, 200) ||
    sessionVerified !== true ||
    hasCurrentMembership !== true ||
    !validRole(role) ||
    !validDraftEnvelope(handoff) ||
    handoff.homeId !== selectedHomeId ||
    !validProvider(provider) ||
    provider.homeId !== selectedHomeId ||
    handoff.providerId !== provider.id ||
    handoff.providerRevision !== provider.revision ||
    handoff.policyVersion !== PROVIDER_HANDOFF_POLICY_VERSION ||
    !["SENT", "ACKNOWLEDGED"].includes(handoff.status)
  ) {
    return { status: "unavailable" };
  }
  if (!hasWriteRole(role)) return { status: "read-only" };
  return {
    status: "cancellation-authorized",
    handoffId: handoff.id,
    sendCancellationRequest: provider.channel.type === "APPROVED_CONNECTOR",
    markExternallyCancelledImmediately: false,
    requireProviderOrUserConfirmation: true,
    automatedRefundAllowed: false,
    automatedPaymentAllowed: false,
  };
}

export function decideProviderCleanup({
  scope,
  now,
}: {
  scope: "HANDOFF" | "PROVIDER" | "TASK" | "PROPERTY" | "ACCOUNT";
  now: Date;
}): ProviderCleanupDecision {
  if (!PROVIDER_CLEANUP_SCOPES.includes(scope) || !validDate(now)) {
    return { status: "unavailable" };
  }
  return {
    status: "cleanup-authorized",
    scope,
    archiveProviderProfile:
      scope === "PROVIDER" || scope === "PROPERTY" || scope === "ACCOUNT",
    revokeConnectorCredentials:
      scope === "PROVIDER" || scope === "PROPERTY" || scope === "ACCOUNT",
    removeWebhookSubscription:
      scope === "PROVIDER" || scope === "PROPERTY" || scope === "ACCOUNT",
    cancelPendingHandoffs: true,
    deleteDraftPayloads: true,
    deleteProviderResponses: true,
    deleteAuditAfter: new Date(
      now.getTime() + PROVIDER_HANDOFF_AUDIT_RETENTION_MS,
    ),
    deleteHouseholdTask:
      scope === "TASK" || scope === "PROPERTY" || scope === "ACCOUNT",
    requireRetryableCleanupLedger: true,
  };
}
