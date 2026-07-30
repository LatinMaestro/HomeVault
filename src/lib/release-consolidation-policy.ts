export const RELEASE_CONSOLIDATION_POLICY_VERSION =
  "homevault-release-consolidation-v2";
export const CONSOLIDATION_EVIDENCE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const DELIVERY_PLAN_BRANCH =
  "agent/app-store-delivery-plan-2026-07-27";

export const CONSOLIDATION_CONFLICT_DOMAINS = [
  "AUTHORIZATION",
  "ACCOUNT_LIFECYCLE",
  "DATA_MODEL",
  "PROPERTY_ISOLATION",
  "BACKGROUND_DELIVERY",
  "NATIVE_SECURITY",
  "PRIVATE_FILES",
  "EXTERNAL_PROCESSORS",
  "STORE_DISCLOSURE",
  "RELEASE_GATES",
] as const;

export type ConsolidationConflictDomain =
  (typeof CONSOLIDATION_CONFLICT_DOMAINS)[number];

export const CONSOLIDATION_SLICES = [
  {
    id: "HOUSEHOLD_ROLE_POLICY",
    branch: "agent/household-role-policy-foundation",
    domains: ["AUTHORIZATION", "ACCOUNT_LIFECYCLE"],
    activationGate: null,
  },
  {
    id: "HOUSEHOLD_INVITATION_CONTRACT",
    branch: "agent/household-invitation-contract",
    domains: ["AUTHORIZATION", "ACCOUNT_LIFECYCLE"],
    activationGate: null,
  },
  {
    id: "HOUSEHOLD_INVITATION_LIFECYCLE",
    branch: "agent/household-invitation-lifecycle",
    domains: ["AUTHORIZATION", "ACCOUNT_LIFECYCLE"],
    activationGate: "TRANSACTIONAL_EMAIL_DELIVERY",
  },
  {
    id: "HOUSEHOLD_OWNERSHIP_TRANSFER",
    branch: "agent/household-ownership-transfer-policy",
    domains: ["AUTHORIZATION", "ACCOUNT_LIFECYCLE"],
    activationGate: null,
  },
  {
    id: "PROPERTY_ACCESS_SELECTION",
    branch: "agent/property-access-selection-policy",
    domains: ["AUTHORIZATION", "PROPERTY_ISOLATION"],
    activationGate: null,
  },
  {
    id: "PROPERTY_CREATION",
    branch: "agent/property-creation-policy",
    domains: ["AUTHORIZATION", "DATA_MODEL", "PROPERTY_ISOLATION"],
    activationGate: null,
  },
  {
    id: "PROPERTY_RECORD_ISOLATION",
    branch: "agent/property-record-isolation-policy",
    domains: ["AUTHORIZATION", "PROPERTY_ISOLATION", "PRIVATE_FILES"],
    activationGate: null,
  },
  {
    id: "PROPERTY_EXPORT",
    branch: "agent/property-export-policy",
    domains: ["AUTHORIZATION", "PROPERTY_ISOLATION"],
    activationGate: null,
  },
  {
    id: "PROPERTY_DELETION",
    branch: "agent/property-deletion-policy",
    domains: [
      "AUTHORIZATION",
      "ACCOUNT_LIFECYCLE",
      "PROPERTY_ISOLATION",
      "PRIVATE_FILES",
    ],
    activationGate: null,
  },
  {
    id: "MULTI_PROPERTY_ACCOUNT_LIFECYCLE",
    branch: "agent/multi-property-account-lifecycle",
    domains: [
      "AUTHORIZATION",
      "ACCOUNT_LIFECYCLE",
      "PROPERTY_ISOLATION",
      "PRIVATE_FILES",
    ],
    activationGate: null,
  },
  {
    id: "VERIFIED_EMAIL_CHANGE",
    branch: "agent/verified-email-change-policy",
    domains: ["AUTHORIZATION", "ACCOUNT_LIFECYCLE"],
    activationGate: "TRANSACTIONAL_EMAIL_DELIVERY",
  },
  {
    id: "SOCIAL_IDENTITY_LINKING",
    branch: "agent/social-identity-linking-policy",
    domains: ["AUTHORIZATION", "ACCOUNT_LIFECYCLE", "EXTERNAL_PROCESSORS"],
    activationGate: "SOCIAL_IDENTITY_PROVIDER_APPROVAL",
  },
  {
    id: "NOTIFICATION_PREFERENCES",
    branch: "agent/notification-preferences-quiet-hours",
    domains: ["PROPERTY_ISOLATION", "BACKGROUND_DELIVERY"],
    activationGate: null,
  },
  {
    id: "NOTIFICATION_DELIVERY",
    branch: "agent/notification-delivery-scheduling",
    domains: [
      "AUTHORIZATION",
      "PROPERTY_ISOLATION",
      "BACKGROUND_DELIVERY",
      "EXTERNAL_PROCESSORS",
    ],
    activationGate: "PUSH_PROVIDER_AND_APP_ENTITLEMENTS",
  },
  {
    id: "EXTERNAL_CALENDAR",
    branch: "agent/external-calendar-connection-policy",
    domains: [
      "AUTHORIZATION",
      "PROPERTY_ISOLATION",
      "EXTERNAL_PROCESSORS",
    ],
    activationGate: "CALENDAR_PROVIDER_APPROVAL",
  },
  {
    id: "BIOMETRIC_REENTRY",
    branch: "agent/biometric-native-reentry-policy",
    domains: ["AUTHORIZATION", "ACCOUNT_LIFECYCLE", "NATIVE_SECURITY"],
    activationGate: "SIGNED_PHYSICAL_DEVICE_QA",
  },
  {
    id: "NATIVE_DOCUMENT_CAPTURE",
    branch: "agent/native-document-capture-policy",
    domains: [
      "AUTHORIZATION",
      "NATIVE_SECURITY",
      "PRIVATE_FILES",
      "STORE_DISCLOSURE",
    ],
    activationGate: "SIGNED_CAPTURE_PERMISSION_QA",
  },
  {
    id: "ENCRYPTED_OFFLINE_ACCESS",
    branch: "agent/encrypted-offline-household-policy",
    domains: [
      "AUTHORIZATION",
      "ACCOUNT_LIFECYCLE",
      "PROPERTY_ISOLATION",
      "NATIVE_SECURITY",
      "PRIVATE_FILES",
    ],
    activationGate: "SIGNED_DEVICE_LOSS_AND_CONFLICT_QA",
  },
  {
    id: "NATIVE_UTILITIES",
    branch: "agent/native-utilities-policy",
    domains: ["AUTHORIZATION", "NATIVE_SECURITY", "PRIVATE_FILES"],
    activationGate: "SIGNED_EXTENSION_QA",
  },
  {
    id: "EXPANDED_PRIVATE_ATTACHMENTS",
    branch: "agent/expanded-private-attachments-policy",
    domains: [
      "AUTHORIZATION",
      "DATA_MODEL",
      "PROPERTY_ISOLATION",
      "PRIVATE_FILES",
      "EXTERNAL_PROCESSORS",
      "STORE_DISCLOSURE",
    ],
    activationGate: "MALWARE_SCANNING_PROVIDER_DECISION",
  },
  {
    id: "OCR_EXTRACTION",
    branch: "agent/ocr-extraction-policy",
    domains: [
      "AUTHORIZATION",
      "PROPERTY_ISOLATION",
      "PRIVATE_FILES",
      "EXTERNAL_PROCESSORS",
      "STORE_DISCLOSURE",
    ],
    activationGate: "OCR_PROVIDER_PRIVACY_AND_COST_APPROVAL",
  },
  {
    id: "AI_ASSISTANCE",
    branch: "agent/ai-assistance-policy",
    domains: [
      "AUTHORIZATION",
      "PROPERTY_ISOLATION",
      "PRIVATE_FILES",
      "EXTERNAL_PROCESSORS",
      "STORE_DISCLOSURE",
    ],
    activationGate: "AI_PROVIDER_PRIVACY_AND_COST_APPROVAL",
  },
  {
    id: "EMAIL_INGESTION",
    branch: "agent/email-ingestion-policy",
    domains: [
      "AUTHORIZATION",
      "PROPERTY_ISOLATION",
      "PRIVATE_FILES",
      "EXTERNAL_PROCESSORS",
      "STORE_DISCLOSURE",
    ],
    activationGate: "EMAIL_INGESTION_PROVIDER_APPROVAL",
  },
  {
    id: "CONTROLLED_SHARING",
    branch: "agent/controlled-sharing-policy",
    domains: ["AUTHORIZATION", "PROPERTY_ISOLATION", "PRIVATE_FILES"],
    activationGate: null,
  },
  {
    id: "PROVIDER_HANDOFF",
    branch: "agent/provider-handoff-policy",
    domains: [
      "AUTHORIZATION",
      "PROPERTY_ISOLATION",
      "EXTERNAL_PROCESSORS",
      "STORE_DISCLOSURE",
    ],
    activationGate: "PROVIDER_CONNECTOR_APPROVAL",
  },
  {
    id: "PRIVACY_SAFE_CRASH_REPORTING",
    branch: "agent/privacy-safe-crash-reporting-policy",
    domains: [
      "ACCOUNT_LIFECYCLE",
      "NATIVE_SECURITY",
      "EXTERNAL_PROCESSORS",
      "STORE_DISCLOSURE",
    ],
    activationGate: "DIAGNOSTICS_PROVIDER_APPROVAL",
  },
  {
    id: "COMMERCIAL_MODEL_IAP",
    branch: "agent/commercial-model-iap-decision-policy",
    domains: [
      "AUTHORIZATION",
      "ACCOUNT_LIFECYCLE",
      "EXTERNAL_PROCESSORS",
      "STORE_DISCLOSURE",
    ],
    activationGate: "COMMERCIAL_MODEL_AND_STORE_PRODUCT_APPROVAL",
  },
  {
    id: "FULL_SYSTEM_ACCEPTANCE",
    branch: "agent/full-system-acceptance-policy",
    domains: [
      "AUTHORIZATION",
      "ACCOUNT_LIFECYCLE",
      "DATA_MODEL",
      "PROPERTY_ISOLATION",
      "BACKGROUND_DELIVERY",
      "NATIVE_SECURITY",
      "PRIVATE_FILES",
      "EXTERNAL_PROCESSORS",
      "STORE_DISCLOSURE",
      "RELEASE_GATES",
    ],
    activationGate: "ALL_RELEASE_AND_CLIENT_GATES",
  },
] as const satisfies readonly {
  id: string;
  branch: string;
  domains: readonly ConsolidationConflictDomain[];
  activationGate: string | null;
}[];

