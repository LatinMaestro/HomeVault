import assert from "node:assert/strict";
import test from "node:test";

import {
  decideSocialLinkCompletion,
  decideSocialLinkStart,
  decideSocialUnlink,
  getEffectiveSocialLinkRequestStatus,
  type SocialLinkRequest,
} from "../src/lib/social-identity-linking-policy";

const now = new Date("2026-07-27T00:00:00.000Z");

const pendingRequest: SocialLinkRequest = {
  id: "social-link-1",
  userId: "user-1",
  initiatingSessionId: "session-1",
  provider: "apple",
  status: "PENDING",
  expiresAt: new Date("2026-07-27T00:10:00.000Z"),
};

test("starts an approved provider link only from a verified reconfirmed session", () => {
  assert.deepEqual(
    decideSocialLinkStart({
      currentUserId: "user-1",
      currentSessionId: "session-1",
      emailVerified: true,
      credentialConfirmed: true,
      provider: "apple",
    }),
    {
      status: "start-allowed",
      userId: "user-1",
      sessionId: "session-1",
      provider: "apple",
    },
  );

  assert.deepEqual(
    decideSocialLinkStart({
      currentUserId: "user-1",
      currentSessionId: "session-1",
      emailVerified: false,
      credentialConfirmed: true,
      provider: "apple",
    }),
    { status: "unavailable" },
  );

  assert.deepEqual(
    decideSocialLinkStart({
      currentUserId: "user-1",
      currentSessionId: "session-1",
      emailVerified: true,
      credentialConfirmed: false,
      provider: "apple",
    }),
    { status: "credential-confirmation-required" },
  );

  assert.deepEqual(
    decideSocialLinkStart({
      currentUserId: "user-1",
      currentSessionId: "session-1",
      emailVerified: true,
      credentialConfirmed: true,
      provider: "unapproved",
    }),
    { status: "provider-not-approved" },
  );
});

test("expires a pending social-link request at the exact deadline", () => {
  assert.equal(
    getEffectiveSocialLinkRequestStatus(
      pendingRequest,
      new Date("2026-07-27T00:09:59.999Z"),
    ),
    "PENDING",
  );
  assert.equal(
    getEffectiveSocialLinkRequestStatus(
      pendingRequest,
      pendingRequest.expiresAt,
    ),
    "EXPIRED",
  );
});

test("links a verified provider subject to the immutable current user", () => {
  assert.deepEqual(
    decideSocialLinkCompletion({
      request: pendingRequest,
      currentUserId: "user-1",
      currentSessionId: "session-1",
      callbackProvider: "apple",
      providerSubject: " provider-subject-1 ",
      stateVerified: true,
      nonceVerified: true,
      pkceVerified: true,
      existingLinkUserId: null,
      now,
    }),
    {
      status: "link-allowed",
      userId: "user-1",
      provider: "apple",
      providerSubject: "provider-subject-1",
      linkedAt: now,
    },
  );
});

test("rejects session swaps, provider swaps and incomplete callback proofs", () => {
  const completion = {
    request: pendingRequest,
    currentUserId: "user-1",
    currentSessionId: "session-1",
    callbackProvider: "apple",
    providerSubject: "provider-subject-1",
    stateVerified: true,
    nonceVerified: true,
    pkceVerified: true,
    existingLinkUserId: null,
    now,
  };

  assert.deepEqual(
    decideSocialLinkCompletion({
      ...completion,
      currentSessionId: "other-session",
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideSocialLinkCompletion({
      ...completion,
      callbackProvider: "google",
    }),
    { status: "invalid-callback" },
  );
  assert.deepEqual(
    decideSocialLinkCompletion({
      ...completion,
      nonceVerified: false,
    }),
    { status: "invalid-callback" },
  );
  assert.deepEqual(
    decideSocialLinkCompletion({
      ...completion,
      pkceVerified: false,
    }),
    { status: "invalid-callback" },
  );
  assert.deepEqual(
    decideSocialLinkCompletion({
      ...completion,
      stateVerified: false,
    }),
    { status: "invalid-callback" },
  );
});

test("never merges accounts by provider email or reassigns an existing identity", () => {
  const completion = {
    request: pendingRequest,
    currentUserId: "user-1",
    currentSessionId: "session-1",
    callbackProvider: "apple",
    providerSubject: "provider-subject-1",
    stateVerified: true,
    nonceVerified: true,
    pkceVerified: true,
    now,
  };

  assert.deepEqual(
    decideSocialLinkCompletion({
      ...completion,
      existingLinkUserId: "user-1",
    }),
    { status: "already-linked" },
  );
  assert.deepEqual(
    decideSocialLinkCompletion({
      ...completion,
      existingLinkUserId: "other-user",
    }),
    { status: "provider-identity-unavailable" },
  );
});

test("rejects expired and terminal request replay", () => {
  const completion = {
    request: pendingRequest,
    currentUserId: "user-1",
    currentSessionId: "session-1",
    callbackProvider: "apple",
    providerSubject: "provider-subject-1",
    stateVerified: true,
    nonceVerified: true,
    pkceVerified: true,
    existingLinkUserId: null,
  };

  assert.deepEqual(
    decideSocialLinkCompletion({
      ...completion,
      now: pendingRequest.expiresAt,
    }),
    { status: "expired" },
  );
  assert.deepEqual(
    decideSocialLinkCompletion({
      ...completion,
      request: { ...pendingRequest, status: "LINKED" },
      now,
    }),
    { status: "unavailable" },
  );
});

test("unlink requires reconfirmation and another verified sign-in method", () => {
  const unlink = {
    currentUserId: "user-1",
    emailVerified: true,
    credentialConfirmed: true,
    provider: "apple",
    linkedUserId: "user-1",
    alternateVerifiedSignInMethods: 1,
  };

  assert.deepEqual(decideSocialUnlink(unlink), {
    status: "unlink-allowed",
    userId: "user-1",
    provider: "apple",
  });
  assert.deepEqual(
    decideSocialUnlink({ ...unlink, credentialConfirmed: false }),
    { status: "credential-confirmation-required" },
  );
  assert.deepEqual(
    decideSocialUnlink({ ...unlink, alternateVerifiedSignInMethods: 0 }),
    { status: "alternate-sign-in-required" },
  );
  assert.deepEqual(
    decideSocialUnlink({ ...unlink, linkedUserId: "other-user" }),
    { status: "unavailable" },
  );
});
