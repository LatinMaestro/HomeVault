import assert from "node:assert/strict";
import test from "node:test";

import {
  COMMERCIAL_POLICY_VERSION,
  decideCommercialActivation,
  decideCommercialCleanup,
  decideEntitlement,
  decideStoreNotification,
  type CommercialCleanupEvidence,
  type CommercialDecisionEvidence,
  type EntitlementEvidence,
  type StoreNotificationEvidence,
  type StoreProductEvidence,
  type StoreTransactionEvidence,
} from "../src/lib/commercial-model-policy";

const now = new Date("2026-07-30T00:00:00.000Z");

const decision: CommercialDecisionEvidence = {
  decisionId: "fictional-commercial-decision",
  revision: 4,
  model: "SUBSCRIPTION",
  productVersion: 2,
  issuedAt: new Date("2026-07-29T23:00:00.000Z"),
  expiresAt: new Date("2026-08-28T23:00:00.000Z"),
  clientApproved: true,
  legalApproved: true,
  costApproved: true,
  storePolicyReviewed: true,
  privacyDisclosureApproved: true,
  serverResolved: true,
};

const product: StoreProductEvidence = {
  decisionId: decision.decisionId,
  decisionRevision: decision.revision,
  model: "SUBSCRIPTION",
  platform: "APPLE",
  productId: "com.example.homevault.fictional.monthly",
  productVersion: decision.productVersion,
  fetchedAt: new Date("2026-07-29T23:55:00.000Z"),
  expiresAt: new Date("2026-07-30T00:05:00.000Z"),
  serverStoreFetched: true,
  active: true,
  autoRenewableSubscription: true,
  externalPurchaseLinkDisabled: true,
  advertisingDisabled: true,
  trackingDisabled: true,
};

const activationInput = {
  evidence: decision,
  expectedDecisionId: decision.decisionId,
  expectedRevision: decision.revision,
  product,
  expectedPlatform: product.platform,
  expectedProductId: product.productId,
  now,
};

const activation = decideCommercialActivation(activationInput);

const transaction: StoreTransactionEvidence = {
  verificationId: "verification-1",
  userId: "user-1",
  accountId: "account-1",
  platform: product.platform,
  environment: "SANDBOX",
  productId: product.productId,
  productVersion: product.productVersion,
  originalTransactionId: "original-transaction-1",
  transactionId: "transaction-1",
  signedPayloadDigest: "fictional-sha256-digest",
  purchasedAt: new Date("2026-07-29T23:45:00.000Z"),
  expiresAt: new Date("2026-08-29T23:45:00.000Z"),
  verifiedAt: new Date("2026-07-29T23:55:00.000Z"),
  verificationExpiresAt: new Date("2026-07-30T00:05:00.000Z"),
  serverStoreVerified: true,
  signatureVerified: true,
  appIdentifierVerified: true,
  environmentVerified: true,
  ownershipTypeVerified: true,
  revoked: false,
  refunded: false,
  consumedVerificationId: null,
};

const entitlement: EntitlementEvidence = {
  id: "entitlement-1",
  revision: 8,
  userId: transaction.userId,
  accountId: transaction.accountId,
  platform: transaction.platform,
  environment: transaction.environment,
  productId: transaction.productId,
  productVersion: transaction.productVersion,
  originalTransactionId: transaction.originalTransactionId,
  sourceTransactionId: "transaction-before-1",
  status: "ACTIVE",
  expiresAt: transaction.expiresAt,
  updatedAt: new Date("2026-07-29T23:50:00.000Z"),
};

test("exports a versioned policy without selecting a live commercial model", () => {
  assert.equal(COMMERCIAL_POLICY_VERSION, "homevault-commercial-v1");
});

test("authorizes a subscription only after every explicit decision gate", () => {
  assert.deepEqual(activation, {
    status: "subscription-authorized",
    model: "SUBSCRIPTION",
    platform: "APPLE",
    productId: product.productId,
    productVersion: product.productVersion,
    usePlatformIapOnly: true,
    externalPaymentsEnabled: false,
    advertisingEnabled: false,
    trackingEnabled: false,
  });
});

test("keeps client, legal, cost, store and privacy decisions fail closed", () => {
  const cases = [
    ["clientApproved", "client"],
    ["legalApproved", "legal"],
    ["costApproved", "cost"],
    ["storePolicyReviewed", "store-policy"],
    ["privacyDisclosureApproved", "privacy"],
  ] as const;
  for (const [field, reason] of cases) {
    assert.deepEqual(
      decideCommercialActivation({
        ...activationInput,
        evidence: { ...decision, [field]: false },
      }),
      { status: "decision-gate", reason },
    );
  }
});

