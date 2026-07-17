import assert from "node:assert/strict";
import test from "node:test";

import { isAuthRuntimeConfigured, isAuthSignupEnabled } from "../src/lib/auth-config";

const keys = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "AUTH_SIGNUP_ENABLED",
  "AUTH_EMAIL_FROM",
  "AUTH_EMAIL_PROVIDER",
] as const;

function withEnvironment(
  values: Partial<Record<(typeof keys)[number], string>>,
  callback: () => void,
) {
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

  for (const key of keys) {
    delete process.env[key];
  }
  Object.assign(process.env, values);

  try {
    callback();
  } finally {
    for (const key of keys) {
      const value = previous[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("auth runtime requires database, secret and base URL", () => {
  withEnvironment({}, () => assert.equal(isAuthRuntimeConfigured(), false));
  withEnvironment(
    {
      DATABASE_URL: "postgresql://example",
      BETTER_AUTH_SECRET: "test-secret",
    },
    () => assert.equal(isAuthRuntimeConfigured(), false),
  );
  withEnvironment(
    {
      DATABASE_URL: "postgresql://example",
      BETTER_AUTH_SECRET: "test-secret",
      BETTER_AUTH_URL: "https://homevault.example",
    },
    () => assert.equal(isAuthRuntimeConfigured(), true),
  );
});

test("signup requires explicit enablement and configured email delivery", () => {
  const base = {
    AUTH_SIGNUP_ENABLED: "true",
    AUTH_EMAIL_FROM: "HomeVault <accounts@example.com>",
  };

  withEnvironment(base, () => assert.equal(isAuthSignupEnabled(), false));
  withEnvironment(
    { ...base, AUTH_EMAIL_PROVIDER: "disabled" },
    () => assert.equal(isAuthSignupEnabled(), false),
  );
  withEnvironment(
    { ...base, AUTH_EMAIL_PROVIDER: "resend" },
    () => assert.equal(isAuthSignupEnabled(), true),
  );
  withEnvironment(
    {
      ...base,
      AUTH_EMAIL_PROVIDER: "resend",
      AUTH_SIGNUP_ENABLED: "TRUE",
    },
    () => assert.equal(isAuthSignupEnabled(), false),
  );
});
