import assert from "node:assert/strict";
import test from "node:test";

import { GET as getAndroidAssociation } from "../src/app/.well-known/assetlinks.json/route";
import { GET as getAppleAssociation } from "../src/app/.well-known/apple-app-site-association/route";

const originalAppleTeam = process.env.APPLE_APP_TEAM_ID;
const originalAndroidFingerprint =
  process.env.ANDROID_APP_LINK_SHA256_CERT_FINGERPRINT;

test.afterEach(() => {
  if (originalAppleTeam === undefined) delete process.env.APPLE_APP_TEAM_ID;
  else process.env.APPLE_APP_TEAM_ID = originalAppleTeam;

  if (originalAndroidFingerprint === undefined) {
    delete process.env.ANDROID_APP_LINK_SHA256_CERT_FINGERPRINT;
  } else {
    process.env.ANDROID_APP_LINK_SHA256_CERT_FINGERPRINT =
      originalAndroidFingerprint;
  }
});

test("association endpoints fail closed without signing identities", () => {
  delete process.env.APPLE_APP_TEAM_ID;
  delete process.env.ANDROID_APP_LINK_SHA256_CERT_FINGERPRINT;

  assert.equal(getAppleAssociation().status, 404);
  assert.equal(getAndroidAssociation().status, 404);
});

test("Apple association uses the approved bundle identifier", async () => {
  process.env.APPLE_APP_TEAM_ID = "AB12CD34EF";
  const response = getAppleAssociation();
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(
    payload.applinks.details[0].appID,
    "AB12CD34EF.au.com.homevault.app",
  );
});

test("Android association publishes only a valid signing fingerprint", async () => {
  const fingerprint = Array.from({ length: 32 }, () => "AA").join(":");
  process.env.ANDROID_APP_LINK_SHA256_CERT_FINGERPRINT = fingerprint;
  const response = getAndroidAssociation();
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(payload[0].target.sha256_cert_fingerprints, [fingerprint]);
  assert.equal(payload[0].target.package_name, "au.com.homevault.app");
});