test("rejects truthy decision evidence and substituted decision identities", () => {
  for (const patch of [
    { clientApproved: 1 as never },
    { serverResolved: 1 as never },
    { decisionId: "another-decision" },
    { revision: decision.revision + 1 },
    { model: "AD_SUPPORTED" as never },
    { expiresAt: now },
  ]) {
    assert.deepEqual(
      decideCommercialActivation({
        ...activationInput,
        evidence: { ...decision, ...patch },
      }),
      { status: "unavailable" },
    );
  }
});

test("a free decision cannot smuggle in a store product", () => {
  const free = { ...decision, model: "FREE" as const };
  assert.deepEqual(
    decideCommercialActivation({
      ...activationInput,
      evidence: free,
      product: undefined,
      expectedPlatform: undefined,
      expectedProductId: undefined,
    }),
    {
      status: "free-authorized",
      model: "FREE",
      productVersion: free.productVersion,
      purchasesEnabled: false,
      subscriptionsEnabled: false,
      externalPaymentsEnabled: false,
    },
  );
  assert.deepEqual(
    decideCommercialActivation({ ...activationInput, evidence: free }),
    { status: "unavailable" },
  );
});

test("binds the approved product to decision, platform, ID and version", () => {
  for (const patch of [
    { decisionId: "another-decision" },
    { decisionRevision: decision.revision + 1 },
    { platform: "GOOGLE" as const },
    { productId: "another-product" },
    { productVersion: product.productVersion + 1 },
    { serverStoreFetched: false },
    { active: false },
    { autoRenewableSubscription: false },
    { externalPurchaseLinkDisabled: false },
    { advertisingDisabled: false },
    { trackingDisabled: false },
  ]) {
    assert.deepEqual(
      decideCommercialActivation({
        ...activationInput,
        product: { ...product, ...patch },
      }),
      { status: "decision-gate", reason: "product" },
    );
  }
});

test("authorizes only exact server-verified transaction entitlements", () => {
  assert.deepEqual(
    decideEntitlement({
      activation,
      userId: transaction.userId,
      accountId: transaction.accountId,
      product,
      transaction,
      existingEntitlement: entitlement,
      now,
    }),
    {
      status: "entitlement-authorized",
      userId: transaction.userId,
      accountId: transaction.accountId,
      productId: transaction.productId,
      originalTransactionId: transaction.originalTransactionId,
      transactionId: transaction.transactionId,
      nextRevision: 9,
      entitlementExpiresAt: transaction.expiresAt,
      paidFeaturesEnabled: true,
      exportAvailable: true,
      deletionAvailable: true,
      privacyAndSupportAvailable: true,
      coreHouseholdDataReadable: true,
    },
  );
});

test("rejects receipt substitution, replay evidence and truthy verification", () => {
  for (const patch of [
    { userId: "another-user" },
    { accountId: "another-account" },
    { platform: "GOOGLE" as const },
    { productId: "another-product" },
    { productVersion: product.productVersion + 1 },
    { originalTransactionId: "another-original" },
    { transactionId: " " },
    { serverStoreVerified: false },
    { signatureVerified: 1 as never },
    { appIdentifierVerified: false },
    { environmentVerified: false },
    { ownershipTypeVerified: false },
    { verifiedAt: "not-a-date" as never },
  ]) {
    assert.deepEqual(
      decideEntitlement({
        activation,
        userId: transaction.userId,
        accountId: transaction.accountId,
        product,
        transaction: { ...transaction, ...patch },
        existingEntitlement: entitlement,
        now,
      }),
      { status: "unavailable" },
    );
  }
});

test("deduplicates an already-applied transaction", () => {
  assert.deepEqual(
    decideEntitlement({
      activation,
      userId: transaction.userId,
      accountId: transaction.accountId,
      product,
      transaction: { ...transaction, consumedVerificationId: "verification-1" },
      existingEntitlement: {
        ...entitlement,
        sourceTransactionId: transaction.transactionId,
      },
      now,
    }),
    { status: "duplicate", transactionId: transaction.transactionId },
  );
});

test("fails closed for cross-account and malformed entitlement state", () => {
  for (const patch of [
    { userId: "another-user" },
    { accountId: "another-account" },
    { productId: "another-product" },
    { originalTransactionId: "another-original" },
    { revision: 0 },
    { status: "UNKNOWN" as never },
    { updatedAt: new Date("2026-07-30T00:00:00.001Z") },
  ]) {
    assert.deepEqual(
      decideEntitlement({
        activation,
        userId: transaction.userId,
        accountId: transaction.accountId,
        product,
        transaction,
        existingEntitlement: { ...entitlement, ...patch },
        now,
      }),
      { status: "unavailable" },
    );
  }
});