export type ConsolidationSliceId =
  (typeof CONSOLIDATION_SLICES)[number]["id"];

export type ExactHeadExecutionEvidence = {
  runId: string;
  jobId: string;
  headCommit: string;
  status: "PASSED" | "FAILED" | "CANCELLED";
  executable: boolean;
  executedStepCount: number;
  artifactDigest: string;
  issuedAt: Date;
  expiresAt: Date;
  serverResolved: boolean;
};

export type DeliveryPlanEvidence = {
  branch: string;
  headCommit: string;
  sourceDiffReviewed: boolean;
  reviewThreadsResolved: boolean;
  standardCi: ExactHeadExecutionEvidence | null;
  merged: boolean;
  mergeCommit: string | null;
  mergedAt: Date | null;
  mainContainsMerge: boolean;
};

export type ConsolidationSliceEvidence = {
  sliceId: ConsolidationSliceId;
  branch: string;
  sourceBaseCommit: string;
  sourceBranchHead: string;
  sourceDiffDigest: string;
  sourceChangedFiles: readonly string[];
  sourceLineageServerResolved: boolean;
  headCommit: string;
  rebasedOntoCommit: string;
  diffDigest: string;
  rebasedChangedFiles: readonly string[];
  sourceDiffReviewed: boolean;
  reviewThreadsResolved: boolean;
  reviewedConflictDomains: readonly ConsolidationConflictDomain[];
  focusedTestsPassed: boolean;
  strictTypecheckPassed: boolean;
  vercelDeploymentId: string;
  vercelHeadCommit: string;
  vercelReady: boolean;
  standardCi: ExactHeadExecutionEvidence | null;
  nativeCi: ExactHeadExecutionEvidence | null;
  merged: boolean;
  mergeCommit: string | null;
  mergedAt: Date | null;
  mainContainsMerge: boolean;
};

