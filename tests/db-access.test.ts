import assert from "node:assert/strict";
import test from "node:test";

import { isPreviewDatabaseEnabled } from "../src/lib/db";

test("preview database access requires both deliberate configuration values", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalPreviewAccess = process.env.HOMEVAULT_PREVIEW_DATABASE_ACCESS;

  try {
    delete process.env.DATABASE_URL;
    delete process.env.HOMEVAULT_PREVIEW_DATABASE_ACCESS;
    assert.equal(isPreviewDatabaseEnabled(), false);

    process.env.DATABASE_URL = "postgresql://example.invalid/homevault";
    assert.equal(
      isPreviewDatabaseEnabled(),
      false,
      "a database credential must not enable unauthenticated access",
    );

    delete process.env.DATABASE_URL;
    process.env.HOMEVAULT_PREVIEW_DATABASE_ACCESS = "enabled";
    assert.equal(
      isPreviewDatabaseEnabled(),
      false,
      "the preview switch must not work without a database credential",
    );

    process.env.DATABASE_URL = "postgresql://example.invalid/homevault";
    process.env.HOMEVAULT_PREVIEW_DATABASE_ACCESS = "true";
    assert.equal(
      isPreviewDatabaseEnabled(),
      false,
      "only the documented exact switch value may enable preview access",
    );

    process.env.HOMEVAULT_PREVIEW_DATABASE_ACCESS = "enabled";
    assert.equal(isPreviewDatabaseEnabled(), true);
  } finally {
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;

    if (originalPreviewAccess === undefined) {
      delete process.env.HOMEVAULT_PREVIEW_DATABASE_ACCESS;
    } else {
      process.env.HOMEVAULT_PREVIEW_DATABASE_ACCESS = originalPreviewAccess;
    }
  }
});
