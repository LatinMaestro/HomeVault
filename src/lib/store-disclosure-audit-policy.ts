import type { CandidateIdentity } from "./full-system-acceptance-policy";

export const STORE_DISCLOSURE_AUDIT_POLICY_VERSION =
  "homevault-store-disclosure-audit-v2";
export const DISCLOSURE_EVIDENCE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const CLIENT_DISCLOSURE_DECISION_MAX_AGE_MS =
  30 * 24 * 60 * 60 * 1000;

export const STORE_CAPABILITIES = [
  "AUTH_IDENTITY",
  "ROLES_INVITATIONS",
  "MULTI_PROPERTY",
  "NOTIFICATIONS",
  "CALENDAR_SYNC",
  "BIOMETRIC_REENTRY",
  "CAMERA_CAPTURE",
  "OFFLINE_ACCESS",
  "EXPANDED_ATTACHMENTS",
  "OCR_DRAFTS",
  "AI_DRAFTS",
  "EMAIL_INGESTION",
  "CONTROLLED_SHARING",
  "PROVIDER_HANDOFF",
  "CRASH_REPORTING",
  "COMMERCIAL_ENTITLEMENTS",
  "NATIVE_UTILITIES",
] as const;

export type StoreCapability = (typeof STORE_CAPABILITIES)[number];

export const DISCLOSURE_SURFACES = [
  "PUBLIC_PRIVACY_POLICY",
  "APPLE_APP_PRIVACY",
  "GOOGLE_DATA_SAFETY",
  "STORE_LISTING",
  "REVIEWER_NOTES",
  "SUPPORT_RUNBOOK",
] as const;

export type DisclosureSurface = (typeof DISCLOSURE_SURFACES)[number];

export const CLIENT_DISCLOSURE_GATES = [
  "LEGAL_IDENTITY",
  "PRIVACY_POLICY",
  "RETENTION_SCHEDULE",
  "STORE_DECLARATIONS",
  "REVIEWER_PACKAGE",
  "COMMERCIAL_MODEL",
] as const;

export type ClientDisclosureGate = (typeof CLIENT_DISCLOSURE_GATES)[number];

export const DATA_CLASSES = [
  "ACCOUNT_IDENTITY",
  "HOUSEHOLD_CONTENT",
  "PURCHASE_METADATA",
  "PRIVATE_FILES",
  "NOTIFICATION_TOKENS",
  "CALENDAR_EVENTS",
  "DEVICE_SECURITY",
  "DIAGNOSTICS",
  "COMMERCIAL_RECORDS",
] as const;

export type DisclosureDataClass = (typeof DATA_CLASSES)[number];

export const PLATFORM_PERMISSIONS = [
  "CAMERA",
  "NOTIFICATIONS",
  "CALENDAR",
  "BIOMETRICS",
] as const;

export type PlatformPermission = (typeof PLATFORM_PERMISSIONS)[number];

export const DELETION_SCOPES = [
  "DATABASE",
  "PRIVATE_FILES",
  "DEVICES",
  "PROCESSORS",
  "CALENDARS",
  "NOTIFICATION_TOKENS",
  "SHARES",
  "DIAGNOSTICS",
] as const;

export type DisclosureDeletionScope = (typeof DELETION_SCOPES)[number];

export type CapabilityDisclosure = {
  capability: StoreCapability;
  candidateId: string;
  candidateRevision: number;
  releaseCommit: string;
  shipped: boolean;
  enabled: boolean;
  dataClasses: DisclosureDataClass[];
  permissions: PlatformPermission[];
  processorIds: string[];
  deletionScopes: DisclosureDeletionScope[];
};

export type ProviderDisclosure = {
  id: string;
  capability: StoreCapability;
  candidateId: string;
  candidateRevision: number;
  releaseCommit: string;
  status: "APPROVED" | "PENDING" | "DISABLED";
  privacyReviewed: boolean;
  regionRecorded: boolean;
  retentionRecorded: boolean;
  deletionSupported: boolean;
  decisionId: string | null;
  decisionRevision: number | null;
  decidedAt: Date | null;
  expiresAt: Date | null;
  authorityRecorded: boolean;
};

