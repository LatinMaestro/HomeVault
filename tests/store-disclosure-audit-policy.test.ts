import assert from "node:assert/strict";
import test from "node:test";

import {
  CLIENT_DISCLOSURE_GATES,
  DISCLOSURE_SURFACES,
  STORE_CAPABILITIES,
  auditStoreDisclosures,
  type CapabilityDisclosure,
  type ClientDisclosureGateEvidence,
  type DisclosureSnapshot,
  type ProviderDisclosure,
} from "../src/lib/store-disclosure-audit-policy";
import type { CandidateIdentity } from "../src/lib/full-system-acceptance-policy";

const candidate: CandidateIdentity = {
  candidateId: "release-disclosure-candidate",
  revision: 12,
  releaseCommit: "db8af7dac90f113064ebd8ffcd5db68fbcabd337",
  deploymentId: "dpl_ReleaseDisclosure1",
  appVersion: "1.0.0",
  buildNumber: "101",
};
const now = new Date("2026-07-30T22:00:00.000Z");
const issuedAt = new Date("2026-07-30T21:00:00.000Z");
const evidenceExpiresAt = new Date("2026-07-31T20:00:00.000Z");
const decisionExpiresAt = new Date("2026-08-20T21:00:00.000Z");

const capabilities: CapabilityDisclosure[] = STORE_CAPABILITIES.map(
  (capability) => ({
    capability,
    candidateId: candidate.candidateId,
    candidateRevision: candidate.revision,
    releaseCommit: candidate.releaseCommit,
    shipped: false,
    enabled: false,
    dataClasses: [],
    permissions: [],
    processorIds: [],
    deletionScopes: [],
  }),
).map((item) => {
  if (item.capability === "AUTH_IDENTITY") {
    return {
      ...item,
      shipped: true,
      enabled: true,
      dataClasses: ["ACCOUNT_IDENTITY", "HOUSEHOLD_CONTENT"],
      deletionScopes: ["DATABASE", "DEVICES", "PROCESSORS"],
    };
  }
  if (item.capability === "EXPANDED_ATTACHMENTS") {
    return {
      ...item,
      shipped: true,
      enabled: true,
      dataClasses: ["PRIVATE_FILES"],
      processorIds: ["vercel-private-blob"],
      deletionScopes: ["PRIVATE_FILES", "PROCESSORS"],
    };
  }
  if (item.capability === "CAMERA_CAPTURE") {
    return {
      ...item,
      shipped: true,
      enabled: true,
      dataClasses: ["PRIVATE_FILES"],
      permissions: ["CAMERA"],
      deletionScopes: ["PRIVATE_FILES", "DEVICES"],
    };
  }
  if (item.capability === "OCR_DRAFTS") {
    return { ...item, shipped: true };
  }
  return item;
});

const providers: ProviderDisclosure[] = [
  {
    id: "vercel-private-blob",
    capability: "EXPANDED_ATTACHMENTS",
    candidateId: candidate.candidateId,
    candidateRevision: candidate.revision,
    releaseCommit: candidate.releaseCommit,
    status: "APPROVED",
    privacyReviewed: true,
    regionRecorded: true,
    retentionRecorded: true,
    deletionSupported: true,
    decisionId: "provider-approval-1",
    decisionRevision: 2,
    decidedAt: issuedAt,
    expiresAt: decisionExpiresAt,
    authorityRecorded: true,
  },
];

const expectedStates = capabilities.map(
  ({ capability, shipped, enabled }) => ({
    capability,
    shipped,
    enabled,
  }),
);

const snapshots: DisclosureSnapshot[] = DISCLOSURE_SURFACES.map((surface) => ({
  surface,
  candidateId: candidate.candidateId,
  candidateRevision: candidate.revision,
  releaseCommit: candidate.releaseCommit,
  artifactDigest: "a".repeat(64),
  issuedAt,
  expiresAt: evidenceExpiresAt,
  serverResolved: true,
  capabilityStates: expectedStates,
  dataClasses: ["ACCOUNT_IDENTITY", "HOUSEHOLD_CONTENT", "PRIVATE_FILES"],
  permissions: ["CAMERA"],
  processorIds: ["vercel-private-blob"],
  deletionScopes: ["DATABASE", "DEVICES", "PROCESSORS", "PRIVATE_FILES"],
  status: "ALIGNED",
}));

