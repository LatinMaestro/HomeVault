import assert from "node:assert/strict";
import test from "node:test";

import { getProviderContactLinks } from "../src/lib/provider-contact-links";

test("provider contact links normalize common household contact details", () => {
  const links = getProviderContactLinks({
    phone: "07 3000 1111",
    email: "help@example.test",
    website: "example.test/service",
  });

  assert.equal(links.phone, "tel:0730001111");
  assert.equal(links.email, "mailto:help%40example.test");
  assert.equal(links.website, "https://example.test/service");
});

test("provider contact links reject unsafe or malformed values", () => {
  const links = getProviderContactLinks({
    phone: "not a number",
    email: "bad\r\nBcc:other@example.test",
    website: "javascript:alert(1)",
  });

  assert.equal(links.phone, null);
  assert.equal(links.email, null);
  assert.equal(links.website, null);
});

test("provider contact links preserve explicit secure website URLs", () => {
  const links = getProviderContactLinks({
    website: "https://tradie.example.test/contact?from=homevault",
  });

  assert.equal(
    links.website,
    "https://tradie.example.test/contact?from=homevault",
  );
});
