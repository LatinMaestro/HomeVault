import {
  normalizeHouseholdInvitationEmail,
  validateHouseholdInvitationEmail,
} from "@/lib/household-invitation";

export type StoredEmailChangeStatus =
  | "PENDING"
  | "APPLIED"
  | "CANCELLED"
  | "SUPERSEDED";

export type EffectiveEmailChangeStatus =
  | StoredEmailChangeStatus
  | "EXPIRED"
  | "INVALID";

export type EmailChangeProof =
  | "current-email-approval"
  | "new-email-verification";

export type EmailChangeLifecycle = {
  id: string;
  userId: string;
  currentEmail: string;
  newEmail: string;
  status: StoredEmailChangeStatus;
  expiresAt: Date;
  currentEmailApprovedAt?: Date | null;
  currentEmailApprovalTokenId?: string | null;
  newEmailVerifiedAt?: Date | null;
  newEmailVerificationTokenId?: string | null;
  appliedAt?: Date | null;
};

export type EmailChangeTokenEvidence = {
  tokenId: string;
  changeId: string;
  userId: string;
  email: string;
  proof: EmailChangeProof;
  verified: boolean;
  expiresAt: Date;
  consumedAt?: Date | null;
};

export type EmailChangeRequestDecision =
  | {
      status: "request-allowed";
      userId: string;
      currentEmail: string;
      newEmail: string;
    }
  | { status: "unavailable" }
  | { status: "credential-confirmation-required" }
  | { status: "invalid-email" }
  | { status: "unchanged-email" }
  | { status: "email-unavailable" };

export type EmailChangeProofDecision =
  | {
      status: "proof-accepted";
      changeId: string;
      userId: string;
      tokenId: string;
      proof: EmailChangeProof;
      acceptedAt: Date;
    }
  | { status: "unavailable" }
  | { status: "expired" }
  | { status: "already-confirmed" }
  | { status: "invalid-proof" };

export type EmailChangeApplicationDecision =
  | {
      status: "application-allowed";
      changeId: string;
      userId: string;
      oldEmail: string;
      newEmail: string;
      appliedAt: Date;
      sessionPlan: {
        preserveCurrentSession: true;
        revokeOtherSessions: true;
      };
      lifecyclePlan: {
        markNewEmailVerified: true;
        supersedeSiblingRequests: true;
        notifyOldEmail: true;
      };
    }
  | { status: "unavailable" }
  | { status: "expired" }
  | { status: "proofs-required" }
  | { status: "email-unavailable" };

const APPROVED_STATUSES = new Set<StoredEmailChangeStatus>([
  "PENDING",
  "APPLIED",
  "CANCELLED",
  "SUPERSEDED",
]);
const APPROVED_PROOFS = new Set<EmailChangeProof>([
  "current-email-approval",
  "new-email-verification",
]);

function isCanonicalId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 128 &&
    value.trim() === value &&
    !/[\u0000-\u001f\u007f]/.test(value)
  );
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function normalizeValidEmail(value: unknown) {
  if (typeof value !== "string") return null;
  if (validateHouseholdInvitationEmail(value)) return null;
  return normalizeHouseholdInvitationEmail(value);
}

function isProof(value: unknown): value is EmailChangeProof {
  return APPROVED_PROOFS.has(value as EmailChangeProof);
}

function isLifecycleShapeValid(change: EmailChangeLifecycle) {
  const currentEmail = normalizeValidEmail(change?.currentEmail);
  const newEmail = normalizeValidEmail(change?.newEmail);
  return Boolean(
    change &&
      isCanonicalId(change.id) &&
      isCanonicalId(change.userId) &&
      currentEmail &&
      newEmail &&
      currentEmail !== newEmail &&
      APPROVED_STATUSES.has(change.status) &&
      isValidDate(change.expiresAt),
  );
}

export function getEffectiveEmailChangeStatus(
  change: EmailChangeLifecycle,
  now = new Date(),
): EffectiveEmailChangeStatus {
  if (!isLifecycleShapeValid(change) || !isValidDate(now)) {
    return "INVALID";
  }
  if (change.status !== "PENDING") {
    return change.status;
  }
  return change.expiresAt.getTime() <= now.getTime() ? "EXPIRED" : "PENDING";
}

export function decideEmailChangeRequest({
  currentUserId,
  currentEmail,
  emailVerified,
  credentialConfirmed,
  requestedEmail,
  requestedEmailAvailable,
}: {
  currentUserId: string;
  currentEmail: string;
  emailVerified: boolean;
  credentialConfirmed: boolean;
  requestedEmail: string;
  requestedEmailAvailable: boolean;
}): EmailChangeRequestDecision {
  if (!isCanonicalId(currentUserId) || emailVerified !== true) {
    return { status: "unavailable" };
  }
  if (credentialConfirmed !== true) {
    return { status: "credential-confirmation-required" };
  }

  const normalizedCurrentEmail = normalizeValidEmail(currentEmail);
  const normalizedRequestedEmail = normalizeValidEmail(requestedEmail);
  if (!normalizedCurrentEmail) return { status: "unavailable" };
  if (!normalizedRequestedEmail) return { status: "invalid-email" };
  if (normalizedCurrentEmail === normalizedRequestedEmail) {
    return { status: "unchanged-email" };
  }
  if (requestedEmailAvailable !== true) {
    return { status: "email-unavailable" };
  }

  return {
    status: "request-allowed",
    userId: currentUserId,
    currentEmail: normalizedCurrentEmail,
    newEmail: normalizedRequestedEmail,
  };
}

