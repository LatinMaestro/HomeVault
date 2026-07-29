export const COMMERCIAL_POLICY_VERSION = "homevault-commercial-v1";
export const COMMERCIAL_EVIDENCE_MAX_AGE_MS = 10 * 60 * 1000;
export const COMMERCIAL_DECISION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
export const COMMERCIAL_RECEIPT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const COMMERCIAL_MODELS = ["FREE", "SUBSCRIPTION"] as const;
const STORE_PLATFORMS = ["APPLE", "GOOGLE"] as const;
const STORE_ENVIRONMENTS = ["SANDBOX", "PRODUCTION"] as const;
const ENTITLEMENT_STATUSES = ["ACTIVE", "GRACE", "EXPIRED", "REVOKED"] as const;
const CLEANUP_SCOPES = ["ACCOUNT", "USER"] as const;

export type CommercialModel = (typeof COMMERCIAL_MODELS)[number];
export type StorePlatform = (typeof STORE_PLATFORMS)[number];
export type StoreEnvironment = (typeof STORE_ENVIRONMENTS)[number];
export type EntitlementStatus = (typeof ENTITLEMENT_STATUSES)[number];

export type CommercialDecisionEvidence = {
  decisionId: string;
  revision: number;
  model: CommercialModel;
  productVersion: number;
  issuedAt: Date;
  expiresAt: Date;
  clientApproved: boolean;
  legalApproved: boolean;
  costApproved: boolean;
  storePolicyReviewed: boolean;
  privacyDisclosureApproved: boolean;
  serverResolved: boolean;
};

export type StoreProductEvidence = {
  decisionId: string;
  decisionRevision: number;
  model: CommercialModel;
  platform: StorePlatform;
  productId: string;
  productVersion: number;
  fetchedAt: Date;
  expiresAt: Date;
  serverStoreFetched: boolean;
  active: boolean;
  autoRenewableSubscription: boolean;
  externalPurchaseLinkDisabled: boolean;
  advertisingDisabled: boolean;
  trackingDisabled: boolean;
};

export type StoreTransactionEvidence = {
  verificationId: string;
  userId: string;
  accountId: string;
  platform: StorePlatform;
  environment: StoreEnvironment;
  productId: string;
  productVersion: number;
  originalTransactionId: string;
  transactionId: string;
  signedPayloadDigest: string;
  purchasedAt: Date;
  expiresAt: Date;
  verifiedAt: Date;
  verificationExpiresAt: Date;
  serverStoreVerified: boolean;
  signatureVerified: boolean;
  appIdentifierVerified: boolean;
  environmentVerified: boolean;
  ownershipTypeVerified: boolean;
  revoked: boolean;
  refunded: boolean;
  consumedVerificationId: string | null;
};

export type EntitlementEvidence = {
  id: string;
  revision: number;
  userId: string;
  accountId: string;
  platform: StorePlatform;
  environment: StoreEnvironment;
  productId: string;
  productVersion: number;
  originalTransactionId: string;
  sourceTransactionId: string;
  status: EntitlementStatus;
  expiresAt: Date;
  updatedAt: Date;
};

export type StoreNotificationEvidence = {
  notificationId: string;
  notificationType: string;
  platform: StorePlatform;
  environment: StoreEnvironment;
  appIdentifier: string;
  productId: string;
  originalTransactionId: string;
  transactionId: string;
  signedPayloadDigest: string;
  issuedAt: Date;
  verifiedAt: Date;
  expiresAt: Date;
  signatureVerified: boolean;
  appIdentifierVerified: boolean;
  environmentVerified: boolean;
  serverReceived: boolean;
};

export type CommercialCleanupEvidence = {
  cleanupId: string;
  scope: "ACCOUNT" | "USER";
  userId: string;
  accountId: string;
  decisionId: string;
  decisionRevision: number;
  issuedAt: Date;
  expiresAt: Date;
  serverAuthorized: boolean;
};

