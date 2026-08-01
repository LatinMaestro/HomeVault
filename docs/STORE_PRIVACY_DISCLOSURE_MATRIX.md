# Store Privacy Disclosure Matrix

> Candidate-bound document: update this matrix whenever an approved optional capability or processor is enabled, then derive the final store answers from the exact signed build and executed deletion evidence.

This document is the engineering source for Apple App Privacy and Google Play Data safety answers. Store forms remain client-submitted legal declarations and must be rechecked against the signed build, production vendor contracts and final privacy policy immediately before submission.

## Product Commitments

- No advertising.
- No cross-app or cross-site tracking.
- No sale of account or household data.
- No behavioural analytics SDK.
- No automatic or unconfirmed AI/OCR writes; any approved processing is user-initiated, minimised, draft-only and disclosed.
- No location, contacts or microphone permission; camera permission is requested only for explicit user-initiated document capture when that capability passes release gates.
- No budgeting feature; payment/IAP is implemented only if the explicitly approved commercial model requires digital entitlements.
- Household data is used to provide HomeVault functionality.
- Transport to the production service uses HTTPS.
- Account export and deletion are available to verified users.

HomeVault is not end-to-end encrypted. Do not claim that the developer cannot read server-held household records.

## Data Inventory

| HomeVault data | Apple category | Google Play category | Linked to identity | Required | Purpose |
| --- | --- | --- | --- | --- | --- |
| Account display name | Name | Personal info / Name | Yes | Required for an account | Account management and app functionality |
| Verified account email | Email address | Personal info / Email address | Yes | Required for an account | Authentication, verification, recovery and security |
| Internal account identifier | User ID | Personal info / User IDs | Yes | Generated | Account management, household authorisation and security |
| Home address fields | Physical address | Location / Physical address | Yes | Optional | Household organisation and app functionality |
| Asset, room, maintenance, warranty, reminder and provider metadata | Other user content | App activity or Other user-generated content | Yes | Optional | User-requested household record functionality |
| Receipt totals, purchase dates and purchase places | Purchase history | Financial info / Purchase history | Yes | Optional | Archival receipt and warranty context, never budgeting or profiling |
| Uploaded JPEG or PNG household records | Photos or videos | Photos and videos | Yes | Optional | User-requested private document storage |
| Uploaded PDF household records | Other user content | Files and docs | Yes | Optional | User-requested private document storage |
| Session and credential security records | User ID | App info and performance / Other data where requested by the form | Yes | Generated | Authentication, fraud prevention, security and compliance |

The exact Google category names presented by Play Console can change. Choose the closest current categories and preserve the HomeVault purpose and handling described here.

## Apple App Privacy Draft

For the submitted production build:

- Data used to track users: **No**.
- Data linked to the user: **Yes**, for the categories in the inventory.
- Data not linked to the user: **None currently identified**.
- Primary purpose: **App Functionality**.
- Account email, user ID and credential/session controls also support account management and security.
- Advertising, third-party advertising, developer advertising and analytics purposes: **No**.

The app target contains `ios/App/App/PrivacyInfo.xcprivacy`. It declares current linked data classes, no tracking domains and no app-owned required-reason API use. Third-party package privacy manifests are merged by Xcode; inspect the signed archive privacy report before submission.

## Google Play Data Safety Draft

Initial engineering answers:

- Does the app collect or share required user data types? **Collects: Yes. Shares: No**, subject to final processor-contract review.
- Is all collected user data encrypted in transit? **Yes**, for the approved HTTPS production runtime and providers.
- Can users request deletion? **Yes**.
- In-app deletion path: `Settings > Account and security > Delete account`.
- Public deletion information URL: `https://homevault.grovekind.com/account-deletion`.
- Collection is required only for account name, verified email and generated account/security identifiers.
- Household content, purchase metadata and attachments are user-optional.
- Data is used for app functionality, account management and security.
- No data is used for advertising, marketing, analytics or personalisation.

Google's definition of sharing contains processor and service-provider exceptions. Confirm the contracts and actual handling of Vercel, Neon, Resend and any future support provider before answering **No** in Play Console.

## Processor And SDK Register

| Component | Role | Household/account data exposure | Advertising or analytics |
| --- | --- | --- | --- |
| Vercel / Next.js runtime | Hosts the application and server requests | Processes account and household requests | None implemented |
| Neon Postgres | Stores account and household relational data | Stores linked production records | None |
| Vercel Private Blob | Stores approved private document objects | Stores user-selected attachments | None |
| Resend | Sends verification and password-recovery email | Processes recipient email and transactional content | None |
| Better Auth | Application authentication library | Processes credential, session and verification records | None |
| Prisma PostgreSQL adapter | Server database access library | Processes database queries in the application runtime | None |
| Capacitor core and native plugins | iOS/Android container, connectivity, app lifecycle, status bar and privacy screen | No independent server-side collection identified | None |
| GitHub Actions | Build and release automation | Must receive signing secrets only; no production household data | None |

Store signing providers, customer support tools or crash reporting must be added to this register before use. No crash-reporting or analytics SDK is currently approved.

## Retention And Deletion

- Active account and household data is retained until the user removes records or deletes the account.
- Account deletion removes identity, sessions, memberships and eligible sole-member household relational data in one database transaction.
- Private attachment deletion is attempted through the authorised storage cleanup workflow and reports any cleanup failure.
- An owner with other household members cannot delete and strand the household; ownership transfer remains required before that advanced-sharing case can launch.
- Infrastructure backups and provider logs may expire on provider schedules rather than instantly. Exact production periods must be inserted into the final legal privacy policy after client vendor settings are confirmed.
- No deleted data is retained for advertising or analytics.

## Submission Audit

Before submitting either form:

1. build from reviewed `main` and inventory the final package dependencies;
2. inspect the Xcode archive privacy report and Android merged manifest;
3. confirm no unlisted SDK, permission, tracking domain or outbound processor exists;
4. verify production auth, email, database and Blob behavior with synthetic accounts;
5. verify export and deletion, including attachment cleanup;
6. confirm vendor contracts, regions, backup retention and legal entity;
7. make the public privacy policy and store answers match this matrix;
8. retain screenshots or exports of the submitted declarations with the release record.

Any new analytics, crash reporting, notification delivery, AI/OCR, email ingestion, payment, camera, contact or location capability requires this matrix and both store declarations to be reopened before release.
