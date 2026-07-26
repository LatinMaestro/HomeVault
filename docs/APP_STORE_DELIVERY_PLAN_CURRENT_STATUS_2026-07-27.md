# HomeVault Complete App Store Delivery Plan

Status date: 27 July 2026  
Target: complete HomeVault product, including all optional features, ready for Apple App Review submission  
Repository baseline: `8ed478b78c24dc37a43320ea272e5db6ccced4fb` (merged PR #158)

## User Direction

All HomeVault optional features are now included in the total delivery programme. They are not post-launch deferrals. Implement them before the final version 1.0 App Store readiness audit, subject to the privacy, security, provider, cost, legal and client-account gates stated below.

If an optional feature proves incompatible with platform policy, privacy obligations, product safety or the approved architecture, document the evidence and request a specific client decision. Do not silently omit it.

## Verified Current Status

- The shared Next.js product, Prisma/PostgreSQL data layer and Capacitor iOS/Android projects are implemented.
- Production Better Auth, Resend transactional email, Neon migrations, private Vercel Blob and `https://homevault.grovekind.com` are connected.
- Disposable production signup, verification gating, database writes, email delivery and cleanup previously passed.
- Household-authorised reads/mutations, exports, account controls, account deletion and guarded private attachments are implemented.
- Native privacy controls, protected same-origin record sharing, trusted-link scaffolding, unsigned native compilation and the guarded signed-artifact workflow are implemented.
- Store privacy drafts, listing drafts, reviewer journey, client release actions and final acceptance protocol exist.
- PR #158 added optional file selection during receipt/document creation, authorised inline viewing and request/navigation latency improvements.
- PR #158 did not receive executable GitHub CI evidence, and its Vercel preview was deferred by service capacity. Current main is not yet release-green.
- Draft PR #159 contains this current-status delivery plan.

## Delivery Principles

- GitHub `main` is the source of truth; work through focused branches and pull requests.
- Development and verification remain online-first.
- Every release claim identifies the exact commit, deployment/build and evidence.
- Use fictional accounts, files and household data for development, QA and review.
- Keep server-side household authorisation and private-file controls fail closed.
- Add each optional capability behind an explicit reviewed privacy/security contract.
- Re-audit store disclosures, permissions, retention, exports and deletion after every new data capability or SDK.
- Do not submit to App Review or publish publicly without explicit release-owner approval.

## Complete Feature Scope

### Existing core product

- Household profile, rooms and asset categories.
- Asset inventory and lifecycle metadata.
- Maintenance tasks, recurring schedule advancement, templates and completion history.
- Reminders and due-date views.
- Warranties, receipts, documents and private attachments.
- Service-provider directory and safe contact actions.
- Search, calendar, archive/recovery, quick add, exports and printable household report.
- Verified accounts, household membership authorisation, recovery, session controls and account deletion.
- Responsive web/PWA and Capacitor iOS/Android candidates.

### Optional programme now required

1. Reminder delivery through local and/or push notifications, background scheduling, preferences, quiet hours, deep links and retry/deduplication controls.
2. Advanced household invitations, acceptance/revocation, OWNER/ADULT/CHILD/GUEST administration, ownership transfer and safe member departure/removal.
3. Multi-property support with property switching, property-scoped roles, strict cross-property isolation, exports and deletion.
4. Verified email-change lifecycle and optional social sign-in/account linking where it can preserve one immutable HomeVault identity safely.
5. Biometric native re-entry using platform-secure credentials without making biometrics the server authorisation boundary.
6. Camera/document capture with permission-minimised native flows, image review, retake, upload and metadata controls.
7. Expanded private attachments: approved HEIC/HEIF support, multiple attachments/galleries, lifecycle cleanup and malware scanning if the approved broader-file policy requires it.
8. Encrypted offline household access with explicit bounded scope, device-loss protection, retention, conflict resolution, queued mutations and safe recovery.
9. External calendar integration beyond one-way ICS export, with user-controlled connection, per-property selection, update/revocation and no unintended calendar writes.
10. OCR-assisted extraction for receipts, warranties, manuals and household documents, with confidence, provenance and mandatory user confirmation before persistence.
11. AI-assisted classification, summarisation and maintenance suggestions, limited to user-requested household content, with reviewable drafts, no silent record changes and no model training on private data.
12. Email ingestion/forwarding for household documents, with household routing, sender/file validation, deduplication, quarantine and review-before-save.
13. Controlled public or guest sharing for selected records/attachments using explicit, time-limited, revocable grants; never expose private Blob URLs.
14. Provider workflow expansion where approved: richer provider management, optional booking/message handoff and external integrations without disclosing unrelated household data.
15. Optional privacy-reviewed crash reporting limited to operational diagnostics, with redaction, retention, consent/disclosure and no behavioural analytics.
16. Optional subscriptions/in-app purchases if the final commercial model requires them, including entitlement restoration, family/account lifecycle, refund handling and store-policy compliance.
17. Current-platform polish: widgets, shortcuts, share/import extensions and other low-permission native utilities where supported and valuable.

### Explicit non-product exclusions

The following remain outside HomeVault because they are unrelated or conflict with the privacy-first product, unless the client separately changes the product mandate:

- budgeting, spending analytics, valuation or financial advice;
- insurance claim automation;
- advertising, cross-app tracking or behavioural analytics;
- automated service-provider payments;
- unrestricted public attachments;
- unnecessary location, contacts, microphone, USB or payment permissions.

## Phase A: Restore Exact-Head Evidence

- Run dependency integrity, lint, TypeScript, tests, Prisma/migration checks, production build and route smoke on the exact current candidate.
- Run generated Capacitor drift, Android Debug/unsigned Release and iOS Debug/Release Simulator builds on the same source.
- Fix real failures in focused reviewed PRs.
- Verify the exact deployed commit, health/readiness and canonical-host behaviour.
- Validate the merged PR #158 attachment and performance changes.

Exit: exact-head standard/native checks and production regression evidence pass.

## Phase B: Controlled Production Acceptance

Using a verified synthetic OWNER account and harmless fixtures, test:

- signup, verification, sign-in, recovery and first-home onboarding;
- household isolation and all current read/write workflows;
- profile/password/session controls;
- complete private attachment lifecycle and authorisation denial;
- search, calendar, archive, exports and printable report;
- account deletion, cascades and Blob cleanup.

Exit: documented current-product journeys pass, regressions exist for fixed defects, and disposable data is cleaned up.

## Phase C: Release-Quality Foundation

- Complete mobile, tablet, safe-area, navigation and native-back review.
- Validate offline fallback, timeout, unavailable-service and retry states.
- Complete accessibility, performance, idempotency and error-message review.
- Re-audit dependencies, migrations, privacy, export and deletion.
- Remove placeholder, preview-only or misleading copy.

Exit: the existing foundation is stable enough for optional-scope expansion.

## Phase D: Household Sharing, Roles and Multi-Property

Implement:

- secure invitation creation, delivery, expiry, acceptance and revocation;
- full role-administration rules for OWNER, ADULT, CHILD and GUEST;
- ownership transfer before owner deletion/departure;
- property creation/switching and property-scoped membership;
- cross-property isolation on every read, mutation, search, export, notification and file;
- multi-property onboarding, dashboard, navigation, account deletion and recovery;
- verified email change;
- optional social identity linking only after takeover/recovery threats are covered.

Exit: invitation abuse, privilege escalation, orphaned ownership and cross-property access tests pass.

## Phase E: Notifications and Calendar Connections

Implement:

- local and/or push delivery for maintenance, reminders and warranty dates;
- per-user/per-property preferences, quiet hours, timezone and frequency controls;
- background scheduling, idempotency, retries, cancellation and deep links;
- permission education, denial recovery and complete opt-out;
- external calendar connection/sync with explicit selections and revocation;
- no duplicate events or unintended calendar mutation.

Exit: delivery is reliable, private, user-controlled and reflected accurately in store disclosures.

## Phase F: Native Security, Capture and Offline Capability

Implement:

- biometric re-entry backed by iOS Keychain/Android Keystore;
- camera/document capture with review, retake and permission-minimised upload;
- useful widgets, shortcuts and import/share extensions where they improve HomeVault;
- encrypted bounded offline household data;
- device-loss/session revocation, cache expiry and secure wipe;
- queued offline actions with deterministic conflict resolution and retry;
- clear stale/offline state and no cross-account residue.

Exit: physical-device security, offline conflict and recovery tests pass.

## Phase G: Attachment Expansion and Document Intelligence

Implement:

- approved HEIC/HEIF and multi-attachment support;
- secure gallery/replacement/deletion behaviour;
- malware scanning if broader file support makes it necessary and the provider/cost is approved;
- OCR extraction with confidence and field-level provenance;
- AI classification, summaries and maintenance suggestions as reviewable drafts;
- email ingestion with authenticated household routing, quarantine, deduplication and review;
- explicit user confirmation before extracted or generated content changes a record;
- provider deletion, export, retention and incident-response coverage for every new processor.

Exit: no OCR/AI/email input can silently create authoritative household data or bypass file/household controls.

## Phase H: Controlled Sharing and Provider Workflows

Implement:

- selected record/attachment sharing through expiring, revocable grants;
- recipient scope, download policy, audit trail and emergency revocation;
- no direct exposure of private Blob URLs;
- richer provider administration;
- optional booking or message handoff only with minimum household disclosure;
- paid/external provider connections only after explicit account, cost and privacy approval.

Exit: sharing and integrations fail closed, remain auditable and are covered by deletion/retention rules.

## Phase I: Reliability Telemetry and Commercial Model

Implement if required for the final product:

- privacy-reviewed crash reporting with sensitive-field redaction, short retention and operational-only use;
- no behavioural product analytics or advertising identifiers;
- subscriptions/in-app purchases, entitlement restoration and cross-device/account handling;
- cancellation/refund/support flows and Apple policy compliance;
- feature access must never block export, privacy, support or account deletion.

Exit: final SDK inventory, commercial behaviour and disclosures match the build.

## Phase J: Full-System Security and Acceptance

Re-run the complete programme across web, iOS and Android:

- authentication, recovery, email change and linked identities;
- roles, invitations, multi-property and isolation;
- every core record and attachment workflow;
- notifications, calendar sync, biometric re-entry and offline conflict handling;
- camera, galleries, OCR/AI drafts and email ingestion;
- controlled sharing and provider integrations;
- subscriptions/restore where enabled;
- export, retention and deletion across database, files, offline devices, processors, calendars, notifications and shared grants;
- accessibility, performance, crash readiness and physical-device privacy.

Exit: no unresolved severity-one or severity-two defect; required exact-head checks and acceptance evidence pass.

## Phase K: Public Identity, Legal and Support

Client-owned inputs:

- legal developer/seller entity;
- monitored support email and required address;
- approved privacy policy, retention periods and complete processor list;
- cleared public name;
- category, territories, pricing and commercial model.

Engineering:

- finalise public privacy, support and deletion pages;
- verify public non-geofenced URLs;
- align copy and store declarations with every optional capability and SDK;
- document support, incident, subscription and data-request operations.

Exit: public/legal content is approved, live and complete.

## Phase L: Apple Account, Signing and TestFlight

Client-owned gates:

- Apple Developer membership and App Store Connect record;
- final bundle identifier, Team ID and agreements;
- distribution certificate/provisioning profile;
- protected signing and store credentials.

Engineering:

- configure Universal Links and native services;
- freeze version/build and exact release commit;
- produce and inspect the signed IPA, entitlements, icons, launch assets, permission strings and privacy report;
- upload the authorised build to TestFlight;
- test representative current iPhone and supported iPad layouts;
- repeat all full-system journeys and resolve blockers through new verified candidates.

Exit: one immutable signed/TestFlight candidate passes physical-device acceptance.

## Phase M: Store Listing and Reviewer Package

Complete:

- final name, subtitle, description, keywords, category and release notes;
- age rating, pricing, territories and encryption/export compliance;
- App Privacy answers matching all optional features, processors and SDKs;
- final screenshots from the approved signed build;
- stable verified fictional reviewer household;
- reviewer instructions covering permissions, biometrics, offline, notifications, OCR/AI drafts, sharing and any subscription path;
- credentials stored only in App Store Connect.

Exit: metadata, screenshots, disclosures and reviewer access exactly match the candidate.

## Phase N: Submission-Readiness Audit

Tie together:

- exact Git commit/tag, CI and native CI;
- Vercel production deployment and migrations;
- provider/service readiness;
- signed IPA and TestFlight build;
- full physical-device acceptance;
- public legal/support/deletion URLs;
- privacy report and store declarations;
- screenshots, listing and reviewer journey;
- subscription/commercial evidence if enabled;
- support, incident, rollback and data-deletion ownership.

Ready-for-submission means the complete core and optional scope is implemented and evidenced, no release blocker remains, and the release owner receives a final go/no-go report. App Review submission remains a separate explicit approval.

## Current Critical Path

1. Review and merge the expanded plan in PR #159.
2. Restore exact-head verification for current main and PR #158 behaviour.
3. Complete current-product controlled production acceptance.
4. Implement optional phases D–I in focused dependency-ordered PRs.
5. Re-run full-system security, privacy and acceptance.
6. Close public identity/legal/provider/client-account gates.
7. Produce and physically test the signed TestFlight candidate.
8. Finalise disclosures, listing, screenshots and reviewer access.
9. Complete the submission-readiness audit and request submission approval.
