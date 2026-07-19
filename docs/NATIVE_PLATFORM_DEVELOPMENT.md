# Native Platform Development

HomeVault uses Capacitor 8 to produce iOS and Android release candidates from the shared authenticated Next.js runtime.

## Architecture

- The native containers load only `https://homevault.grovekind.com` by default.
- `HOMEVAULT_NATIVE_SERVER_URL` may override the URL only during a controlled native build.
- Household access remains enforced by the Next.js server and PostgreSQL membership boundary.
- Native code does not contain database, auth, Blob or email secrets.
- Cleartext HTTP and mixed content are disabled.
- A bundled privacy-safe shell is retained for a failed initial connection.
- Native runtime integration handles trusted app links, Android back behaviour, connectivity fallback and system status bars.

## Identifiers

- Shared application/bundle ID: `au.com.homevault.app`
- Display name: `HomeVault`
- Initial version: `1.0`
- Initial build/version code: `1`
- iOS minimum: 15.0
- Android minimum SDK: 24
- Android target/compile SDK: 36

Identifiers must be confirmed in the Apple and Google developer accounts before signing. Changing them after an app record is created is a client-controlled release decision.

## Online-first Workflow

Native projects are generated, synced and compiled in GitHub Actions. The client is not expected to install Xcode, Android Studio, Node.js or native dependencies locally.

The Native CI workflow:

1. installs the locked dependencies;
2. synchronises the generated platform project;
3. rejects uncommitted generated drift;
4. compiles Android Debug and unsigned Android Release bundle configurations on Linux;
5. compiles iOS Debug and Release Simulator configurations on macOS.

## Release Boundaries

Unsigned CI builds prove source and release-configuration compatibility only. A separate manual GitHub Actions workflow is ready to create signed AAB and IPA artifacts after client-owned credentials are stored in the protected `native-release` environment. It never uploads to a store automatically.

Store distribution still requires client-owned Apple/Google accounts, app records, signing credentials, legal identity, policy declarations and production service configuration. See `docs/NATIVE_RELEASE_OPERATIONS.md` for the online signing and handoff runbook.

The first public submission must be tested through TestFlight and Google Play internal testing. Store reviewers need a synthetic, verified review account; no private household data should be supplied.


## Privacy And Link Hardening

The native runtime enables privacy-screen protection before household use. iOS app-switcher previews are obscured; Android also prevents screenshots, screen recording and application backup. Both platforms register `homevault://`. The canonical HTTPS domain is declared for verified links, but the public association endpoints return 404 until `APPLE_APP_TEAM_ID` and `ANDROID_APP_LINK_SHA256_CERT_FINGERPRINT` are configured from the final signing accounts.

## Protected Record Sharing

Supported native detail screens use the official Capacitor Share plugin for the platform share sheet. The payload is deliberately limited to a generic record label and a validated same-origin HomeVault route. Sharing does not create a public link or access grant, and the recipient must pass the normal sign-in and household membership checks. Sensitive record fields, private attachment keys and file URLs are never included. The control is capability-detected and remains hidden when the platform share API is unavailable.
