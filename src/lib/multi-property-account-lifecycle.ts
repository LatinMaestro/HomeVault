import type { HouseholdAccessRole } from "@/lib/household-access";

export type AccountPropertyMembership = {
  id: string;
  userId: string;
  homeId: string;
  role: HouseholdAccessRole;
  memberCount: number;
  ownerCount: number;
  active: boolean;
};

export type AccountDeletionCredentialEvidence = {
  id: string;
  userId: string;
  purpose: "account-deletion";
  verified: boolean;
  confirmedAt: string;
  expiresAt: string;
  consumedAt: string | null;
};

export type AccountRecoveryProofEvidence = {
  id: string;
  userId: string;
  purpose: "account-recovery";
  verified: boolean;
  issuedAt: string;
  expiresAt: string;
  consumedAt: string | null;
};

const ACCOUNT_DELETION_CLEANUP_SCOPES = [
  "account-identity-and-social-links",
  "relational-records-memberships-and-invitations",
  "private-files-and-pending-uploads",
  "devices-offline-keys-caches-and-queued-actions",
  "notification-tokens-schedules-and-deduplication",
  "calendar-connections-and-created-events",
  "email-ingestion-routes-and-quarantine",
  "ocr-ai-jobs-drafts-and-processor-copies",
  "sharing-grants",
  "provider-integrations",
] as const;

export type AccountDeletionCleanupScope =
  (typeof ACCOUNT_DELETION_CLEANUP_SCOPES)[number];

type ExpectedMembership = Readonly<AccountPropertyMembership>;

export type MultiPropertyAccountDeletionDecision =
  | {
      status: "deletion-allowed";
      userId: string;
      credentialEvidenceId: string;
      expectedMemberships: ExpectedMembership[];
      deleteHomeIds: string[];
      removeMembershipIds: string[];
      cleanupScopes: readonly AccountDeletionCleanupScope[];
    }
  | { status: "unavailable" }
  | { status: "credential-confirmation-required" }
  | {
      status: "ownership-transfer-required";
      userId: string;
      properties: Array<{
        homeId: string;
        ownerMembershipId: string;
      }>;
    };

type RecoveryPlan = {
  userId: string;
  consumeRecoveryProofId: string;
  revokeExistingSessions: true;
  replaceOfflinePropertyKeys: true;
};

export type RecoveredPropertyAccessDecision =
  | {
      status: "selected";
      recovery: RecoveryPlan;
      membership: ExpectedMembership;
    }
  | {
      status: "selection-required";
      recovery: RecoveryPlan;
      homeIds: string[];
    }
  | {
      status: "onboarding-required";
      recovery: RecoveryPlan;
    }
  | { status: "unavailable" };

const APPROVED_ROLES = new Set<HouseholdAccessRole>([
  "OWNER",
  "ADULT",
  "CHILD",
  "GUEST",
]);
const MAX_MEMBERSHIPS = 100;
const MAX_PROPERTY_MEMBERS = 1_000;
const MAX_ID_LENGTH = 128;
const MAX_CREDENTIAL_AGE_MS = 15 * 60 * 1_000;
const MAX_RECOVERY_PROOF_AGE_MS = 30 * 60 * 1_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  try {
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  } catch {
    return false;
  }
}

function isCanonicalId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_ID_LENGTH &&
    value === value.trim() &&
    !/\s/u.test(value) &&
    !/[\u0000-\u001f\u007f]/u.test(value) &&
    !/\p{Cf}/u.test(value)
  );
}

function parseDate(value: unknown) {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  const milliseconds = Date.parse(value);
  return Number.isFinite(milliseconds) ? milliseconds : null;
}

function parseEvaluationTime(value: unknown) {
  return parseDate(value);
}