const clientGates: ClientDisclosureGateEvidence[] =
  CLIENT_DISCLOSURE_GATES.map((gate) => ({
    gate,
    candidateId: candidate.candidateId,
    candidateRevision: candidate.revision,
    releaseCommit: candidate.releaseCommit,
    status: "PENDING",
    decisionId: null,
    decisionRevision: null,
    decidedAt: null,
    expiresAt: null,
    authorityRecorded: false,
  }));

const input = {
  candidate,
  capabilities,
  providers,
  snapshots,
  clientGates,
  now,
};

test("separates exact-candidate disclosure alignment from client approvals", () => {
  assert.deepEqual(auditStoreDisclosures(input), {
    status: "ready-for-client-approval",
    candidate,
    exactCandidateEvidence: true,
    pendingClientGates: CLIENT_DISCLOSURE_GATES,
  });
});

test("authorizes the store package only after every client gate is approved", () => {
  assert.deepEqual(
    auditStoreDisclosures({
      ...input,
      clientGates: clientGates.map((item) => ({
        ...item,
        status: "APPROVED" as const,
        decisionId: `approval-${item.gate}`,
        decisionRevision: 1,
        decidedAt: issuedAt,
        expiresAt: decisionExpiresAt,
        authorityRecorded: true,
      })),
    }),
    {
      status: "ready-for-store-package",
      candidate,
      exactCandidateEvidence: true,
      clientApprovalsComplete: true,
    },
  );
});

