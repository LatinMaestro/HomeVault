import assert from "node:assert/strict";
import test from "node:test";

import {
  ACCEPTANCE_BOUNDARIES,
  ACCEPTANCE_DOMAINS,
  CLIENT_RELEASE_GATES,
  REQUIRED_CLEANUP_SCOPES,
  REQUIRED_PLATFORM_COVERAGE,
  decideFullSystemAcceptance,
  type AcceptanceDefect,
  type AcceptanceEvidence,
  type BoundaryEvidence,
  type CandidateEvidence,
  type CandidateIdentity,
  type CleanupEvidence,
  type ClientGateEvidence,
  type CommercialModel,
  type CommercialSelectionEvidence,
} from "../src/lib/full-system-acceptance-policy";

const now = new Date("2026-07-30T00:00:00.000Z");
const issuedAt = new Date("2026-07-29T23:00:00.000Z");
const expiresAt = new Date("2026-07-30T23:00:00.000Z");
const digest = "a".repeat(64);
const candidate: CandidateIdentity = {
  candidateId: "release-candidate-1",
  revision: 7,
  releaseCommit: "8ed478b78c24dc37a43320ea272e5db6ccced4fb",
  deploymentId: "dpl_ReleaseCandidate1",
  appVersion: "1.0.0",
  buildNumber: "100",
};
const candidateEvidence: CandidateEvidence = {
  evidenceId: "candidate-proof-1",
  candidateId: candidate.candidateId,
  candidateRevision: candidate.revision,
  releaseCommit: candidate.releaseCommit,
  deploymentId: candidate.deploymentId,
  appVersion: candidate.appVersion,
  buildNumber: candidate.buildNumber,
  standardCiRunId: "standard-run-100",
  nativeCiRunId: "native-run-101",
  standardArtifactDigest: "b".repeat(64),
  nativeArtifactDigest: "c".repeat(64),
  issuedAt,
  expiresAt,
  exactHead: true,
  standardCiPassed: true,
  nativeCiPassed: true,
  deploymentReady: true,
  serverResolved: true,
};
const evidence: AcceptanceEvidence[] = ACCEPTANCE_DOMAINS.map(
  (domain, index) => ({
    evidenceId: `domain-evidence-${index}`,
    revision: 1,
    domain,
    status: "PASSED",
    candidateId: candidate.candidateId,
    candidateRevision: candidate.revision,
    releaseCommit: candidate.releaseCommit,
    workflowRunId: `workflow-${index}`,
    jobId: `job-${index}`,
    executable: true,
    artifactDigest: digest,
    platforms: REQUIRED_PLATFORM_COVERAGE[domain],
    fictionalDataOnly: true,
    issuedAt,
    expiresAt,
    serverResolved: true,
  }),
);
const boundaries: BoundaryEvidence[] = ACCEPTANCE_BOUNDARIES.map(
  (boundary, index) => ({
    boundary,
    evidenceId: `boundary-${index}`,
    candidateId: candidate.candidateId,
    candidateRevision: candidate.revision,
    releaseCommit: candidate.releaseCommit,
    artifactDigest: digest,
    issuedAt,
    expiresAt,
    passed: true,
    serverResolved: true,
  }),
);
const cleanupEvidence: CleanupEvidence[] = REQUIRED_CLEANUP_SCOPES.map(
  (scope, index) => ({
    scope,
    evidenceId: `cleanup-${index}`,
    candidateId: candidate.candidateId,
    candidateRevision: candidate.revision,
    releaseCommit: candidate.releaseCommit,
    artifactDigest: digest,
    issuedAt,
    expiresAt,
    completed: true,
    serverResolved: true,
  }),
);
const clientGates: ClientGateEvidence[] = CLIENT_RELEASE_GATES.map((gate) => ({
  gate,
  status: "PENDING",
  authority: null,
}));
const commercialSelection: CommercialSelectionEvidence = {
  decisionId: "commercial-decision-1",
  decisionRevision: 1,
  candidateId: candidate.candidateId,
  candidateRevision: candidate.revision,
  model: "SUBSCRIPTION",
  authorityId: "client-authority-1",
  decidedAt: issuedAt,
  approved: true,
  serverRecorded: true,
};
const input = {
  candidate,
  candidateEvidence,
  evidence,
  commercialModel: "SUBSCRIPTION" as CommercialModel,
  commercialSelection,
  defects: [] as AcceptanceDefect[],
  boundaries,
  cleanupEvidence,
  clientGates,
  now,
};

