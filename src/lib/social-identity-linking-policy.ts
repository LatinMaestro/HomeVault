export const APPROVED_SOCIAL_IDENTITY_PROVIDERS = [
  "apple",
  "google",
] as const;

export type SocialIdentityProvider =
  (typeof APPROVED_SOCIAL_IDENTITY_PROVIDERS)[number];

export type StoredSocialLinkRequestStatus =
  | "PENDING"
  | "LINKED"
  | "CANCELLED"
  | "SUPERSEDED";

export type EffectiveSocialLinkRequestStatus =
  | StoredSocialLinkRequestStatus
  | "EXPIRED"
  | "INVALID";

export type SocialLinkRequest = {
  id: string;
  userId: string;
  initiatingSessionId: string;
  provider: SocialIdentityProvider;
  stateId: string;
  nonceId: string;
  pkceChallengeId: string;
  status: StoredSocialLinkRequestStatus;
  expiresAt: Date;
};

export type SocialCallbackEvidence = {
  requestId: string;
  userId: string;
  sessionId: string;
  provider: SocialIdentityProvider;
  providerSubject: string;
  stateId: string;
  nonceId: string;
  pkceChallengeId: string;
  stateVerified: boolean;
  nonceVerified: boolean;
  pkceVerified: boolean;
  issuerVerified: boolean;
  audienceVerified: boolean;
  signatureVerified: boolean;
  timestampsVerified: boolean;
  stateConsumedAt?: Date | null;
};

export type SocialIdentityLink = {
  id: string;
  userId: string;
  provider: SocialIdentityProvider;
  providerSubject: string;
};

export type AlternateSignInEvidence = {
  userId: string;
  methodId: string;
  verified: boolean;
};

export type SocialLinkStartDecision =
  | {
      status: "start-allowed";
      userId: string;
      sessionId: string;
      provider: SocialIdentityProvider;
    }
  | { status: "unavailable" }
  | { status: "credential-confirmation-required" }
  | { status: "provider-not-approved" };

export type SocialLinkCompletionDecision =
  | {
      status: "link-allowed";
      requestId: string;
      userId: string;
      sessionId: string;
      provider: SocialIdentityProvider;
      providerSubject: string;
      linkedAt: Date;
      transactionPlan: {
        consumeRequest: true;
        preserveUserId: true;
        preserveVerifiedEmail: true;
        mergeByProviderEmail: false;
        reassignExistingIdentity: false;
      };
    }
  | { status: "unavailable" }
  | { status: "expired" }
  | { status: "invalid-callback" }
  | { status: "provider-identity-unavailable" }
  | { status: "already-linked" };

export type SocialUnlinkDecision =
  | {
      status: "unlink-allowed";
      linkId: string;
      userId: string;
      provider: SocialIdentityProvider;
      providerSubject: string;
      lifecyclePlan: {
        preserveUserId: true;
        revokeProviderSessions: true;
        notifyVerifiedEmail: true;
      };
    }
  | { status: "unavailable" }
  | { status: "credential-confirmation-required" }
  | { status: "alternate-sign-in-required" };

const APPROVED_STATUSES = new Set<StoredSocialLinkRequestStatus>([
  "PENDING",
  "LINKED",
  "CANCELLED",
  "SUPERSEDED",
]);
const APPROVED_PROVIDERS = new Set<SocialIdentityProvider>(
  APPROVED_SOCIAL_IDENTITY_PROVIDERS,
);

function isCanonicalIdentifier(
  value: unknown,
  maximumLength = 128,
): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= maximumLength &&
    value.trim() === value &&
    !/[\u0000-\u001f\u007f]/.test(value)
  );
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

export function isApprovedSocialIdentityProvider(
  provider: unknown,
): provider is SocialIdentityProvider {
  return APPROVED_PROVIDERS.has(provider as SocialIdentityProvider);
}

function isRequestShapeValid(request: SocialLinkRequest) {
  return Boolean(
    request &&
      isCanonicalIdentifier(request.id) &&
      isCanonicalIdentifier(request.userId) &&
      isCanonicalIdentifier(request.initiatingSessionId) &&
      isApprovedSocialIdentityProvider(request.provider) &&
      isCanonicalIdentifier(request.stateId) &&
      isCanonicalIdentifier(request.nonceId) &&
      isCanonicalIdentifier(request.pkceChallengeId) &&
      APPROVED_STATUSES.has(request.status) &&
      isValidDate(request.expiresAt),
  );
}

export function getEffectiveSocialLinkRequestStatus(
  request: SocialLinkRequest,
  now = new Date(),
): EffectiveSocialLinkRequestStatus {
  if (!isRequestShapeValid(request) || !isValidDate(now)) return "INVALID";
  if (request.status !== "PENDING") return request.status;
  return request.expiresAt.getTime() <= now.getTime() ? "EXPIRED" : "PENDING";
}

export function decideSocialLinkStart({
  currentUserId,
  currentSessionId,
  sessionVerified,
  emailVerified,
  credentialConfirmed,
  provider,
}: {
  currentUserId: string;
  currentSessionId: string;
  sessionVerified: boolean;
  emailVerified: boolean;
  credentialConfirmed: boolean;
  provider: unknown;
}): SocialLinkStartDecision {
  if (
    !isCanonicalIdentifier(currentUserId) ||
    !isCanonicalIdentifier(currentSessionId) ||
    sessionVerified !== true ||
    emailVerified !== true
  ) {
    return { status: "unavailable" };
  }
  if (credentialConfirmed !== true) {
    return { status: "credential-confirmation-required" };
  }
  if (!isApprovedSocialIdentityProvider(provider)) {
    return { status: "provider-not-approved" };
  }
  return {
    status: "start-allowed",
    userId: currentUserId,
    sessionId: currentSessionId,
    provider,
  };
}

