import assert from "node:assert/strict";
import test from "node:test";

import {
  ACCEPTANCE_DOMAINS,
  CLIENT_RELEASE_GATES,
  REQUIRED_CLEANUP_SCOPES,
  REQUIRED_PLATFORM_COVERAGE,
  decideFullSystemAcceptance,
  type AcceptanceBoundaries,
  type AcceptanceDefect,
  type AcceptanceEvidence,
  type CandidateIdentity,
  type ClientGateEvidence,
  type CommercialModel,
} from "../src/lib/full-system-acceptance-policy";

const now = new Date("2026-07-28T10:00:00.000Z");
const candidate: CandidateIdentity = {
  releaseCommit: "8ed478b78c24dc37a43320ea272e5db6ccced4fb",
  deploymentId: "dpl_ReleaseCandidate1",
  appVersion: "1.0.0",
  buildNumber: "100",
};

const evidence: AcceptanceEvidence[] = ACCEPTANCE_DOMAINS.map((domain) => ({
  domain,
  status: "PASSED",
  releaseCommit: candidate.releaseCommit,
  executable: true,
  artifactDigest: "a".repeat(64),
  platforms: REQUIRED_PLATFORM_COVERAGE[domain],
  fictionalDataOnly: true,
}));

const boundaries: AcceptanceBoundaries = {
  serverAuthorizationVerified: true,
  crossPropertyIsolationVerified: true,
  privateFileDeliveryVerified: true,
  leastPrivilegeProvidersVerified: true,
  secretsAndLogsScanPassed: true,
  userReviewedAutomationVerified: true,
  prohibitedProductScopesAbsent: true,
  accessibilityRegressionPassed: true,
  performanceBudgetsPassed: true,
};

const clientGates: ClientGateEvidence[] = CLIENT_RELEASE_GATES.map((gate) => ({
  gate,
  status: "PENDING",
}));

