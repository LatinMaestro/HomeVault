import assert from "node:assert/strict";
import test from "node:test";

import {
  decideSocialLinkCompletion,
  decideSocialLinkStart,
  decideSocialUnlink,
  getEffectiveSocialLinkRequestStatus,
  type SocialCallbackEvidence,
  type SocialIdentityLink,
  type SocialLinkRequest,
} from "../src/lib/social-identity-linking-policy";

const now = new Date("2026-07-29T01:00:00.000Z");
const expiry = new Date("2026-07-29T01:10:00.000Z");
const request: SocialLinkRequest = {
  id: "social-link-1",
  userId: "user-1",
  initiatingSessionId: "session-1",
  provider: "apple",
  stateId: "state-1",
  nonceId: "nonce-1",
  pkceChallengeId: "pkce-1",
  status: "PENDING",
  expiresAt: expiry,
};
const callback: SocialCallbackEvidence = {
  requestId: "social-link-1",
  userId: "user-1",
  sessionId: "session-1",
  provider: "apple",
  providerSubject: "provider-subject-1",
  stateId: "state-1",
  nonceId: "nonce-1",
  pkceChallengeId: "pkce-1",
  stateVerified: true,
  nonceVerified: true,
  pkceVerified: true,
  issuerVerified: true,
  audienceVerified: true,
  signatureVerified: true,
  timestampsVerified: true,
};
const link: SocialIdentityLink = {
  id: "link-1",
  userId: "user-1",
  provider: "apple",
  providerSubject: "provider-subject-1",
};

