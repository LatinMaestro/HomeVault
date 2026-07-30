export const ROLE_SOURCE_EXTRACTION_POLICY_VERSION =
  "homevault-role-source-extraction-v1";
export const ROLE_SOURCE_EVIDENCE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const ROLE_SOURCE_BRANCH = "agent/household-role-policy-foundation";
export const ROLE_SOURCE_BASE =
  "e809b2a4a4a1845efc849455843687ce8686ca4d";
export const ROLE_SOURCE_HEAD =
  "33fb9ccd3d0a8ed57fb41c9c5440ccb0b3084ef5";
export const ROLE_SOURCE_MANIFEST_DIGEST =
  "1ea530f49c6a4a0ae29f97bc74db4a1af0a77246ac81b9fe719a95290dae2a96";

export const ROLE_SOURCE_FILES = [
  {
    path: "docs/PHASE_5A_HOUSEHOLD_ROLE_POLICY.md",
    status: "ADDED",
    baseBlob: null,
    headBlob: "8b4888b3e95acc0f9c9031986f1de1800b64f865",
    additions: 36,
    deletions: 0,
  },
  {
    path: "src/lib/household-access.ts",
    status: "MODIFIED",
    baseBlob: "3d32305450a2d125376cf0b9b6a8a6ddefb03295",
    headBlob: "ed647c29ff84db576b662daac5aa23ac564987be",
    additions: 32,
    deletions: 0,
  },
  {
    path: "tests/household-access.test.ts",
    status: "MODIFIED",
    baseBlob: "45656028aee01f643b2ff0d54df89b021b531233",
    headBlob: "d4899f585462349a50f87704d5b260ba78043c03",
    additions: 65,
    deletions: 0,
  },
] as const;

export type RoleSourceFileEvidence = {
  path: string;
  status: "ADDED" | "MODIFIED";
  baseBlob: string | null;
  headBlob: string;
  additions: number;
  deletions: number;
};

export type RoleSourceObservation = {
  branch: string;
  baseCommit: string;
  headCommit: string;
  manifestDigest: string;
  files: readonly RoleSourceFileEvidence[];
  serverResolved: boolean;
  capturedAt: Date;
};

export type PositiveExecutionEvidence = {
  runId: string;
  jobId: string;
  headCommit: string;
  status: "PASSED" | "FAILED" | "CANCELLED";
  executable: boolean;
  executedStepCount: number;
  serverResolved: boolean;
  issuedAt: Date;
  expiresAt: Date;
};

export type RoleExtractionPlanGate = {
  headCommit: string;
  exactHeadCi: PositiveExecutionEvidence | null;
  sourceDiffReviewed: boolean;
  reviewThreadsResolved: boolean;
  merged: boolean;
  mergeCommit: string | null;
  mergedAt: Date | null;
  mainContainsMerge: boolean;
};

export type RebasedRoleCandidate = {
  targetBaseCommit: string;
  headCommit: string;
  sourceBranch: string;
  sourceHeadCommit: string;
  sourceManifestDigest: string;
  changedFiles: readonly string[];
  sourceEquivalenceServerResolved: boolean;
  sourceDiffReviewed: boolean;
  authorizationConflictReviewed: boolean;
  accountLifecycleConflictReviewed: boolean;
};

export type RoleSourceExtractionInput = {
  currentMainCommit: string;
  source: RoleSourceObservation;
  plan: RoleExtractionPlanGate;
  candidate: RebasedRoleCandidate | null;
};

export type RoleSourceExtractionDecision =
  | {
      status: "blocked-baseline-ci";
      sourceSnapshotVerified: true;
      planHeadCommit: string;
    }
  | {
      status: "ready-for-plan-review";
      sourceSnapshotVerified: true;
      planHeadCommit: string;
    }
  | {
      status: "ready-for-extraction";
      sourceSnapshotVerified: true;
      sourceHeadCommit: typeof ROLE_SOURCE_HEAD;
      sourceManifestDigest: typeof ROLE_SOURCE_MANIFEST_DIGEST;
      targetBaseCommit: string;
      changedFiles: readonly string[];
    }
  | {
      status: "ready-for-exact-head-verification";
      headCommit: string;
      requiredChecks: readonly [
        "HOUSEHOLD_ACCESS_UNIT",
        "LINT",
        "TYPECHECK",
        "BUILD",
        "STANDARD_CI",
        "NATIVE_CI",
        "VERCEL",
      ];
    }
  | { status: "blocked"; reasons: string[] }
  | { status: "unavailable" };

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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

