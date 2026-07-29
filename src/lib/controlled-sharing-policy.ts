export const CONTROLLED_SHARE_POLICY_VERSION = "homevault-controlled-share-v1";
export const CONTROLLED_SHARE_GRANT_ID_MIN_ENTROPY_BYTES = 16;
export const CONTROLLED_SHARE_TOKEN_MIN_ENTROPY_BYTES = 32;
export const CONTROLLED_SHARE_MIN_TTL_MS = 5 * 60 * 1000;
export const CONTROLLED_SHARE_MAX_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const CONTROLLED_SHARE_SESSION_TTL_MS = 15 * 60 * 1000;
export const CONTROLLED_SHARE_CONFIRMATION_TTL_MS = 10 * 60 * 1000;
export const CONTROLLED_SHARE_AUDIT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
export const CONTROLLED_SHARE_MAX_ATTACHMENTS = 10;

export const CONTROLLED_SHARE_FIELDS = [
  "TITLE",
  "RECORD_TYPE",
  "ISSUE_DATE",
  "EXPIRY_DATE",
  "SANITIZED_DESCRIPTION",
] as const;

const CONTROLLED_SHARE_TARGET_TYPES = [
  "DOCUMENT",
  "RECEIPT",
  "WARRANTY",
  "ASSET",
  "MAINTENANCE",
] as const;

const CONTROLLED_SHARE_AUDIT_EVENTS = [
  "CREATED",
  "EXCHANGE_SUCCEEDED",
  "EXCHANGE_DENIED",
  "VIEWED",
  "DOWNLOAD_SUCCEEDED",
  "DOWNLOAD_DENIED",
  "REVOKED",
  "EXPIRED",
] as const;

export type ControlledShareField = (typeof CONTROLLED_SHARE_FIELDS)[number];
export type ControlledShareRole = "OWNER" | "ADULT" | "CHILD" | "GUEST";
export type ControlledShareTargetType =
  | "DOCUMENT"
  | "RECEIPT"
  | "WARRANTY"
  | "ASSET"
  | "MAINTENANCE";

export type ControlledShareMembershipEvidence = {
  userId: string;
  homeId: string;
  role: ControlledShareRole;
  active: boolean;
  revision: number;
};

export type ControlledShareConfirmationEvidence = {
  id: string;
  userId: string;
  homeId: string;
  recordId: string;
  recordRevision: number;
  selectionBinding: string;
  issuedAt: Date;
  expiresAt: Date;
  singleUse: boolean;
  consumed: boolean;
};

export type ControlledShareTokenEvidence = {
  grantId: string;
  routeGrantId: string;
  tokenHash: string;
  matchedConstantTime: boolean;
};

export type ControlledShareRateLimitEvidence = {
  grantId: string;
  allowed: boolean;
};

export type ControlledShareRecipientEvidence = {
  grantId: string;
  verifiedUserId: string;
  recipientEmailHash: string;
  matchedConstantTime: boolean;
};

export type ControlledShareRecipientBindingEvidence = {
  userId: string;
  homeId: string;
  recordId: string;
  recipientEmailHash: string;
  serverVerified: boolean;
};

export type ControlledShareSessionEvidence = {
  grantId: string;
  sessionId: string;
  matchedConstantTime: boolean;
};

export type ControlledShareAttachment = {
  id: string;
  homeId: string;
  recordId: string;
  contentDigest: string;
  storageKey: string;
  status: "AVAILABLE" | "QUARANTINED" | "REJECTED" | "DELETION_PENDING";
  malwareDecision: "CLEAN" | "PENDING" | "MALICIOUS" | "ERROR" | "UNAVAILABLE";
  privateOnly: true;
};

export type ControlledShareRecord = {
  id: string;
  homeId: string;
  targetType: ControlledShareTargetType;
  revision: number;
  status: "ACTIVE" | "ARCHIVED" | "DELETED";
  availableFields: readonly ControlledShareField[];
  attachments: readonly ControlledShareAttachment[];
};

export type ControlledShareAttachmentBinding = {
  attachmentId: string;
  contentDigest: string;
};

