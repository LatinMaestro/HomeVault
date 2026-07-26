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

test("normalizes an Australian property and derives OWNER identity from the current user", () => {
  assert.deepEqual(decideAdditionalPropertyCreation(validRequest), {
    status: "creation-allowed",
    requestId: "property_retry_123456",
    ownerUserId: "user-1",
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

test("requires a current verified identity", () => {
  assert.deepEqual(
    decideAdditionalPropertyCreation({
      ...validRequest,
      currentUserId: "",
    }),
    { status: "unavailable" },
  );

  assert.deepEqual(
    decideAdditionalPropertyCreation({
      ...validRequest,
      emailVerified: false,
    }),
    { status: "verification-required" },
  );
});

test("requires a bounded retry key for idempotent persistence", () => {
  assert.deepEqual(
    decideAdditionalPropertyCreation({
      ...validRequest,
      requestId: "short",
    }),
    { status: "invalid-request" },
  );

  assert.deepEqual(
    decideAdditionalPropertyCreation({
      ...validRequest,
      requestId: "property retry with spaces",
    }),
    { status: "invalid-request" },
  );
});

test("rejects invalid property names, states and Australian postcodes", () => {
  assert.deepEqual(
    decideAdditionalPropertyCreation({
      ...validRequest,
      draft: { ...validRequest.draft, name: " " },
    }),
    { status: "invalid-request" },
  );

  assert.deepEqual(
    decideAdditionalPropertyCreation({
      ...validRequest,
      draft: { ...validRequest.draft, state: "California" },
    }),
    { status: "invalid-request" },
  );

  assert.deepEqual(
    decideAdditionalPropertyCreation({
      ...validRequest,
      draft: { ...validRequest.draft, postcode: "123" },
    }),
    { status: "invalid-request" },
  );
});

test("keeps optional address fields empty without changing the country boundary", () => {
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
      ownerUserId: "user-1",
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