const input = {
  candidate,
  evidence,
  commercialModel: "SUBSCRIPTION" as CommercialModel,
  defects: [] as AcceptanceDefect[],
  boundaries,
  completedCleanupScopes: REQUIRED_CLEANUP_SCOPES,
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

test("authorizes go/no-go only after every client gate is complete", () => {
  assert.deepEqual(
    decideFullSystemAcceptance({
      ...input,
      clientGates: clientGates.map((gate) => ({
        ...gate,
        status: "COMPLETE" as const,
      })),
    }),
    {
      status: "ready-for-go-no-go",
      candidate,
      exactHeadEvidence: true,
      clientGatesComplete: true,
    },
  );
});

test("rejects malformed candidate and duplicate client-gate identities", () => {
  assert.deepEqual(
    decideFullSystemAcceptance({
      ...input,
      candidate: { ...candidate, releaseCommit: "not-a-commit" },
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

test("fails closed on malformed runtime values without throwing", () => {
  const malformedInputs = [
    { ...input, candidate: { ...candidate, buildNumber: "0" } },
    { ...input, now: "2026-07-28T10:00:00.000Z" },
    { ...input, evidence: null },
    { ...input, evidence: [{ ...evidence[0], fictionalDataOnly: 1 }] },
    { ...input, boundaries: null },
    { ...input, clientGates: [null] },
    {
      ...input,
      defects: [
        {
          id: "release-3",
          severity: 3,
          status: "OPEN",
          waiver: {
            owner: "Release owner",
            reason: "Malformed runtime date.",
            expiresAt: "2026-08-04T10:00:00.000Z",
          },
        },
      ],
    },
  ];

  for (const malformed of malformedInputs) {
    assert.doesNotThrow(() =>
      assert.deepEqual(decideFullSystemAcceptance(malformed as never), {
        status: "unavailable",
      }),
    );
  }
});

test("blocks missing and duplicate acceptance domains", () => {
  const missing = evidence.slice(1);
  const duplicate = [...evidence, evidence[0]];
  for (const nextEvidence of [missing, duplicate]) {
    const decision = decideFullSystemAcceptance({
      ...input,
      evidence: nextEvidence,
    });
    assert.equal(decision.status, "blocked");
    assert.ok(
      decision.status === "blocked" &&
        decision.reasons.includes("acceptance-domain-coverage"),
    );
  }
});

test("requires executable artifact evidence at the exact candidate head", () => {
  const cases: AcceptanceEvidence[] = [
    { ...evidence[0], executable: false },
    { ...evidence[0], artifactDigest: null },
    {
      ...evidence[0],
      releaseCommit: "f45680ce285bbd9e5241ea8c04e44d8ff5e18139",
    },
  ];
  for (const replacement of cases) {
    const decision = decideFullSystemAcceptance({
      ...input,
      evidence: [replacement, ...evidence.slice(1)],
    });
    assert.equal(decision.status, "blocked");
  }
});

test("requires every platform assigned to each capability domain", () => {
  const decision = decideFullSystemAcceptance({
    ...input,
    evidence: [
      { ...evidence[0], platforms: ["WEB"] },
      ...evidence.slice(1),
    ],
  });
  assert.equal(decision.status, "blocked");
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("domain:AUTH_IDENTITY:platform-coverage"),
  );
});

test("requires fictional QA data for every executable acceptance suite", () => {
  const decision = decideFullSystemAcceptance({
    ...input,
    evidence: [
      { ...evidence[3], fictionalDataOnly: false },
      ...evidence.filter((item) => item.domain !== evidence[3].domain),
    ],
  });
  assert.equal(decision.status, "blocked");
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes(
        "domain:CORE_RECORDS_PRIVATE_FILES:fixture-safety",
      ),
  );
});

test("never waives open severity one or two defects", () => {
  for (const severity of [1, 2] as const) {
    const decision = decideFullSystemAcceptance({
      ...input,
      defects: [
        {
          id: `release-${severity}`,
          severity,
          status: "OPEN",
          waiver: {
            owner: "Release owner",
            reason: "A fictional waiver that cannot override severity.",
            expiresAt: new Date("2026-07-29T10:00:00.000Z"),
          },
        },
      ],
    });
    assert.equal(decision.status, "blocked");
  }
});

test("permits only bounded and accountable lower-severity waivers", () => {
  const defect: AcceptanceDefect = {
    id: "release-3",
    severity: 3,
    status: "OPEN",
    waiver: {
      owner: "Release owner",
      reason: "Low-risk visual issue with an approved follow-up.",
      expiresAt: new Date("2026-08-04T10:00:00.000Z"),
    },
  };
  assert.equal(
    decideFullSystemAcceptance({ ...input, defects: [defect] }).status,
    "ready-for-client-gates",
  );
  const expired = decideFullSystemAcceptance({
    ...input,
    defects: [
      {
        ...defect,
        waiver: {
          ...defect.waiver!,
          expiresAt: new Date("2026-07-28T09:59:59.000Z"),
        },
      },
    ],
  });
  assert.equal(expired.status, "blocked");
});

test("blocks any unverified privacy, authorization or product boundary", () => {
  for (const key of Object.keys(boundaries) as (keyof AcceptanceBoundaries)[]) {
    const decision = decideFullSystemAcceptance({
      ...input,
      boundaries: { ...boundaries, [key]: false },
    });
    assert.equal(decision.status, "blocked");
  }
});

test("requires complete lifecycle cleanup across devices and processors", () => {
  const decision = decideFullSystemAcceptance({
    ...input,
    completedCleanupScopes: REQUIRED_CLEANUP_SCOPES.filter(
      (scope) => scope !== "PROCESSORS",
    ),
  });
  assert.deepEqual(decision, {
    status: "blocked",
    reasons: ["lifecycle-cleanup"],
  });
});

test("keeps the commercial model explicit and validates free releases", () => {
  assert.ok(
    decideFullSystemAcceptance({
      ...input,
      commercialModel: "UNDECIDED",
    }).status === "blocked",
  );

  const freeEvidence: AcceptanceEvidence[] = evidence.map((item) =>
    item.domain === "COMMERCIAL_ENTITLEMENTS"
      ? {
          ...item,
          status: "NOT_APPLICABLE",
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
      evidence: freeEvidence,
    }).status,
    "ready-for-client-gates",
  );
  const malformedNotApplicable = decideFullSystemAcceptance({
    ...input,
    commercialModel: "FREE",
    evidence: freeEvidence.map((item) =>
      item.domain === "COMMERCIAL_ENTITLEMENTS"
        ? { ...item, executable: true }
        : item,
    ),
  });
  assert.deepEqual(malformedNotApplicable, {
    status: "blocked",
    reasons: ["domain:COMMERCIAL_ENTITLEMENTS:not-applicable-shape"],
  });
  const missingNotApplicableRecord = decideFullSystemAcceptance({
    ...input,
    commercialModel: "FREE",
    evidence: freeEvidence.filter(
      (item) => item.domain !== "COMMERCIAL_ENTITLEMENTS",
    ),
  });
  assert.equal(missingNotApplicableRecord.status, "blocked");
  assert.ok(
    missingNotApplicableRecord.status === "blocked" &&
      missingNotApplicableRecord.reasons.includes(
        "acceptance-domain-coverage",
      ),
  );
});

test("fails closed when a client authority rejects a release gate", () => {
  const decision = decideFullSystemAcceptance({
    ...input,
    clientGates: clientGates.map((gate) =>
      gate.gate === "APPLE_SIGNING"
        ? { ...gate, status: "REJECTED" as const }
        : gate,
    ),
  });
  assert.deepEqual(decision, {
    status: "blocked",
    reasons: ["client-gate:APPLE_SIGNING:rejected"],
  });
});