function parseMemberships(
  currentUserId: string,
  value: unknown,
): AccountPropertyMembership[] | null {
  if (
    !Array.isArray(value) ||
    value.length > MAX_MEMBERSHIPS
  ) {
    return null;
  }

  const memberships: AccountPropertyMembership[] = [];
  const membershipIds = new Set<string>();
  const homeIds = new Set<string>();

  for (const candidate of value) {
    if (
      !isRecord(candidate) ||
      !isCanonicalId(candidate.id) ||
      !isCanonicalId(candidate.userId) ||
      candidate.userId !== currentUserId ||
      !isCanonicalId(candidate.homeId) ||
      typeof candidate.role !== "string" ||
      !APPROVED_ROLES.has(candidate.role as HouseholdAccessRole) ||
      !Number.isInteger(candidate.memberCount) ||
      (candidate.memberCount as number) < 1 ||
      (candidate.memberCount as number) > MAX_PROPERTY_MEMBERS ||
      candidate.ownerCount !== 1 ||
      typeof candidate.active !== "boolean" ||
      membershipIds.has(candidate.id) ||
      homeIds.has(candidate.homeId)
    ) {
      return null;
    }

    membershipIds.add(candidate.id);
    homeIds.add(candidate.homeId);
    memberships.push({
      id: candidate.id,
      userId: candidate.userId,
      homeId: candidate.homeId,
      role: candidate.role as HouseholdAccessRole,
      memberCount: candidate.memberCount as number,
      ownerCount: 1,
      active: candidate.active,
    });
  }

  return memberships;
}

function hasValidCredentialEvidence({
  currentUserId,
  credential,
  evaluatedAt,
}: {
  currentUserId: string;
  credential: unknown;
  evaluatedAt: number;
}): boolean {
  if (
    !isRecord(credential) ||
    !isCanonicalId(credential.id) ||
    credential.userId !== currentUserId ||
    credential.purpose !== "account-deletion" ||
    credential.verified !== true ||
    credential.consumedAt !== null
  ) {
    return false;
  }

  const confirmedAt = parseDate(credential.confirmedAt);
  const expiresAt = parseDate(credential.expiresAt);
  return (
    confirmedAt !== null &&
    expiresAt !== null &&
    confirmedAt <= evaluatedAt &&
    evaluatedAt < expiresAt &&
    expiresAt > confirmedAt &&
    expiresAt - confirmedAt <= MAX_CREDENTIAL_AGE_MS
  );
}

function hasValidRecoveryProof({
  recoveredUserId,
  recoveryProof,
  evaluatedAt,
}: {
  recoveredUserId: string;
  recoveryProof: unknown;
  evaluatedAt: number;
}): boolean {
  if (
    !isRecord(recoveryProof) ||
    !isCanonicalId(recoveryProof.id) ||
    recoveryProof.userId !== recoveredUserId ||
    recoveryProof.purpose !== "account-recovery" ||
    recoveryProof.verified !== true ||
    recoveryProof.consumedAt !== null
  ) {
    return false;
  }

  const issuedAt = parseDate(recoveryProof.issuedAt);
  const expiresAt = parseDate(recoveryProof.expiresAt);
  return (
    issuedAt !== null &&
    expiresAt !== null &&
    issuedAt <= evaluatedAt &&
    evaluatedAt < expiresAt &&
    expiresAt > issuedAt &&
    expiresAt - issuedAt <= MAX_RECOVERY_PROOF_AGE_MS
  );
}

function copyMembership(
  membership: AccountPropertyMembership,
): ExpectedMembership {
  return { ...membership };
}

