export const EMAIL_INGESTION_POLICY_VERSION = "homevault-email-ingestion-v1";
export const EMAIL_WEBHOOK_MAX_AGE_MS = 5 * 60 * 1000;
export const EMAIL_QUARANTINE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const EMAIL_MAX_RAW_BYTES = 25_000_000;
export const EMAIL_MAX_BODY_CHARACTERS = 100_000;
export const EMAIL_MAX_ATTACHMENTS = 10;
export const EMAIL_MAX_ATTACHMENT_BYTES = 4_000_000;
export const EMAIL_MAX_TOTAL_ATTACHMENT_BYTES = 20_000_000;
export const EMAIL_ROUTE_MIN_ENTROPY_BYTES = 32;

export const EMAIL_ATTACHMENT_MEDIA_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
] as const;

export type EmailIngestionRole = "OWNER" | "ADULT" | "CHILD" | "GUEST";
export type EmailAttachmentMediaType =
  (typeof EMAIL_ATTACHMENT_MEDIA_TYPES)[number];

export type EmailIngestionRoute = {
  id: string;
  homeId: string;
  tokenHash: string;
  version: number;
  status: "ACTIVE" | "REVOKED";
  createdByUserId: string;
  createdAt: Date;
};

export type EmailSenderAuthentication = {
  dkim: "PASS" | "FAIL" | "NONE";
  dmarc: "PASS" | "FAIL" | "NONE";
  spf: "PASS" | "FAIL" | "NONE";
  alignedDomain: string | null;
};

export type EmailAttachmentCandidate = {
  id: string;
  fileName: string;
  mediaType: string;
  sizeBytes: number;
  contentDigest: string;
};

export type QuarantinedEmailAttachment = {
  id: string;
  homeId: string;
  emailId: string;
  fileName: string;
  mediaType: EmailAttachmentMediaType;
  sizeBytes: number;
  contentDigest: string;
  status: "QUARANTINED" | "AVAILABLE" | "REJECTED" | "DELETION_PENDING";
  signatureValid: boolean;
  metadataSanitized: boolean;
  malwareDecision: "PENDING" | "CLEAN" | "MALICIOUS" | "ERROR" | "UNAVAILABLE";
  privateOnly: true;
  storageKey: string;
};

export type QuarantinedEmail = {
  id: string;
  homeId: string;
  routeId: string;
  providerEventId: string;
  internetMessageId: string;
  canonicalContentDigest: string;
  envelopeFrom: string;
  headerFrom: string;
  subject: string;
  receivedAt: Date;
  expiresAt: Date;
  status:
    | "QUARANTINED"
    | "REVIEW_READY"
    | "ACCEPTED"
    | "REJECTED"
    | "DELETION_PENDING";
  senderAuthentication: EmailSenderAuthentication;
  senderAllowlisted: boolean;
  bodySanitized: boolean;
  remoteContentRemoved: boolean;
  activeContentRemoved: boolean;
  containsFullPaymentCredentials: boolean;
  attachments: readonly QuarantinedEmailAttachment[];
};

export type EmailRouteDecision =
  | {
      status: "route-authorized";
      homeId: string;
      tokenHash: string;
      storeRawToken: false;
      exposeRouteInExports: false;
      requireAtomicRotation: true;
      requireConstantTimeHashComparison: true;
    }
  | { status: "reconfirmation-required" }
  | { status: "read-only" }
  | { status: "unavailable" };

export type EmailIngressDecision =
  | {
      status: "quarantine-authorized";
      homeId: string;
      routeId: string;
      providerEventId: string;
      internetMessageId: string;
      canonicalContentDigest: string;
      senderTrust: "VERIFIED_ALLOWED" | "UNVERIFIED";
      attachmentIds: string[];
      expiresAt: Date;
      privateOnly: true;
      exposeProviderUrl: false;
      loadRemoteContent: false;
      executeActiveContent: false;
      autoSaveAllowed: false;
    }
  | { status: "duplicate"; emailId: string }
  | {
      status: "provider-gate";
      reason: "provider" | "region" | "retention" | "webhook";
    }
  | {
      status: "invalid-message";
      reason: "replay" | "size" | "body" | "attachment";
    }
  | { status: "unavailable" };