export type ControlledShareGrant = {
  id: string;
  idEntropyBytes: number;
  homeId: string;
  recordId: string;
  recordRevision: number;
  policyVersion: typeof CONTROLLED_SHARE_POLICY_VERSION;
  createdByUserId: string;
  createdAt: Date;
  startsAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  status: "ACTIVE" | "REVOKED";
  audience: "PUBLIC_LINK" | "VERIFIED_RECIPIENT";
  recipientEmailHash: string | null;
  tokenHash: string;
  selectedFields: readonly ControlledShareField[];
  attachmentBindings: readonly ControlledShareAttachmentBinding[];
  allowDownload: boolean;
};

export type ControlledShareSession = {
  id: string;
  version: number;
  grantId: string;
  verifiedUserId: string | null;
  createdAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
};

export type ControlledShareGrantDecision =
  | {
      status: "grant-authorized";
      grantId: string;
      grantIdEntropyBytes: number;
      homeId: string;
      recordId: string;
      recordRevision: number;
      createdByUserId: string;
      startsAt: Date;
      expiresAt: Date;
      audience: "PUBLIC_LINK" | "VERIFIED_RECIPIENT";
      recipientEmailHash: string | null;
      allowDownload: boolean;
      policyVersion: typeof CONTROLLED_SHARE_POLICY_VERSION;
      selectedFields: ControlledShareField[];
      attachmentBindings: ControlledShareAttachmentBinding[];
      tokenHash: string;
      tokenEntropyBytes: number;
      storeRawToken: false;
      deliverRawTokenOnce: true;
      secretPlacement: "URL_FRAGMENT";
      requirePostExchange: true;
      exposePrivateBlobUrl: false;
      noIndex: true;
      noStore: true;
    }
  | { status: "confirmation-required" }
  | { status: "read-only" }
  | { status: "unavailable" };

export type ControlledShareExchangeDecision =
  | {
      status: "session-authorized";
      grantId: string;
      expiresAt: Date;
      cookie: {
        httpOnly: true;
        secure: true;
        sameSite: "strict";
        path: string;
      };
      clearFragmentSecret: true;
      exposePrivateBlobUrl: false;
    }
  | { status: "recipient-verification-required" }
  | { status: "expired-or-revoked" }
  | { status: "stale" }
  | { status: "unavailable" };

export type ControlledShareViewDecision =
  | {
      status: "view-authorized";
      grantId: string;
      recordId: string;
      selectedFields: ControlledShareField[];
      attachmentIds: string[];
      allowDownload: boolean;
      responseHeaders: {
        cacheControl: "private, no-store";
        robotsTag: "noindex, nofollow, noarchive";
        referrerPolicy: "no-referrer";
        frameAncestors: "'none'";
      };
      exposeHouseholdNavigation: false;
      exposePrivateBlobUrl: false;
    }
  | { status: "expired-or-revoked" }
  | { status: "stale" }
  | { status: "unavailable" };

export type ControlledShareDownloadDecision =
  | {
      status: "stream-authorized";
      grantId: string;
      attachmentId: string;
      internalStorageKey: string;
      streamThroughAuthorizedServerRoute: true;
      redirectToStorageProvider: false;
      exposePrivateBlobUrl: false;
      cacheControl: "private, no-store";
    }
  | { status: "download-disabled" }
  | { status: "expired-or-revoked" }
  | { status: "stale" }
  | { status: "unavailable" };

export type ControlledShareRevocationDecision =
  | {
      status: "revocation-authorized";
      grantId: string;
      revokeImmediately: true;
      deleteTokenHash: true;
      invalidateAllSessions: true;
      preserveBoundedAudit: true;
    }
  | { status: "read-only" }
  | { status: "unavailable" };

export type ControlledShareAuditEvent =
  | "CREATED"
  | "EXCHANGE_SUCCEEDED"
  | "EXCHANGE_DENIED"
  | "VIEWED"
  | "DOWNLOAD_SUCCEEDED"
  | "DOWNLOAD_DENIED"
  | "REVOKED"
  | "EXPIRED";

export type ControlledShareAuditDecision =
  | {
      status: "audit-authorized";
      grantId: string;
      event: ControlledShareAuditEvent;
      occurredAt: Date;
      actorUserId: string | null;
      retainUntil: Date;
      storeRawToken: false;
      storePrivateBlobUrl: false;
      storeRequestBody: false;
      storeIpAddress: false;
      storeUserAgent: false;
    }
  | { status: "unavailable" };