export type DisclosureSnapshot = {
  surface: DisclosureSurface;
  candidateId: string;
  candidateRevision: number;
  releaseCommit: string;
  artifactDigest: string;
  issuedAt: Date;
  expiresAt: Date;
  serverResolved: boolean;
  capabilityStates: {
    capability: StoreCapability;
    shipped: boolean;
    enabled: boolean;
  }[];
  dataClasses: DisclosureDataClass[];
  permissions: PlatformPermission[];
  processorIds: string[];
  deletionScopes: DisclosureDeletionScope[];
  status: "ALIGNED" | "MISALIGNED";
};

export type ClientDisclosureGateEvidence = {
  gate: ClientDisclosureGate;
  candidateId: string;
  candidateRevision: number;
  releaseCommit: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  decisionId: string | null;
  decisionRevision: number | null;
  decidedAt: Date | null;
  expiresAt: Date | null;
  authorityRecorded: boolean;
};

export type StoreDisclosureAuditDecision =
  | {
      status: "ready-for-store-package";
      candidate: CandidateIdentity;
      exactCandidateEvidence: true;
      clientApprovalsComplete: true;
    }
  | {
      status: "ready-for-client-approval";
      candidate: CandidateIdentity;
      exactCandidateEvidence: true;
      pendingClientGates: ClientDisclosureGate[];
    }
  | { status: "blocked"; reasons: string[] }
  | { status: "unavailable" };

const PROVIDER_STATUSES = ["APPROVED", "PENDING", "DISABLED"] as const;
const SNAPSHOT_STATUSES = ["ALIGNED", "MISALIGNED"] as const;
const CLIENT_GATE_STATUSES = ["APPROVED", "PENDING", "REJECTED"] as const;

function validText(value: unknown, maximum: number) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maximum &&
    !value.includes("\0") &&
    !value.includes("\r") &&
    !value.includes("\n")
  );
}

function validCandidate(candidate: CandidateIdentity) {
  if (typeof candidate !== "object" || candidate === null) return false;
  const buildNumber = Number(candidate.buildNumber);
  return (
    validText(candidate.candidateId, 200) &&
    Number.isSafeInteger(candidate.revision) &&
    candidate.revision > 0 &&
    typeof candidate.releaseCommit === "string" &&
    /^[a-f0-9]{40}$/.test(candidate.releaseCommit) &&
    typeof candidate.deploymentId === "string" &&
    /^dpl_[A-Za-z0-9]+$/.test(candidate.deploymentId) &&
    typeof candidate.appVersion === "string" &&
    /^\d+\.\d+\.\d+$/.test(candidate.appVersion) &&
    typeof candidate.buildNumber === "string" &&
    /^[1-9]\d*$/.test(candidate.buildNumber) &&
    Number.isSafeInteger(buildNumber)
  );
}

function exactSet<T extends string>(
  actual: readonly T[],
  required: readonly T[],
) {
  return (
    Array.isArray(actual) &&
    new Set(actual).size === actual.length &&
    actual.length === required.length &&
    required.every((value) => actual.includes(value))
  );
}

function sortedUnique(values: readonly string[]) {
  return [...new Set(values)].sort();
}

function validDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function validAuthorityShape(
  status: "APPROVED" | "PENDING" | "REJECTED" | "DISABLED",
  evidence: {
    decisionId: unknown;
    decisionRevision: unknown;
    decidedAt: unknown;
    expiresAt: unknown;
    authorityRecorded: unknown;
  },
) {
  if (typeof evidence.authorityRecorded !== "boolean") return false;
  if (status === "PENDING" || status === "DISABLED") {
    return (
      evidence.decisionId === null &&
      evidence.decisionRevision === null &&
      evidence.decidedAt === null &&
      evidence.expiresAt === null &&
      evidence.authorityRecorded === false
    );
  }
  return (
    validText(evidence.decisionId, 200) &&
    Number.isSafeInteger(evidence.decisionRevision) &&
    (evidence.decisionRevision as number) > 0 &&
    validDate(evidence.decidedAt) &&
    validDate(evidence.expiresAt) &&
    evidence.authorityRecorded === true
  );
}