export type EmailQuarantineDecision =
  | {
      status: "review-ready";
      emailId: string;
      senderWarningRequired: boolean;
      privateOnly: true;
      noRemoteContent: true;
      autoSaveAllowed: false;
    }
  | {
      status: "quarantine";
      emailId: string;
      retryAllowed: boolean;
    }
  | {
      status: "reject-and-delete";
      emailId: string;
      deleteRawMessage: true;
      deleteAttachmentObjects: true;
    }
  | { status: "unavailable" };

export type EmailReviewConfirmation = {
  confirmSender: boolean;
  targetType: "DOCUMENT" | "RECEIPT";
  title: string;
  selectedAttachmentIds: readonly string[];
  includeSanitizedBody: boolean;
};

export type EmailReviewDecision =
  | {
      status: "review-save-authorized";
      homeId: string;
      emailId: string;
      targetType: "DOCUMENT" | "RECEIPT";
      title: string;
      selectedAttachmentIds: string[];
      includeSanitizedBody: boolean;
      useNormalRecordActions: true;
      requireExplicitFinalSave: true;
      createAutomatically: false;
      runOcrAutomatically: false;
      runAiAutomatically: false;
      transcribePaymentCredentials: false;
      provenance: {
        routeId: string;
        internetMessageId: string;
        canonicalContentDigest: string;
        receivedAt: Date;
        headerFrom: string;
      };
    }
  | { status: "confirmation-required" }
  | { status: "read-only" }
  | { status: "stale" }
  | { status: "unavailable" };

export type EmailIngestionCleanupDecision = {
  revokeRoutes: boolean;
  deleteRawMessages: true;
  deleteSanitizedBodies: true;
  deleteQuarantineObjects: true;
  deleteAttachmentObjects: true;
  deleteRelationalMetadata: true;
  invalidateReviewSessions: true;
  preserveAcceptedRecordValues: boolean;
  requireRetryableCleanupLedger: true;
};

function hasWriteRole(role: EmailIngestionRole) {
  return role === "OWNER" || role === "ADULT";
}

function validText(value: unknown, maximum: number) {
  if (typeof value !== "string") {
    return false;
  }
  const normalized = value.trim();
  return (
    normalized.length > 0 &&
    normalized.length <= maximum &&
    !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(normalized)
  );
}

function validDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function validEmailAddress(value: unknown) {
  if (typeof value !== "string") {
    return false;
  }
  if (
    !value ||
    value.length > 254 ||
    value.includes("\0") ||
    value.includes("\r") ||
    value.includes("\n")
  ) {
    return false;
  }
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

function validLeafFileName(value: string) {
  return (
    validText(value, 255) &&
    !value.includes("/") &&
    !value.includes("\\") &&
    value !== "." &&
    value !== ".."
  );
}

function isAllowedAttachmentMediaType(
  value: string,
): value is EmailAttachmentMediaType {
  return EMAIL_ATTACHMENT_MEDIA_TYPES.includes(
    value as EmailAttachmentMediaType,
  );
}

function exactExtensionMatches(
  fileName: string,
  mediaType: EmailAttachmentMediaType,
) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const allowed: Record<EmailAttachmentMediaType, readonly string[]> = {
    "application/pdf": ["pdf"],
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/heic": ["heic"],
    "image/heif": ["heif"],
  };
  return Boolean(extension && allowed[mediaType].includes(extension));
}

function senderVerifiedAndAllowed(
  authentication: EmailSenderAuthentication,
  allowlisted: boolean,
) {
  return (
    allowlisted === true &&
    authentication.dkim === "PASS" &&
    authentication.dmarc === "PASS" &&
    validText(authentication.alignedDomain, 253)
  );
}

function validSenderAuthentication(value: unknown) {
  if (!value || typeof value !== "object") {
    return false;
  }
  const authentication = value as EmailSenderAuthentication;
  const results = ["PASS", "FAIL", "NONE"];
  return (
    results.includes(authentication.dkim) &&
    results.includes(authentication.dmarc) &&
    results.includes(authentication.spf) &&
    (authentication.alignedDomain === null ||
      validText(authentication.alignedDomain, 253))
  );
}