export type ControlledShareCleanupDecision =
  | {
      status: "cleanup-authorized";
      revokeMatchingGrants: true;
      deleteTokenHashes: true;
      invalidateSessions: true;
      deleteShareViews: true;
      purgeBrowserAndCdnCaches: true;
      deleteDeviceAndOfflineCopies: true;
      deleteQueuedShareActions: true;
      deleteNotificationReferences: true;
      removeAuditPayloads: true;
      deleteAuditAfter: Date;
      deleteAcceptedRecord: boolean;
      deletePrivateAttachment: boolean;
      requireRetryableCleanupLedger: true;
    }
  | { status: "unavailable" };

function hasWriteRole(role: ControlledShareRole) {
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
    !normalized.includes("\0") &&
    !normalized.includes("\r") &&
    !normalized.includes("\n")
  );
}

function validDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function uniqueValues<T>(values: readonly T[]) {
  return Array.isArray(values) && new Set(values).size === values.length;
}

function validMembershipEvidence(
  evidence: ControlledShareMembershipEvidence,
  userId: string,
  homeId: string,
) {
  return (
    Boolean(evidence) &&
    evidence.userId === userId &&
    evidence.homeId === homeId &&
    evidence.active === true &&
    Number.isSafeInteger(evidence.revision) &&
    evidence.revision >= 1 &&
    ["OWNER", "ADULT", "CHILD", "GUEST"].includes(evidence.role)
  );
}

function selectionBinding({
  record,
  selectedFields,
  attachmentBindings,
  allowDownload,
  audience,
  recipientEmailHash,
  startsAt,
  expiresAt,
}: {
  record: ControlledShareRecord;
  selectedFields: readonly ControlledShareField[];
  attachmentBindings: readonly ControlledShareAttachmentBinding[];
  allowDownload: boolean;
  audience: "PUBLIC_LINK" | "VERIFIED_RECIPIENT";
  recipientEmailHash: string | null;
  startsAt: Date;
  expiresAt: Date;
}) {
  return JSON.stringify({
    homeId: record.homeId,
    recordId: record.id,
    recordRevision: record.revision,
    selectedFields: [...selectedFields],
    attachmentBindings: attachmentBindings.map((binding) => ({
      attachmentId: binding.attachmentId,
      contentDigest: binding.contentDigest,
    })),
    allowDownload,
    audience,
    recipientEmailHash,
    startsAt: startsAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });
}

function validRecordShape(record: ControlledShareRecord) {
  return (
    Boolean(record) &&
    validText(record.id, 200) &&
    validText(record.homeId, 200) &&
    CONTROLLED_SHARE_TARGET_TYPES.includes(record.targetType) &&
    Number.isSafeInteger(record.revision) &&
    record.revision >= 1 &&
    record.status === "ACTIVE" &&
    Array.isArray(record.availableFields) &&
    record.availableFields.length > 0 &&
    uniqueValues(record.availableFields) &&
    record.availableFields.every((field) =>
      CONTROLLED_SHARE_FIELDS.includes(field),
    ) &&
    Array.isArray(record.attachments) &&
    record.attachments.length <= CONTROLLED_SHARE_MAX_ATTACHMENTS &&
    record.attachments.every(
      (attachment) =>
        Boolean(attachment) &&
        validText(attachment.id, 200) &&
        validText(attachment.homeId, 200) &&
        validText(attachment.recordId, 200) &&
        validText(attachment.contentDigest, 256) &&
        validText(attachment.storageKey, 500) &&
        attachment.homeId === record.homeId &&
        attachment.recordId === record.id &&
        ["AVAILABLE", "QUARANTINED", "REJECTED", "DELETION_PENDING"].includes(
          attachment.status,
        ) &&
        ["CLEAN", "PENDING", "MALICIOUS", "ERROR", "UNAVAILABLE"].includes(
          attachment.malwareDecision,
        ) &&
        attachment.privateOnly === true,
    ) &&
    uniqueValues(record.attachments.map((attachment) => attachment.id)) &&
    uniqueValues(
      record.attachments.map((attachment) => attachment.contentDigest),
    )
  );
}

