import assert from "node:assert/strict";
import test from "node:test";

import {
  canonicalProductionOrigin,
  getProductionReadinessConfiguration,
  isProductionConfigurationReady,
} from "../src/lib/production-readiness";

const keys = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "AUTH_EMAIL_PROVIDER",
  "AUTH_EMAIL_FROM",
  "RESEND_API_KEY",
  "BLOB_READ_WRITE_TOKEN",
  "VERCEL_OIDC_TOKEN",
  "HOMEVAULT_PREVIEW_DATABASE_ACCESS",
] as const;

function withEnvironment(
  values: Partial<Record<(typeof keys)[number], string>>,
  callback: () => void,
) {
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

  for (const key of keys) delete process.env[key];
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

const completeConfiguration = {
  DATABASE_URL: "postgresql://example",
  BETTER_AUTH_SECRET: "test-secret",
  BETTER_AUTH_URL: canonicalProductionOrigin,
  AUTH_EMAIL_PROVIDER: "resend",
  AUTH_EMAIL_FROM: "HomeVault <accounts@example.com>",
  RESEND_API_KEY: "re_test",
  BLOB_READ_WRITE_TOKEN: "vercel_blob_test",
};

test("production readiness requires every approved runtime service", () => {
  withEnvironment(completeConfiguration, () => {
    const configuration = getProductionReadinessConfiguration();
    assert.deepEqual(configuration, {
      auth: true,
      email: true,
      attachments: true,
      canonicalUrl: true,
      previewModeDisabled: true,
    });
    assert.equal(isProductionConfigurationReady(configuration), true);
  });
});

test("production readiness fails closed for preview mode or a non-canonical auth URL", () => {
  withEnvironment(
    {
      ...completeConfiguration,
      HOMEVAULT_PREVIEW_DATABASE_ACCESS: "enabled",
    },
    () => assert.equal(isProductionConfigurationReady(), false),
  );

  withEnvironment(
    {
      ...completeConfiguration,
      BETTER_AUTH_URL: "https://preview.example.com",
    },
    () => assert.equal(isProductionConfigurationReady(), false),
  );
});

test("production readiness never treats partial service setup as ready", () => {
  withEnvironment(
    {
      DATABASE_URL: "postgresql://example",
      BETTER_AUTH_SECRET: "test-secret",
      BETTER_AUTH_URL: canonicalProductionOrigin,
    },
    () => assert.equal(isProductionConfigurationReady(), false),
  );
});