export function decideEmailRouteProvision({
  currentUserId,
  selectedHomeId,
  sessionVerified,
  hasCurrentMembership,
  role,
  credentialsReconfirmed,
  generatedTokenEntropyBytes,
  generatedTokenHash,
}: {
  currentUserId: string;
  selectedHomeId: string;
  sessionVerified: boolean;
  hasCurrentMembership: boolean;
  role: EmailIngestionRole;
  credentialsReconfirmed: boolean;
  generatedTokenEntropyBytes: number;
  generatedTokenHash: string;
}): EmailRouteDecision {
  if (
    !validText(currentUserId, 200) ||
    !validText(selectedHomeId, 200) ||
    !sessionVerified ||
    !hasCurrentMembership ||
    !validText(generatedTokenHash, 512) ||
    !Number.isSafeInteger(generatedTokenEntropyBytes) ||
    generatedTokenEntropyBytes < EMAIL_ROUTE_MIN_ENTROPY_BYTES
  ) {
    return { status: "unavailable" };
  }
  if (role !== "OWNER") {
    return { status: "read-only" };
  }
  if (credentialsReconfirmed !== true) {
    return { status: "reconfirmation-required" };
  }
  return {
    status: "route-authorized",
    homeId: selectedHomeId,
    tokenHash: generatedTokenHash,
    storeRawToken: false,
    exposeRouteInExports: false,
    requireAtomicRotation: true,
    requireConstantTimeHashComparison: true,
  };
}