function recordMatchesGrant(
  grant: ControlledShareGrant,
  record: ControlledShareRecord,
) {
  if (
    !validRecordShape(record) ||
    record.id !== grant.recordId ||
    record.homeId !== grant.homeId ||
    record.revision !== grant.recordRevision ||
    grant.selectedFields.some(
      (field) => !record.availableFields.includes(field),
    )
  ) {
    return false;
  }
  const attachments = new Map(
    record.attachments.map((attachment) => [attachment.id, attachment]),
  );
  return grant.attachmentBindings.every((binding) => {
    const attachment = attachments.get(binding.attachmentId);
    return (
      attachment?.homeId === grant.homeId &&
      attachment.recordId === grant.recordId &&
      attachment.contentDigest === binding.contentDigest &&
      attachment.status === "AVAILABLE" &&
      attachment.malwareDecision === "CLEAN" &&
      attachment.privateOnly
    );
  });
}

function activeGrant(grant: ControlledShareGrant, now: Date) {
  return (
    grant.policyVersion === CONTROLLED_SHARE_POLICY_VERSION &&
    grant.status === "ACTIVE" &&
    grant.revokedAt === null &&
    validDate(grant.startsAt) &&
    validDate(grant.expiresAt) &&
    now >= grant.startsAt &&
    now < grant.expiresAt
  );
}

function validGrantShape(grant: ControlledShareGrant) {
  return (
    Boolean(grant) &&
    validText(grant.id, 200) &&
    Number.isSafeInteger(grant.idEntropyBytes) &&
    grant.idEntropyBytes >= CONTROLLED_SHARE_GRANT_ID_MIN_ENTROPY_BYTES &&
    validText(grant.homeId, 200) &&
    validText(grant.recordId, 200) &&
    validText(grant.createdByUserId, 200) &&
    validText(grant.tokenHash, 512) &&
    grant.policyVersion === CONTROLLED_SHARE_POLICY_VERSION &&
    Number.isSafeInteger(grant.recordRevision) &&
    grant.recordRevision >= 1 &&
    validDate(grant.createdAt) &&
    validDate(grant.startsAt) &&
    validDate(grant.expiresAt) &&
    grant.startsAt >= grant.createdAt &&
    grant.expiresAt.getTime() - grant.startsAt.getTime() >=
      CONTROLLED_SHARE_MIN_TTL_MS &&
    grant.expiresAt.getTime() - grant.startsAt.getTime() <=
      CONTROLLED_SHARE_MAX_TTL_MS &&
    ((grant.status === "ACTIVE" && grant.revokedAt === null) ||
      (grant.status === "REVOKED" &&
        validDate(grant.revokedAt) &&
        grant.revokedAt >= grant.startsAt)) &&
    typeof grant.allowDownload === "boolean" &&
    Array.isArray(grant.selectedFields) &&
    grant.selectedFields.length > 0 &&
    uniqueValues(grant.selectedFields) &&
    grant.selectedFields.every((field) =>
      CONTROLLED_SHARE_FIELDS.includes(field),
    ) &&
    Array.isArray(grant.attachmentBindings) &&
    grant.attachmentBindings.length <= CONTROLLED_SHARE_MAX_ATTACHMENTS &&
    grant.attachmentBindings.every(
      (binding) =>
        Boolean(binding) &&
        validText(binding.attachmentId, 200) &&
        validText(binding.contentDigest, 256),
    ) &&
    uniqueValues(
      grant.attachmentBindings.map((binding) => binding.attachmentId),
    ) &&
    uniqueValues(
      grant.attachmentBindings.map((binding) => binding.contentDigest),
    ) &&
    ((grant.audience === "PUBLIC_LINK" &&
      grant.recipientEmailHash === null) ||
      (grant.audience === "VERIFIED_RECIPIENT" &&
        grant.recipientEmailHash !== null &&
        validText(grant.recipientEmailHash, 512)))
  );
}