function hasMatchingCurrentIdentity({
  change,
  currentUserId,
  currentVerifiedEmail,
  sessionVerified,
}: {
  change: EmailChangeLifecycle;
  currentUserId: string;
  currentVerifiedEmail: string;
  sessionVerified: boolean;
}) {
  const currentEmail = normalizeValidEmail(currentVerifiedEmail);
  return Boolean(
    sessionVerified === true &&
      isLifecycleShapeValid(change) &&
      isCanonicalId(currentUserId) &&
      change.userId === currentUserId &&
      currentEmail &&
      normalizeValidEmail(change.currentEmail) === currentEmail,
  );
}

function expectedProofEmail(change: EmailChangeLifecycle, proof: EmailChangeProof) {
  return proof === "current-email-approval"
    ? normalizeValidEmail(change.currentEmail)
    : normalizeValidEmail(change.newEmail);
}

export function decideEmailChangeProof({
  change,
  currentUserId,
  currentVerifiedEmail,
  sessionVerified,
  token,
  now = new Date(),
}: {
  change: EmailChangeLifecycle;
  currentUserId: string;
  currentVerifiedEmail: string;
  sessionVerified: boolean;
  token: EmailChangeTokenEvidence;
  now?: Date;
}): EmailChangeProofDecision {
  if (
    !hasMatchingCurrentIdentity({
      change,
      currentUserId,
      currentVerifiedEmail,
      sessionVerified,
    }) ||
    !isValidDate(now)
  ) {
    return { status: "unavailable" };
  }

  const status = getEffectiveEmailChangeStatus(change, now);
  if (status === "EXPIRED") return { status: "expired" };
  if (status !== "PENDING") return { status: "unavailable" };

  if (
    !token ||
    token.verified !== true ||
    !isCanonicalId(token.tokenId) ||
    token.changeId !== change.id ||
    token.userId !== change.userId ||
    !isProof(token.proof) ||
    normalizeValidEmail(token.email) !== expectedProofEmail(change, token.proof) ||
    !isValidDate(token.expiresAt) ||
    token.expiresAt.getTime() > change.expiresAt.getTime() ||
    token.expiresAt.getTime() <= now.getTime() ||
    (token.consumedAt !== null && token.consumedAt !== undefined)
  ) {
    return { status: "invalid-proof" };
  }

  const alreadyConfirmed =
    token.proof === "current-email-approval"
      ? change.currentEmailApprovedAt != null ||
        change.currentEmailApprovalTokenId != null
      : change.newEmailVerifiedAt != null ||
        change.newEmailVerificationTokenId != null;
  if (alreadyConfirmed) return { status: "already-confirmed" };

  return {
    status: "proof-accepted",
    changeId: change.id,
    userId: change.userId,
    tokenId: token.tokenId,
    proof: token.proof,
    acceptedAt: now,
  };
}

function hasCoherentRecordedProofs(change: EmailChangeLifecycle, now: Date) {
  const entries = [
    [change.currentEmailApprovedAt, change.currentEmailApprovalTokenId],
    [change.newEmailVerifiedAt, change.newEmailVerificationTokenId],
  ] as const;
  if (
    !entries.every(
      ([acceptedAt, tokenId]) =>
        isValidDate(acceptedAt) &&
        isCanonicalId(tokenId) &&
        acceptedAt.getTime() <= now.getTime() &&
        acceptedAt.getTime() < change.expiresAt.getTime(),
    )
  ) {
    return false;
  }
  return entries[0][1] !== entries[1][1];
}

export function decideEmailChangeApplication({
  change,
  currentUserId,
  currentVerifiedEmail,
  sessionVerified,
  requestedEmailAvailable,
  now = new Date(),
}: {
  change: EmailChangeLifecycle;
  currentUserId: string;
  currentVerifiedEmail: string;
  sessionVerified: boolean;
  requestedEmailAvailable: boolean;
  now?: Date;
}): EmailChangeApplicationDecision {
  if (
    !hasMatchingCurrentIdentity({
      change,
      currentUserId,
      currentVerifiedEmail,
      sessionVerified,
    }) ||
    !isValidDate(now)
  ) {
    return { status: "unavailable" };
  }

  const status = getEffectiveEmailChangeStatus(change, now);
  if (status === "EXPIRED") return { status: "expired" };
  if (status !== "PENDING") return { status: "unavailable" };
  if (!hasCoherentRecordedProofs(change, now)) {
    return { status: "proofs-required" };
  }
  if (requestedEmailAvailable !== true) {
    return { status: "email-unavailable" };
  }

  return {
    status: "application-allowed",
    changeId: change.id,
    userId: change.userId,
    oldEmail: normalizeValidEmail(change.currentEmail)!,
    newEmail: normalizeValidEmail(change.newEmail)!,
    appliedAt: now,
    sessionPlan: {
      preserveCurrentSession: true,
      revokeOtherSessions: true,
    },
    lifecyclePlan: {
      markNewEmailVerified: true,
      supersedeSiblingRequests: true,
      notifyOldEmail: true,
    },
  };
}