export function decideEmailIngress({
  route,
  routeTokenHashMatchesConstantTime,
  providerEventId,
  internetMessageId,
  canonicalContentDigest,
  canonicalDigestVerified,
  envelopeFrom,
  headerFrom,
  senderAuthentication,
  senderAllowlisted,
  attachments,
  rawMessageBytes,
  sanitizedBodyCharacters,
  providerApproved,
  approvedRegionConfigured,
  boundedRetentionConfigured,
  webhookSecretConfigured,
  webhookSignatureValid,
  webhookTimestamp,
  existingEmail,
  now,
}: {
  route: EmailIngestionRoute;
  routeTokenHashMatchesConstantTime: boolean;
  providerEventId: string;
  internetMessageId: string;
  canonicalContentDigest: string;
  canonicalDigestVerified: boolean;
  envelopeFrom: string;
  headerFrom: string;
  senderAuthentication: EmailSenderAuthentication;
  senderAllowlisted: boolean;
  attachments: readonly EmailAttachmentCandidate[];
  rawMessageBytes: number;
  sanitizedBodyCharacters: number;
  providerApproved: boolean;
  approvedRegionConfigured: boolean;
  boundedRetentionConfigured: boolean;
  webhookSecretConfigured: boolean;
  webhookSignatureValid: boolean;
  webhookTimestamp: Date;
  existingEmail?: Pick<
    QuarantinedEmail,
    "id" | "homeId" | "providerEventId" | "internetMessageId" | "canonicalContentDigest"
  >;
  now: Date;
}): EmailIngressDecision {
  if (
    !route ||
    !validText(route.id, 200) ||
    !validText(route.homeId, 200) ||
    !validText(route.tokenHash, 512) ||
    !validText(route.createdByUserId, 200) ||
    !validDate(route.createdAt) ||
    !Number.isSafeInteger(route.version) ||
    route.version < 1 ||
    route.status !== "ACTIVE" ||
    routeTokenHashMatchesConstantTime !== true ||
    !validText(providerEventId, 200) ||
    !validText(internetMessageId, 998) ||
    !validText(canonicalContentDigest, 256) ||
    !canonicalDigestVerified ||
    !validEmailAddress(envelopeFrom) ||
    !validEmailAddress(headerFrom) ||
    !validSenderAuthentication(senderAuthentication) ||
    typeof senderAllowlisted !== "boolean" ||
    !Array.isArray(attachments)
  ) {
    return { status: "unavailable" };
  }

  if (providerApproved !== true) {
    return { status: "provider-gate", reason: "provider" };
  }
  if (approvedRegionConfigured !== true) {
    return { status: "provider-gate", reason: "region" };
  }
  if (boundedRetentionConfigured !== true) {
    return { status: "provider-gate", reason: "retention" };
  }
  if (
    webhookSecretConfigured !== true ||
    webhookSignatureValid !== true
  ) {
    return { status: "provider-gate", reason: "webhook" };
  }

  if (!validDate(now) || !validDate(webhookTimestamp)) {
    return { status: "invalid-message", reason: "replay" };
  }
  const webhookAge = now.getTime() - webhookTimestamp.getTime();
  if (
    !Number.isFinite(webhookAge) ||
    webhookAge < 0 ||
    webhookAge > EMAIL_WEBHOOK_MAX_AGE_MS
  ) {
    return { status: "invalid-message", reason: "replay" };
  }
  if (
    !Number.isSafeInteger(rawMessageBytes) ||
    rawMessageBytes < 1 ||
    rawMessageBytes > EMAIL_MAX_RAW_BYTES
  ) {
    return { status: "invalid-message", reason: "size" };
  }
  if (
    !Number.isSafeInteger(sanitizedBodyCharacters) ||
    sanitizedBodyCharacters < 0 ||
    sanitizedBodyCharacters > EMAIL_MAX_BODY_CHARACTERS
  ) {
    return { status: "invalid-message", reason: "body" };
  }
  if (attachments.length > EMAIL_MAX_ATTACHMENTS) {
    return { status: "invalid-message", reason: "attachment" };
  }

  const seenIds = new Set<string>();
  const seenDigests = new Set<string>();
  let totalAttachmentBytes = 0;
  for (const attachment of attachments) {
    if (
      !attachment ||
      !validText(attachment.id, 200) ||
      seenIds.has(attachment.id) ||
      !validText(attachment.contentDigest, 256) ||
      seenDigests.has(attachment.contentDigest) ||
      !validLeafFileName(attachment.fileName) ||
      !isAllowedAttachmentMediaType(attachment.mediaType) ||
      !exactExtensionMatches(attachment.fileName, attachment.mediaType) ||
      !Number.isSafeInteger(attachment.sizeBytes) ||
      attachment.sizeBytes < 1 ||
      attachment.sizeBytes > EMAIL_MAX_ATTACHMENT_BYTES
    ) {
      return { status: "invalid-message", reason: "attachment" };
    }
    seenIds.add(attachment.id);
    seenDigests.add(attachment.contentDigest);
    totalAttachmentBytes += attachment.sizeBytes;
    if (!Number.isSafeInteger(totalAttachmentBytes)) {
      return { status: "invalid-message", reason: "attachment" };
    }
  }
  if (totalAttachmentBytes > EMAIL_MAX_TOTAL_ATTACHMENT_BYTES) {
    return { status: "invalid-message", reason: "attachment" };
  }

  if (existingEmail) {
    if (
      !validText(existingEmail.id, 200) ||
      existingEmail.homeId !== route.homeId ||
      !validText(existingEmail.providerEventId, 200) ||
      !validText(existingEmail.internetMessageId, 998) ||
      !validText(existingEmail.canonicalContentDigest, 256)
    ) {
      return { status: "unavailable" };
    }
    if (
      existingEmail.providerEventId === providerEventId ||
      (existingEmail.internetMessageId === internetMessageId &&
        existingEmail.canonicalContentDigest === canonicalContentDigest)
    ) {
      return { status: "duplicate", emailId: existingEmail.id };
    }
  }

  return {
    status: "quarantine-authorized",
    homeId: route.homeId,
    routeId: route.id,
    providerEventId,
    internetMessageId,
    canonicalContentDigest,
    senderTrust: senderVerifiedAndAllowed(
      senderAuthentication,
      senderAllowlisted,
    )
      ? "VERIFIED_ALLOWED"
      : "UNVERIFIED",
    attachmentIds: attachments.map((attachment) => attachment.id),
    expiresAt: new Date(now.getTime() + EMAIL_QUARANTINE_TTL_MS),
    privateOnly: true,
    exposeProviderUrl: false,
    loadRemoteContent: false,
    executeActiveContent: false,
    autoSaveAllowed: false,
  };
}