export function decideControlledShareGrant({
  currentUserId,
  selectedHomeId,
  sessionVerified,
  membership,
  record,
  selectedFields,
  selectedAttachmentIds,
  allowDownload,
  audience,
  recipientEmailHash,
  recipientBindingEvidence,
  startsAt,
  expiresAt,
  generatedGrantId,
  generatedGrantIdEntropyBytes,
  generatedTokenEntropyBytes,
  generatedTokenHash,
  confirmationEvidence,
  now,
}: {
  currentUserId: string;
  selectedHomeId: string;
  sessionVerified: boolean;
  membership: ControlledShareMembershipEvidence;
  record: ControlledShareRecord;
  selectedFields: readonly ControlledShareField[];
  selectedAttachmentIds: readonly string[];
  allowDownload: boolean;
  audience: "PUBLIC_LINK" | "VERIFIED_RECIPIENT";
  recipientEmailHash: string | null;
  recipientBindingEvidence: ControlledShareRecipientBindingEvidence | null;
  startsAt: Date;
  expiresAt: Date;
  generatedGrantId: string;
  generatedGrantIdEntropyBytes: number;
  generatedTokenEntropyBytes: number;
  generatedTokenHash: string;
  confirmationEvidence: ControlledShareConfirmationEvidence;
  now: Date;
}): ControlledShareGrantDecision {
  if (
    !validText(currentUserId, 200) ||
    !validText(selectedHomeId, 200) ||
    sessionVerified !== true ||
    !validMembershipEvidence(membership, currentUserId, selectedHomeId) ||
    !validDate(now) ||
    !record ||
    record.homeId !== selectedHomeId ||
    !validRecordShape(record) ||
    !Array.isArray(selectedFields) ||
    !Array.isArray(selectedAttachmentIds) ||
    typeof allowDownload !== "boolean"
  ) {
    return { status: "unavailable" };
  }
  if (!hasWriteRole(membership.role)) {
    return { status: "read-only" };
  }
  if (
    !validDate(startsAt) ||
    !validDate(expiresAt) ||
    !validDate(now)
  ) {
    return { status: "unavailable" };
  }
  const ttl = expiresAt.getTime() - startsAt.getTime();
  if (
    startsAt < now ||
    ttl < CONTROLLED_SHARE_MIN_TTL_MS ||
    ttl > CONTROLLED_SHARE_MAX_TTL_MS ||
    !validText(generatedGrantId, 200) ||
    !Number.isSafeInteger(generatedGrantIdEntropyBytes) ||
    generatedGrantIdEntropyBytes <
      CONTROLLED_SHARE_GRANT_ID_MIN_ENTROPY_BYTES ||
    !Number.isSafeInteger(generatedTokenEntropyBytes) ||
    generatedTokenEntropyBytes < CONTROLLED_SHARE_TOKEN_MIN_ENTROPY_BYTES ||
    !validText(generatedTokenHash, 512)
  ) {
    return { status: "unavailable" };
  }
  if (
    selectedFields.length < 1 ||
    !uniqueValues(selectedFields) ||
    selectedFields.some(
      (field) =>
        !CONTROLLED_SHARE_FIELDS.includes(field) ||
        !record.availableFields.includes(field),
    ) ||
    selectedAttachmentIds.length > CONTROLLED_SHARE_MAX_ATTACHMENTS ||
    !uniqueValues(selectedAttachmentIds)
  ) {
    return { status: "unavailable" };
  }
  if (
    (audience !== "PUBLIC_LINK" && audience !== "VERIFIED_RECIPIENT") ||
    (audience === "PUBLIC_LINK" &&
      (recipientEmailHash !== null || recipientBindingEvidence !== null)) ||
    (audience === "VERIFIED_RECIPIENT" &&
      (!recipientBindingEvidence ||
        recipientBindingEvidence.userId !== currentUserId ||
        recipientBindingEvidence.homeId !== selectedHomeId ||
        recipientBindingEvidence.recordId !== record.id ||
        recipientBindingEvidence.recipientEmailHash !== recipientEmailHash ||
        recipientBindingEvidence.serverVerified !== true ||
        recipientEmailHash === null ||
        !validText(recipientEmailHash, 512)))
  ) {
    return { status: "unavailable" };
  }
  const attachmentById = new Map(
    record.attachments.map((attachment) => [attachment.id, attachment]),
  );
  const bindings: ControlledShareAttachmentBinding[] = [];
  for (const attachmentId of selectedAttachmentIds) {
    const attachment = attachmentById.get(attachmentId);
    if (
      !attachment ||
      attachment.homeId !== selectedHomeId ||
      attachment.recordId !== record.id ||
      attachment.status !== "AVAILABLE" ||
      attachment.malwareDecision !== "CLEAN" ||
      !attachment.privateOnly ||
      !validText(attachment.contentDigest, 256)
    ) {
      return { status: "unavailable" };
    }
    bindings.push({
      attachmentId: attachment.id,
      contentDigest: attachment.contentDigest,
    });
  }
  const expectedSelectionBinding = selectionBinding({
    record,
    selectedFields,
    attachmentBindings: bindings,
    allowDownload,
    audience,
    recipientEmailHash,
    startsAt,
    expiresAt,
  });
  if (
    !confirmationEvidence ||
    !validText(confirmationEvidence.id, 200) ||
    confirmationEvidence.userId !== currentUserId ||
    confirmationEvidence.homeId !== selectedHomeId ||
    confirmationEvidence.recordId !== record.id ||
    confirmationEvidence.recordRevision !== record.revision ||
    confirmationEvidence.selectionBinding !== expectedSelectionBinding ||
    !validDate(confirmationEvidence.issuedAt) ||
    !validDate(confirmationEvidence.expiresAt) ||
    confirmationEvidence.expiresAt <= confirmationEvidence.issuedAt ||
    confirmationEvidence.expiresAt.getTime() -
      confirmationEvidence.issuedAt.getTime() >
      CONTROLLED_SHARE_CONFIRMATION_TTL_MS ||
    now < confirmationEvidence.issuedAt ||
    now >= confirmationEvidence.expiresAt ||
    confirmationEvidence.singleUse !== true ||
    confirmationEvidence.consumed !== false
  ) {
    return { status: "confirmation-required" };
  }
  return {
    status: "grant-authorized",
    grantId: generatedGrantId,
    grantIdEntropyBytes: generatedGrantIdEntropyBytes,
    homeId: selectedHomeId,
    recordId: record.id,
    recordRevision: record.revision,
    createdByUserId: currentUserId,
    startsAt,
    expiresAt,
    audience,
    recipientEmailHash,
    allowDownload,
    policyVersion: CONTROLLED_SHARE_POLICY_VERSION,
    selectedFields: [...selectedFields],
    attachmentBindings: bindings,
    tokenHash: generatedTokenHash,
    tokenEntropyBytes: generatedTokenEntropyBytes,
    storeRawToken: false,
    deliverRawTokenOnce: true,
    secretPlacement: "URL_FRAGMENT",
    requirePostExchange: true,
    exposePrivateBlobUrl: false,
    noIndex: true,
    noStore: true,
  };
}

