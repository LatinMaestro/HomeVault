import assert from "node:assert/strict";
import test from "node:test";

import {
  attachmentMaxBytes,
  hasExpectedAttachmentSignature,
} from "../src/lib/attachment-storage";

test("attachment limit stays below the Vercel server request ceiling", () => {
  assert.equal(attachmentMaxBytes, 4_000_000);
});

test("recognises supported file signatures", () => {
  assert.equal(
    hasExpectedAttachmentSignature(
      "application/pdf",
      new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]),
    ),
    true,
  );
  assert.equal(
    hasExpectedAttachmentSignature(
      "image/jpeg",
      new Uint8Array([0xff, 0xd8, 0xff, 0xe0]),
    ),
    true,
  );
  assert.equal(
    hasExpectedAttachmentSignature(
      "image/png",
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ),
    true,
  );
});

test("rejects a mismatched signature", () => {
  assert.equal(
    hasExpectedAttachmentSignature(
      "application/pdf",
      new Uint8Array([0xff, 0xd8, 0xff]),
    ),
    false,
  );
});
