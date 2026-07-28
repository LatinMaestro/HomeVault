export const FULL_SYSTEM_ACCEPTANCE_POLICY_VERSION =
  "homevault-full-system-acceptance-v1";

export const ACCEPTANCE_DOMAINS = [
  "AUTH_IDENTITY",
  "HOUSEHOLD_ROLES_INVITATIONS",
  "MULTI_PROPERTY_ISOLATION",
  "CORE_RECORDS_PRIVATE_FILES",
  "NOTIFICATIONS_CALENDAR",
  "BIOMETRICS_CAPTURE_OFFLINE",
  "NATIVE_UTILITIES",
  "ATTACHMENTS_SCANNING",
  "OCR_AI_EMAIL_REVIEW",
  "CONTROLLED_SHARING_PROVIDER_HANDOFF",
  "PRIVACY_SAFE_DIAGNOSTICS",
  "EXPORT_RETENTION_DELETION",
  "SECURITY_PRIVACY",
  "ACCESSIBILITY_PERFORMANCE",
  "STORE_REVIEWER_PACKAGE",
  "COMMERCIAL_ENTITLEMENTS",
] as const;

export const CLIENT_RELEASE_GATES = [
  "LEGAL_PUBLIC_COPY",
  "PROVIDER_AND_COST_APPROVALS",
  "COMMERCIAL_MODEL",
  "APPLE_ENROLMENT_AND_AGREEMENTS",
  "APPLE_SIGNING",
  "PHYSICAL_DEVICE_REGRESSION",
  "TESTFLIGHT_QA",
  "REVIEWER_CREDENTIALS",
] as const;

export const REQUIRED_CLEANUP_SCOPES = [
  "DATABASE",
  "PRIVATE_FILES",
  "DEVICES_AND_OFFLINE_CACHE",
  "PROCESSORS",
  "CALENDARS",
  "NOTIFICATION_TOKENS",
  "SHARES",
  "DIAGNOSTICS",
  "COMMERCIAL_ENTITLEMENTS",
] as const;

export const ACCEPTANCE_BOUNDARIES = [
  "serverAuthorizationVerified",
  "crossPropertyIsolationVerified",
  "privateFileDeliveryVerified",
  "leastPrivilegeProvidersVerified",
  "secretsAndLogsScanPassed",
  "userReviewedAutomationVerified",
  "prohibitedProductScopesAbsent",
  "accessibilityRegressionPassed",
  "performanceBudgetsPassed",
] as const;

export type AcceptanceDomain = (typeof ACCEPTANCE_DOMAINS)[number];
export type ClientReleaseGate = (typeof CLIENT_RELEASE_GATES)[number];
export type CleanupScope = (typeof REQUIRED_CLEANUP_SCOPES)[number];
export type AcceptancePlatform = "WEB" | "IOS" | "ANDROID";
export type CommercialModel = "UNDECIDED" | "FREE" | "SUBSCRIPTION";

export const REQUIRED_PLATFORM_COVERAGE: Record<
  AcceptanceDomain,
  readonly AcceptancePlatform[]
> = {
  AUTH_IDENTITY: ["WEB", "IOS", "ANDROID"],
  HOUSEHOLD_ROLES_INVITATIONS: ["WEB", "IOS", "ANDROID"],
  MULTI_PROPERTY_ISOLATION: ["WEB", "IOS", "ANDROID"],
  CORE_RECORDS_PRIVATE_FILES: ["WEB", "IOS", "ANDROID"],
  NOTIFICATIONS_CALENDAR: ["IOS", "ANDROID"],
  BIOMETRICS_CAPTURE_OFFLINE: ["IOS", "ANDROID"],
  NATIVE_UTILITIES: ["IOS"],
  ATTACHMENTS_SCANNING: ["WEB", "IOS", "ANDROID"],
  OCR_AI_EMAIL_REVIEW: ["WEB", "IOS", "ANDROID"],
  CONTROLLED_SHARING_PROVIDER_HANDOFF: ["WEB", "IOS", "ANDROID"],
  PRIVACY_SAFE_DIAGNOSTICS: ["IOS", "ANDROID"],
  EXPORT_RETENTION_DELETION: ["WEB", "IOS", "ANDROID"],
  SECURITY_PRIVACY: ["WEB", "IOS", "ANDROID"],
  ACCESSIBILITY_PERFORMANCE: ["WEB", "IOS", "ANDROID"],
  STORE_REVIEWER_PACKAGE: ["IOS"],
  COMMERCIAL_ENTITLEMENTS: ["IOS"],
};

export type CandidateIdentity = {
  releaseCommit: string;
  deploymentId: string;
  appVersion: string;
  buildNumber: string;
};

export type AcceptanceEvidence = {
  domain: AcceptanceDomain;
  status: "PASSED" | "FAILED" | "NOT_APPLICABLE";
  releaseCommit: string;
  executable: boolean;
  artifactDigest: string | null;
  platforms: readonly AcceptancePlatform[];
  fictionalDataOnly: boolean;
};