export function decideControlledShareExchange({
  grant,
  record,
  routeGrantId,
  requestMethod,
  tokenEvidence,
  rateLimitEvidence,
  recipientEvidence,
  now,
}: {
  grant: ControlledShareGrant;
  record: ControlledShareRecord;
  routeGrantId: string;
  requestMethod: "GET" | "POST";
  tokenEvidence: ControlledShareTokenEvidence;
  rateLimitEvidence: ControlledShareRateLimitEvidence;
  recipientEvidence: ControlledShareRecipientEvidence | null;
  now: Date;
}): ControlledShareExchangeDecision {
  if (
    !validDate(now) ||
    !grant ||
    !record ||
    !validGrantShape(grant) ||
    !validText(routeGrantId, 200) ||
    routeGrantId !== grant.id ||
    requestMethod !== "POST" ||
    !tokenEvidence ||
    tokenEvidence.grantId !== grant.id ||
    tokenEvidence.routeGrantId !== routeGrantId ||
    tokenEvidence.tokenHash !== grant.tokenHash ||
    tokenEvidence.matchedConstantTime !== true ||
    !rateLimitEvidence ||
    rateLimitEvidence.grantId !== grant.id ||
    rateLimitEvidence.allowed !== true
  ) {
    return { status: "unavailable" };
  }
  if (!activeGrant(grant, now)) {
    return { status: "expired-or-revoked" };
  }
  if (!recordMatchesGrant(grant, record)) {
    return { status: "stale" };
  }
  if (
    grant.audience === "VERIFIED_RECIPIENT" &&
    (!recipientEvidence ||
      recipientEvidence.grantId !== grant.id ||
      !validText(recipientEvidence.verifiedUserId, 200) ||
      recipientEvidence.recipientEmailHash !== grant.recipientEmailHash ||
      recipientEvidence.matchedConstantTime !== true)
  ) {
    return { status: "recipient-verification-required" };
  }
  if (grant.audience === "PUBLIC_LINK" && recipientEvidence !== null) {
    return { status: "unavailable" };
  }
  return {
    status: "session-authorized",
    grantId: grant.id,
    expiresAt: new Date(
      Math.min(
        now.getTime() + CONTROLLED_SHARE_SESSION_TTL_MS,
        grant.expiresAt.getTime(),
      ),
    ),
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: `/share/${grant.id}`,
    },
    clearFragmentSecret: true,
    exposePrivateBlobUrl: false,
  };
}