function blob(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{40}$/.test(value);
}

function path(value: unknown): value is string {
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

function file(value: unknown): value is RoleSourceFileEvidence {
  if (!record(value)) return false;
  return (
    path(value.path) &&
    ["ADDED", "MODIFIED"].includes(String(value.status)) &&
    (value.baseBlob === null || blob(value.baseBlob)) &&
    blob(value.headBlob) &&
    Number.isSafeInteger(value.additions) &&
    Number(value.additions) >= 0 &&
    Number.isSafeInteger(value.deletions) &&
    Number(value.deletions) >= 0 &&
    (Number(value.additions) > 0 || Number(value.deletions) > 0)
  );
}

function files(value: unknown): value is readonly RoleSourceFileEvidence[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 20 &&
    value.every(file) &&
    new Set(value.map((item) => item.path)).size === value.length
  );
}

function filePaths(value: unknown): value is readonly string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 20 &&
    value.every(path) &&
    new Set(value).size === value.length
  );
}

function source(value: unknown): value is RoleSourceObservation {
  if (!record(value)) return false;
  return (
    typeof value.branch === "string" &&
    commit(value.baseCommit) &&
    commit(value.headCommit) &&
    digest(value.manifestDigest) &&
    files(value.files) &&
    typeof value.serverResolved === "boolean" &&
    date(value.capturedAt)
  );
}

function execution(value: unknown): value is PositiveExecutionEvidence {
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
    typeof value.serverResolved === "boolean" &&
    date(value.issuedAt) &&
    date(value.expiresAt)
  );
}

function plan(value: unknown): value is RoleExtractionPlanGate {
  if (!record(value)) return false;
  return (
    commit(value.headCommit) &&
    (value.exactHeadCi === null || execution(value.exactHeadCi)) &&
    typeof value.sourceDiffReviewed === "boolean" &&
    typeof value.reviewThreadsResolved === "boolean" &&
    typeof value.merged === "boolean" &&
    (value.mergeCommit === null || commit(value.mergeCommit)) &&
    (value.mergedAt === null || date(value.mergedAt)) &&
    typeof value.mainContainsMerge === "boolean"
  );
}

function candidate(value: unknown): value is RebasedRoleCandidate {
  if (!record(value)) return false;
  return (
    commit(value.targetBaseCommit) &&
    commit(value.headCommit) &&
    typeof value.sourceBranch === "string" &&
    commit(value.sourceHeadCommit) &&
    digest(value.sourceManifestDigest) &&
    filePaths(value.changedFiles) &&
    typeof value.sourceEquivalenceServerResolved === "boolean" &&
    typeof value.sourceDiffReviewed === "boolean" &&
    typeof value.authorizationConflictReviewed === "boolean" &&
    typeof value.accountLifecycleConflictReviewed === "boolean"
  );
}

function exactFiles(
  provided: readonly RoleSourceFileEvidence[],
  expected: readonly RoleSourceFileEvidence[],
) {
  if (provided.length !== expected.length) return false;
  const byPath = new Map(provided.map((item) => [item.path, item]));
  return expected.every((item) => {
    const actual = byPath.get(item.path);
    return (
      actual?.status === item.status &&
      actual.baseBlob === item.baseBlob &&
      actual.headBlob === item.headBlob &&
      actual.additions === item.additions &&
      actual.deletions === item.deletions
    );
  });
}

function exactPaths(provided: readonly string[]) {
  const expected = ROLE_SOURCE_FILES.map((item) => item.path);
  return (
    provided.length === expected.length &&
    expected.every((item) => provided.includes(item))
  );
}

function sourceSnapshotMatches(value: RoleSourceObservation, now: Date) {
  const captured = value.capturedAt.getTime();
  return (
    value.branch === ROLE_SOURCE_BRANCH &&
    value.baseCommit === ROLE_SOURCE_BASE &&
    value.headCommit === ROLE_SOURCE_HEAD &&
    value.manifestDigest === ROLE_SOURCE_MANIFEST_DIGEST &&
    value.serverResolved &&
    captured <= now.getTime() &&
    now.getTime() - captured <= ROLE_SOURCE_EVIDENCE_MAX_AGE_MS &&
    exactFiles(value.files, ROLE_SOURCE_FILES)
  );
}