export type AcceptanceDefect = {
  id: string;
  severity: 1 | 2 | 3 | 4;
  status: "OPEN" | "RESOLVED";
  waiver:
    | {
        owner: string;
        reason: string;
        expiresAt: Date;
      }
    | null;
};

export type AcceptanceBoundaries = {
  serverAuthorizationVerified: boolean;
  crossPropertyIsolationVerified: boolean;
  privateFileDeliveryVerified: boolean;
  leastPrivilegeProvidersVerified: boolean;
  secretsAndLogsScanPassed: boolean;
  userReviewedAutomationVerified: boolean;
  prohibitedProductScopesAbsent: boolean;
  accessibilityRegressionPassed: boolean;
  performanceBudgetsPassed: boolean;
};

export type ClientGateEvidence = {
  gate: ClientReleaseGate;
  status: "COMPLETE" | "PENDING" | "REJECTED";
};

export type FullSystemAcceptanceDecision =
  | {
      status: "ready-for-go-no-go";
      candidate: CandidateIdentity;
      exactHeadEvidence: true;
      clientGatesComplete: true;
    }
  | {
      status: "ready-for-client-gates";
      candidate: CandidateIdentity;
      exactHeadEvidence: true;
      pendingClientGates: ClientReleaseGate[];
    }
  | {
      status: "blocked";
      reasons: string[];
    }
  | { status: "unavailable" };

const ACCEPTANCE_PLATFORMS = ["WEB", "IOS", "ANDROID"] as const;
const COMMERCIAL_MODELS = ["UNDECIDED", "FREE", "SUBSCRIPTION"] as const;
const EVIDENCE_STATUSES = ["PASSED", "FAILED", "NOT_APPLICABLE"] as const;
const CLIENT_GATE_STATUSES = ["COMPLETE", "PENDING", "REJECTED"] as const;
const DEFECT_STATUSES = ["OPEN", "RESOLVED"] as const;

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