function authorizeShareSession({
  grant,
  record,
  session,
  sessionEvidence,
  recipientEvidence,
  now,
}: {
  grant: ControlledShareGrant;
  record: ControlledShareRecord;
  session: ControlledShareSession;
  sessionEvidence: ControlledShareSessionEvidence;
  recipientEvidence: ControlledShareRecipientEvidence | null;
  now: Date;
}): "authorized" | "expired-or-revoked" | "stale" | "unavailable" {
  if (
    !validDate(now) ||
    !grant ||
    !record ||
    !session ||
    !validGrantShape(grant) ||
    !validText(session.id, 200) ||
    !Number.isSafeInteger(session.version) ||
    session.version < 1 ||
    session.grantId !== grant.id ||
    !validDate(session.createdAt) ||
    !validDate(session.expiresAt) ||
    session.createdAt < grant.startsAt ||
    session.expiresAt <= session.createdAt ||
    session.expiresAt > grant.expiresAt ||
    session.expiresAt.getTime() - session.createdAt.getTime() >
      CONTROLLED_SHARE_SESSION_TTL_MS ||
    (session.revokedAt !== null && !validDate(session.revokedAt)) ||
    !sessionEvidence ||
    sessionEvidence.grantId !== grant.id ||
    sessionEvidence.sessionId !== session.id ||
    sessionEvidence.matchedConstantTime !== true
  ) {
    return "unavailable";
  }
  if (
    !activeGrant(grant, now) ||
    session.revokedAt !== null ||
    now < session.createdAt ||
    now >= session.expiresAt
  ) {
    return "expired-or-revoked";
  }
  if (
    grant.audience === "VERIFIED_RECIPIENT" &&
    (!recipientEvidence ||
      recipientEvidence.grantId !== grant.id ||
      !validText(session.verifiedUserId ?? "", 200) ||
      session.verifiedUserId !== recipientEvidence.verifiedUserId ||
      recipientEvidence.recipientEmailHash !== grant.recipientEmailHash ||
      recipientEvidence.matchedConstantTime !== true)
  ) {
    return "unavailable";
  }
  if (grant.audience === "PUBLIC_LINK" && recipientEvidence !== null) {
    return "unavailable";
  }
  return recordMatchesGrant(grant, record) ? "authorized" : "stale";
}

export function decideControlledShareView(input: {
  grant: ControlledShareGrant;
  record: ControlledShareRecord;
  session: ControlledShareSession;
  sessionEvidence: ControlledShareSessionEvidence;
  recipientEvidence: ControlledShareRecipientEvidence | null;
  now: Date;
}): ControlledShareViewDecision {
  const authorization = authorizeShareSession(input);
  if (authorization !== "authorized") {
    return { status: authorization };
  }
  return {
    status: "view-authorized",
    grantId: input.grant.id,
    recordId: input.record.id,
    selectedFields: [...input.grant.selectedFields],
    attachmentIds: input.grant.attachmentBindings.map(
      (binding) => binding.attachmentId,
    ),
    allowDownload: input.grant.allowDownload,
    responseHeaders: {
      cacheControl: "private, no-store",
      robotsTag: "noindex, nofollow, noarchive",
      referrerPolicy: "no-referrer",
      frameAncestors: "'none'",
    },
    exposeHouseholdNavigation: false,
    exposePrivateBlobUrl: false,
  };
}

