import { createHash } from "node:crypto";

export const PROVIDER_HANDOFF_POLICY_VERSION = "homevault-provider-handoff-v1";
export const PROVIDER_WEBHOOK_MAX_AGE_MS = 5 * 60 * 1000;
export const PROVIDER_HANDOFF_DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const PROVIDER_EVIDENCE_MAX_AGE_MS = 10 * 60 * 1000;
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

export type ProviderMembershipEvidence = {
  userId: string;
  homeId: string;
  role: ProviderHandoffRole;
  active: boolean;
  membershipRevision: number;
};

export type ProviderConfirmationPurpose =
  | "PROFILE_SAVE"
  | "DRAFT_REVIEW"
  | "FINAL_PREVIEW"
  | "RESPONSE_REVIEW"
  | "CANCELLATION";

export type ProviderConfirmationEvidence = {
  id: string;
  userId: string;
  homeId: string;
  purpose: ProviderConfirmationPurpose;
  subjectId: string;
  bindingDigest: string;
  issuedAt: Date;
  expiresAt: Date;
  consumed: boolean;
};

export type ProviderDraftSafetyEvidence = {
  homeId: string;
  taskId: string;
  providerId: string;
  disclosureDigest: string;
  policyVersion: typeof PROVIDER_HANDOFF_POLICY_VERSION;
  scannedAt: Date;
  containsPaymentCredentials: boolean;
  containsInsuranceClaimInstructions: boolean;
  containsBudgetOrValuationAdvice: boolean;
  containsAdvertisingOrTrackingData: boolean;
  containsUnrelatedHouseholdData: boolean;
  containsAttachmentOrPrivateUrl: boolean;
};

export type ProviderPayloadEvidence = {
  handoffId: string;
  canonicalPayloadDigest: string;
  serverRecomputed: boolean;
};

export type ProviderIdempotencyEvidence = {
  handoffId: string;
  idempotencyKey: string;
  serverGenerated: boolean;
  consumed: boolean;
};

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
  approvalId: string;
  approvalVersion: number;
  connectorId: string;
  externalProviderAccountId: string;
  approvedAt: Date;
  expiresAt: Date;
  providerApproved: boolean;
  accountApproved: boolean;
  costApproved: boolean;
  privacyApproved: boolean;
  approvedRegionConfigured: boolean;
  boundedRetentionConfigured: boolean;
  oauthScopes: readonly string[];
  credentialsServerHeld: boolean;
};

export type ProviderWebhookEvidence = {
  handoffId: string;
  homeId: string;
  providerId: string;
  connectorId: string;
  externalProviderAccountId: string;
  providerEventId: string;
  responseDigest: string;
  receivedAt: Date;
  secretConfigured: boolean;
  signatureValid: boolean;
  responseScopeAllowed: boolean;
};