export type ReleaseConsolidationInput = {
  currentMainCommit: string;
  deliveryPlan: DeliveryPlanEvidence;
  slices: readonly ConsolidationSliceEvidence[];
};

export type ReleaseConsolidationDecision =
  | {
      status: "blocked-baseline-ci";
      branch: typeof DELIVERY_PLAN_BRANCH;
      reason: "EXECUTABLE_EXACT_HEAD_CI_REQUIRED";
    }
  | {
      status: "ready-for-plan-review";
      branch: typeof DELIVERY_PLAN_BRANCH;
      headCommit: string;
    }
  | {
      status: "ready-for-rebase";
      sliceId: ConsolidationSliceId;
      branch: string;
      expectedBaseCommit: string;
      activationGate: string | null;
    }
  | {
      status: "ready-for-exact-head-verification";
      sliceId: ConsolidationSliceId;
      branch: string;
      headCommit: string;
      requiredChecks: readonly ["STANDARD", "NATIVE", "VERCEL"];
      activationGate: string | null;
    }
  | {
      status: "ready-for-focused-pr";
      sliceId: ConsolidationSliceId;
      branch: string;
      headCommit: string;
      activationGate: string | null;
    }
  | {
      status: "complete";
      mainCommit: string;
      mergedSlices: number;
      activationGatesRemainExternal: true;
    }
  | { status: "blocked"; reasons: string[] }
  | { status: "unavailable" };

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function text(value: unknown, maximum = 240): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maximum &&
    !/[\0\r\n]/.test(value)
  );
}

