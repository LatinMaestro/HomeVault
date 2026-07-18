# App Store And Google Play Readiness

HomeVault is intended for eventual distribution through both the Apple App Store and Google Play. The shared Next.js application remains the product and backend foundation, but store packaging must provide a polished, app-like mobile experience rather than a low-value website wrapper.

## Current Position

The repository now provides:

- mobile-first responsive workflows;
- standalone web-app metadata and a branded install icon;
- theme colour, portrait orientation and safe-area support;
- database-free production route smoke coverage;
- privacy-first preview controls;
- no production tracking, advertising or unnecessary device permissions;
- a privacy-safe offline fallback that does not cache household records.

This is an installable foundation, not a store-submission build.

## Recommended Distribution Architecture

1. Keep Next.js, Prisma and PostgreSQL as the shared application and server foundation.
2. Finish production identity, authorization, deletion, privacy and storage decision gates on the web platform.
3. Add a Capacitor-based iOS and Android shell only after the core authenticated workflows are stable.
4. Add meaningful platform integration before App Store submission, such as secure device re-entry, native sharing/export, approved document capture and useful offline behavior.
5. Keep all household authorization on the server. A native shell must never become the security boundary.
6. Use TestFlight and Google Play internal testing before public store review.

A remote-only shell with no platform value is not the target architecture. Apple states that an app should provide utility and UI beyond a repackaged website under [App Review Guideline 4.2](https://developer.apple.com/app-store/review/guidelines/).

## Mandatory Product Gates

Before either public store submission:

- Production authentication is implemented.
- Every read and mutation has server-side household authorization.
- In-app account deletion is available if account creation is available.
- Google Play also has a public web URL for account/data deletion requests.
- A public, non-geofenced privacy policy URL is live and linked inside the app.
- Data retention, export and deletion behavior is implemented and documented.
- Support and contact URLs are live.
- Real file storage has approved access control, retention and deletion rules before uploads exist.
- Store privacy disclosures match actual application and SDK behavior.
- No placeholder, preview-only or misleading content remains.
- Store screenshots and descriptions match the submitted build.
- Accessibility and device-layout review is complete.

Apple requires in-app account deletion for apps that support account creation: [Apple account deletion guidance](https://developer.apple.com/support/offering-account-deletion-in-your-app).

Google Play requires both an in-app deletion path and an external web resource when account creation is supported: [Google Play account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111).

## Apple Submission Readiness

Client-controlled requirements:

- Apple Developer Program membership.
- App Store Connect app record.
- Final bundle identifier and legal seller identity.
- Distribution certificates and signing managed through approved cloud/native tooling.
- Privacy policy, support and marketing URLs.
- App privacy questionnaire.
- Age rating, category, territories and review contact.
- TestFlight review and final App Review submission.

Engineering requirements:

- Native iOS project and reproducible signed archive.
- Final PNG icon asset set with no transparency.
- Launch experience and safe-area verification.
- Account deletion and restore/re-entry behavior.
- App Review notes that explain sample/test access.
- No beta labels or unfinished controls in the submission build.
- Sufficient app-like utility to satisfy minimum-functionality review.

## Google Play Submission Readiness

Client-controlled requirements:

- Verified Google Play Console developer account.
- Final application ID and legal developer identity.
- Play App Signing enrollment.
- Privacy policy and deletion-request URLs.
- Data safety form, content rating, target audience and store listing.
- Internal testing and production release access.

Engineering requirements:

- Native Android project and reproducible Android App Bundle.
- Final adaptive icon and splash assets.
- Current target SDK compliance at submission time.
- Back-navigation, edge-to-edge and supported-device verification.
- Account deletion behavior and external deletion URL.
- Pre-launch report review and policy remediation.

See `docs/STORE_LISTING_DRAFT.md` for working listing copy, screenshot captions, reviewer notes and submission ownership.

## Store Asset Register

Required before submission:

- Final app name and subtitle/short description.
- Final icon source plus iOS and Android exports.
- Phone screenshots for current required device classes.
- Optional tablet screenshots only if tablet support is declared.
- Feature graphic and store listing artwork where required.
- Privacy policy, support and account-deletion URLs.
- Review/demo credentials backed by synthetic data.
- Release notes and reviewer instructions.

## Deferred Native Capabilities

The following require separate product and privacy approval:

- Camera or document capture.
- File uploads and production storage.
- Local or push notifications.
- Biometric re-entry.
- Offline household-data caching.
- Native sharing/export.
- Deep links and universal/app links.
- Purchases or subscriptions.

## Current Submission Blockers

- No production authentication or server-side household authorization.
- No account deletion workflow.
- Preview privacy and support routes exist, but final legal/contact URLs and the account-deletion URL are not complete.
- No native iOS or Android projects.
- No final raster store assets.
- No developer-account, signing or store-listing configuration in the repository.
- No approved production storage approach.
- Final Vercel and device review is pending.

These blockers do not prevent continued shared-app development. They do prevent a responsible public store submission.


## Production Identity Direction

HomeVault has selected self-hosted Better Auth with the existing Next.js, Prisma and PostgreSQL stack because Neon Managed Better Auth remains Beta. Identity only establishes who is signed in; HomeVault server code must still verify household membership for every read and mutation.

Vercel Private Blob is the selected production attachment store. Provisioning and uploads follow production identity and account-lifecycle controls.

See `docs/AUTHENTICATION_ARCHITECTURE.md`.


## Implemented Account Lifecycle Evidence

- In-app deletion confirmation: `/account/delete`.
- Public deletion information: `/account-deletion`.
- Household export is offered before deletion.
- Sole-member household records are deleted through database cascades.
- Owners cannot abandon remaining members without transfer.
- Private attachment cleanup remains a release gate until Blob is provisioned.