function authorityIsFresh(
  evidence: { decidedAt: Date | null; expiresAt: Date | null },
  now: Date,
) {
  return (
    evidence.decidedAt !== null &&
    evidence.expiresAt !== null &&
    evidence.decidedAt.getTime() <= now.getTime() &&
    evidence.expiresAt.getTime() > now.getTime() &&
    evidence.expiresAt.getTime() > evidence.decidedAt.getTime() &&
    evidence.expiresAt.getTime() - evidence.decidedAt.getTime() <=
      CLIENT_DISCLOSURE_DECISION_MAX_AGE_MS
  );
}

function validCapability(capability: CapabilityDisclosure) {
  return (
    typeof capability === "object" &&
    capability !== null &&
    STORE_CAPABILITIES.includes(capability.capability) &&
    validText(capability.candidateId, 200) &&
    Number.isSafeInteger(capability.candidateRevision) &&
    capability.candidateRevision > 0 &&
    typeof capability.releaseCommit === "string" &&
    typeof capability.shipped === "boolean" &&
    typeof capability.enabled === "boolean" &&
    (!capability.enabled || capability.shipped) &&
    Array.isArray(capability.dataClasses) &&
    capability.dataClasses.every((value) => DATA_CLASSES.includes(value)) &&
    Array.isArray(capability.permissions) &&
    capability.permissions.every((value) =>
      PLATFORM_PERMISSIONS.includes(value),
    ) &&
    Array.isArray(capability.processorIds) &&
    capability.processorIds.every((value) => validText(value, 120)) &&
    Array.isArray(capability.deletionScopes) &&
    capability.deletionScopes.every((value) =>
      DELETION_SCOPES.includes(value),
    ) &&
    new Set(capability.dataClasses).size === capability.dataClasses.length &&
    new Set(capability.permissions).size === capability.permissions.length &&
    new Set(capability.processorIds).size === capability.processorIds.length &&
    new Set(capability.deletionScopes).size ===
      capability.deletionScopes.length
  );
}

function validProvider(provider: ProviderDisclosure) {
  return (
    typeof provider === "object" &&
    provider !== null &&
    validText(provider.id, 120) &&
    STORE_CAPABILITIES.includes(provider.capability) &&
    validText(provider.candidateId, 200) &&
    Number.isSafeInteger(provider.candidateRevision) &&
    provider.candidateRevision > 0 &&
    typeof provider.releaseCommit === "string" &&
    PROVIDER_STATUSES.includes(provider.status) &&
    typeof provider.privacyReviewed === "boolean" &&
    typeof provider.regionRecorded === "boolean" &&
    typeof provider.retentionRecorded === "boolean" &&
    typeof provider.deletionSupported === "boolean" &&
    validAuthorityShape(provider.status, provider)
  );
}

function validSnapshot(snapshot: DisclosureSnapshot) {
  return (
    typeof snapshot === "object" &&
    snapshot !== null &&
    DISCLOSURE_SURFACES.includes(snapshot.surface) &&
    validText(snapshot.candidateId, 200) &&
    Number.isSafeInteger(snapshot.candidateRevision) &&
    snapshot.candidateRevision > 0 &&
    typeof snapshot.releaseCommit === "string" &&
    typeof snapshot.artifactDigest === "string" &&
    /^[a-f0-9]{64}$/.test(snapshot.artifactDigest) &&
    validDate(snapshot.issuedAt) &&
    validDate(snapshot.expiresAt) &&
    typeof snapshot.serverResolved === "boolean" &&
    SNAPSHOT_STATUSES.includes(snapshot.status) &&
    Array.isArray(snapshot.capabilityStates) &&
    snapshot.capabilityStates.every(
      (state) =>
        typeof state === "object" &&
        state !== null &&
        STORE_CAPABILITIES.includes(state.capability) &&
        typeof state.shipped === "boolean" &&
        typeof state.enabled === "boolean" &&
        (!state.enabled || state.shipped),
    ) &&
    Array.isArray(snapshot.dataClasses) &&
    snapshot.dataClasses.every((value) => DATA_CLASSES.includes(value)) &&
    Array.isArray(snapshot.permissions) &&
    snapshot.permissions.every((value) =>
      PLATFORM_PERMISSIONS.includes(value),
    ) &&
    Array.isArray(snapshot.processorIds) &&
    snapshot.processorIds.every((value) => validText(value, 120)) &&
    Array.isArray(snapshot.deletionScopes) &&
    snapshot.deletionScopes.every((value) =>
      DELETION_SCOPES.includes(value),
    ) &&
    new Set(snapshot.capabilityStates.map((item) => item.capability)).size ===
      snapshot.capabilityStates.length &&
    new Set(snapshot.dataClasses).size === snapshot.dataClasses.length &&
    new Set(snapshot.permissions).size === snapshot.permissions.length &&
    new Set(snapshot.processorIds).size === snapshot.processorIds.length &&
    new Set(snapshot.deletionScopes).size === snapshot.deletionScopes.length
  );
}