function date(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function commit(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{40}$/.test(value);
}

function digest(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function repositoryPath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 240 &&
    !value.startsWith("/") &&
    !value.endsWith("/") &&
    !value.includes("\\") &&
    !value.split("/").includes("..") &&
    /^[A-Za-z0-9._/-]+$/.test(value)
  );
}

function changedFiles(value: unknown): value is readonly string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 100 &&
    value.every(repositoryPath) &&
    new Set(value).size === value.length
  );
}

function execution(
  value: unknown,
): value is ExactHeadExecutionEvidence {
  if (!record(value)) return false;
  return (
    typeof value.runId === "string" &&
    /^[1-9]\d*$/.test(value.runId) &&
    typeof value.jobId === "string" &&
    /^[1-9]\d*$/.test(value.jobId) &&
    commit(value.headCommit) &&
    ["PASSED", "FAILED", "CANCELLED"].includes(String(value.status)) &&
    typeof value.executable === "boolean" &&
    Number.isSafeInteger(value.executedStepCount) &&
    Number(value.executedStepCount) >= 0 &&
    digest(value.artifactDigest) &&
    date(value.issuedAt) &&
    date(value.expiresAt) &&
    typeof value.serverResolved === "boolean"
  );
}

function validExecution(
  value: ExactHeadExecutionEvidence | null,
  headCommit: string,
  at: Date,
) {
  if (!value) return false;
  const issued = value.issuedAt.getTime();
  const expires = value.expiresAt.getTime();
  const checkedAt = at.getTime();
  return (
    value.headCommit === headCommit &&
    value.status === "PASSED" &&
    value.executable &&
    value.executedStepCount > 0 &&
    value.serverResolved &&
    issued <= checkedAt &&
    checkedAt - issued <= CONSOLIDATION_EVIDENCE_MAX_AGE_MS &&
    expires > checkedAt &&
    expires > issued
  );
}

function deliveryPlan(value: unknown): value is DeliveryPlanEvidence {
  if (!record(value)) return false;
  return (
    value.branch === DELIVERY_PLAN_BRANCH &&
    commit(value.headCommit) &&
    typeof value.sourceDiffReviewed === "boolean" &&
    typeof value.reviewThreadsResolved === "boolean" &&
    (value.standardCi === null || execution(value.standardCi)) &&
    typeof value.merged === "boolean" &&
    (value.mergeCommit === null || commit(value.mergeCommit)) &&
    (value.mergedAt === null || date(value.mergedAt)) &&
    typeof value.mainContainsMerge === "boolean"
  );
}

