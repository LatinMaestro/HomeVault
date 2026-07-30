import assert from "node:assert/strict";
import test from "node:test";

import { decideAdditionalPropertyCreation } from "../src/lib/property-creation-policy";

const validRequest = {
  currentUserId: "user-1",
  emailVerified: true,
  requestId: "property_retry_123456",
  draft: {
    name: "  Coast House  ",
    addressLine: "  12 Example Street  ",
    suburb: "  Burleigh Heads  ",
    state: "qld",
    postcode: "4220",
  },
};

test("returns an exact immutable atomic property and owner-membership plan", () => {
  const decision = decideAdditionalPropertyCreation(validRequest);

  assert.deepEqual(decision, {
    status: "creation-allowed",
    requestId: "property_retry_123456",
    ownerMembership: {
      userId: "user-1",
      role: "OWNER",
    },
    home: {
      name: "Coast House",
      addressLine: "12 Example Street",
      suburb: "Burleigh Heads",
      state: "QLD",
      postcode: "4220",
      country: "Australia",
    },
  });
  assert.equal(Object.isFrozen(decision), true);

  if (decision.status === "creation-allowed") {
    assert.equal(Object.isFrozen(decision.ownerMembership), true);
    assert.equal(Object.isFrozen(decision.home), true);
  }
});

test("requires a canonical current identity", () => {
  for (const currentUserId of [
    "",
    " user-1",
    "user-1 ",
    "user 1",
    "user\u200B1",
    "   ",
  ]) {
    assert.deepEqual(
      decideAdditionalPropertyCreation({
        ...validRequest,
        currentUserId,
      }),
      { status: "unavailable" },
    );
  }
});

test("requires an exact verified-email boolean", () => {
  assert.deepEqual(
    decideAdditionalPropertyCreation({
      ...validRequest,
      emailVerified: false,
    }),
    { status: "verification-required" },
  );

  assert.deepEqual(
    decideAdditionalPropertyCreation({
      ...validRequest,
      emailVerified: "true",
    }),
    { status: "verification-required" },
  );
});

test("requires a bounded string retry key", () => {
  for (const requestId of ["short", "property retry with spaces"]) {
    assert.deepEqual(
      decideAdditionalPropertyCreation({
        ...validRequest,
        requestId,
      }),
      { status: "invalid-request" },
    );
  }

  assert.deepEqual(
    decideAdditionalPropertyCreation({
      ...validRequest,
      requestId: 1234567890123456,
    }),
    { status: "invalid-request" },
  );
});

test("fails closed without throwing on malformed top-level runtime input", () => {
  for (const input of [null, undefined, [], "request"]) {
    assert.deepEqual(
      decideAdditionalPropertyCreation(input),
      { status: "unavailable" },
    );
  }

  const hostileInput = new Proxy(
    {},
    {
      getPrototypeOf() {
        throw new Error("hostile");
      },
    },
  );

  assert.deepEqual(
    decideAdditionalPropertyCreation(hostileInput),
    { status: "unavailable" },
  );
});

test("fails closed without throwing on malformed runtime drafts", () => {
  for (const draft of [
    null,
    [],
    { ...validRequest.draft, name: 42 },
    { ...validRequest.draft, suburb: 42 },
  ]) {
    assert.deepEqual(
      decideAdditionalPropertyCreation({
        ...validRequest,
        draft,
      }),
      { status: "invalid-request" },
    );
  }

  const hostileDraft = Object.defineProperty({}, "name", {
    get() {
      throw new Error("hostile");
    },
  });

  assert.deepEqual(
    decideAdditionalPropertyCreation({
      ...validRequest,
      draft: hostileDraft,
    }),
    { status: "invalid-request" },
  );
});

test("rejects invalid state, postcode, control, format and oversized text", () => {
  for (const draft of [
    { ...validRequest.draft, state: "California" },
    { ...validRequest.draft, postcode: "123" },
    { ...validRequest.draft, name: "Coast\nHouse" },
    { ...validRequest.draft, name: "Coast\u200BHouse" },
    { ...validRequest.draft, addressLine: "x".repeat(201) },
    { ...validRequest.draft, suburb: "x".repeat(101) },
  ]) {
    assert.deepEqual(
      decideAdditionalPropertyCreation({
        ...validRequest,
        draft,
      }),
      { status: "invalid-request" },
    );
  }
});

test("preserves empty optional fields inside the Australian boundary", () => {
  assert.deepEqual(
    decideAdditionalPropertyCreation({
      ...validRequest,
      draft: {
        name: "Rental",
        addressLine: " ",
        suburb: null,
        state: null,
        postcode: "",
      },
    }),
    {
      status: "creation-allowed",
      requestId: "property_retry_123456",
      ownerMembership: {
        userId: "user-1",
        role: "OWNER",
      },
      home: {
        name: "Rental",
        addressLine: null,
        suburb: null,
        state: null,
        postcode: null,
        country: "Australia",
      },
    },
  );
});