export function auditStoreDisclosures({
  candidate,
  capabilities,
  providers,
  snapshots,
  clientGates,
  now,
}: {
  candidate: CandidateIdentity;
  capabilities: readonly CapabilityDisclosure[];
  providers: readonly ProviderDisclosure[];
  snapshots: readonly DisclosureSnapshot[];
  clientGates: readonly ClientDisclosureGateEvidence[];
  now: Date;
}): StoreDisclosureAuditDecision {
  if (
    !validCandidate(candidate) ||
    !validDate(now) ||
    !Array.isArray(capabilities) ||
    !Array.isArray(providers) ||
    !Array.isArray(snapshots) ||
    !Array.isArray(clientGates) ||
    !capabilities.every(validCapability) ||
    !providers.every(validProvider) ||
    !snapshots.every(validSnapshot) ||
    clientGates.some(
      (item) =>
        typeof item !== "object" ||
        item === null ||
        !CLIENT_DISCLOSURE_GATES.includes(item.gate) ||
        !CLIENT_GATE_STATUSES.includes(item.status) ||
        !validText(item.candidateId, 200) ||
        !Number.isSafeInteger(item.candidateRevision) ||
        item.candidateRevision < 1 ||
        typeof item.releaseCommit !== "string" ||
        !validAuthorityShape(item.status, item),
    ) ||
    !exactSet(
      capabilities.map((item) => item.capability),
      STORE_CAPABILITIES,
    ) ||
    !exactSet(
      snapshots.map((item) => item.surface),
      DISCLOSURE_SURFACES,
    ) ||
    !exactSet(
      clientGates.map((item) => item.gate),
      CLIENT_DISCLOSURE_GATES,
    ) ||
    new Set(providers.map((item) => item.id)).size !== providers.length
  ) {
    return { status: "unavailable" };
  }

  const reasons: string[] = [];
  const shippedCapabilities = capabilities.filter((item) => item.shipped);
  const enabledCapabilities = capabilities.filter((item) => item.enabled);
  const expectedStates = capabilities
    .map(({ capability, shipped, enabled }) => ({
      capability,
      shipped,
      enabled,
    }))
    .sort((a, b) => a.capability.localeCompare(b.capability));
  const expectedDataClasses = sortedUnique(
    enabledCapabilities.flatMap((item) => item.dataClasses),
  );
  const expectedPermissions = sortedUnique(
    shippedCapabilities.flatMap((item) => item.permissions),
  );
  const expectedProcessorIds = sortedUnique(
    enabledCapabilities.flatMap((item) => item.processorIds),
  );
  const expectedDeletionScopes = sortedUnique(
    enabledCapabilities.flatMap((item) => item.deletionScopes),
  );
  const providersById = new Map(providers.map((item) => [item.id, item]));

  for (const capability of capabilities) {
    if (
      capability.candidateId !== candidate.candidateId ||
      capability.candidateRevision !== candidate.revision ||
      capability.releaseCommit !== candidate.releaseCommit
    ) {
      reasons.push(`capability:${capability.capability}:candidate`);
    }
    for (const processorId of capability.processorIds) {
      const provider = providersById.get(processorId);
      if (!provider || provider.capability !== capability.capability) {
        reasons.push(`capability:${capability.capability}:processor`);
      } else if (
        capability.enabled &&
        (provider.status !== "APPROVED" ||
          !provider.privacyReviewed ||
          !provider.regionRecorded ||
          !provider.retentionRecorded ||
          !provider.deletionSupported)
      ) {
        reasons.push(`provider:${processorId}:approval`);
      }
    }
  }

  for (const provider of providers) {
    const capability = capabilities.find(
      (item) => item.capability === provider.capability,
    );
    if (
      provider.candidateId !== candidate.candidateId ||
      provider.candidateRevision !== candidate.revision ||
      provider.releaseCommit !== candidate.releaseCommit
    ) {
      reasons.push(`provider:${provider.id}:candidate`);
    }
    if (
      provider.status === "APPROVED" &&
      !authorityIsFresh(provider, now)
    ) {
      reasons.push(`provider:${provider.id}:authority-stale`);
    }
    if (
      !capability ||
      !capability.processorIds.includes(provider.id) ||
      (!capability.enabled && provider.status === "APPROVED")
    ) {
      reasons.push(`provider:${provider.id}:inventory`);
    }
  }

  for (const snapshot of snapshots) {
    if (
      snapshot.candidateId !== candidate.candidateId ||
      snapshot.candidateRevision !== candidate.revision ||
      snapshot.releaseCommit !== candidate.releaseCommit
    ) {
      reasons.push(`surface:${snapshot.surface}:candidate`);
    }
    if (
      !snapshot.serverResolved ||
      snapshot.issuedAt.getTime() > now.getTime() ||
      snapshot.expiresAt.getTime() <= now.getTime() ||
      snapshot.expiresAt.getTime() <= snapshot.issuedAt.getTime() ||
      snapshot.expiresAt.getTime() - snapshot.issuedAt.getTime() >
        DISCLOSURE_EVIDENCE_MAX_AGE_MS
    ) {
      reasons.push(`surface:${snapshot.surface}:evidence-stale`);
    }
    if (snapshot.status !== "ALIGNED") {
      reasons.push(`surface:${snapshot.surface}:status`);
    }
    const states = [...snapshot.capabilityStates].sort((a, b) =>
      a.capability.localeCompare(b.capability),
    );
    if (
      !exactSet(
        snapshot.capabilityStates.map(
          (item: { capability: StoreCapability }) => item.capability,
        ),
        STORE_CAPABILITIES,
      ) ||
      JSON.stringify(states) !== JSON.stringify(expectedStates)
    ) {
      reasons.push(`surface:${snapshot.surface}:capabilities`);
    }
    if (
      JSON.stringify(sortedUnique(snapshot.dataClasses)) !==
      JSON.stringify(expectedDataClasses)
    ) {
      reasons.push(`surface:${snapshot.surface}:data-classes`);
    }
    if (
      JSON.stringify(sortedUnique(snapshot.permissions)) !==
      JSON.stringify(expectedPermissions)
    ) {
      reasons.push(`surface:${snapshot.surface}:permissions`);
    }
    if (
      JSON.stringify(sortedUnique(snapshot.processorIds)) !==
      JSON.stringify(expectedProcessorIds)
    ) {
      reasons.push(`surface:${snapshot.surface}:processors`);
    }
    if (
      JSON.stringify(sortedUnique(snapshot.deletionScopes)) !==
      JSON.stringify(expectedDeletionScopes)
    ) {
      reasons.push(`surface:${snapshot.surface}:deletion`);
    }
  }

  for (const gate of clientGates) {
    if (
      gate.candidateId !== candidate.candidateId ||
      gate.candidateRevision !== candidate.revision ||
      gate.releaseCommit !== candidate.releaseCommit
    ) {
      reasons.push(`client-gate:${gate.gate}:candidate`);
    }
    if (
      (gate.status === "APPROVED" || gate.status === "REJECTED") &&
      !authorityIsFresh(gate, now)
    ) {
      reasons.push(`client-gate:${gate.gate}:authority-stale`);
    }
    if (gate.status === "REJECTED") {
      reasons.push(`client-gate:${gate.gate}:rejected`);
    }
  }

  const uniqueReasons = [...new Set(reasons)].sort();
  if (uniqueReasons.length > 0) {
    return { status: "blocked", reasons: uniqueReasons };
  }

  const pendingClientGates = clientGates
    .filter((item) => item.status === "PENDING")
    .map((item) => item.gate);
  if (pendingClientGates.length > 0) {
    return {
      status: "ready-for-client-approval",
      candidate,
      exactCandidateEvidence: true,
      pendingClientGates,
    };
  }

  return {
    status: "ready-for-store-package",
    candidate,
    exactCandidateEvidence: true,
    clientApprovalsComplete: true,
  };
}