function validExecution(
  value: PositiveExecutionEvidence | null,
  headCommit: string,
  at: Date,
) {
  if (!value) return false;
  const issued = value.issuedAt.getTime();
  return (
    value.headCommit === headCommit &&
    value.status === "PASSED" &&
    value.executable &&
    value.executedStepCount > 0 &&
    value.serverResolved &&
    issued <= at.getTime() &&
    at.getTime() - issued <= ROLE_SOURCE_EVIDENCE_MAX_AGE_MS &&
    value.expiresAt.getTime() > at.getTime() &&
    value.expiresAt.getTime() > issued
  );
}

function blocked(reasons: string[]): RoleSourceExtractionDecision {
  return { status: "blocked", reasons: [...new Set(reasons)].sort() };
}

export function auditRoleSourceExtraction(
  value: unknown,
  now = new Date(),
): RoleSourceExtractionDecision {
  if (
    !record(value) ||
    !commit(value.currentMainCommit) ||
    !source(value.source) ||
    !plan(value.plan) ||
    !(value.candidate === null || candidate(value.candidate)) ||
    !date(now)
  ) {
    return { status: "unavailable" };
  }

  const input = value as unknown as RoleSourceExtractionInput;
  if (!sourceSnapshotMatches(input.source, now)) {
    return blocked(["role-source:snapshot-drift"]);
  }

  const planAt = input.plan.mergedAt ?? now;
  if (!validExecution(input.plan.exactHeadCi, input.plan.headCommit, planAt)) {
    return {
      status: "blocked-baseline-ci",
      sourceSnapshotVerified: true,
      planHeadCommit: input.plan.headCommit,
    };
  }
  if (!input.plan.sourceDiffReviewed || !input.plan.reviewThreadsResolved) {
    return blocked(["delivery-plan:review"]);
  }
  if (!input.plan.merged) {
    return {
      status: "ready-for-plan-review",
      sourceSnapshotVerified: true,
      planHeadCommit: input.plan.headCommit,
    };
  }
  if (
    !input.plan.mergeCommit ||
    !input.plan.mergedAt ||
    !input.plan.mainContainsMerge ||
    input.currentMainCommit !== input.plan.mergeCommit
  ) {
    return { status: "unavailable" };
  }

  if (!input.candidate) {
    return {
      status: "ready-for-extraction",
      sourceSnapshotVerified: true,
      sourceHeadCommit: ROLE_SOURCE_HEAD,
      sourceManifestDigest: ROLE_SOURCE_MANIFEST_DIGEST,
      targetBaseCommit: input.currentMainCommit,
      changedFiles: ROLE_SOURCE_FILES.map((item) => item.path),
    };
  }

  const reasons: string[] = [];
  if (input.candidate.targetBaseCommit !== input.currentMainCommit) {
    reasons.push("role-candidate:target-base");
  }
  if (
    input.candidate.sourceBranch !== ROLE_SOURCE_BRANCH ||
    input.candidate.sourceHeadCommit !== ROLE_SOURCE_HEAD ||
    input.candidate.sourceManifestDigest !== ROLE_SOURCE_MANIFEST_DIGEST ||
    !exactPaths(input.candidate.changedFiles) ||
    !input.candidate.sourceEquivalenceServerResolved
  ) {
    reasons.push("role-candidate:source-equivalence");
  }
  if (!input.candidate.sourceDiffReviewed) {
    reasons.push("role-candidate:diff-review");
  }
  if (
    !input.candidate.authorizationConflictReviewed ||
    !input.candidate.accountLifecycleConflictReviewed
  ) {
    reasons.push("role-candidate:conflict-review");
  }
  if (reasons.length > 0) return blocked(reasons);

  return {
    status: "ready-for-exact-head-verification",
    headCommit: input.candidate.headCommit,
    requiredChecks: [
      "HOUSEHOLD_ACCESS_UNIT",
      "LINT",
      "TYPECHECK",
      "BUILD",
      "STANDARD_CI",
      "NATIVE_CI",
      "VERCEL",
    ],
  };
}