test("separates exact-head engineering acceptance from client-only gates", () => {
  assert.deepEqual(decideFullSystemAcceptance(input), {
    status: "ready-for-client-gates",
    candidate,
    exactHeadEvidence: true,
    pendingClientGates: CLIENT_RELEASE_GATES,
  });
});

test("authorizes go/no-go only with candidate-bound client authority", () => {
  const complete = clientGates.map((gate, index) => ({
    ...gate,
    status: "COMPLETE" as const,
    authority: {
      gate: gate.gate,
      candidateId: candidate.candidateId,
      candidateRevision: candidate.revision,
      authorityId: `authority-${index}`,
      decisionRevision: 1,
      decision: "COMPLETE" as const,
      decidedAt: issuedAt,
      serverRecorded: true,
    },
  }));
  assert.deepEqual(
    decideFullSystemAcceptance({ ...input, clientGates: complete }),
    {
      status: "ready-for-go-no-go",
      candidate,
      exactHeadEvidence: true,
      clientGatesComplete: true,
    },
  );
});

test("rejects malformed candidates and duplicate client gates", () => {
  assert.deepEqual(
    decideFullSystemAcceptance({
      ...input,
      candidate: { ...candidate, releaseCommit: "bad" },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideFullSystemAcceptance({
      ...input,
      clientGates: [...clientGates, clientGates[0]],
    }),
    { status: "unavailable" },
  );
});

test("fails closed on malformed runtime values and truthy flags", () => {
  const malformed = [
    { ...input, now: now.toISOString() },
    { ...input, evidence: null },
    { ...input, boundaries: null },
    {
      ...input,
      candidateEvidence: { ...candidateEvidence, exactHead: 1 },
    },
    {
      ...input,
      cleanupEvidence: [{ ...cleanupEvidence[0], completed: "yes" }],
    },
  ];
  for (const item of malformed) {
    assert.doesNotThrow(() =>
      assert.deepEqual(decideFullSystemAcceptance(item as never), {
        status: "unavailable",
      }),
    );
  }
});

test("binds candidate proof to every release coordinate", () => {
  const replacements = [
    { releaseCommit: "f".repeat(40) },
    { deploymentId: "dpl_Substituted" },
    { appVersion: "1.0.1" },
    { buildNumber: "101" },
    { candidateId: "another-candidate" },
    { candidateRevision: 8 },
  ];
  for (const replacement of replacements) {
    const decision = decideFullSystemAcceptance({
      ...input,
      candidateEvidence: { ...candidateEvidence, ...replacement },
    });
    assert.deepEqual(decision, {
      status: "blocked",
      reasons: ["candidate-evidence"],
    });
  }
});

test("requires real exact-head standard, native and deployment results", () => {
  for (const key of [
    "exactHead",
    "standardCiPassed",
    "nativeCiPassed",
    "deploymentReady",
    "serverResolved",
  ] as const) {
    const decision = decideFullSystemAcceptance({
      ...input,
      candidateEvidence: { ...candidateEvidence, [key]: false },
    });
    assert.equal(decision.status, "blocked");
  }
});

test("rejects expired or future-issued candidate proof", () => {
  for (const proof of [
    { ...candidateEvidence, expiresAt: now },
    {
      ...candidateEvidence,
      issuedAt: new Date("2026-07-30T00:01:00.000Z"),
    },
  ]) {
    assert.equal(
      decideFullSystemAcceptance({
        ...input,
        candidateEvidence: proof,
      }).status,
      "blocked",
    );
  }
});

test("requires unique complete acceptance-domain coverage", () => {
  for (const next of [evidence.slice(1), [...evidence, evidence[0]]]) {
    const decision = decideFullSystemAcceptance({ ...input, evidence: next });
    assert.equal(decision.status, "blocked");
    assert.ok(
      decision.status === "blocked" &&
        decision.reasons.includes("acceptance-domain-coverage"),
    );
  }
});

test("binds domain evidence to candidate, workflow and server authority", () => {
  const cases: AcceptanceEvidence[] = [
    { ...evidence[0], candidateRevision: candidate.revision + 1 },
    { ...evidence[0], workflowRunId: null },
    { ...evidence[0], jobId: null },
    { ...evidence[0], serverResolved: false },
    { ...evidence[0], expiresAt: now },
  ];
  for (const replacement of cases) {
    assert.equal(
      decideFullSystemAcceptance({
        ...input,
        evidence: [replacement, ...evidence.slice(1)],
      }).status,
      "blocked",
    );
  }
});

test("requires platform coverage and fictional QA fixtures", () => {
  const insufficient = {
    ...evidence[0],
    platforms: ["WEB"] as const,
    fictionalDataOnly: false,
  };
  const decision = decideFullSystemAcceptance({
    ...input,
    evidence: [insufficient, ...evidence.slice(1)],
  });
  assert.equal(decision.status, "blocked");
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("domain:AUTH_IDENTITY:platform-coverage") &&
      decision.reasons.includes("domain:AUTH_IDENTITY:fixture-safety"),
  );
});

test("requires candidate-bound evidence for every security boundary", () => {
  for (const replacement of [
    { ...boundaries[0], candidateId: "substituted" },
    { ...boundaries[0], passed: false },
    { ...boundaries[0], serverResolved: false },
    { ...boundaries[0], expiresAt: now },
  ]) {
    const decision = decideFullSystemAcceptance({
      ...input,
      boundaries: [replacement, ...boundaries.slice(1)],
    });
    assert.equal(decision.status, "blocked");
  }
});

test("rejects missing and duplicate boundary identities", () => {
  for (const next of [boundaries.slice(1), [...boundaries, boundaries[0]]]) {
    const decision = decideFullSystemAcceptance({ ...input, boundaries: next });
    assert.ok(
      decision.status === "blocked" &&
        decision.reasons.includes("acceptance-boundary-coverage"),
    );
  }
});

test("requires complete candidate-bound lifecycle cleanup", () => {
  const missing = decideFullSystemAcceptance({
    ...input,
    cleanupEvidence: cleanupEvidence.slice(1),
  });
  assert.ok(
    missing.status === "blocked" &&
      missing.reasons.includes("lifecycle-cleanup"),
  );
  const substituted = decideFullSystemAcceptance({
    ...input,
    cleanupEvidence: [
      { ...cleanupEvidence[0], releaseCommit: "f".repeat(40) },
      ...cleanupEvidence.slice(1),
    ],
  });
  assert.ok(
    substituted.status === "blocked" &&
      substituted.reasons.includes("cleanup:DATABASE"),
  );
});

test("requires server resolution evidence for resolved defects", () => {
  const defect: AcceptanceDefect = {
    id: "release-1",
    revision: 2,
    candidateId: candidate.candidateId,
    candidateRevision: candidate.revision,
    releaseCommit: candidate.releaseCommit,
    severity: 1,
    status: "RESOLVED",
    resolution: {
      defectId: "release-1",
      defectRevision: 2,
      candidateId: candidate.candidateId,
      candidateRevision: candidate.revision,
      releaseCommit: candidate.releaseCommit,
      artifactDigest: digest,
      verifiedAt: issuedAt,
      resolved: true,
      serverResolved: true,
    },
    waiver: null,
  };
  assert.equal(
    decideFullSystemAcceptance({ ...input, defects: [defect] }).status,
    "ready-for-client-gates",
  );
  const substituted = decideFullSystemAcceptance({
    ...input,
    defects: [
      {
        ...defect,
        resolution: { ...defect.resolution!, defectRevision: 3 },
      },
    ],
  });
  assert.equal(substituted.status, "blocked");
});

test("never waives open severity one or two defects", () => {
  for (const severity of [1, 2] as const) {
    const defect = openWaivedDefect(severity);
    assert.equal(
      decideFullSystemAcceptance({ ...input, defects: [defect] }).status,
      "blocked",
    );
  }
});

test("permits only bounded candidate-bound lower-severity waivers", () => {
  const defect = openWaivedDefect(3);
  assert.equal(
    decideFullSystemAcceptance({ ...input, defects: [defect] }).status,
    "ready-for-client-gates",
  );
  for (const waiver of [
    { ...defect.waiver!, candidateRevision: candidate.revision + 1 },
    { ...defect.waiver!, approved: false },
    { ...defect.waiver!, serverRecorded: false },
    { ...defect.waiver!, expiresAt: now },
  ]) {
    assert.equal(
      decideFullSystemAcceptance({
        ...input,
        defects: [{ ...defect, waiver }],
      }).status,
      "blocked",
    );
  }
});

test("keeps the commercial model blocked until a recorded client decision", () => {
  assert.deepEqual(
    decideFullSystemAcceptance({
      ...input,
      commercialModel: "UNDECIDED",
      commercialSelection: null,
    }),
    { status: "blocked", reasons: ["commercial-model"] },
  );
  assert.equal(
    decideFullSystemAcceptance({
      ...input,
      commercialSelection: {
        ...commercialSelection,
        candidateId: "substituted",
      },
    }).status,
    "blocked",
  );
});

test("supports a recorded free model with strict not-applicable evidence", () => {
  const freeSelection = {
    ...commercialSelection,
    model: "FREE" as const,
  };
  const freeEvidence = evidence.map((item) =>
    item.domain === "COMMERCIAL_ENTITLEMENTS"
      ? {
          ...item,
          status: "NOT_APPLICABLE" as const,
          workflowRunId: null,
          jobId: null,
          executable: false,
          artifactDigest: null,
          platforms: [],
          fictionalDataOnly: false,
        }
      : item,
  );
  assert.equal(
    decideFullSystemAcceptance({
      ...input,
      commercialModel: "FREE",
      commercialSelection: freeSelection,
      evidence: freeEvidence,
    }).status,
    "ready-for-client-gates",
  );
  const malformed = freeEvidence.map((item) =>
    item.domain === "COMMERCIAL_ENTITLEMENTS"
      ? { ...item, executable: true }
      : item,
  );
  assert.equal(
    decideFullSystemAcceptance({
      ...input,
      commercialModel: "FREE",
      commercialSelection: freeSelection,
      evidence: malformed,
    }).status,
    "blocked",
  );
  const falselyExecutable = decideFullSystemAcceptance({
    ...input,
    commercialModel: "FREE",
    commercialSelection: freeSelection,
  });
  assert.ok(
    falselyExecutable.status === "blocked" &&
      falselyExecutable.reasons.includes(
        "domain:COMMERCIAL_ENTITLEMENTS:not-applicable-required",
      ),
  );
});

test("does not accept fabricated client-gate completion", () => {
  const fabricated = clientGates.map((gate) => ({
    ...gate,
    status: "COMPLETE" as const,
    authority: null,
  }));
  const decision = decideFullSystemAcceptance({
    ...input,
    clientGates: fabricated,
  });
  assert.equal(decision.status, "blocked");
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.some((reason) => reason.endsWith(":authority")),
  );
});

