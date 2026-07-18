import assert from "node:assert/strict";
import test from "node:test";

import {
  validateDisplayName,
  validatePasswordChange,
} from "../src/lib/account-input";

test("validates account display names", () => {
  assert.equal(validateDisplayName("A"), "Use at least 2 characters for your name.");
  assert.equal(validateDisplayName("  Sam Taylor  "), null);
  assert.equal(validateDisplayName("a".repeat(81)), "Keep your name to 80 characters or fewer.");
});

test("validates secure password changes", () => {
  assert.equal(
    validatePasswordChange({
      currentPassword: "old-password",
      newPassword: "short",
      confirmPassword: "short",
    }),
    "Use at least 12 characters for the new password.",
  );
  assert.equal(
    validatePasswordChange({
      currentPassword: "old-password-123",
      newPassword: "new-password-123",
      confirmPassword: "different-password",
    }),
    "The new passwords do not match.",
  );
  assert.equal(
    validatePasswordChange({
      currentPassword: "old-password-123",
      newPassword: "new-password-123",
      confirmPassword: "new-password-123",
    }),
    null,
  );
});
