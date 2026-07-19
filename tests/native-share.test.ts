import assert from "node:assert/strict";
import test from "node:test";

import { buildProtectedShareUrl } from "../src/lib/native-share";

const origin = "https://homevault.grovekind.com";

test("native sharing builds a canonical protected record URL", () => {
  assert.equal(
    buildProtectedShareUrl("/vault/assets/asset-1?view=care", origin),
    "https://homevault.grovekind.com/vault/assets/asset-1?view=care",
  );
});

test("native sharing rejects external and protocol-relative destinations", () => {
  assert.throws(
    () => buildProtectedShareUrl("https://example.com/private", origin),
    /internal paths/,
  );
  assert.throws(
    () => buildProtectedShareUrl("//example.com/private", origin),
    /internal paths/,
  );
});