function validCandidate(candidate: CandidateIdentity) {
  if (typeof candidate !== "object" || candidate === null) return false;
  const buildNumber = Number(candidate.buildNumber);
  return (
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

function completeUniqueSet<T extends string>(
  actual: readonly T[],
  required: readonly T[],
) {
  return (
    Array.isArray(actual) &&
    Array.isArray(required) &&
    new Set(actual).size === actual.length &&
    actual.length === required.length &&
    required.every((value) => actual.includes(value))
  );
}

function validWaiver(defect: AcceptanceDefect, now: Date) {
  if (!defect.waiver) return false;
  const maximumExpiry = now.getTime() + 30 * 24 * 60 * 60 * 1000;
  return (
    typeof defect.waiver === "object" &&
    validText(defect.waiver.owner, 160) &&
    validText(defect.waiver.reason, 500) &&
    defect.waiver.expiresAt instanceof Date &&
    Number.isFinite(defect.waiver.expiresAt.getTime()) &&
    defect.waiver.expiresAt.getTime() > now.getTime() &&
    defect.waiver.expiresAt.getTime() <= maximumExpiry
  );
}

function evidenceBlockers({
  candidate,
  evidence,
  commercialModel,
}: {
  candidate: CandidateIdentity;
  evidence: readonly AcceptanceEvidence[];
  commercialModel: CommercialModel;
}) {
  const blockers: string[] = [];
  const evidenceDomains = evidence.map((item) => item.domain);

  if (
    !completeUniqueSet(evidenceDomains, ACCEPTANCE_DOMAINS) ||
    evidence.some(
      (item) =>
        item.domain === "COMMERCIAL_ENTITLEMENTS" &&
        commercialModel === "FREE" &&
        item.status !== "NOT_APPLICABLE",
    )
  ) {
    blockers.push("acceptance-domain-coverage");
  }

  for (const item of evidence) {
    const commercialNotApplicable =
      commercialModel === "FREE" &&
      item.domain === "COMMERCIAL_ENTITLEMENTS" &&
      item.status === "NOT_APPLICABLE";
    const passed =
      item.status === "PASSED" ||
      (commercialNotApplicable && item.releaseCommit === candidate.releaseCommit);
    const platforms = REQUIRED_PLATFORM_COVERAGE[item.domain];
    if (!passed) blockers.push(`domain:${item.domain}:status`);
    if (item.releaseCommit !== candidate.releaseCommit) {
      blockers.push(`domain:${item.domain}:candidate`);
    }
    if (!commercialNotApplicable) {
      if (
        item.executable !== true ||
        typeof item.artifactDigest !== "string" ||
        !/^[a-f0-9]{64}$/.test(item.artifactDigest)
      ) {
        blockers.push(`domain:${item.domain}:executable-evidence`);
      }
      if (!platforms.every((platform) => item.platforms.includes(platform))) {
        blockers.push(`domain:${item.domain}:platform-coverage`);
      }
      if (item.fictionalDataOnly !== true) {
        blockers.push(`domain:${item.domain}:fixture-safety`);
      }
    } else if (
      item.executable !== false ||
      item.artifactDigest !== null ||
      item.platforms.length !== 0 ||
      item.fictionalDataOnly !== false
    ) {
      blockers.push(`domain:${item.domain}:not-applicable-shape`);
    }
  }

  return blockers;
}

export function decideFullSystemAcceptance({
  candidate,
  evidence,
  commercialModel,
  defects,
  boundaries,
  completedCleanupScopes,
  clientGates,
  now,
}: {
  candidate: CandidateIdentity;
  evidence: readonly AcceptanceEvidence[];
  commercialModel: CommercialModel;
  defects: readonly AcceptanceDefect[];
  boundaries: AcceptanceBoundaries;
  completedCleanupScopes: readonly CleanupScope[];
  clientGates: readonly ClientGateEvidence[];
  now: Date;
}): FullSystemAcceptanceDecision {
  if (
    !validCandidate(candidate) ||
    !(now instanceof Date) ||
    !Number.isFinite(now.getTime()) ||
    !COMMERCIAL_MODELS.includes(commercialModel) ||
    !Array.isArray(evidence) ||
    !Array.isArray(defects) ||
    !Array.isArray(completedCleanupScopes) ||
    !Array.isArray(clientGates) ||
    typeof boundaries !== "object" ||
    boundaries === null ||
    !evidence.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        ACCEPTANCE_DOMAINS.includes(item.domain) &&
        EVIDENCE_STATUSES.includes(item.status) &&
        typeof item.releaseCommit === "string" &&
        typeof item.executable === "boolean" &&
        (typeof item.artifactDigest === "string" ||
          item.artifactDigest === null) &&
        typeof item.fictionalDataOnly === "boolean" &&
        Array.isArray(item.platforms) &&
        new Set(item.platforms).size === item.platforms.length &&
        item.platforms.every(
          (platform: unknown) =>
            typeof platform === "string" &&
            ACCEPTANCE_PLATFORMS.includes(
              platform as (typeof ACCEPTANCE_PLATFORMS)[number],
            ),
        ),
    ) ||
    clientGates.some(
      (gate) =>
        typeof gate !== "object" ||
        gate === null ||
        !CLIENT_RELEASE_GATES.includes(gate.gate) ||
        !CLIENT_GATE_STATUSES.includes(gate.status),
    ) ||
    !completeUniqueSet(
      clientGates.map((gate) => gate.gate),
      CLIENT_RELEASE_GATES,
    ) ||
    !completeUniqueSet(
      Object.keys(boundaries) as (keyof AcceptanceBoundaries)[],
      ACCEPTANCE_BOUNDARIES,
    ) ||
    Object.values(boundaries).some((value) => typeof value !== "boolean") ||
    defects.some(
      (defect) =>
        typeof defect !== "object" ||
        defect === null ||
        !validText(defect.id, 160) ||
        ![1, 2, 3, 4].includes(defect.severity) ||
        !DEFECT_STATUSES.includes(defect.status) ||
        (defect.waiver !== null &&
          (typeof defect.waiver !== "object" ||
            defect.waiver === null ||
            !validText(defect.waiver.owner, 160) ||
            !validText(defect.waiver.reason, 500) ||
            !(defect.waiver.expiresAt instanceof Date) ||
            !Number.isFinite(defect.waiver.expiresAt.getTime()))),
    )
  ) {
    return { status: "unavailable" };
  }

  const reasons = evidenceBlockers({
    candidate,
    evidence,
    commercialModel,
  });

  if (commercialModel === "UNDECIDED") reasons.push("commercial-model");
  if (
    !completeUniqueSet(completedCleanupScopes, REQUIRED_CLEANUP_SCOPES)
  ) {
    reasons.push("lifecycle-cleanup");
  }
  for (const [boundary, passed] of Object.entries(boundaries)) {
    if (!passed) reasons.push(`boundary:${boundary}`);
  }
  for (const defect of defects) {
    if (defect.status === "RESOLVED") continue;
    if (defect.severity <= 2) {
      reasons.push(`defect:${defect.id}:severity-${defect.severity}`);
    } else if (!validWaiver(defect, now)) {
      reasons.push(`defect:${defect.id}:waiver`);
    }
  }
  for (const gate of clientGates) {
    if (gate.status === "REJECTED") {
      reasons.push(`client-gate:${gate.gate}:rejected`);
    }
  }

  const uniqueReasons = [...new Set(reasons)].sort();
  if (uniqueReasons.length > 0) {
    return { status: "blocked", reasons: uniqueReasons };
  }

  const pendingClientGates = clientGates
    .filter((gate) => gate.status === "PENDING")
    .map((gate) => gate.gate);
  if (pendingClientGates.length > 0) {
    return {
      status: "ready-for-client-gates",
      candidate,
      exactHeadEvidence: true,
      pendingClientGates,
    };
  }

  return {
    status: "ready-for-go-no-go",
    candidate,
    exactHeadEvidence: true,
    clientGatesComplete: true,
  };
}