test("rejects substituted and truthy client authority evidence", () => {
  const complete: ClientGateEvidence = {
    gate: "APPLE_SIGNING",
    status: "COMPLETE",
    authority: {
      gate: "APPLE_SIGNING",
      candidateId: "substituted",
      candidateRevision: candidate.revision,
      authorityId: "apple-authority",
      decisionRevision: 1,
      decision: "COMPLETE",
      decidedAt: issuedAt,
      serverRecorded: true,
    },
  };
  const next = clientGates.map((gate) =>
    gate.gate === complete.gate ? complete : gate,
  );
  assert.equal(
    decideFullSystemAcceptance({ ...input, clientGates: next }).status,
    "blocked",
  );
  assert.deepEqual(
    decideFullSystemAcceptance({
      ...input,
      clientGates: next.map((gate) =>
        gate.gate === complete.gate
          ? {
              ...gate,
              authority: { ...gate.authority!, serverRecorded: 1 },
            }
          : gate,
      ) as never,
    }),
    { status: "unavailable" },
  );
});

test("fails closed when recorded client authority rejects a gate", () => {
  const rejected: ClientGateEvidence = {
    gate: "APPLE_SIGNING",
    status: "REJECTED",
    authority: {
      gate: "APPLE_SIGNING",
      candidateId: candidate.candidateId,
      candidateRevision: candidate.revision,
      authorityId: "apple-authority",
      decisionRevision: 1,
      decision: "REJECTED",
      decidedAt: issuedAt,
      serverRecorded: true,
    },
  };
  const decision = decideFullSystemAcceptance({
    ...input,
    clientGates: clientGates.map((gate) =>
      gate.gate === rejected.gate ? rejected : gate,
    ),
  });
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("client-gate:APPLE_SIGNING:rejected"),
  );
});

function openWaivedDefect(severity: 1 | 2 | 3 | 4): AcceptanceDefect {
  return {
    id: `release-${severity}`,
    revision: 1,
    candidateId: candidate.candidateId,
    candidateRevision: candidate.revision,
    releaseCommit: candidate.releaseCommit,
    severity,
    status: "OPEN",
    resolution: null,
    waiver: {
      defectId: `release-${severity}`,
      defectRevision: 1,
      candidateId: candidate.candidateId,
      candidateRevision: candidate.revision,
      authorityId: "release-authority",
      reason: "A fictional low-severity acceptance waiver.",
      issuedAt,
      expiresAt: new Date("2026-08-05T00:00:00.000Z"),
      approved: true,
      serverRecorded: true,
    },
  };
}
