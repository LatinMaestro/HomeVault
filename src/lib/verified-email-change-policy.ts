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
  | "EXPIRED";

export type EmailChangeLifecycle = {
  id: string;
  userId: string;
  currentEmail: string;
  newEmail: string;
  status: StoredEmailChangeStatus;
  expiresAt: Date;
  currentEmailApprovedAt?: Date | null;
  newEmailVerifiedAt?: Date | null;
  appliedAt?: Date | null;
};

export type EmailChangeRequestDecision =
  | {
      status: "request-allowed";
      userId: string;
      currentEmail: string;
      newEmail: string;
    }
  | {
      status: "unavailable";
    }
  | {
      status: "credential-confirmation-required";
    }
  | {
      status: "invalid-email";
    }
  | {
      status: "unchanged-email";
    }
  | {
      status: "email-unavailable";
    };

export type EmailChangeProof = "current-email-approval" | "new-email-verification";

export type EmailChangeProofDecision =
  | {
      status: "proof-accepted";
      proof: EmailChangeProof;
      acceptedAt: Date;
    }
  | {
      status: "unavailable";
    }
  | {
      status: "expired";
    }
  | {
      status: "already-confirmed";
    }
  | {
      status: "invalid-proof";
    };

export type EmailChangeApplicationDecision =
  | {
      status: "application-allowed";
      userId: string;
      newEmail: string;
      appliedAt: Date;
    }
  | {
      status: "unavailable";
    }
  | {
      status: "expired";
    }
  | {
      status: "proofs-required";
    }
  | {
      status: "email-unavailable";
    };

export function getEffectiveEmailChangeStatus(
  change: EmailChangeLifecycle,
  now = new Date(),
): EffectiveEmailChangeStatus {
  if (change.status !== "PENDING") {
    return change.status;
  }

  return change.expiresAt.getTime() <= now.getTime()
    ? "EXPIRED"
    : "PENDING";
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
  if (!currentUserId || !emailVerified) {
    return { status: "unavailable" };
  }

  if (!credentialConfirmed) {
    return { status: "credential-confirmation-required" };
  }

  if (validateHouseholdInvitationEmail(requestedEmail)) {
    return { status: "invalid-email" };
  }

  const normalizedCurrentEmail =
    normalizeHouseholdInvitationEmail(currentEmail);
  const normalizedRequestedEmail =
    normalizeHouseholdInvitationEmail(requestedEmail);

  if (!normalizedCurrentEmail) {
    return { status: "unavailable" };
  }

  if (normalizedCurrentEmail === normalizedRequestedEmail) {
    return { status: "unchanged-email" };
  }

  if (!requestedEmailAvailable) {
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
}: {
  change: EmailChangeLifecycle;
  currentUserId: string;
  currentVerifiedEmail: string;
}) {
  return (
    change.id &&
    change.userId === currentUserId &&
    normalizeHouseholdInvitationEmail(change.currentEmail) ===
      normalizeHouseholdInvitationEmail(currentVerifiedEmail)
  );
}

export function decideEmailChangeProof({
  change,
  currentUserId,
  currentVerifiedEmail,
  proof,
  tokenVerified,
  now = new Date(),
}: {
  change: EmailChangeLifecycle;
  currentUserId: string;
  currentVerifiedEmail: string;
  proof: EmailChangeProof;
  tokenVerified: boolean;
  now?: Date;
}): EmailChangeProofDecision {
  if (
    !hasMatchingCurrentIdentity({
      change,
      currentUserId,
      currentVerifiedEmail,
    })
  ) {
    return { status: "unavailable" };
  }

  const status = getEffectiveEmailChangeStatus(change, now);

  if (status === "EXPIRED") {
    return { status: "expired" };
  }

  if (status !== "PENDING") {
    return { status: "unavailable" };
  }

  if (!tokenVerified) {
    return { status: "invalid-proof" };
  }

  const alreadyConfirmed =
    proof === "current-email-approval"
      ? Boolean(change.currentEmailApprovedAt)
      : Boolean(change.newEmailVerifiedAt);

  if (alreadyConfirmed) {
    return { status: "already-confirmed" };
  }

  return {
    status: "proof-accepted",
    proof,
    acceptedAt: now,
  };
}

export function decideEmailChangeApplication({
  change,
  currentUserId,
  currentVerifiedEmail,
  requestedEmailAvailable,
  now = new Date(),
}: {
  change: EmailChangeLifecycle;
  currentUserId: string;
  currentVerifiedEmail: string;
  requestedEmailAvailable: boolean;
  now?: Date;
}): EmailChangeApplicationDecision {
  if (
    !hasMatchingCurrentIdentity({
      change,
      currentUserId,
      currentVerifiedEmail,
    })
  ) {
    return { status: "unavailable" };
  }

  const status = getEffectiveEmailChangeStatus(change, now);

  if (status === "EXPIRED") {
    return { status: "expired" };
  }

  if (status !== "PENDING") {
    return { status: "unavailable" };
  }

  if (!change.currentEmailApprovedAt || !change.newEmailVerifiedAt) {
    return { status: "proofs-required" };
  }

  if (!requestedEmailAvailable) {
    return { status: "email-unavailable" };
  }

  return {
    status: "application-allowed",
    userId: change.userId,
    newEmail: normalizeHouseholdInvitationEmail(change.newEmail),
    appliedAt: now,
  };
}