function sliceEvidence(value: unknown): value is ConsolidationSliceEvidence {
  if (!record(value)) return false;
  return (
    CONSOLIDATION_SLICES.some((item) => item.id === value.sliceId) &&
    text(value.branch) &&
    commit(value.sourceBaseCommit) &&
    commit(value.sourceBranchHead) &&
    digest(value.sourceDiffDigest) &&
    changedFiles(value.sourceChangedFiles) &&
    typeof value.sourceLineageServerResolved === "boolean" &&
    commit(value.headCommit) &&
    commit(value.rebasedOntoCommit) &&
    digest(value.diffDigest) &&
    changedFiles(value.rebasedChangedFiles) &&
    typeof value.sourceDiffReviewed === "boolean" &&
    typeof value.reviewThreadsResolved === "boolean" &&
    Array.isArray(value.reviewedConflictDomains) &&
    value.reviewedConflictDomains.every((item) =>
      CONSOLIDATION_CONFLICT_DOMAINS.includes(
        item as ConsolidationConflictDomain,
      ),
    ) &&
    typeof value.focusedTestsPassed === "boolean" &&
    typeof value.strictTypecheckPassed === "boolean" &&
    typeof value.vercelDeploymentId === "string" &&
    /^dpl_[A-Za-z0-9]+$/.test(value.vercelDeploymentId) &&
    commit(value.vercelHeadCommit) &&
    typeof value.vercelReady === "boolean" &&
    (value.standardCi === null || execution(value.standardCi)) &&
    (value.nativeCi === null || execution(value.nativeCi)) &&
    typeof value.merged === "boolean" &&
    (value.mergeCommit === null || commit(value.mergeCommit)) &&
    (value.mergedAt === null || date(value.mergedAt)) &&
    typeof value.mainContainsMerge === "boolean"
  );
}

function exactDomains(
  provided: readonly ConsolidationConflictDomain[],
  required: readonly ConsolidationConflictDomain[],
) {
  return (
    provided.length === required.length &&
    new Set(provided).size === required.length &&
    required.every((domain) => provided.includes(domain))
  );
}

function exactFiles(provided: readonly string[], required: readonly string[]) {
  return (
    provided.length === required.length &&
    new Set(provided).size === required.length &&
    required.every((path) => provided.includes(path))
  );
}

function sourceLineagePreserved(evidence: ConsolidationSliceEvidence) {
  return (
    evidence.sourceLineageServerResolved &&
    evidence.sourceBaseCommit !== evidence.sourceBranchHead &&
    evidence.sourceDiffDigest === evidence.diffDigest &&
    exactFiles(evidence.sourceChangedFiles, evidence.rebasedChangedFiles)
  );
}

function blocked(reasons: string[]): ReleaseConsolidationDecision {
  return { status: "blocked", reasons: [...new Set(reasons)].sort() };
}