function decideMultiPropertyAccountDeletionUnchecked({
  currentUserId,
  emailVerified,
  credential,
  evaluatedAt,
  memberships,
}: {
  currentUserId: string;
  emailVerified: boolean;
  credential?: AccountDeletionCredentialEvidence | null;
  evaluatedAt: string;
  memberships: unknown;
}): MultiPropertyAccountDeletionDecision {
  if (!isCanonicalId(currentUserId) || emailVerified !== true) {
    return { status: "unavailable" };
  }

  const evaluationTime = parseEvaluationTime(evaluatedAt);
  const parsedMemberships = parseMemberships(currentUserId, memberships);
  if (
    evaluationTime === null ||
    parsedMemberships === null ||
    parsedMemberships.some((membership) => membership.active !== true)
  ) {
    return { status: "unavailable" };
  }

  if (credential === undefined || credential === null) {
    return { status: "credential-confirmation-required" };
  }

  if (
    !hasValidCredentialEvidence({
      currentUserId,
      credential,
      evaluatedAt: evaluationTime,
    })
  ) {
    return { status: "unavailable" };
  }

  if (
    parsedMemberships.some(
      (membership) =>
        membership.role !== "OWNER" && membership.memberCount < 2,
    )
  ) {
    return { status: "unavailable" };
  }

  const transferProperties = parsedMemberships
    .filter(
      (membership) =>
        membership.role === "OWNER" && membership.memberCount > 1,
    )
    .map((membership) => ({
      homeId: membership.homeId,
      ownerMembershipId: membership.id,
    }))
    .sort((left, right) => left.homeId.localeCompare(right.homeId));

  if (transferProperties.length > 0) {
    return {
      status: "ownership-transfer-required",
      userId: currentUserId,
      properties: transferProperties,
    };
  }

  return {
    status: "deletion-allowed",
    userId: currentUserId,
    credentialEvidenceId: credential.id,
    expectedMemberships: parsedMemberships
      .map(copyMembership)
      .sort((left, right) => left.homeId.localeCompare(right.homeId)),
    deleteHomeIds: parsedMemberships
      .filter(
        (membership) =>
          membership.role === "OWNER" && membership.memberCount === 1,
      )
      .map((membership) => membership.homeId)
      .sort(),
    removeMembershipIds: parsedMemberships
      .filter((membership) => membership.role !== "OWNER")
      .map((membership) => membership.id)
      .sort(),
    cleanupScopes: ACCOUNT_DELETION_CLEANUP_SCOPES,
  };
}

function resolveRecoveredPropertyAccessUnchecked({
  recoveredUserId,
  recoveryProof,
  evaluatedAt,
  requestedHomeId,
  currentMemberships,
}: {
  recoveredUserId: string;
  recoveryProof: AccountRecoveryProofEvidence;
  evaluatedAt: string;
  requestedHomeId?: string | null;
  currentMemberships: unknown;
}): RecoveredPropertyAccessDecision {
  if (!isCanonicalId(recoveredUserId)) {
    return { status: "unavailable" };
  }

  const evaluationTime = parseEvaluationTime(evaluatedAt);
  const memberships = parseMemberships(
    recoveredUserId,
    currentMemberships,
  );
  if (
    evaluationTime === null ||
    memberships === null ||
    !hasValidRecoveryProof({
      recoveredUserId,
      recoveryProof,
      evaluatedAt: evaluationTime,
    })
  ) {
    return { status: "unavailable" };
  }

  if (
    requestedHomeId !== undefined &&
    requestedHomeId !== null &&
    !isCanonicalId(requestedHomeId)
  ) {
    return { status: "unavailable" };
  }

  const recovery: RecoveryPlan = {
    userId: recoveredUserId,
    consumeRecoveryProofId: recoveryProof.id,
    revokeExistingSessions: true,
    replaceOfflinePropertyKeys: true,
  };
  const activeMemberships = memberships.filter(
    (membership) => membership.active === true,
  );

  if (requestedHomeId !== undefined && requestedHomeId !== null) {
    const membership = activeMemberships.find(
      (candidate) => candidate.homeId === requestedHomeId,
    );

    return membership
      ? {
          status: "selected",
          recovery,
          membership: copyMembership(membership),
        }
      : { status: "unavailable" };
  }

  if (activeMemberships.length === 0) {
    return { status: "onboarding-required", recovery };
  }

  if (activeMemberships.length === 1) {
    return {
      status: "selected",
      recovery,
      membership: copyMembership(activeMemberships[0]),
    };
  }

  return {
    status: "selection-required",
    recovery,
    homeIds: activeMemberships
      .map((membership) => membership.homeId)
      .sort(),
  };
}


export function decideMultiPropertyAccountDeletion(
  input: Parameters<typeof decideMultiPropertyAccountDeletionUnchecked>[0],
): MultiPropertyAccountDeletionDecision {
  try {
    return decideMultiPropertyAccountDeletionUnchecked(input);
  } catch {
    return { status: "unavailable" };
  }
}

export function resolveRecoveredPropertyAccess(
  input: Parameters<typeof resolveRecoveredPropertyAccessUnchecked>[0],
): RecoveredPropertyAccessDecision {
  try {
    return resolveRecoveredPropertyAccessUnchecked(input);
  } catch {
    return { status: "unavailable" };
  }
}