export function decideControlledShareDownload(
  input: {
    grant: ControlledShareGrant;
    record: ControlledShareRecord;
    session: ControlledShareSession;
    sessionEvidence: ControlledShareSessionEvidence;
    recipientEvidence: ControlledShareRecipientEvidence | null;
    now: Date;
  } & { attachmentId: string },
): ControlledShareDownloadDecision {
  const authorization = authorizeShareSession(input);
  if (authorization !== "authorized") {
    return { status: authorization };
  }
  if (!input.grant.allowDownload) {
    return { status: "download-disabled" };
  }
  if (!validText(input.attachmentId, 200)) {
    return { status: "unavailable" };
  }
  const binding = input.grant.attachmentBindings.find(
    (candidate) => candidate.attachmentId === input.attachmentId,
  );
  const attachment = input.record.attachments.find(
    (candidate) => candidate.id === input.attachmentId,
  );
  if (
    !binding ||
    !attachment ||
    attachment.contentDigest !== binding.contentDigest ||
    !validText(attachment.storageKey, 500)
  ) {
    return { status: "unavailable" };
  }
  return {
    status: "stream-authorized",
    grantId: input.grant.id,
    attachmentId: attachment.id,
    internalStorageKey: attachment.storageKey,
    streamThroughAuthorizedServerRoute: true,
    redirectToStorageProvider: false,
    exposePrivateBlobUrl: false,
    cacheControl: "private, no-store",
  };
}

export function decideControlledShareRevocation({
  currentUserId,
  selectedHomeId,
  sessionVerified,
  membership,
  grant,
}: {
  currentUserId: string;
  selectedHomeId: string;
  sessionVerified: boolean;
  membership: ControlledShareMembershipEvidence;
  grant: ControlledShareGrant;
}): ControlledShareRevocationDecision {
  if (
    !validText(currentUserId, 200) ||
    !validText(selectedHomeId, 200) ||
    sessionVerified !== true ||
    !validMembershipEvidence(membership, currentUserId, selectedHomeId) ||
    !grant ||
    !validGrantShape(grant) ||
    grant.homeId !== selectedHomeId
  ) {
    return { status: "unavailable" };
  }
  if (
    membership.role !== "OWNER" &&
    !(membership.role === "ADULT" && grant.createdByUserId === currentUserId)
  ) {
    return { status: "read-only" };
  }
  return {
    status: "revocation-authorized",
    grantId: grant.id,
    revokeImmediately: true,
    deleteTokenHash: true,
    invalidateAllSessions: true,
    preserveBoundedAudit: true,
  };
}

export function decideControlledShareAudit({
  grantId,
  event,
  occurredAt,
  actorUserId,
}: {
  grantId: string;
  event: ControlledShareAuditEvent;
  occurredAt: Date;
  actorUserId: string | null;
}): ControlledShareAuditDecision {
  if (
    !validText(grantId, 200) ||
    !validDate(occurredAt) ||
    !CONTROLLED_SHARE_AUDIT_EVENTS.includes(event) ||
    (actorUserId !== null && !validText(actorUserId, 200))
  ) {
    return { status: "unavailable" };
  }
  return {
    status: "audit-authorized",
    grantId,
    event,
    occurredAt,
    actorUserId,
    retainUntil: new Date(
      occurredAt.getTime() + CONTROLLED_SHARE_AUDIT_RETENTION_MS,
    ),
    storeRawToken: false,
    storePrivateBlobUrl: false,
    storeRequestBody: false,
    storeIpAddress: false,
    storeUserAgent: false,
  };
}

export function decideControlledShareCleanup({
  scope,
  now,
}: {
  scope: "GRANT" | "RECORD" | "ATTACHMENT" | "PROPERTY" | "ACCOUNT";
  now: Date;
}): ControlledShareCleanupDecision {
  if (
    !validDate(now) ||
    !["GRANT", "RECORD", "ATTACHMENT", "PROPERTY", "ACCOUNT"].includes(scope)
  ) {
    return { status: "unavailable" };
  }
  return {
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
    deleteAuditAfter: new Date(
      now.getTime() + CONTROLLED_SHARE_AUDIT_RETENTION_MS,
    ),
    deleteAcceptedRecord:
      scope === "RECORD" || scope === "PROPERTY" || scope === "ACCOUNT",
    deletePrivateAttachment:
      scope === "ATTACHMENT" ||
      scope === "RECORD" ||
      scope === "PROPERTY" ||
      scope === "ACCOUNT",
    requireRetryableCleanupLedger: true,
  };
}