export function decideEmailQuarantine({
  email,
  rawMessageThreatDetected,
  now,
}: {
  email: QuarantinedEmail;
  rawMessageThreatDetected: boolean;
  now: Date;
}): EmailQuarantineDecision {
  if (
    !email ||
    !validText(email.id, 200) ||
    !validText(email.homeId, 200) ||
    !validText(email.routeId, 200) ||
    !validText(email.providerEventId, 200) ||
    !validText(email.internetMessageId, 998) ||
    !validText(email.canonicalContentDigest, 256) ||
    !validDate(email.receivedAt) ||
    !validDate(now) ||
    !validDate(email.expiresAt) ||
    email.expiresAt <= email.receivedAt ||
    email.expiresAt.getTime() - email.receivedAt.getTime() >
      EMAIL_QUARANTINE_TTL_MS ||
    !validSenderAuthentication(email.senderAuthentication) ||
    typeof email.senderAllowlisted !== "boolean" ||
    typeof email.bodySanitized !== "boolean" ||
    typeof email.remoteContentRemoved !== "boolean" ||
    typeof email.activeContentRemoved !== "boolean" ||
    typeof email.containsFullPaymentCredentials !== "boolean" ||
    !Array.isArray(email.attachments) ||
    email.attachments.length > EMAIL_MAX_ATTACHMENTS ||
    typeof rawMessageThreatDetected !== "boolean" ||
    email.status !== "QUARANTINED"
  ) {
    return { status: "unavailable" };
  }
  const attachmentIds = new Set<string>();
  const attachmentDigests = new Set<string>();
  let totalAttachmentBytes = 0;
  for (const attachment of email.attachments) {
    if (
      !attachment ||
      !validText(attachment.id, 200) ||
      attachmentIds.has(attachment.id) ||
      !validText(attachment.contentDigest, 256) ||
      attachmentDigests.has(attachment.contentDigest) ||
      attachment.homeId !== email.homeId ||
      attachment.emailId !== email.id ||
      !Number.isSafeInteger(attachment.sizeBytes) ||
      attachment.sizeBytes < 1 ||
      attachment.sizeBytes > EMAIL_MAX_ATTACHMENT_BYTES
    ) {
      return { status: "unavailable" };
    }
    attachmentIds.add(attachment.id);
    attachmentDigests.add(attachment.contentDigest);
    totalAttachmentBytes += attachment.sizeBytes;
  }
  if (
    !Number.isSafeInteger(totalAttachmentBytes) ||
    totalAttachmentBytes > EMAIL_MAX_TOTAL_ATTACHMENT_BYTES
  ) {
    return { status: "unavailable" };
  }
  if (
    now >= email.expiresAt ||
    rawMessageThreatDetected ||
    email.attachments.some(
      (attachment) =>
        !validLeafFileName(attachment.fileName) ||
        !isAllowedAttachmentMediaType(attachment.mediaType) ||
        !exactExtensionMatches(attachment.fileName, attachment.mediaType) ||
        !Number.isSafeInteger(attachment.sizeBytes) ||
        attachment.sizeBytes < 1 ||
        attachment.sizeBytes > EMAIL_MAX_ATTACHMENT_BYTES ||
        !validText(attachment.contentDigest, 256) ||
        !validText(attachment.storageKey, 1_024) ||
        attachment.privateOnly !== true ||
        attachment.malwareDecision === "MALICIOUS" ||
        attachment.signatureValid !== true ||
        attachment.metadataSanitized !== true,
    )
  ) {
    return {
      status: "reject-and-delete",
      emailId: email.id,
      deleteRawMessage: true,
      deleteAttachmentObjects: true,
    };
  }
  if (
    !email.bodySanitized ||
    !email.remoteContentRemoved ||
    !email.activeContentRemoved
  ) {
    return { status: "quarantine", emailId: email.id, retryAllowed: false };
  }
  const pending = email.attachments.some(
    (attachment) =>
      attachment.status === "QUARANTINED" &&
      (attachment.malwareDecision === "PENDING" ||
        attachment.malwareDecision === "ERROR" ||
        attachment.malwareDecision === "UNAVAILABLE"),
  );
  if (pending) {
    return {
      status: "quarantine",
      emailId: email.id,
      retryAllowed: email.attachments.some(
        (attachment) => attachment.malwareDecision === "ERROR",
      ),
    };
  }
  const attachmentsReady = email.attachments.every(
    (attachment) =>
      attachment.homeId === email.homeId &&
      attachment.emailId === email.id &&
      attachment.privateOnly &&
      attachment.status === "AVAILABLE" &&
      attachment.malwareDecision === "CLEAN",
  );
  if (!attachmentsReady) {
    return { status: "quarantine", emailId: email.id, retryAllowed: false };
  }
  return {
    status: "review-ready",
    emailId: email.id,
    senderWarningRequired: !senderVerifiedAndAllowed(
      email.senderAuthentication,
      email.senderAllowlisted,
    ),
    privateOnly: true,
    noRemoteContent: true,
    autoSaveAllowed: false,
  };
}