export type ProviderCleanupEvidence = {
  scope: "HANDOFF" | "PROVIDER" | "TASK" | "PROPERTY" | "ACCOUNT";
  homeId: string;
  subjectId: string;
  issuedAt: Date;
  expiresAt: Date;
  serverAuthorized: boolean;
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
      deleteProviderCopies: true;
      deleteWebhookQueues: true;
      deleteIdempotencyKeys: true;
      deleteServerCaches: true;
      deleteDeviceOfflineCopies: true;
      deleteQueuedActions: true;
      deleteNotificationReferences: true;
      redactSensitiveAuditPayloads: true;
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

function digest(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function normalizedDisclosures(disclosures: readonly ProviderDisclosure[]) {
  return disclosures
    .map((disclosure) => ({
      field: disclosure.field,
      value: disclosure.value.trim(),
      explicitlyConfirmed: disclosure.explicitlyConfirmed,
    }))
    .sort((left, right) => left.field.localeCompare(right.field));
}

function profileBinding(profile: ProviderProfile) {
  return digest({
    id: profile.id,
    homeId: profile.homeId,
    revision: profile.revision,
    displayName: profile.displayName.trim(),
    serviceCategories: [...profile.serviceCategories].sort(),
    channel: profile.channel,
  });
}

function draftBinding({
  task,
  provider,
  kind,
  disclosures,
}: {
  task: ProviderTaskSnapshot;
  provider: ProviderProfile;
  kind: ProviderHandoffKind;
  disclosures: readonly ProviderDisclosure[];
}) {
  return digest({
    homeId: task.homeId,
    taskId: task.id,
    taskRevision: task.revision,
    providerId: provider.id,
    providerRevision: provider.revision,
    kind,
    disclosures: normalizedDisclosures(disclosures),
  });
}

function sendBinding(
  draft: ProviderHandoffDraft,
  idempotencyEvidence: ProviderIdempotencyEvidence,
) {
  return digest({
    handoffId: draft.id,
    homeId: draft.homeId,
    taskId: draft.taskId,
    taskRevision: draft.taskRevision,
    providerId: draft.providerId,
    providerRevision: draft.providerRevision,
    canonicalPayloadDigest: draft.canonicalPayloadDigest,
    idempotencyKey: idempotencyEvidence.idempotencyKey,
  });
}

function responseBinding(
  handoff: ProviderHandoffDraft,
  response: ProviderHandoffResponse,
) {
  return digest({
    handoffId: handoff.id,
    homeId: handoff.homeId,
    providerId: handoff.providerId,
    responseId: response.id,
    providerEventId: response.providerEventId,
    status: response.status,
    plainTextMessage: response.plainTextMessage,
    proposedStartAt: response.proposedStartAt?.toISOString() ?? null,
    createdAt: response.createdAt.toISOString(),
  });
}

function cancellationBinding(
  handoff: ProviderHandoffDraft,
  provider: ProviderProfile,
) {
  return digest({
    handoffId: handoff.id,
    homeId: handoff.homeId,
    status: handoff.status,
    providerId: provider.id,
    providerRevision: provider.revision,
  });
}

function webhookResponseDigest({
  handoff,
  providerEventId,
  responseStatus,
  plainTextMessage,
  proposedStartAt,
}: {
  handoff: ProviderHandoffDraft;
  providerEventId: string;
  responseStatus: ProviderHandoffResponse["status"];
  plainTextMessage: string | null;
  proposedStartAt: Date | null;
}) {
  return digest({
    handoffId: handoff.id,
    homeId: handoff.homeId,
    providerId: handoff.providerId,
    providerEventId,
    responseStatus,
    plainTextMessage,
    proposedStartAt:
      proposedStartAt === null
        ? null
        : validDate(proposedStartAt)
          ? proposedStartAt.toISOString()
          : "INVALID",
  });
}

export const providerHandoffBindings = {
  profile: profileBinding,
  disclosures: (disclosures: readonly ProviderDisclosure[]) =>
    digest(normalizedDisclosures(disclosures)),
  draft: draftBinding,
  send: sendBinding,
  response: responseBinding,
  cancellation: cancellationBinding,
  webhookResponse: webhookResponseDigest,
};

function validMembershipEvidence(
  evidence: ProviderMembershipEvidence,
  currentUserId: string,
  selectedHomeId: string,
) {
  return (
    typeof evidence === "object" &&
    evidence !== null &&
    evidence.userId === currentUserId &&
    evidence.homeId === selectedHomeId &&
    evidence.active === true &&
    validRole(evidence.role) &&
    Number.isInteger(evidence.membershipRevision) &&
    evidence.membershipRevision >= 1
  );
}

function validConfirmationEvidence({
  evidence,
  currentUserId,
  selectedHomeId,
  purpose,
  subjectId,
  bindingDigest,
  now,
}: {
  evidence: ProviderConfirmationEvidence;
  currentUserId: string;
  selectedHomeId: string;
  purpose: ProviderConfirmationPurpose;
  subjectId: string;
  bindingDigest: string;
  now: Date;
}) {
  return (
    typeof evidence === "object" &&
    evidence !== null &&
    validText(evidence.id, 200) &&
    evidence.userId === currentUserId &&
    evidence.homeId === selectedHomeId &&
    evidence.purpose === purpose &&
    evidence.subjectId === subjectId &&
    evidence.bindingDigest === bindingDigest &&
    validDate(evidence.issuedAt) &&
    validDate(evidence.expiresAt) &&
    evidence.issuedAt <= now &&
    evidence.expiresAt > now &&
    evidence.expiresAt.getTime() - evidence.issuedAt.getTime() <=
      PROVIDER_EVIDENCE_MAX_AGE_MS &&
    evidence.consumed === false
  );
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
    disclosures.every(
      (disclosure) =>
        typeof disclosure === "object" &&
        disclosure !== null &&
        PROVIDER_DISCLOSURE_FIELDS.includes(disclosure.field) &&
        disclosure.explicitlyConfirmed === true &&
        validDisclosureValue(disclosure),
    ) &&
    uniqueValues(disclosures.map((disclosure) => disclosure.field))
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
    validText(gate.approvalId, 200) &&
    Number.isInteger(gate.approvalVersion) &&
    gate.approvalVersion >= 1 &&
    validText(gate.connectorId, 200) &&
    validText(gate.externalProviderAccountId, 200) &&
    validDate(gate.approvedAt) &&
    validDate(gate.expiresAt) &&
    Array.isArray(gate.oauthScopes) &&
    gate.oauthScopes.every((scope) => validText(scope, 100))
  );
}

function exactConnectorGate(
  gate: ProviderConnectorGate,
  provider: ProviderProfile,
  now: Date,
) {
  return (
    validConnectorGateShape(gate) &&
    provider.channel.type === "APPROVED_CONNECTOR" &&
    gate.connectorId === provider.channel.connectorId &&
    gate.externalProviderAccountId ===
      provider.channel.externalProviderAccountId &&
    gate.approvedAt <= now &&
    gate.expiresAt > now &&
    gate.expiresAt.getTime() - gate.approvedAt.getTime() <=
      30 * 24 * 60 * 60 * 1000
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
  membershipEvidence,
  profile,
  confirmationEvidence,
  connectorGate,
  now,
}: {
  currentUserId: string;
  selectedHomeId: string;
  membershipEvidence: ProviderMembershipEvidence;
  profile: ProviderProfile;
  confirmationEvidence: ProviderConfirmationEvidence;
  connectorGate: ProviderConnectorGate | null;
  now: Date;
}): ProviderProfileDecision {
  if (
    !validText(currentUserId, 200) ||
    !validText(selectedHomeId, 200) ||
    !validDate(now) ||
    !validMembershipEvidence(
      membershipEvidence,
      currentUserId,
      selectedHomeId,
    ) ||
    !validProvider(profile) ||
    profile.homeId !== selectedHomeId
  ) {
    return { status: "unavailable" };
  }
  if (!hasWriteRole(membershipEvidence.role)) return { status: "read-only" };
  if (
    !validConfirmationEvidence({
      evidence: confirmationEvidence,
      currentUserId,
      selectedHomeId,
      purpose: "PROFILE_SAVE",
      subjectId: profile.id,
      bindingDigest: profileBinding(profile),
      now,
    })
  ) {
    return { status: "confirmation-required" };
  }
  if (profile.channel.type === "APPROVED_CONNECTOR") {
    if (connectorGate === null) return { status: "unavailable" };
    if (
      !exactConnectorGate(connectorGate, profile, now) ||
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
  membershipEvidence,
  task,
  provider,
  kind,
  disclosures,
  confirmationEvidence,
  safetyEvidence,
  now,
}: {
  currentUserId: string;
  selectedHomeId: string;
  membershipEvidence: ProviderMembershipEvidence;
  task: ProviderTaskSnapshot;
  provider: ProviderProfile;
  kind: ProviderHandoffKind;
  disclosures: readonly ProviderDisclosure[];
  confirmationEvidence: ProviderConfirmationEvidence;
  safetyEvidence: ProviderDraftSafetyEvidence;
  now: Date;
}): ProviderHandoffDraftDecision {
  if (
    !validText(currentUserId, 200) ||
    !validText(selectedHomeId, 200) ||
    !validDate(now) ||
    !validMembershipEvidence(
      membershipEvidence,
      currentUserId,
      selectedHomeId,
    ) ||
    !PROVIDER_HANDOFF_KINDS.includes(kind) ||
    !validTask(task) ||
    !validProvider(provider) ||
    !validDisclosures(disclosures) ||
    task.homeId !== selectedHomeId ||
    provider.homeId !== selectedHomeId ||
    !provider.serviceCategories.includes(task.serviceCategory)
  ) {
    return { status: "unavailable" };
  }
  const disclosureDigest = digest(normalizedDisclosures(disclosures));
  const bindingDigest = draftBinding({ task, provider, kind, disclosures });
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
  if (!hasWriteRole(membershipEvidence.role)) return { status: "read-only" };
  if (
    !validConfirmationEvidence({
      evidence: confirmationEvidence,
      currentUserId,
      selectedHomeId,
      purpose: "DRAFT_REVIEW",
      subjectId: task.id,
      bindingDigest,
      now,
    })
  ) {
    return { status: "confirmation-required" };
  }
  if (
    typeof safetyEvidence !== "object" ||
    safetyEvidence === null ||
    safetyEvidence.homeId !== selectedHomeId ||
    safetyEvidence.taskId !== task.id ||
    safetyEvidence.providerId !== provider.id ||
    safetyEvidence.disclosureDigest !== disclosureDigest ||
    safetyEvidence.policyVersion !== PROVIDER_HANDOFF_POLICY_VERSION ||
    !validDate(safetyEvidence.scannedAt) ||
    safetyEvidence.scannedAt > now ||
    now.getTime() - safetyEvidence.scannedAt.getTime() >
      PROVIDER_EVIDENCE_MAX_AGE_MS ||
    safetyEvidence.containsPaymentCredentials !== false ||
    safetyEvidence.containsInsuranceClaimInstructions !== false ||
    safetyEvidence.containsBudgetOrValuationAdvice !== false ||
    safetyEvidence.containsAdvertisingOrTrackingData !== false ||
    safetyEvidence.containsUnrelatedHouseholdData !== false ||
    safetyEvidence.containsAttachmentOrPrivateUrl !== false
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
  membershipEvidence,
  task,
  provider,
  draft,
  payloadEvidence,
  confirmationEvidence,
  idempotencyEvidence,
  connectorGate,
  now,
}: {
  currentUserId: string;
  selectedHomeId: string;
  membershipEvidence: ProviderMembershipEvidence;
  task: ProviderTaskSnapshot;
  provider: ProviderProfile;
  draft: ProviderHandoffDraft;
  payloadEvidence: ProviderPayloadEvidence;
  confirmationEvidence: ProviderConfirmationEvidence;
  idempotencyEvidence: ProviderIdempotencyEvidence;
  connectorGate: ProviderConnectorGate | null;
  now: Date;
}): ProviderHandoffSendDecision {
  if (
    !validText(currentUserId, 200) ||
    !validText(selectedHomeId, 200) ||
    !validMembershipEvidence(
      membershipEvidence,
      currentUserId,
      selectedHomeId,
    ) ||
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
  if (!hasWriteRole(membershipEvidence.role)) return { status: "read-only" };
  if (!exactDraftDependencies(draft, task, provider)) {
    return { status: "stale" };
  }
  if (
    typeof payloadEvidence !== "object" ||
    payloadEvidence === null ||
    payloadEvidence.handoffId !== draft.id ||
    payloadEvidence.canonicalPayloadDigest !== draft.canonicalPayloadDigest ||
    payloadEvidence.serverRecomputed !== true ||
    typeof idempotencyEvidence !== "object" ||
    idempotencyEvidence === null ||
    idempotencyEvidence.handoffId !== draft.id ||
    !validText(idempotencyEvidence.idempotencyKey, 200) ||
    idempotencyEvidence.serverGenerated !== true ||
    idempotencyEvidence.consumed !== false
  ) {
    return { status: "unavailable" };
  }
  if (
    !validConfirmationEvidence({
      evidence: confirmationEvidence,
      currentUserId,
      selectedHomeId,
      purpose: "FINAL_PREVIEW",
      subjectId: draft.id,
      bindingDigest: sendBinding(draft, idempotencyEvidence),
      now,
    })
  ) {
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
    !exactConnectorGate(connectorGate, provider, now) ||
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
    idempotencyKey: idempotencyEvidence.idempotencyKey,
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
  webhookEvidence,
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
  webhookEvidence: ProviderWebhookEvidence;
  existingResponse?: Pick<
    ProviderHandoffResponse,
    "id" | "handoffId" | "homeId" | "providerId" | "providerEventId"
  >;
  now: Date;
}): ProviderWebhookDecision {
  if (
    !validConnectorGateShape(connectorGate) ||
    !validDate(now) ||
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
    !exactConnectorGate(connectorGate, provider, now) ||
    connectorGate.credentialsServerHeld !== true ||
    !connectorGate.oauthScopes.includes("responses:read")
  ) {
    return { status: "provider-gate", reason: "scope" };
  }
  if (
    typeof webhookEvidence !== "object" ||
    webhookEvidence === null ||
    webhookEvidence.handoffId !== handoff.id ||
    webhookEvidence.homeId !== handoff.homeId ||
    webhookEvidence.providerId !== provider.id ||
    webhookEvidence.providerEventId !== providerEventId ||
    webhookEvidence.connectorId !== provider.channel.connectorId ||
    webhookEvidence.externalProviderAccountId !==
      provider.channel.externalProviderAccountId ||
    webhookEvidence.responseDigest !==
      webhookResponseDigest({
        handoff,
        providerEventId,
        responseStatus,
        plainTextMessage,
        proposedStartAt,
      }) ||
    !validDate(webhookEvidence.receivedAt) ||
    webhookEvidence.secretConfigured !== true ||
    webhookEvidence.signatureValid !== true
  ) {
    return { status: "provider-gate", reason: "webhook" };
  }
  if (webhookEvidence.responseScopeAllowed !== true) {
    return { status: "provider-gate", reason: "scope" };
  }
  const webhookAge = now.getTime() - webhookEvidence.receivedAt.getTime();
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
  membershipEvidence,
  handoff,
  task,
  provider,
  response,
  confirmationEvidence,
  now,
}: {
  currentUserId: string;
  selectedHomeId: string;
  membershipEvidence: ProviderMembershipEvidence;
  handoff: ProviderHandoffDraft;
  task: ProviderTaskSnapshot;
  provider: ProviderProfile;
  response: ProviderHandoffResponse;
  confirmationEvidence: ProviderConfirmationEvidence;
  now: Date;
}): ProviderResponseReviewDecision {
  if (
    !validText(currentUserId, 200) ||
    !validText(selectedHomeId, 200) ||
    !validMembershipEvidence(
      membershipEvidence,
      currentUserId,
      selectedHomeId,
    ) ||
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
  if (!hasWriteRole(membershipEvidence.role)) return { status: "read-only" };
  if (!exactDraftDependencies(handoff, task, provider)) {
    return { status: "stale" };
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
  if (
    !validConfirmationEvidence({
      evidence: confirmationEvidence,
      currentUserId,
      selectedHomeId,
      purpose: "RESPONSE_REVIEW",
      subjectId: response.id,
      bindingDigest: responseBinding(handoff, response),
      now,
    })
  ) {
    return { status: "confirmation-required" };
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
  membershipEvidence,
  handoff,
  provider,
  confirmationEvidence,
  now,
}: {
  currentUserId: string;
  selectedHomeId: string;
  membershipEvidence: ProviderMembershipEvidence;
  handoff: ProviderHandoffDraft;
  provider: ProviderProfile;
  confirmationEvidence: ProviderConfirmationEvidence;
  now: Date;
}): ProviderCancellationDecision {
  if (
    !validText(currentUserId, 200) ||
    !validText(selectedHomeId, 200) ||
    !validDate(now) ||
    !validMembershipEvidence(
      membershipEvidence,
      currentUserId,
      selectedHomeId,
    ) ||
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
  if (!hasWriteRole(membershipEvidence.role)) return { status: "read-only" };
  if (
    !validConfirmationEvidence({
      evidence: confirmationEvidence,
      currentUserId,
      selectedHomeId,
      purpose: "CANCELLATION",
      subjectId: handoff.id,
      bindingDigest: cancellationBinding(handoff, provider),
      now,
    })
  ) {
    return { status: "unavailable" };
  }
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
  evidence,
  expectedHomeId,
  expectedSubjectId,
  now,
}: {
  evidence: ProviderCleanupEvidence;
  expectedHomeId: string;
  expectedSubjectId: string;
  now: Date;
}): ProviderCleanupDecision {
  if (
    typeof evidence !== "object" ||
    evidence === null ||
    !validText(expectedHomeId, 200) ||
    !validText(expectedSubjectId, 200) ||
    !PROVIDER_CLEANUP_SCOPES.includes(evidence.scope) ||
    evidence.homeId !== expectedHomeId ||
    evidence.subjectId !== expectedSubjectId ||
    !validDate(evidence.issuedAt) ||
    !validDate(evidence.expiresAt) ||
    !validDate(now) ||
    evidence.issuedAt > now ||
    evidence.expiresAt <= now ||
    evidence.expiresAt.getTime() - evidence.issuedAt.getTime() >
      PROVIDER_EVIDENCE_MAX_AGE_MS ||
    evidence.serverAuthorized !== true
  ) {
    return { status: "unavailable" };
  }
  const scope = evidence.scope;
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
    deleteProviderCopies: true,
    deleteWebhookQueues: true,
    deleteIdempotencyKeys: true,
    deleteServerCaches: true,
    deleteDeviceOfflineCopies: true,
    deleteQueuedActions: true,
    deleteNotificationReferences: true,
    redactSensitiveAuditPayloads: true,
    deleteAuditAfter: new Date(
      now.getTime() + PROVIDER_HANDOFF_AUDIT_RETENTION_MS,
    ),
    deleteHouseholdTask:
      scope === "TASK" || scope === "PROPERTY" || scope === "ACCOUNT",
    requireRetryableCleanupLedger: true,
  };
}
