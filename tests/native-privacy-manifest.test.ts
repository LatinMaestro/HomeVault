import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { join } from "node:path";

const manifestPath = join(
  process.cwd(),
  "ios",
  "App",
  "App",
  "PrivacyInfo.xcprivacy",
);
const projectPath = join(
  process.cwd(),
  "ios",
  "App",
  "App.xcodeproj",
  "project.pbxproj",
);

const manifest = readFileSync(manifestPath, "utf8");
const project = readFileSync(projectPath, "utf8");

const collectedTypes = [
  "NSPrivacyCollectedDataTypeName",
  "NSPrivacyCollectedDataTypeEmailAddress",
  "NSPrivacyCollectedDataTypePhysicalAddress",
  "NSPrivacyCollectedDataTypeUserID",
  "NSPrivacyCollectedDataTypePurchaseHistory",
  "NSPrivacyCollectedDataTypePhotosorVideos",
  "NSPrivacyCollectedDataTypeOtherUserContent",
];

test("iOS privacy manifest is bundled and explicitly disables tracking", () => {
  assert.match(project, /PrivacyInfo\.xcprivacy in Resources/);
  assert.match(
    manifest,
    /<key>NSPrivacyTracking<\/key>\s*<false\/>/,
  );
  assert.match(
    manifest,
    /<key>NSPrivacyTrackingDomains<\/key>\s*<array\/>/,
  );
});

test("privacy manifest declares each current account and household data class", () => {
  for (const dataType of collectedTypes) {
    assert.match(manifest, new RegExp(`<string>${dataType}</string>`));
  }

  const linkedCount = manifest.match(
    /<key>NSPrivacyCollectedDataTypeLinked<\/key>\s*<true\/>/g,
  );
  const trackingCount = manifest.match(
    /<key>NSPrivacyCollectedDataTypeTracking<\/key>\s*<false\/>/g,
  );

  assert.equal(linkedCount?.length, collectedTypes.length);
  assert.equal(trackingCount?.length, collectedTypes.length);
});

test("privacy manifest limits every declared use to app functionality", () => {
  const purposes = manifest.match(
    /NSPrivacyCollectedDataTypePurposeAppFunctionality/g,
  );
  assert.equal(purposes?.length, collectedTypes.length);
  assert.doesNotMatch(manifest, /PurposeAdvertising|PurposeAnalytics/);
});
