# HomeVault App Store Delivery Plan

Status date: 27 July 2026  
Target: HomeVault version 1.0 ready for Apple App Review submission  
Repository baseline: `8ed478b78c24dc37a43320ea272e5db6ccced4fb` (merged PR #158)

## Verified Current Status

- No pull requests or issues were open when this plan was prepared.
- The shared Next.js product, Prisma/PostgreSQL data layer and Capacitor iOS/Android projects are implemented.
- Production Better Auth, Resend transactional email, Neon migrations, private Vercel Blob and the canonical `https://homevault.grovekind.com` origin are connected.
- Disposable production signup, verification gating, database writes, email delivery and cleanup have passed.
- Household-authorised reads and mutations, exports, account controls, account deletion and guarded private attachments are implemented.
- Native privacy controls, protected record sharing, trusted-link scaffolding, unsigned iOS/Android compilation and the guarded signed-artifact workflow are implemented.
- Store privacy drafts, listing drafts, reviewer journey, client release actions and final acceptance protocol exist.
- PR #158 added optional single-step private attachments for new receipts/documents, authorised inline viewing and request/navigation latency reductions.
- PR #158 did not receive executable GitHub CI evidence, and its Vercel preview was deferred by service capacity. Current main is therefore implemented but not release-green.

## Delivery Principles

- GitHub `main` remains the source of truth.
- Development and verification remain online-first.
- Every release claim must identify the exact commit, build and evidence.
- Use fictional accounts, files and household data only.
- Keep server-side household authorisation and private-file controls fail closed.
- Do not add unapproved OCR, AI, camera capture, notifications, analytics, advertising, billing, public links or advanced sharing.
- Do not submit to App Review or publish publicly without explicit release-owner approval.

## Phase A: Restore Exact-Head Evidence

Exit criteria:

- Standard CI passes on the exact current candidate: dependency integrity, formatting/lint, TypeScript, unit/integration contracts, Prisma validation, migration checks, production build and route smoke.
- Native CI passes on the same source: generated Capacitor drift, Android Debug and unsigned Release, iOS Debug and Release Simulator.
- Any real failures are fixed through focused reviewed pull requests.
- Vercel production is confirmed to serve the exact verified main commit.
- Health, readiness and canonical-host behaviour pass.

Immediate priority: verify commit `8ed478b78c24dc37a43320ea272e5db6ccced4fb` and the PR #158 attachment/performance changes.

## Phase B: Controlled Production Acceptance

Use a verified synthetic OWNER account and harmless PDF/JPEG/PNG fixtures.

Required journeys:

- signup, email verification, sign-in and recovery;
- first-home onboarding and household isolation;
- profile update, password change and session revocation;
- room, category, asset, maintenance, reminder, warranty, receipt and document create/edit flows;
- single-step receipt/document file creation;
- private upload, inline view, download, replacement/removal and authorisation denial;
- search, calendar, archive, household exports and printable report;
- account deletion, cascade behaviour and private Blob cleanup.

Exit criteria:

- All documented production journeys pass against the exact deployed commit.
- Failures have regression coverage.
- Disposable records are removed, except the separately controlled stable reviewer fixture.
- Evidence is recorded without secrets or personal data.

## Phase C: Release-Quality Hardening

Complete the documented web, iOS and Android acceptance coverage:

- phone layouts, practical tablet layouts and safe areas;
- bottom navigation, native back behaviour and protected native sharing;
- offline, timeout, unavailable-service and retry states;
- keyboard navigation, labels, contrast, focus and dynamic-text resilience;
- app-switcher privacy, Android secure-window/backup controls and no household-data caching;
- performance, duplicate submission, idempotency and error-message review;
- dependency, migration, privacy, export and deletion regression audit.

Exit criteria:

- No unresolved severity-one or severity-two defects.
- No placeholder, preview-only or misleading release copy.
- Required exact-head standard and native checks pass.
- Production smoke and acceptance evidence are current.

## Phase D: Public Identity, Legal and Support

Client-owned inputs:

- legal developer/seller entity;
- monitored support email and required contact address;
- approved privacy policy, retention periods and processor list;
- final public app name and name clearance;
- initial category, territories and pricing.

Engineering completion:

- finalise public privacy, support and account-deletion pages;
- verify all public, non-geofenced URLs;
- align in-app copy, store copy, privacy matrix and actual SDK/data behaviour;
- confirm no unsupported claims.

Exit criteria:

- Public pages are approved and live.
- Store declarations have no unresolved legal placeholders.
- Support ownership and response path are documented.

## Phase E: Apple Account and Signing

Client-owned gates:

- active Apple Developer Program membership;
- App Store Connect app record;
- confirmed bundle identifier `au.com.homevault.app` or approved replacement;
- Apple Team ID;
- distribution certificate and App Store provisioning profile;
- signing material stored only in the protected GitHub `native-release` environment.

Engineering completion:

- configure the verified Apple association identity;
- validate Universal Links;
- freeze version `1.0.0`, build numbering and release commit;
- run the guarded signed-artifact workflow;
- inspect the IPA, entitlements, icons, launch experience, privacy manifest/report and permission strings.

Exit criteria:

- A reproducible signed IPA exists for one exact verified commit.
- Signing material is absent from source, logs, issues and pull requests.
- Archive evidence and rollback references are retained.

## Phase F: TestFlight and Physical-Device Acceptance

Required testing:

- upload the authorised signed candidate to TestFlight;
- install on at least one representative current iPhone;
- review supported iPad layouts if tablet support remains declared;
- repeat authentication, onboarding, household isolation, core records, private attachments, exports, sharing, trusted links, recovery, offline behaviour, privacy controls and account deletion;
- review launch, background/resume, network changes, system text size and device rotation policy.

Exit criteria:

- Every final acceptance item passes on the submitted build.
- Blocker fixes are rebuilt from a new exact verified commit and affected tests are repeated.
- The approved TestFlight build is tied to immutable commit and CI evidence.

## Phase G: Store Listing and Reviewer Package

Complete:

- final name, subtitle, description, keywords, category and release notes;
- age rating, territories, pricing and encryption/export-compliance answers;
- App Privacy answers matching the final signed build;
- privacy, support and account-deletion URLs;
- final screenshots captured from the approved signed production build;
- stable verified fictional reviewer household with harmless sample records;
- concise review notes covering login, native utility, attachments, sharing and deliberate exclusions.

Exit criteria:

- No placeholder artwork, metadata or credentials.
- Reviewer access is stable and stored only in App Store Connect.
- Screenshots and claims exactly match the candidate.

## Phase H: Submission-Readiness Audit

Produce one go/no-go record tying together:

- exact Git commit and release tag;
- standard CI and Native CI;
- Vercel production deployment;
- migration and provider readiness;
- signed IPA and TestFlight build;
- physical-device acceptance;
- public legal/support/deletion URLs;
- privacy declarations and signed-build privacy evidence;
- store metadata and screenshots;
- reviewer credentials and journey;
- support, rollback and incident ownership.

Ready-for-submission means every mandatory item is evidenced, no release blocker remains, and the release owner has received the final go/no-go report. App Review submission is a separate explicit approval step.

## Current Critical Path

1. Obtain executable exact-head verification for current main.
2. Confirm the PR #158 production deployment and attachment lifecycle.
3. Complete controlled synthetic production acceptance.
4. Close final public identity/legal inputs.
5. Connect Apple account and protected signing materials.
6. Produce and test the signed TestFlight candidate.
7. Finalise store assets, declarations and reviewer access.
8. Complete the submission-readiness audit and request submission approval.