export function auditReleaseConsolidation(
  value: unknown,
  now = new Date(),
): ReleaseConsolidationDecision {
  if (
    !record(value) ||
    !commit(value.currentMainCommit) ||
    !deliveryPlan(value.deliveryPlan) ||
    !Array.isArray(value.slices) ||
    !value.slices.every(sliceEvidence) ||
    !date(now)
  ) {
    return { status: "unavailable" };
  }

  const input = value as unknown as ReleaseConsolidationInput;
  if (
    new Set(input.slices.map((item) => item.sliceId)).size !==
      input.slices.length ||
    new Set(input.slices.map((item) => item.branch)).size !==
      input.slices.length
  ) {
    return { status: "unavailable" };
  }

  const planAt = input.deliveryPlan.mergedAt ?? now;
  if (
    !validExecution(
      input.deliveryPlan.standardCi,
      input.deliveryPlan.headCommit,
      planAt,
    )
  ) {
    return {
      status: "blocked-baseline-ci",
      branch: DELIVERY_PLAN_BRANCH,
      reason: "EXECUTABLE_EXACT_HEAD_CI_REQUIRED",
    };
  }
  if (
    !input.deliveryPlan.sourceDiffReviewed ||
    !input.deliveryPlan.reviewThreadsResolved
  ) {
    return blocked(["delivery-plan:review"]);
  }
  if (!input.deliveryPlan.merged) {
    return {
      status: "ready-for-plan-review",
      branch: DELIVERY_PLAN_BRANCH,
      headCommit: input.deliveryPlan.headCommit,
    };
  }
  if (
    !input.deliveryPlan.mergeCommit ||
    !input.deliveryPlan.mergedAt ||
    !input.deliveryPlan.mainContainsMerge
  ) {
    return { status: "unavailable" };
  }

  const byId = new Map(input.slices.map((item) => [item.sliceId, item]));
  let expectedMain = input.deliveryPlan.mergeCommit;
  let encounteredUnmerged = false;

  for (const definition of CONSOLIDATION_SLICES) {
    const evidence = byId.get(definition.id);
    if (!evidence || !evidence.merged) {
      encounteredUnmerged = true;
      continue;
    }
    if (encounteredUnmerged) return { status: "unavailable" };
    if (
      evidence.branch !== definition.branch ||
      evidence.rebasedOntoCommit !== expectedMain ||
      !evidence.mergeCommit ||
      !evidence.mergedAt ||
      !evidence.mainContainsMerge
    ) {
      return { status: "unavailable" };
    }
    const reasons = inspectSlice(evidence, definition, evidence.mergedAt);
    if (reasons.length > 0) return blocked(reasons);
    expectedMain = evidence.mergeCommit;
  }

  if (input.currentMainCommit !== expectedMain) {
    return blocked(["main:unexpected-head"]);
  }

  const next = CONSOLIDATION_SLICES.find(
    (definition) => !byId.get(definition.id)?.merged,
  );
  if (!next) {
    return {
      status: "complete",
      mainCommit: input.currentMainCommit,
      mergedSlices: CONSOLIDATION_SLICES.length,
      activationGatesRemainExternal: true,
    };
  }

  const evidence = byId.get(next.id);
  if (!evidence || evidence.rebasedOntoCommit !== input.currentMainCommit) {
    return {
      status: "ready-for-rebase",
      sliceId: next.id,
      branch: next.branch,
      expectedBaseCommit: input.currentMainCommit,
      activationGate: next.activationGate,
    };
  }
  if (evidence.branch !== next.branch) return { status: "unavailable" };

  const reviewReasons: string[] = [];
  if (!sourceLineagePreserved(evidence)) {
    reviewReasons.push(`slice:${next.id}:source-lineage`);
  }
  if (!evidence.sourceDiffReviewed) {
    reviewReasons.push(`slice:${next.id}:diff-review`);
  }
  if (!evidence.reviewThreadsResolved) {
    reviewReasons.push(`slice:${next.id}:review-threads`);
  }
  if (!exactDomains(evidence.reviewedConflictDomains, next.domains)) {
    reviewReasons.push(`slice:${next.id}:conflict-domains`);
  }
  if (reviewReasons.length > 0) return blocked(reviewReasons);

  const verificationReasons = inspectSlice(evidence, next, now);
  if (verificationReasons.length > 0) {
    return {
      status: "ready-for-exact-head-verification",
      sliceId: next.id,
      branch: next.branch,
      headCommit: evidence.headCommit,
      requiredChecks: ["STANDARD", "NATIVE", "VERCEL"],
      activationGate: next.activationGate,
    };
  }

  return {
    status: "ready-for-focused-pr",
    sliceId: next.id,
    branch: next.branch,
    headCommit: evidence.headCommit,
    activationGate: next.activationGate,
  };
}

function inspectSlice(
  evidence: ConsolidationSliceEvidence,
  definition: (typeof CONSOLIDATION_SLICES)[number],
  at: Date,
) {
  const reasons: string[] = [];
  if (!evidence.sourceDiffReviewed) reasons.push(`slice:${definition.id}:diff-review`);
  if (!sourceLineagePreserved(evidence)) {
    reasons.push(`slice:${definition.id}:source-lineage`);
  }
  if (!evidence.reviewThreadsResolved) {
    reasons.push(`slice:${definition.id}:review-threads`);
  }
  if (!exactDomains(evidence.reviewedConflictDomains, definition.domains)) {
    reasons.push(`slice:${definition.id}:conflict-domains`);
  }
  if (!evidence.focusedTestsPassed || !evidence.strictTypecheckPassed) {
    reasons.push(`slice:${definition.id}:focused-verification`);
  }
  if (
    !evidence.vercelReady ||
    evidence.vercelHeadCommit !== evidence.headCommit
  ) {
    reasons.push(`slice:${definition.id}:vercel`);
  }
  if (!validExecution(evidence.standardCi, evidence.headCommit, at)) {
    reasons.push(`slice:${definition.id}:standard-ci`);
  }
  if (!validExecution(evidence.nativeCi, evidence.headCommit, at)) {
    reasons.push(`slice:${definition.id}:native-ci`);
  }
  return reasons;
}