export type CommercialActivationDecision =
  | {
      status: "free-authorized";
      model: "FREE";
      productVersion: number;
      purchasesEnabled: false;
      subscriptionsEnabled: false;
      externalPaymentsEnabled: false;
    }
  | {
      status: "subscription-authorized";
      model: "SUBSCRIPTION";
      platform: StorePlatform;
      productId: string;
      productVersion: number;
      usePlatformIapOnly: true;
      externalPaymentsEnabled: false;
      advertisingEnabled: false;
      trackingEnabled: false;
    }
  | {
      status: "decision-gate";
      reason:
        | "client"
        | "legal"
        | "cost"
        | "store-policy"
        | "privacy"
        | "product";
    }
  | { status: "unavailable" };

export type EntitlementDecision =
  | {
      status: "entitlement-authorized";
      userId: string;
      accountId: string;
      productId: string;
      originalTransactionId: string;
      transactionId: string;
      nextRevision: number;
      entitlementExpiresAt: Date;
      paidFeaturesEnabled: true;
      exportAvailable: true;
      deletionAvailable: true;
      privacyAndSupportAvailable: true;
      coreHouseholdDataReadable: true;
    }
  | { status: "duplicate"; transactionId: string }
  | { status: "not-entitled" }
  | { status: "unavailable" };

export type StoreNotificationDecision =
  | {
      status: "notification-authorized";
      notificationId: string;
      notificationType: string;
      productId: string;
      originalTransactionId: string;
      transactionId: string;
      compareAndSetEntitlementRevision: number;
      requireFreshStoreStatus: true;
    }
  | { status: "duplicate"; notificationId: string }
  | { status: "unavailable" };

export type CommercialCleanupDecision =
  | {
      status: "cleanup-authorized";
      scope: "ACCOUNT" | "USER";
      revokeEntitlements: true;
      deleteReceiptPayloads: true;
      deleteTransactionMappings: true;
      deleteNotificationPayloads: true;
      deleteWebhookQueues: true;
      deleteDeduplicationKeys: true;
      deleteServerCaches: true;
      deleteDeviceAndOfflineEntitlements: true;
      deleteProviderCustomerMappings: true;
      cancelHomeVaultManagedRenewals: false;
      discloseStoreManagedRetention: true;
      requireRetryableCleanupLedger: true;
      preserveExportAndDeletionUntilCleanupCompletes: true;
      deleteHouseholdRecords: false;
    }
  | { status: "unavailable" };