export function decideEmailReview({
  currentUserId,
  selectedHomeId,
  sessionVerified,
  hasCurrentMembership,
  role,
  email,
  confirmation,
  now,
}: {
  currentUserId: string;
  selectedHomeId: string;
  sessionVerified: boolean;
  hasCurrentMembership: boolean;
  role: EmailIngestionRole;
  email: QuarantinedEmail;
  confirmation: EmailReviewConfirmation;
  now: Date;
}): EmailReviewDecision {
  if (
    !email ||
    !confirmation ||
    !validText(currentUserId, 200) ||
    !validText(selectedHomeId, 200) ||
    !sessionVerified ||
    !hasCurrentMembership ||
    !validDate(now) ||
    !validDate(email.receivedAt) ||
    !validDate(email.expiresAt) ||
    !validText(email.id, 200) ||
    !validText(email.routeId, 200) ||
    !validText(email.internetMessageId, 998) ||
    !validText(email.canonicalContentDigest, 256) ||
    !validEmailAddress(email.headerFrom) ||
    email.expiresAt <= email.receivedAt ||
    email.expiresAt.getTime() - email.receivedAt.getTime() >
      EMAIL_QUARANTINE_TTL_MS ||
    !Array.isArray(email.attachments) ||
    !Array.isArray(confirmation.selectedAttachmentIds) ||
    email.homeId !== selectedHomeId ||
    email.status !== "REVIEW_READY"
  ) {
    return { status: "unavailable" };
  }
  if (!hasWriteRole(role)) {
    return { status: "read-only" };
  }
  if (now >= email.expiresAt) {
    return { status: "stale" };
  }
  if (
    confirmation.confirmSender !== true ||
    (confirmation.targetType !== "DOCUMENT" &&
      confirmation.targetType !== "RECEIPT") ||
    typeof confirmation.includeSanitizedBody !== "boolean" ||
    !validText(confirmation.title, 200) ||
    (confirmation.selectedAttachmentIds.length === 0 &&
      !confirmation.includeSanitizedBody) ||
    confirmation.selectedAttachmentIds.length > EMAIL_MAX_ATTACHMENTS ||
    new Set(confirmation.selectedAttachmentIds).size !==
      confirmation.selectedAttachmentIds.length
  ) {
    return { status: "confirmation-required" };
  }
  const attachmentById = new Map(
    email.attachments.map((attachment) => [attachment.id, attachment]),
  );
  const selectedAttachments = confirmation.selectedAttachmentIds.map(
    (attachmentId) => attachmentById.get(attachmentId),
  );
  if (
    selectedAttachments.some(
      (attachment) =>
        !attachment ||
        attachment.homeId !== selectedHomeId ||
        attachment.emailId !== email.id ||
        attachment.status !== "AVAILABLE" ||
        attachment.malwareDecision !== "CLEAN" ||
        !attachment.signatureValid ||
        !attachment.metadataSanitized,
    )
  ) {
    return { status: "confirmation-required" };
  }
  if (
    confirmation.includeSanitizedBody &&
    (!email.bodySanitized ||
      !email.remoteContentRemoved ||
      !email.activeContentRemoved ||
      email.containsFullPaymentCredentials)
  ) {
    return { status: "confirmation-required" };
  }
  return {
    status: "review-save-authorized",
    homeId: selectedHomeId,
    emailId: email.id,
    targetType: confirmation.targetType,
    title: confirmation.title.trim(),
    selectedAttachmentIds: [...confirmation.selectedAttachmentIds],
    includeSanitizedBody: confirmation.includeSanitizedBody,
    useNormalRecordActions: true,
    requireExplicitFinalSave: true,
    createAutomatically: false,
    runOcrAutomatically: false,
    runAiAutomatically: false,
    transcribePaymentCredentials: false,
    provenance: {
      routeId: email.routeId,
      internetMessageId: email.internetMessageId,
      canonicalContentDigest: email.canonicalContentDigest,
      receivedAt: email.receivedAt,
      headerFrom: email.headerFrom,
    },
  };
}

export function decideEmailIngestionCleanup({
  scope,
}: {
  scope: "EMAIL" | "ROUTE" | "PROPERTY" | "ACCOUNT";
}): EmailIngestionCleanupDecision {
  return {
    revokeRoutes:
      scope === "ROUTE" || scope === "PROPERTY" || scope === "ACCOUNT",
    deleteRawMessages: true,
    deleteSanitizedBodies: true,
    deleteQuarantineObjects: true,
    deleteAttachmentObjects: true,
    deleteRelationalMetadata: true,
    invalidateReviewSessions: true,
    preserveAcceptedRecordValues: scope === "EMAIL" || scope === "ROUTE",
    requireRetryableCleanupLedger: true,
  };
}