test("rejects malformed candidates and impossible enabled capability states", () => {
  assert.deepEqual(
    auditStoreDisclosures({
      ...input,
      candidate: { ...candidate, buildNumber: "0" },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    auditStoreDisclosures({
      ...input,
      capabilities: capabilities.map((item) =>
        item.capability === "OCR_DRAFTS"
          ? { ...item, shipped: false, enabled: true }
          : item,
      ),
    }),
    { status: "unavailable" },
  );
});

test("fails closed on malformed runtime collections without throwing", () => {
  const malformed = [
    { ...input, capabilities: null },
    { ...input, providers: [null] },
    { ...input, snapshots: [{ ...snapshots[0], permissions: [1] }] },
    { ...input, clientGates: [null] },
  ];
  for (const next of malformed) {
    assert.doesNotThrow(() =>
      assert.deepEqual(auditStoreDisclosures(next as never), {
        status: "unavailable",
      }),
    );
  }
});

test("requires one unique record for every capability, surface and client gate", () => {
  const cases = [
    { ...input, capabilities: capabilities.slice(1) },
    { ...input, snapshots: [...snapshots, snapshots[0]] },
    { ...input, clientGates: clientGates.slice(1) },
  ];
  for (const next of cases) {
    assert.deepEqual(auditStoreDisclosures(next), {
      status: "unavailable",
    });
  }
});

test("binds every capability and disclosure artifact to the exact candidate", () => {
  const staleCommit = "fa7d24b29eef519caf77559bcb1f0a8685e1a00d";
  const capabilityDecision = auditStoreDisclosures({
    ...input,
    capabilities: [
      { ...capabilities[0], releaseCommit: staleCommit },
      ...capabilities.slice(1),
    ],
  });
  assert.ok(
    capabilityDecision.status === "blocked" &&
      capabilityDecision.reasons.includes(
        `capability:${capabilities[0].capability}:candidate`,
      ),
  );
  const surfaceDecision = auditStoreDisclosures({
    ...input,
    snapshots: [
      { ...snapshots[0], releaseCommit: staleCommit },
      ...snapshots.slice(1),
    ],
  });
  assert.ok(
    surfaceDecision.status === "blocked" &&
      surfaceDecision.reasons.includes(
        `surface:${snapshots[0].surface}:candidate`,
      ),
  );
});

test("blocks stale shipped or enabled claims on every disclosure surface", () => {
  const decision = auditStoreDisclosures({
    ...input,
    snapshots: snapshots.map((snapshot) =>
      snapshot.surface === "REVIEWER_NOTES"
        ? {
            ...snapshot,
            capabilityStates: snapshot.capabilityStates.map((state) =>
              state.capability === "CAMERA_CAPTURE"
                ? { ...state, enabled: false }
                : state,
            ),
          }
        : snapshot,
    ),
  });
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("surface:REVIEWER_NOTES:capabilities"),
  );
});

test("requires exact data, permission, processor and deletion disclosure sets", () => {
  const cases: [keyof DisclosureSnapshot, string][] = [
    ["dataClasses", "data-classes"],
    ["permissions", "permissions"],
    ["processorIds", "processors"],
    ["deletionScopes", "deletion"],
  ];
  for (const [field, reason] of cases) {
    const decision = auditStoreDisclosures({
      ...input,
      snapshots: snapshots.map((snapshot) =>
        snapshot.surface === "APPLE_APP_PRIVACY"
          ? { ...snapshot, [field]: [] }
          : snapshot,
      ),
    });
    assert.ok(
      decision.status === "blocked" &&
        decision.reasons.includes(`surface:APPLE_APP_PRIVACY:${reason}`),
    );
  }
});

test("blocks enabled processors until every approval control passes", () => {
  const controls = [
    {
      status: "PENDING" as const,
      decisionId: null,
      decisionRevision: null,
      decidedAt: null,
      expiresAt: null,
      authorityRecorded: false,
    },
    { privacyReviewed: false },
    { regionRecorded: false },
    { retentionRecorded: false },
    { deletionSupported: false },
  ];
  for (const change of controls) {
    const decision = auditStoreDisclosures({
      ...input,
      providers: [{ ...providers[0], ...change }],
    });
    assert.ok(
      decision.status === "blocked" &&
        decision.reasons.includes(
          "provider:vercel-private-blob:approval",
        ),
    );
  }
});

test("rejects orphaned providers and approved providers for disabled capabilities", () => {
  const orphaned = auditStoreDisclosures({
    ...input,
    providers: [
      ...providers,
      {
        id: "unused-provider",
        capability: "AI_DRAFTS",
        candidateId: candidate.candidateId,
        candidateRevision: candidate.revision,
        releaseCommit: candidate.releaseCommit,
        status: "PENDING",
        privacyReviewed: false,
        regionRecorded: false,
        retentionRecorded: false,
        deletionSupported: false,
        decisionId: null,
        decisionRevision: null,
        decidedAt: null,
        expiresAt: null,
        authorityRecorded: false,
      },
    ],
  });
  assert.ok(
    orphaned.status === "blocked" &&
      orphaned.reasons.includes("provider:unused-provider:inventory"),
  );

  const disabledApproved = auditStoreDisclosures({
    ...input,
    capabilities: capabilities.map((item) =>
      item.capability === "OCR_DRAFTS"
        ? { ...item, processorIds: ["ocr-provider"] }
        : item,
    ),
    providers: [
      ...providers,
      {
        id: "ocr-provider",
        capability: "OCR_DRAFTS",
        candidateId: candidate.candidateId,
        candidateRevision: candidate.revision,
        releaseCommit: candidate.releaseCommit,
        status: "APPROVED",
        privacyReviewed: true,
        regionRecorded: true,
        retentionRecorded: true,
        deletionSupported: true,
        decisionId: "ocr-provider-approval",
        decisionRevision: 1,
        decidedAt: issuedAt,
        expiresAt: decisionExpiresAt,
        authorityRecorded: true,
      },
    ],
  });
  assert.ok(
    disabledApproved.status === "blocked" &&
      disabledApproved.reasons.includes("provider:ocr-provider:inventory"),
  );
});

test("blocks explicitly misaligned surfaces and rejected client authority", () => {
  const surfaceDecision = auditStoreDisclosures({
    ...input,
    snapshots: snapshots.map((snapshot) =>
      snapshot.surface === "STORE_LISTING"
        ? { ...snapshot, status: "MISALIGNED" as const }
        : snapshot,
    ),
  });
  assert.ok(
    surfaceDecision.status === "blocked" &&
      surfaceDecision.reasons.includes("surface:STORE_LISTING:status"),
  );

  const gateDecision = auditStoreDisclosures({
    ...input,
    clientGates: clientGates.map((item) =>
      item.gate === "LEGAL_IDENTITY"
        ? {
            ...item,
            status: "REJECTED" as const,
            decisionId: "legal-identity-rejection",
            decisionRevision: 1,
            decidedAt: issuedAt,
            expiresAt: decisionExpiresAt,
            authorityRecorded: true,
          }
        : item,
    ),
  });
  assert.deepEqual(gateDecision, {
    status: "blocked",
    reasons: ["client-gate:LEGAL_IDENTITY:rejected"],
  });
});

test("rejects malformed evidence hashes and duplicate inventory values", () => {
  assert.deepEqual(
    auditStoreDisclosures({
      ...input,
      snapshots: [
        { ...snapshots[0], artifactDigest: "not-a-digest" },
        ...snapshots.slice(1),
      ],
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    auditStoreDisclosures({
      ...input,
      capabilities: capabilities.map((item) =>
        item.capability === "CAMERA_CAPTURE"
          ? { ...item, permissions: ["CAMERA", "CAMERA"] }
          : item,
      ),
    }),
    { status: "unavailable" },
  );
});

test("binds capabilities, providers, surfaces and client gates to one candidate", () => {
  const cases = [
    {
      ...input,
      capabilities: [
        { ...capabilities[0], candidateRevision: candidate.revision + 1 },
        ...capabilities.slice(1),
      ],
    },
    {
      ...input,
      providers: [{ ...providers[0], candidateId: "substituted-candidate" }],
    },
    {
      ...input,
      snapshots: [
        { ...snapshots[0], candidateRevision: candidate.revision + 1 },
        ...snapshots.slice(1),
      ],
    },
    {
      ...input,
      clientGates: clientGates.map((item, index) =>
        index === 0
          ? { ...item, releaseCommit: "f".repeat(40) }
          : item,
      ),
    },
  ];
  for (const next of cases) {
    const decision = auditStoreDisclosures(next);
    assert.equal(decision.status, "blocked");
  }
});

test("requires fresh server-resolved disclosure artifacts", () => {
  for (const replacement of [
    { serverResolved: false },
    { expiresAt: now },
    { issuedAt: new Date("2026-07-30T22:01:00.000Z") },
    { expiresAt: new Date("2026-07-31T21:01:00.000Z") },
  ]) {
    const decision = auditStoreDisclosures({
      ...input,
      snapshots: [
        { ...snapshots[0], ...replacement },
        ...snapshots.slice(1),
      ],
    });
    assert.ok(
      decision.status === "blocked" &&
        decision.reasons.includes(
          `surface:${snapshots[0].surface}:evidence-stale`,
        ),
    );
  }
});

test("pending gates cannot carry synthetic authority", () => {
  assert.deepEqual(
    auditStoreDisclosures({
      ...input,
      clientGates: clientGates.map((item, index) =>
        index === 0
          ? {
              ...item,
              decisionId: "synthetic-approval",
              authorityRecorded: true,
            }
          : item,
      ) as never,
    }),
    { status: "unavailable" },
  );
});

test("approved provider and client authority must be fresh", () => {
  const staleProvider = auditStoreDisclosures({
    ...input,
    providers: [{ ...providers[0], expiresAt: now }],
  });
  assert.ok(
    staleProvider.status === "blocked" &&
      staleProvider.reasons.includes(
        "provider:vercel-private-blob:authority-stale",
      ),
  );

  const staleGate = auditStoreDisclosures({
    ...input,
    clientGates: clientGates.map((item, index) =>
      index === 0
        ? {
            ...item,
            status: "APPROVED" as const,
            decisionId: "stale-client-approval",
            decisionRevision: 1,
            decidedAt: issuedAt,
            expiresAt: now,
            authorityRecorded: true,
          }
        : item,
    ),
  });
  assert.ok(
    staleGate.status === "blocked" &&
      staleGate.reasons.includes(
        `client-gate:${clientGates[0].gate}:authority-stale`,
      ),
  );

  assert.deepEqual(
    auditStoreDisclosures({ ...input, now: new Date("invalid") }),
    { status: "unavailable" },
  );
});