function validText(value: unknown, maximum = 256) {
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

function validEvidenceWindow(
  issuedAt: unknown,
  expiresAt: unknown,
  now: Date,
  maximumAge: number,
) {
  return (
    validDate(issuedAt) &&
    validDate(expiresAt) &&
    issuedAt <= now &&
    expiresAt > now &&
    expiresAt > issuedAt &&
    expiresAt.getTime() - issuedAt.getTime() <= maximumAge
  );
}

function validDecision(
  evidence: CommercialDecisionEvidence,
  expectedDecisionId: string,
  expectedRevision: number,
  now: Date,
): CommercialActivationDecision | null {
  if (
    typeof evidence !== "object" ||
    evidence === null ||
    !validText(expectedDecisionId) ||
    !Number.isInteger(expectedRevision) ||
    expectedRevision < 1 ||
    evidence.decisionId !== expectedDecisionId ||
    evidence.revision !== expectedRevision ||
    !COMMERCIAL_MODELS.includes(evidence.model) ||
    !Number.isInteger(evidence.productVersion) ||
    evidence.productVersion < 1 ||
    typeof evidence.clientApproved !== "boolean" ||
    typeof evidence.legalApproved !== "boolean" ||
    typeof evidence.costApproved !== "boolean" ||
    typeof evidence.storePolicyReviewed !== "boolean" ||
    typeof evidence.privacyDisclosureApproved !== "boolean" ||
    typeof evidence.serverResolved !== "boolean" ||
    !validEvidenceWindow(
      evidence.issuedAt,
      evidence.expiresAt,
      now,
      COMMERCIAL_DECISION_MAX_AGE_MS,
    ) ||
    evidence.serverResolved !== true
  ) {
    return { status: "unavailable" };
  }
  if (evidence.clientApproved !== true) {
    return { status: "decision-gate", reason: "client" };
  }
  if (evidence.legalApproved !== true) {
    return { status: "decision-gate", reason: "legal" };
  }
  if (evidence.costApproved !== true) {
    return { status: "decision-gate", reason: "cost" };
  }
  if (evidence.storePolicyReviewed !== true) {
    return { status: "decision-gate", reason: "store-policy" };
  }
  if (evidence.privacyDisclosureApproved !== true) {
    return { status: "decision-gate", reason: "privacy" };
  }
  return null;
}

export function decideCommercialActivation({
  evidence,
  expectedDecisionId,
  expectedRevision,
  product,
  expectedPlatform,
  expectedProductId,
  now,
}: {
  evidence: CommercialDecisionEvidence;
  expectedDecisionId: string;
  expectedRevision: number;
  product?: StoreProductEvidence;
  expectedPlatform?: StorePlatform;
  expectedProductId?: string;
  now: Date;
}): CommercialActivationDecision {
  if (!validDate(now)) return { status: "unavailable" };
  const blocked = validDecision(
    evidence,
    expectedDecisionId,
    expectedRevision,
    now,
  );
  if (blocked) return blocked;

  if (evidence.model === "FREE") {
    if (product !== undefined) return { status: "unavailable" };
    return {
      status: "free-authorized",
      model: "FREE",
      productVersion: evidence.productVersion,
      purchasesEnabled: false,
      subscriptionsEnabled: false,
      externalPaymentsEnabled: false,
    };
  }

  if (
    typeof product !== "object" ||
    product === null ||
    !STORE_PLATFORMS.includes(expectedPlatform as StorePlatform) ||
    !validText(expectedProductId) ||
    product.decisionId !== evidence.decisionId ||
    product.decisionRevision !== evidence.revision ||
    product.model !== "SUBSCRIPTION" ||
    product.platform !== expectedPlatform ||
    product.productId !== expectedProductId ||
    product.productVersion !== evidence.productVersion ||
    !validEvidenceWindow(
      product.fetchedAt,
      product.expiresAt,
      now,
      COMMERCIAL_EVIDENCE_MAX_AGE_MS,
    ) ||
    product.serverStoreFetched !== true ||
    product.active !== true ||
    product.autoRenewableSubscription !== true ||
    product.externalPurchaseLinkDisabled !== true ||
    product.advertisingDisabled !== true ||
    product.trackingDisabled !== true
  ) {
    return { status: "decision-gate", reason: "product" };
  }
  return {
    status: "subscription-authorized",
    model: "SUBSCRIPTION",
    platform: product.platform,
    productId: product.productId,
    productVersion: product.productVersion,
    usePlatformIapOnly: true,
    externalPaymentsEnabled: false,
    advertisingEnabled: false,
    trackingEnabled: false,
  };
}

function validTransaction({
  transaction,
  userId,
  accountId,
  product,
  now,
}: {
  transaction: StoreTransactionEvidence;
  userId: string;
  accountId: string;
  product: StoreProductEvidence;
  now: Date;
}) {
  return (
    typeof transaction === "object" &&
    transaction !== null &&
    validText(transaction.verificationId) &&
    transaction.userId === userId &&
    transaction.accountId === accountId &&
    transaction.platform === product.platform &&
    STORE_ENVIRONMENTS.includes(transaction.environment) &&
    transaction.productId === product.productId &&
    transaction.productVersion === product.productVersion &&
    validText(transaction.originalTransactionId) &&
    validText(transaction.transactionId) &&
    validText(transaction.signedPayloadDigest) &&
    validDate(transaction.purchasedAt) &&
    validDate(transaction.expiresAt) &&
    transaction.purchasedAt <= now &&
    transaction.expiresAt > now &&
    validEvidenceWindow(
      transaction.verifiedAt,
      transaction.verificationExpiresAt,
      now,
      COMMERCIAL_EVIDENCE_MAX_AGE_MS,
    ) &&
    now.getTime() - transaction.purchasedAt.getTime() <=
      COMMERCIAL_RECEIPT_MAX_AGE_MS &&
    transaction.serverStoreVerified === true &&
    transaction.signatureVerified === true &&
    transaction.appIdentifierVerified === true &&
    transaction.environmentVerified === true &&
    transaction.ownershipTypeVerified === true &&
    transaction.revoked === false &&
    transaction.refunded === false &&
    (transaction.consumedVerificationId === null ||
      transaction.consumedVerificationId === transaction.verificationId)
  );
}

export function decideEntitlement({
  activation,
  userId,
  accountId,
  product,
  transaction,
  existingEntitlement,
  now,
}: {
  activation: CommercialActivationDecision;
  userId: string;
  accountId: string;
  product: StoreProductEvidence;
  transaction: StoreTransactionEvidence;
  existingEntitlement?: EntitlementEvidence;
  now: Date;
}): EntitlementDecision {
  if (
    activation.status !== "subscription-authorized" ||
    !validText(userId) ||
    !validText(accountId) ||
    !validDate(now) ||
    activation.platform !== product.platform ||
    activation.productId !== product.productId ||
    activation.productVersion !== product.productVersion ||
    !validTransaction({ transaction, userId, accountId, product, now })
  ) {
    return { status: "unavailable" };
  }
  if (transaction.consumedVerificationId !== null) {
    if (
      transaction.consumedVerificationId === transaction.verificationId &&
      existingEntitlement?.sourceTransactionId === transaction.transactionId
    ) {
      return { status: "duplicate", transactionId: transaction.transactionId };
    }
    return { status: "unavailable" };
  }
  if (
    transaction.revoked === true ||
    transaction.refunded === true ||
    transaction.expiresAt <= now
  ) {
    return { status: "not-entitled" };
  }

  let nextRevision = 1;
  if (existingEntitlement) {
    if (
      typeof existingEntitlement !== "object" ||
      !validText(existingEntitlement.id) ||
      !Number.isInteger(existingEntitlement.revision) ||
      existingEntitlement.revision < 1 ||
      existingEntitlement.userId !== userId ||
      existingEntitlement.accountId !== accountId ||
      existingEntitlement.platform !== transaction.platform ||
      existingEntitlement.environment !== transaction.environment ||
      existingEntitlement.productId !== transaction.productId ||
      existingEntitlement.productVersion !== transaction.productVersion ||
      existingEntitlement.originalTransactionId !==
        transaction.originalTransactionId ||
      !ENTITLEMENT_STATUSES.includes(existingEntitlement.status) ||
      !validDate(existingEntitlement.expiresAt) ||
      !validDate(existingEntitlement.updatedAt) ||
      existingEntitlement.updatedAt > now
    ) {
      return { status: "unavailable" };
    }
    if (existingEntitlement.sourceTransactionId === transaction.transactionId) {
      return { status: "duplicate", transactionId: transaction.transactionId };
    }
    nextRevision = existingEntitlement.revision + 1;
  }

  return {
    status: "entitlement-authorized",
    userId,
    accountId,
    productId: transaction.productId,
    originalTransactionId: transaction.originalTransactionId,
    transactionId: transaction.transactionId,
    nextRevision,
    entitlementExpiresAt: transaction.expiresAt,
    paidFeaturesEnabled: true,
    exportAvailable: true,
    deletionAvailable: true,
    privacyAndSupportAvailable: true,
    coreHouseholdDataReadable: true,
  };
}

export function decideStoreNotification({
  notification,
  expectedAppIdentifier,
  entitlement,
  existingNotificationId,
  now,
}: {
  notification: StoreNotificationEvidence;
  expectedAppIdentifier: string;
  entitlement: EntitlementEvidence;
  existingNotificationId?: string;
  now: Date;
}): StoreNotificationDecision {
  if (
    typeof notification !== "object" ||
    notification === null ||
    typeof entitlement !== "object" ||
    entitlement === null ||
    !validText(expectedAppIdentifier) ||
    !validDate(now) ||
    !validText(notification.notificationId) ||
    !validText(notification.notificationType) ||
    !STORE_PLATFORMS.includes(notification.platform) ||
    !STORE_ENVIRONMENTS.includes(notification.environment) ||
    notification.appIdentifier !== expectedAppIdentifier ||
    !validText(notification.productId) ||
    !validText(notification.originalTransactionId) ||
    !validText(notification.transactionId) ||
    !validText(notification.signedPayloadDigest) ||
    !validDate(notification.issuedAt) ||
    notification.issuedAt > now ||
    !validEvidenceWindow(
      notification.verifiedAt,
      notification.expiresAt,
      now,
      COMMERCIAL_EVIDENCE_MAX_AGE_MS,
    ) ||
    notification.signatureVerified !== true ||
    notification.appIdentifierVerified !== true ||
    notification.environmentVerified !== true ||
    notification.serverReceived !== true ||
    notification.platform !== entitlement.platform ||
    notification.environment !== entitlement.environment ||
    notification.productId !== entitlement.productId ||
    notification.originalTransactionId !== entitlement.originalTransactionId ||
    !Number.isInteger(entitlement.revision) ||
    entitlement.revision < 1
  ) {
    return { status: "unavailable" };
  }
  if (existingNotificationId !== undefined) {
    if (!validText(existingNotificationId)) return { status: "unavailable" };
    if (existingNotificationId === notification.notificationId) {
      return { status: "duplicate", notificationId: notification.notificationId };
    }
  }
  return {
    status: "notification-authorized",
    notificationId: notification.notificationId,
    notificationType: notification.notificationType,
    productId: notification.productId,
    originalTransactionId: notification.originalTransactionId,
    transactionId: notification.transactionId,
    compareAndSetEntitlementRevision: entitlement.revision,
    requireFreshStoreStatus: true,
  };
}

export function decideCommercialCleanup({
  evidence,
  expectedUserId,
  expectedAccountId,
  expectedDecisionId,
  expectedDecisionRevision,
  now,
}: {
  evidence: CommercialCleanupEvidence;
  expectedUserId: string;
  expectedAccountId: string;
  expectedDecisionId: string;
  expectedDecisionRevision: number;
  now: Date;
}): CommercialCleanupDecision {
  if (
    typeof evidence !== "object" ||
    evidence === null ||
    !validText(evidence.cleanupId) ||
    !CLEANUP_SCOPES.includes(evidence.scope) ||
    !validText(expectedUserId) ||
    !validText(expectedAccountId) ||
    !validText(expectedDecisionId) ||
    !Number.isInteger(expectedDecisionRevision) ||
    expectedDecisionRevision < 1 ||
    evidence.userId !== expectedUserId ||
    evidence.accountId !== expectedAccountId ||
    evidence.decisionId !== expectedDecisionId ||
    evidence.decisionRevision !== expectedDecisionRevision ||
    !validEvidenceWindow(
      evidence.issuedAt,
      evidence.expiresAt,
      now,
      COMMERCIAL_EVIDENCE_MAX_AGE_MS,
    ) ||
    evidence.serverAuthorized !== true ||
    !validDate(now)
  ) {
    return { status: "unavailable" };
  }
  return {
    status: "cleanup-authorized",
    scope: evidence.scope,
    revokeEntitlements: true,
    deleteReceiptPayloads: true,
    deleteTransactionMappings: true,
    deleteNotificationPayloads: true,
    deleteWebhookQueues: true,
    deleteDeduplicationKeys: true,
    deleteServerCaches: true,
    deleteDeviceAndOfflineEntitlements: true,
    deleteProviderCustomerMappings: true,
    cancelHomeVaultManagedRenewals: false,
    discloseStoreManagedRetention: true,
    requireRetryableCleanupLedger: true,
    preserveExportAndDeletionUntilCleanupCompletes: true,
    deleteHouseholdRecords: false,
  };
}
