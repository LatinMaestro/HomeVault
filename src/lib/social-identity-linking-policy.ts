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
  | "EXPIRED";

export type SocialLinkRequest = {
  id: string;
  userId: string;
  initiatingSessionId: string;
  provider: SocialIdentityProvider;
  status: StoredSocialLinkRequestStatus;
  expiresAt: Date;
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
      userId: string;
      provider: SocialIdentityProvider;
      providerSubject: string;
      linkedAt: Date;
    }
  | { status: "unavailable" }
  | { status: "expired" }
  | { status: "invalid-callback" }
  | { status: "provider-identity-unavailable" }
  | { status: "already-linked" };

export type SocialUnlinkDecision =
  | {
      status: "unlink-allowed";
      userId: string;
      provider: SocialIdentityProvider;
    }
  | { status: "unavailable" }
  | { status: "credential-confirmation-required" }
  | { status: "alternate-sign-in-required" };

export function isApprovedSocialIdentityProvider(
  provider: string,
): provider is SocialIdentityProvider {
  return APPROVED_SOCIAL_IDENTITY_PROVIDERS.includes(
    provider as SocialIdentityProvider,
  );
}

export function getEffectiveSocialLinkRequestStatus(
  request: SocialLinkRequest,
  now = new Date(),
): EffectiveSocialLinkRequestStatus {
  if (request.status !== "PENDING") {
    return request.status;
  }

  return request.expiresAt.getTime() <= now.getTime()
    ? "EXPIRED"
    : "PENDING";
}

export function decideSocialLinkStart({
  currentUserId,
  currentSessionId,
  emailVerified,
  credentialConfirmed,
  provider,
}: {
  currentUserId: string;
  currentSessionId: string;
  emailVerified: boolean;
  credentialConfirmed: boolean;
  provider: string;
}): SocialLinkStartDecision {
  if (!currentUserId || !currentSessionId || !emailVerified) {
    return { status: "unavailable" };
  }

  if (!credentialConfirmed) {
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

export function decideSocialLinkCompletion({
  request,
  currentUserId,
  currentSessionId,
  callbackProvider,
  providerSubject,
  stateVerified,
  nonceVerified,
  pkceVerified,
  existingLinkUserId,
  now = new Date(),
}: {
  request: SocialLinkRequest;
  currentUserId: string;
  currentSessionId: string;
  callbackProvider: string;
  providerSubject: string;
  stateVerified: boolean;
  nonceVerified: boolean;
  pkceVerified: boolean;
  existingLinkUserId: string | null;
  now?: Date;
}): SocialLinkCompletionDecision {
  if (
    !request.id ||
    !currentUserId ||
    !currentSessionId ||
    request.userId !== currentUserId ||
    request.initiatingSessionId !== currentSessionId
  ) {
    return { status: "unavailable" };
  }

  const status = getEffectiveSocialLinkRequestStatus(request, now);

  if (status === "EXPIRED") {
    return { status: "expired" };
  }

  if (status !== "PENDING") {
    return { status: "unavailable" };
  }

  if (
    callbackProvider !== request.provider ||
    !providerSubject.trim() ||
    !stateVerified ||
    !nonceVerified ||
    !pkceVerified
  ) {
    return { status: "invalid-callback" };
  }

  if (existingLinkUserId === currentUserId) {
    return { status: "already-linked" };
  }

  if (existingLinkUserId) {
    return { status: "provider-identity-unavailable" };
  }

  return {
    status: "link-allowed",
    userId: request.userId,
    provider: request.provider,
    providerSubject: providerSubject.trim(),
    linkedAt: now,
  };
}

export function decideSocialUnlink({
  currentUserId,
  emailVerified,
  credentialConfirmed,
  provider,
  linkedUserId,
  alternateVerifiedSignInMethods,
}: {
  currentUserId: string;
  emailVerified: boolean;
  credentialConfirmed: boolean;
  provider: string;
  linkedUserId: string;
  alternateVerifiedSignInMethods: number;
}): SocialUnlinkDecision {
  if (
    !currentUserId ||
    !emailVerified ||
    linkedUserId !== currentUserId ||
    !isApprovedSocialIdentityProvider(provider)
  ) {
    return { status: "unavailable" };
  }

  if (!credentialConfirmed) {
    return { status: "credential-confirmation-required" };
  }

  if (
    !Number.isInteger(alternateVerifiedSignInMethods) ||
    alternateVerifiedSignInMethods < 1
  ) {
    return { status: "alternate-sign-in-required" };
  }

  return {
    status: "unlink-allowed",
    userId: currentUserId,
    provider,
  };
}
