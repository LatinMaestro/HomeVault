# Native Release Operations

HomeVault produces native release candidates online through GitHub Actions. The client does not need Xcode, Android Studio, Node.js or signing files on their local computer.

## Release Evidence Levels

1. Every native pull request synchronises the committed Capacitor projects and compiles Android Debug, unsigned Android Release, iOS Debug Simulator and iOS Release Simulator configurations.
2. The manual **Native signed release candidate** workflow can create a signed Android App Bundle and signed iOS IPA after client-owned store identities are supplied.
3. TestFlight and Google Play internal testing remain mandatory before public submission.
4. Store upload and public release are intentionally not automated. A human must review the signed artifact and store metadata first.

Unsigned builds prove source and release-configuration compatibility. They are not installable store submissions.

## Fixed Identifiers

- Apple bundle ID: `au.com.homevault.app`
- Android application ID: `au.com.homevault.app`
- Canonical runtime: `https://home-vault.vercel.app`
- GitHub environment used by signed builds: `native-release`

The identifiers must be reserved in the client's Apple Developer and Google Play Console accounts before signing credentials are configured.

## Android Signing Setup

Create or select the upload key associated with the Google Play app record. Store these values as GitHub environment secrets in `native-release`:

- `ANDROID_KEYSTORE_BASE64`: base64 form of the upload keystore;
- `ANDROID_KEYSTORE_PASSWORD`;
- `ANDROID_KEY_ALIAS`;
- `ANDROID_KEY_PASSWORD`.

The workflow restores the keystore only inside the temporary GitHub runner, builds an AAB and retains the artifact for 14 days. It does not commit the keystore or upload the bundle to Google Play.

After Play App Signing is enabled, use the Play app-signing certificate SHA-256 fingerprint for `ANDROID_APP_LINK_SHA256_CERT_FINGERPRINT` in Vercel. Do not use an unrelated debug fingerprint.

## Apple Signing Setup

Reserve the bundle ID and create an App Store distribution provisioning profile. Store these values as GitHub environment secrets in `native-release`:

- `APPLE_TEAM_ID`: the 10-character Apple Developer Team ID;
- `APPLE_DISTRIBUTION_CERTIFICATE_BASE64`: base64 form of the distribution `.p12`;
- `APPLE_DISTRIBUTION_CERTIFICATE_PASSWORD`;
- `APPLE_PROVISIONING_PROFILE_BASE64`: base64 form of the App Store provisioning profile.

The workflow creates an isolated temporary keychain, installs the profile, exports a signed IPA, uploads the artifact for 14 days and removes temporary signing material. It does not upload the IPA to App Store Connect.

Set the same `APPLE_TEAM_ID` in Vercel so the Apple App Site Association response matches the signed app.

## Running A Candidate

From GitHub Actions, manually run **Native signed release candidate** and choose:

- `platform`: `android`, `ios` or `both`;
- `version_name`: a three-part version such as `1.0.0`;
- `build_number`: a positive integer that has never been submitted for that version.

The workflow fails before compiling if the version format, build number or required signing secrets are missing. Use a new build number for every store upload.

## Handoff Checks

Before downloading or submitting an artifact:

- verify the workflow ran from the intended reviewed `main` commit;
- verify both standard CI and Native CI passed for that commit;
- verify the production URL, auth, database, email and private attachment lifecycle;
- verify universal/app links on signed physical devices;
- test account creation, recovery, re-entry, export and deletion through internal distribution;
- confirm the store privacy declarations match the final dependency and service inventory;
- confirm synthetic reviewer credentials and support/legal URLs.

Never place signing files, passwords, API keys or store credentials in source, workflow inputs, PR comments, artifacts other than the signed binary, or Vercel client-visible variables.