function callbackMatchesRequest(
  request: SocialLinkRequest,
  callback: SocialCallbackEvidence,
) {
  return Boolean(
    callback &&
      callback.requestId === request.id &&
      callback.userId === request.userId &&
      callback.sessionId === request.initiatingSessionId &&
      callback.provider === request.provider &&
      isCanonicalIdentifier(callback.providerSubject, 255) &&
      callback.stateId === request.stateId &&
      callback.nonceId === request.nonceId &&
      callback.pkceChallengeId === request.pkceChallengeId &&
      callback.stateVerified === true &&
      callback.nonceVerified === true &&
      callback.pkceVerified === true &&
      callback.issuerVerified === true &&
      callback.audienceVerified === true &&
      callback.signatureVerified === true &&
      callback.timestampsVerified === true &&
      (callback.stateConsumedAt === null ||
        callback.stateConsumedAt === undefined),
  );
}

function isExistingLinkEvidenceValid(
  link: SocialIdentityLink,
  request: SocialLinkRequest,
  providerSubject: string,
) {
  return Boolean(
    link &&
      isCanonicalIdentifier(link.id) &&
      isCanonicalIdentifier(link.userId) &&
      link.provider === request.provider &&
      link.providerSubject === providerSubject,
  );
}

export function decideSocialLinkCompletion({
  request,
  currentUserId,
  currentSessionId,
  sessionVerified,
  callback,
  existingLink,
  now = new Date(),
}: {
  request: SocialLinkRequest;
  currentUserId: string;
  currentSessionId: string;
  sessionVerified: boolean;
  callback: SocialCallbackEvidence;
  existingLink: SocialIdentityLink | null;
  now?: Date;
}): SocialLinkCompletionDecision {
  if (
    sessionVerified !== true ||
    !isCanonicalIdentifier(currentUserId) ||
    !isCanonicalIdentifier(currentSessionId) ||
    !isRequestShapeValid(request) ||
    request.userId !== currentUserId ||
    request.initiatingSessionId !== currentSessionId ||
    !isValidDate(now)
  ) {
    return { status: "unavailable" };
  }

  const status = getEffectiveSocialLinkRequestStatus(request, now);
  if (status === "EXPIRED") return { status: "expired" };
  if (status !== "PENDING") return { status: "unavailable" };
  if (!callbackMatchesRequest(request, callback)) {
    return { status: "invalid-callback" };
  }

  if (existingLink !== null) {
    if (
      !isExistingLinkEvidenceValid(
        existingLink,
        request,
        callback.providerSubject,
      )
    ) {
      return { status: "unavailable" };
    }
    return existingLink.userId === currentUserId
      ? { status: "already-linked" }
      : { status: "provider-identity-unavailable" };
  }

  return {
    status: "link-allowed",
    requestId: request.id,
    userId: request.userId,
    sessionId: request.initiatingSessionId,
    provider: request.provider,
    providerSubject: callback.providerSubject,
    linkedAt: now,
    transactionPlan: {
      consumeRequest: true,
      preserveUserId: true,
      preserveVerifiedEmail: true,
      mergeByProviderEmail: false,
      reassignExistingIdentity: false,
    },
  };
}

function isLinkShapeValid(link: SocialIdentityLink) {
  return Boolean(
    link &&
      isCanonicalIdentifier(link.id) &&
      isCanonicalIdentifier(link.userId) &&
      isApprovedSocialIdentityProvider(link.provider) &&
      isCanonicalIdentifier(link.providerSubject, 255),
  );
}

export function decideSocialUnlink({
  currentUserId,
  currentSessionId,
  sessionVerified,
  emailVerified,
  credentialConfirmed,
  link,
  alternateSignIn,
}: {
  currentUserId: string;
  currentSessionId: string;
  sessionVerified: boolean;
  emailVerified: boolean;
  credentialConfirmed: boolean;
  link: SocialIdentityLink;
  alternateSignIn: AlternateSignInEvidence | null;
}): SocialUnlinkDecision {
  if (
    !isCanonicalIdentifier(currentUserId) ||
    !isCanonicalIdentifier(currentSessionId) ||
    sessionVerified !== true ||
    emailVerified !== true ||
    !isLinkShapeValid(link) ||
    link.userId !== currentUserId
  ) {
    return { status: "unavailable" };
  }
  if (credentialConfirmed !== true) {
    return { status: "credential-confirmation-required" };
  }
  if (
    !alternateSignIn ||
    alternateSignIn.userId !== currentUserId ||
    !isCanonicalIdentifier(alternateSignIn.methodId) ||
    alternateSignIn.methodId === link.id ||
    alternateSignIn.verified !== true
  ) {
    return { status: "alternate-sign-in-required" };
  }
  return {
    status: "unlink-allowed",
    linkId: link.id,
    userId: currentUserId,
    provider: link.provider,
    providerSubject: link.providerSubject,
    lifecyclePlan: {
      preserveUserId: true,
      revokeProviderSessions: true,
      notifyVerifiedEmail: true,
    },
  };
}