test("starts only from an exactly verified and reconfirmed session", () => {
  const input = {
    currentUserId: "user-1",
    currentSessionId: "session-1",
    sessionVerified: true,
    emailVerified: true,
    credentialConfirmed: true,
    provider: "apple",
  };
  assert.deepEqual(decideSocialLinkStart(input), {
    status: "start-allowed",
    userId: "user-1",
    sessionId: "session-1",
    provider: "apple",
  });
  assert.deepEqual(
    decideSocialLinkStart({ ...input, sessionVerified: 1 as never }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideSocialLinkStart({ ...input, emailVerified: "yes" as never }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideSocialLinkStart({ ...input, credentialConfirmed: 1 as never }),
    { status: "credential-confirmation-required" },
  );
  assert.deepEqual(
    decideSocialLinkStart({ ...input, currentUserId: " user-1" }),
    { status: "unavailable" },
  );
});

test("allows only Apple and Google without runtime coercion", () => {
  const input = {
    currentUserId: "user-1",
    currentSessionId: "session-1",
    sessionVerified: true,
    emailVerified: true,
    credentialConfirmed: true,
    provider: "github",
  };
  assert.deepEqual(decideSocialLinkStart(input), {
    status: "provider-not-approved",
  });
  assert.deepEqual(
    decideSocialLinkStart({ ...input, provider: { toString: () => "apple" } }),
    { status: "provider-not-approved" },
  );
});

test("invalid request dates and shapes fail closed", () => {
  assert.equal(
    getEffectiveSocialLinkRequestStatus(
      { ...request, expiresAt: new Date("invalid") },
      now,
    ),
    "INVALID",
  );
  assert.equal(
    getEffectiveSocialLinkRequestStatus(request, new Date("invalid")),
    "INVALID",
  );
  assert.equal(getEffectiveSocialLinkRequestStatus(request, expiry), "EXPIRED");
});

test("links a fully bound callback to the immutable current user", () => {
  assert.deepEqual(
    decideSocialLinkCompletion({
      request,
      currentUserId: "user-1",
      currentSessionId: "session-1",
      sessionVerified: true,
      callback,
      existingLink: null,
      now,
    }),
    {
      status: "link-allowed",
      requestId: "social-link-1",
      userId: "user-1",
      sessionId: "session-1",
      provider: "apple",
      providerSubject: "provider-subject-1",
      linkedAt: now,
      transactionPlan: {
        consumeRequest: true,
        preserveUserId: true,
        preserveVerifiedEmail: true,
        mergeByProviderEmail: false,
        reassignExistingIdentity: false,
      },
    },
  );
});

test("request, user, session, provider, state, nonce and PKCE substitutions fail", () => {
  const base = {
    request,
    currentUserId: "user-1",
    currentSessionId: "session-1",
    sessionVerified: true,
    callback,
    existingLink: null,
    now,
  };
  const changes: Partial<SocialCallbackEvidence>[] = [
    { requestId: "other-request" },
    { userId: "other-user" },
    { sessionId: "other-session" },
    { provider: "google" },
    { stateId: "other-state" },
    { nonceId: "other-nonce" },
    { pkceChallengeId: "other-pkce" },
  ];
  for (const change of changes) {
    assert.deepEqual(
      decideSocialLinkCompletion({
        ...base,
        callback: { ...callback, ...change },
      }),
      { status: "invalid-callback" },
    );
  }
});

test("all callback cryptographic and token checks require exact true", () => {
  const base = {
    request,
    currentUserId: "user-1",
    currentSessionId: "session-1",
    sessionVerified: true,
    callback,
    existingLink: null,
    now,
  };
  for (const field of [
    "stateVerified",
    "nonceVerified",
    "pkceVerified",
    "issuerVerified",
    "audienceVerified",
    "signatureVerified",
    "timestampsVerified",
  ] as const) {
    assert.deepEqual(
      decideSocialLinkCompletion({
        ...base,
        callback: { ...callback, [field]: 1 as never },
      }),
      { status: "invalid-callback" },
    );
  }
  assert.deepEqual(
    decideSocialLinkCompletion({
      ...base,
      callback: { ...callback, stateConsumedAt: now },
    }),
    { status: "invalid-callback" },
  );
});

test("existing-link evidence must match the exact provider subject", () => {
  const base = {
    request,
    currentUserId: "user-1",
    currentSessionId: "session-1",
    sessionVerified: true,
    callback,
    now,
  };
  assert.deepEqual(
    decideSocialLinkCompletion({ ...base, existingLink: link }),
    { status: "already-linked" },
  );
  assert.deepEqual(
    decideSocialLinkCompletion({
      ...base,
      existingLink: { ...link, userId: "other-user" },
    }),
    { status: "provider-identity-unavailable" },
  );
  assert.deepEqual(
    decideSocialLinkCompletion({
      ...base,
      existingLink: { ...link, providerSubject: "other-subject" },
    }),
    { status: "unavailable" },
  );
});

test("expired and terminal link requests cannot be replayed", () => {
  const base = {
    request,
    currentUserId: "user-1",
    currentSessionId: "session-1",
    sessionVerified: true,
    callback,
    existingLink: null,
  };
  assert.deepEqual(decideSocialLinkCompletion({ ...base, now: expiry }), {
    status: "expired",
  });
  assert.deepEqual(
    decideSocialLinkCompletion({
      ...base,
      request: { ...request, status: "LINKED" },
      now,
    }),
    { status: "unavailable" },
  );
});

test("unlink requires an exact verified alternate sign-in record", () => {
  const input = {
    currentUserId: "user-1",
    currentSessionId: "session-1",
    sessionVerified: true,
    emailVerified: true,
    credentialConfirmed: true,
    link,
    alternateSignIn: {
      userId: "user-1",
      methodId: "password-1",
      verified: true,
    },
  };
  assert.deepEqual(decideSocialUnlink(input), {
    status: "unlink-allowed",
    linkId: "link-1",
    userId: "user-1",
    provider: "apple",
    providerSubject: "provider-subject-1",
    lifecyclePlan: {
      preserveUserId: true,
      revokeProviderSessions: true,
      notifyVerifiedEmail: true,
    },
  });
  assert.deepEqual(
    decideSocialUnlink({
      ...input,
      alternateSignIn: { ...input.alternateSignIn, verified: 1 as never },
    }),
    { status: "alternate-sign-in-required" },
  );
  assert.deepEqual(
    decideSocialUnlink({
      ...input,
      alternateSignIn: { ...input.alternateSignIn, userId: "other-user" },
    }),
    { status: "alternate-sign-in-required" },
  );
  assert.deepEqual(
    decideSocialUnlink({ ...input, credentialConfirmed: 1 as never }),
    { status: "credential-confirmation-required" },
  );
});

test("unlink rejects cross-user, malformed and last-method evidence", () => {
  const input = {
    currentUserId: "user-1",
    currentSessionId: "session-1",
    sessionVerified: true,
    emailVerified: true,
    credentialConfirmed: true,
    link,
    alternateSignIn: null,
  };
  assert.deepEqual(decideSocialUnlink(input), {
    status: "alternate-sign-in-required",
  });
  assert.deepEqual(
    decideSocialUnlink({ ...input, link: { ...link, userId: "other-user" } }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideSocialUnlink({ ...input, currentSessionId: " session-1" }),
    { status: "unavailable" },
  );
});
