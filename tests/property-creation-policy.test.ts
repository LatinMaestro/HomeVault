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

test("returns an exact atomic property and owner-membership plan", () => {
  assert.deepEqual(decideAdditionalPropertyCreation(validRequest), {
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
});

test("requires a canonical current identity", () => {
  for (const currentUserId of ["", " user-1", "user-1 ", "   "]) {
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
      emailVerified: "true" as unknown as boolean,
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
      requestId: 1234567890123456 as unknown as string,
    }),
    { status: "invalid-request" },
  );
});

test("fails closed without throwing on malformed runtime drafts", () => {
  for (const draft of [
    null,
    { ...validRequest.draft, name: 42 },
    { ...validRequest.draft, suburb: 42 },
  ]) {
    assert.deepEqual(
      decideAdditionalPropertyCreation({
        ...validRequest,
        draft: draft as unknown as typeof validRequest.draft,
      }),
      { status: "invalid-request" },
    );
  }
});

test("rejects invalid state, postcode, control characters and oversized text", () => {
  for (const draft of [
    { ...validRequest.draft, state: "California" },
    { ...validRequest.draft, postcode: "123" },
    { ...validRequest.draft, name: "Coast\nHouse" },
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