const notification: StoreNotificationEvidence = {
  notificationId: "notification-1",
  notificationType: "DID_RENEW",
  platform: entitlement.platform,
  environment: entitlement.environment,
  appIdentifier: "com.example.homevault.fictional",
  productId: entitlement.productId,
  originalTransactionId: entitlement.originalTransactionId,
  transactionId: "transaction-2",
  signedPayloadDigest: "fictional-notification-digest",
  issuedAt: new Date("2026-07-29T23:55:00.000Z"),
  verifiedAt: new Date("2026-07-29T23:56:00.000Z"),
  expiresAt: new Date("2026-07-30T00:06:00.000Z"),
  signatureVerified: true,
  appIdentifierVerified: true,
  environmentVerified: true,
  serverReceived: true,
};

test("authorizes verified notifications with compare-and-set entitlement state", () => {
  assert.deepEqual(
    decideStoreNotification({
      notification,
      expectedAppIdentifier: notification.appIdentifier,
      entitlement,
      now,
    }),
    {
      status: "notification-authorized",
      notificationId: notification.notificationId,
      notificationType: notification.notificationType,
      productId: notification.productId,
      originalTransactionId: notification.originalTransactionId,
      transactionId: notification.transactionId,
      compareAndSetEntitlementRevision: entitlement.revision,
      requireFreshStoreStatus: true,
    },
  );
});

test("rejects substituted notification evidence and duplicate events", () => {
  assert.deepEqual(
    decideStoreNotification({
      notification,
      expectedAppIdentifier: notification.appIdentifier,
      entitlement,
      existingNotificationId: notification.notificationId,
      now,
    }),
    { status: "duplicate", notificationId: notification.notificationId },
  );
  for (const patch of [
    { appIdentifier: "another.app" },
    { productId: "another-product" },
    { originalTransactionId: "another-original" },
    { platform: "GOOGLE" as const },
    { environment: "PRODUCTION" as const },
    { signatureVerified: false },
    { serverReceived: 1 as never },
  ]) {
    assert.deepEqual(
      decideStoreNotification({
        notification: { ...notification, ...patch },
        expectedAppIdentifier: notification.appIdentifier,
        entitlement,
        now,
      }),
      { status: "unavailable" },
    );
  }
});

const cleanup: CommercialCleanupEvidence = {
  cleanupId: "commercial-cleanup-1",
  scope: "ACCOUNT",
  userId: transaction.userId,
  accountId: transaction.accountId,
  decisionId: decision.decisionId,
  decisionRevision: decision.revision,
  issuedAt: new Date("2026-07-29T23:55:00.000Z"),
  expiresAt: new Date("2026-07-30T00:05:00.000Z"),
  serverAuthorized: true,
};

test("account cleanup revokes and deletes every HomeVault commercial copy", () => {
  assert.deepEqual(
    decideCommercialCleanup({
      evidence: cleanup,
      expectedUserId: cleanup.userId,
      expectedAccountId: cleanup.accountId,
      expectedDecisionId: cleanup.decisionId,
      expectedDecisionRevision: cleanup.decisionRevision,
      now,
    }),
    {
      status: "cleanup-authorized",
      scope: "ACCOUNT",
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
    },
  );
});

test("cleanup binds exact account, user, decision and single-use authorization", () => {
  for (const patch of [
    { scope: "PROPERTY" as never },
    { userId: "another-user" },
    { accountId: "another-account" },
    { decisionId: "another-decision" },
    { decisionRevision: decision.revision + 1 },
    { serverAuthorized: false },
    { serverAuthorized: 1 as never },
    { expiresAt: now },
  ]) {
    assert.deepEqual(
      decideCommercialCleanup({
        evidence: { ...cleanup, ...patch },
        expectedUserId: cleanup.userId,
        expectedAccountId: cleanup.accountId,
        expectedDecisionId: cleanup.decisionId,
        expectedDecisionRevision: cleanup.decisionRevision,
        now,
      }),
      { status: "unavailable" },
    );
  }
});

test("invalid runtime dates fail closed across all decisions", () => {
  assert.deepEqual(
    decideCommercialActivation({ ...activationInput, now: new Date("invalid") }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideEntitlement({
      activation,
      userId: transaction.userId,
      accountId: transaction.accountId,
      product,
      transaction,
      now: new Date("invalid"),
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideCommercialCleanup({
      evidence: cleanup,
      expectedUserId: cleanup.userId,
      expectedAccountId: cleanup.accountId,
      expectedDecisionId: cleanup.decisionId,
      expectedDecisionRevision: cleanup.decisionRevision,
      now: new Date("invalid"),
    }),
    { status: "unavailable" },
  );
});
