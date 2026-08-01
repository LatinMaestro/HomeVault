# HomeVault App Store Delivery Plan

Status date: 1 August 2026  
Repository: `LatinMaestro/HomeVault`  
Target: complete the core product and all approved optional capabilities, exact-head verify one immutable release candidate, and stop for explicit owner approval before Apple App Review submission.

## 1. Verified repository checkpoint

### Merged and verified

- GitHub Actions capacity has returned and workflows execute real steps.
- PR #159 merged the complete delivery and Actions-reset integration plan after executable CI.
- PRs #160–#163 integrated household role policy, invitation contract, invitation lifecycle and ownership transfer.
- PRs #164–#168 integrated property selection, property creation, property record/private-file isolation, property-scoped export and property deletion policy contracts.
- Current `main` is `0a4369afd1224a5202b3d80932544bbdebbf898a` from PR #168.
- No pull requests are currently open; PRs #159–#168 have no unresolved review threads.
- The repository contains 192 `agent/*` remote branches. Relevant remaining branches were audited individually; most are cumulative stacks with merge base `8ed478b78c24dc37a43320ea272e5db6ccced4fb`, ten commits behind current `main`, and therefore source-only.
- PR #168 exact head passed standard CI run `30695885720` and native CI run `30695885724`, including Android and iOS debug/release builds.
- Production `https://homevault.grovekind.com/api/health` and `/api/readiness` returned HTTP 200 on 1 August 2026.
- Better Auth, Resend, the production Neon migration baseline and private Vercel Blob are connected.

### Not yet complete

- The recently merged Phase 5 slices are policy contracts and executable unit boundaries. They must not be represented as complete user-facing optional features until their schema, server, UI, provider and end-to-end work is implemented.
- Remaining remote optional-feature branches are source material with stale or divergent ancestry. They are not merge-ready and must not be bulk-merged.
- Several source-of-truth documents still contain pre-production statements that conflict with connected production services or the approved optional programme.
- There is no immutable release candidate, signed IPA, processed TestFlight build, physical-device acceptance record, final reviewer account, final store disclosure approval or submission approval.
- No commercial model has been selected. In-app purchases are required only if the approved model sells digital features or subscriptions.

## 2. Delivery rules

1. GitHub is the source of truth. Use hosted GitHub/Vercel/provider services only; never require client-side development tools.
2. Treat each staged branch as source material. Resolve and record its exact source head and intended files immediately before extraction.
3. Use one focused atomic PR for each dependency-ready slice. Preserve source and rebased lineage in the PR.
4. Run focused tests plus data-boundary, migration, Prisma, dependency, lint, strict TypeScript, production build, route smoke and every path-applicable native/security check.
5. Inspect real jobs, steps, logs and artifacts. A zero-step or `startup_failure` run is neither a source pass nor a source failure.
6. Review the complete diff, resolve every review thread and merge only the exact green head.
7. Verify the resulting target branch and merged blob identities before advancing.
8. Use fictional QA accounts, households, properties, attachments, calendars, emails and provider payloads only.
9. Keep files private and enforce household/property authorization on the server. Never expose Blob URLs as authorization.
10. Never put secrets, signing material, real household data or provider credentials in source, logs, artifacts, PRs or chat.
11. OCR and AI output remains an untrusted reviewable draft until the user explicitly confirms it.
12. Deletion and retention must cover database records, private files, devices/offline caches, processor copies, calendars, notification tokens, ingestion routes, shares and integrations.
13. Do not enable paid providers, irreversible production migrations, signing, TestFlight distribution or public submission without the matching approval gate.
14. Never submit to App Review or publish publicly without explicit owner approval.

## 3. Vercel deployment conservation

GitHub Actions is authoritative for routine validation. The current Git integration can deploy every pushed branch and every merge, so deployment conservation must be established before the remaining high-volume integration queue.

### Required control

- Add a reviewed deployment-control configuration using Vercel's supported `git.deploymentEnabled` branch patterns, or an equivalent project-level Git control, so routine `agent/*` and delivery-integration branches do not create deployments.
- Use a hosted `delivery/integration` branch for focused exact-green PRs if repository workflows are updated to execute on that target.
- Merge the integration branch to `main` only at a milestone checkpoint.
- If static branch suppression cannot be verified safely, disable automatic deployments and use an authenticated hosted deployment workflow only for milestone commits.
- Do not use an ignored-build command as the primary quota control: ignored builds can still count as deployments.
- Never create no-op or deployment-only commits and never redeploy unchanged code.

### Allowed milestone deployments

1. Household, invitations and multi-property complete.
2. Notifications, calendar and native household utilities complete.
3. Document intelligence and controlled external surfaces complete.
4. Immutable full-system release candidate.

Each milestone deployment must bind the exact commit, READY state, canonical host, health/readiness, auth boundary, private-file behavior and milestone journeys. A replacement deployment is allowed only after a real blocker is fixed.

## 4. Detailed delivery phases

### Phase 0 — Repository truth and integration controls

Deliverables:

- Reconcile `AGENTS.md`, `README.md`, `PLAN.md`, the backlog, readiness, privacy/security, reviewer and decision documents against current production services and the approved 17-capability programme.
- Mark historical status documents as superseded without deleting their evidence.
- Inventory all open/draft PRs, review threads, workflow conclusions, artifacts and relevant remote heads.
- Classify each remote branch as merged, source-only, superseded, blocked or unsafe.
- Add the Vercel deployment-conservation control and extend standard/native workflows to the integration target if required.
- Prove a documentation-only/routine branch can complete GitHub gates without consuming a Vercel deployment.

Exit gate: repository truth is internally consistent; routine GitHub integration does not consume Vercel deployment capacity; no stale PR is silently merged.

### Phase 1 — Finish identity and multi-property policy integration

Dependency order:

1. `multi-property-account-lifecycle`
2. `verified-email-change-policy`
3. `social-identity-linking-policy`

For each source:

- lock the exact remote head, base, file set and Git blobs;
- extract the smallest coherent patch onto the latest verified integration target;
- repair only evidenced stale-path, syntax, dependency or runtime-safety defects;
- run focused and full required checks;
- review and merge only the exact green head.

Exit gate: all remaining Phase 5 policy contracts are exact-green and the complete policy surface has no contradictory role, property, identity, export or deletion rules.

### Phase 2 — Implement household, invitation and multi-property product journeys

This phase turns the merged policy contracts into real product capability.

Deliverables:

- production schema/migrations for invitations, membership lifecycle, selected property, transfer confirmations and required audit/version fields;
- owner-only invitation/member administration with no direct OWNER invite or reassignment;
- invitation issue, resend, expiry, revoke, acceptance and replay protection;
- safe non-owner departure, protected owner removal and explicit ownership transfer;
- create, list and switch properties with property-scoped roles and server-owned selection;
- property-isolated reads, writes, search, reminders, files, exports and caches;
- verified email-change initiation, dual-address proof, expiry, replay protection and session handling;
- optional social linking with state, nonce, PKCE, provider-subject binding, safe unlinking and no automatic account merge;
- property-scoped export and property/account deletion implemented across all current data stores;
- settings, onboarding, error, empty, loading and accessibility states for every journey;
- migration, authorization, cross-user, cross-property, export and deletion integration tests.

Milestone 1 gate: exact-green web/native CI, synthetic multi-user/multi-property acceptance, complete deletion evidence, one allowed Vercel milestone deployment and production migration approval before any irreversible change.

### Phase 3 — Reminder delivery and user-controlled calendar sync

Dependency order:

1. notification preferences and quiet hours;
2. scheduling, delivery, retries, deduplication and secure deep links;
3. external-calendar authorization, managed-event sync and revocation.

Deliverables:

- per-user/per-property reminder channel preferences, timezone and quiet hours;
- local notification scheduling where appropriate;
- push token enrollment, rotation, device loss and account/property cleanup;
- durable server scheduling with leases, idempotency, retry limits and deduplication;
- authorization-bound deep links that revalidate access before showing a record;
- user-controlled calendar OAuth with least-privilege scopes;
- versioned managed-event IDs, update/delete reconciliation and disconnect cleanup;
- permission-denied, offline and stale-access states;
- background-job, time-zone/DST, retry, replay and revocation tests.

Provider gate: approve push/calendar providers, accounts, scopes, cost, retention and disclosure changes before enablement.

### Phase 4 — Native security, capture, offline access and utilities

Dependency order:

1. biometric re-entry;
2. camera/document capture;
3. encrypted bounded offline access;
4. widgets, App Shortcuts/App Intents and share/import extensions.

Deliverables:

- platform-secure credential/key material and biometric re-entry bound to the exact account, installation and server session;
- secure wipe on logout, account/property removal, biometric/device-state change or expiry;
- camera/files capture with permission rationale, page review, crop/rotation/retake and private upload;
- encrypted, size-bounded and time-bounded offline snapshots with property/user binding;
- queued offline actions with idempotency keys, optimistic version checks, conflict review and safe retry/discard;
- device-loss, revocation and expiry handling;
- low-data widgets, shortcuts and import handoffs that never expose private household content while locked;
- accessibility, backgrounding, interrupted-upload and storage-pressure tests.

Milestone 2 gate: exact-green web/Android/iOS CI, simulator regression, hosted end-to-end validation and one allowed Vercel milestone deployment.

### Phase 5 — Expanded attachments, malware gate and document intelligence

Dependency order:

1. HEIC/HEIF and multiple private attachments/galleries;
2. approved malware scanning/quarantine gate where required;
3. OCR extraction drafts;
4. AI classification, summaries and maintenance suggestions as drafts;
5. email ingestion with quarantine and review-before-save.

Deliverables:

- content-signature validation, safe image conversion, bounded file/page/count limits and private thumbnails;
- atomic gallery ordering/replacement and complete orphan cleanup;
- quarantine, scanning result, timeout/retry and provider-unavailable states;
- OCR field-level confidence, source page/provenance and mandatory user confirmation;
- AI outputs clearly labelled as drafts, never auto-writing or auto-triggering maintenance/provider actions;
- email routes bound to exact user/property, verified webhook signatures, sender/routing validation, attachment quarantine, deduplication and review grants;
- processor minimisation, retention, deletion and audit evidence;
- hostile-file, decompression, replay, duplicate, prompt-injection and cross-property tests.

Provider gate: approve malware, OCR, AI and inbound-email providers, cost ceilings, regions, training/retention terms and privacy disclosures before enablement.

### Phase 6 — Controlled sharing and provider handoff

Deliverables:

- time-limited, recipient-bound, revocable sharing grants;
- versioned sessions, rate limits and revalidation on every request;
- server-proxied private files with no public Blob URL exposure;
- view/download scope controls and immediate revoke/delete behavior;
- provider booking/message handoff as an explicit user-confirmed draft/action;
- connector allowlists, minimum payloads, webhook verification, replay protection and cleanup;
- no automated provider payment, insurance claim automation or unrestricted public attachments;
- abuse, enumeration, revocation, expiry and cross-property tests.

Milestone 3 gate: exact-green hosted journeys, privacy/security review, approved providers and one allowed Vercel milestone deployment.

### Phase 7 — Privacy-safe diagnostics and commercial decision

Deliverables:

- crash reporting limited to operational diagnostics with aggressive redaction and no behavioural analytics, advertising or tracking;
- consent/disclosure behavior appropriate to the approved provider and jurisdictions;
- installation/account deletion cleanup and retention controls;
- explicit commercial decision: free, paid-up-front, or subscription;
- if no digital paid feature exists, document that IAP is not required;
- if subscriptions or digital entitlements are approved, implement StoreKit/Play Billing, server receipt verification, restore purchases, family/account handling, store notifications, replay protection and entitlement deletion/export behavior;
- never select pricing, trials or plans without owner approval.

Client gate: approve crash provider, commercial model, pricing and subscription terms before enablement.

### Phase 8 — Full-system hardening and regression

Candidate-bound suites must cover:

- authentication, recovery, email change, social link/unlink and session revocation;
- invitation, role, departure, removal and ownership transfer;
- multi-property isolation for reads, writes, files, search, reminders, exports and deletion;
- notifications, calendar, offline queues, conflict handling and device loss;
- capture, attachment galleries, scanning, OCR/AI review and email ingestion;
- controlled sharing and provider handoff;
- account/property export and complete deletion across every processor and device surface;
- authorization/IDOR, CSRF, open redirect, replay, rate limit, secret/log, private-file and supply-chain controls;
- accessibility: keyboard, screen reader, VoiceOver/TalkBack, text scaling, contrast, motion and touch targets;
- performance: launch, navigation, list/search, upload, sync, memory, battery/background and network budgets;
- migration forward/rollback procedure and provider outage degradation;
- current supported iPhone, representative iPad and supported Android physical-device matrix.

Exit gate: all candidate-bound evidence is fresh, reproducible and attached to one exact commit; no high/critical defect or unresolved release thread remains.

### Phase 9 — Freeze and deploy the immutable release candidate

Deliverables:

- freeze one exact commit and app version/build number;
- generate SBOM/dependency and license evidence;
- apply only approved production migrations with restore point and rollback owner;
- perform the single full-system Vercel deployment for that exact commit;
- verify commit identity, READY state, canonical host, redirects, health/readiness, auth/email/database/private Blob boundaries and critical journeys;
- prohibit feature changes after freeze; fixes create a replacement candidate and repeat affected gates.

### Phase 10 — Close provider, legal, public and operational gates

Owner/client actions performed through hosted portals only:

- approve final public product name, entity/developer name and trademark/store availability;
- approve privacy policy, terms if required, retention periods, processor list and support ownership;
- approve provider contracts, regions, costs and production credentials;
- confirm `homevault.grovekind.com`, privacy, support and deletion URLs;
- choose the commercial model and complete tax/banking agreements if applicable;
- nominate incident, rollback, privacy-request and account-recovery owners;
- create a fictional verified reviewer household without exposing credentials in source or chat.

Engineering must pause only at the specific blocked gate and provide exact web-portal steps.

### Phase 11 — Apple signing, TestFlight and physical-device acceptance

Client prerequisites:

- active Apple Developer Program membership and accepted agreements;
- App Store Connect app record, bundle ID and team ID;
- signing certificate/profile or approved App Store Connect/GitHub secret setup;
- App Store Connect API key stored only in encrypted hosted secrets;
- required Universal Link association values.

Engineering deliverables:

- produce and inspect the signed IPA without exposing signing secrets;
- verify entitlements, bundle/version, privacy manifest, permissions and export compliance;
- upload only after the client gate authorizes TestFlight distribution;
- wait for processing and resolve validation issues;
- complete current-iPhone and representative-iPad TestFlight QA, plus Android internal testing where maintained;
- record device/OS/tester/time/result evidence and close every defect.

### Phase 12 — Store materials and reviewer package

Deliverables:

- screenshots captured from the signed accepted build for required device classes;
- final title, subtitle, description, keywords, categories, age rating and support copy;
- final Apple App Privacy answers derived from actual signed-build behavior and contracts;
- permission purpose strings and reviewer notes explaining login, files, notifications, offline, OCR/AI and deletion;
- stable fictional reviewer account/household and support escalation path;
- privacy, support and deletion URLs verified publicly;
- no placeholders, stale claims or undisclosed processors/permissions.

### Phase 13 — Final go/no-go and explicit submission approval

The final audit must bind:

- exact commit, version and build;
- standard/native/security/migration CI and artifacts;
- milestone deployment and production migrations;
- enabled providers and approved contracts/disclosures;
- signed IPA and TestFlight processing;
- physical-device acceptance;
- screenshots, listing, privacy answers and reviewer access;
- rollback, incident, support and privacy-request ownership;
- all client decisions and waivers.

Stop with one explicit recommendation: `GO`, `NO-GO`, or `GO WITH LISTED OWNER ACTIONS`. Even a `GO` result does not authorize submission. Wait for the owner's explicit instruction before pressing Submit for Review or publishing publicly.

## 5. Approved capability coverage

| Capability | Policy/source state | Product completion phase |
| --- | --- | --- |
| Reminder delivery, preferences, quiet hours, deep links and deduplication | staged remote source | Phase 3 |
| Invitations, roles, departure/removal and ownership transfer | policy integrated | Phase 2 |
| Multi-property roles, isolation, exports and deletion | partial policy integrated | Phases 1–2 |
| Verified email change and safe social linking | staged remote source | Phases 1–2 |
| Biometric re-entry | staged remote source | Phase 4 |
| Camera/document capture | staged remote source | Phase 4 |
| HEIC/HEIF, galleries and malware gate | staged remote source | Phase 5 |
| Encrypted bounded offline access | staged remote source | Phase 4 |
| External calendar sync | staged remote source | Phase 3 |
| OCR with confidence/provenance/confirmation | staged remote source | Phase 5 |
| AI drafts only | staged remote source | Phase 5 |
| Email ingestion/quarantine/review | staged remote source | Phase 5 |
| Time-limited revocable sharing | staged remote source | Phase 6 |
| Provider handoff/integrations | staged remote source | Phase 6 |
| Privacy-safe crash reporting | staged remote source | Phase 7 |
| Commercial/IAP if approved model requires it | decision contract staged | Phase 7 |
| Widgets, shortcuts and share/import extensions | staged remote source | Phase 4 |

### Audited remaining source heads

These heads are evidence anchors, not merge instructions. Re-resolve every head immediately before extraction and record any change.

| Source branch | Audited head |
| --- | --- |
| `agent/multi-property-account-lifecycle` | `b2dca623a38ac36b49a27c39a29c61496ef9a4b9` |
| `agent/verified-email-change-policy` | `30b6ee0ca679f6b5a25a536d6dfe6ef76faf7c39` |
| `agent/social-identity-linking-policy` | `db2b3ac242d1456f051f654d6d56b21c7cb23677` |
| `agent/notification-preferences-quiet-hours` | `113feabc642a15d44a28255b50925908234115bf` |
| `agent/notification-delivery-scheduling` | `051bd58bb50153b403ee285bf488d63dd0b02c75` |
| `agent/external-calendar-connection-policy` | `a4481c120199783ed83ff417cf10fd7c175c430f` |
| `agent/biometric-native-reentry-policy` | `e95fe0fa6cc8f5d1b0cf3558b95d625b8cb3b171` |
| `agent/native-document-capture-policy` | `324cd4c6894c856694851fbf916b594fd3291e3a` |
| `agent/encrypted-offline-household-policy` | `7977c6e70e77402fb37d72cd972b5f8aadf5ed16` |
| `agent/native-utilities-policy` | `91277df3a34e5d88d545a3d8b7777a3d03492224` |
| `agent/expanded-private-attachments-policy` | `c0f41345d2ed3785efa310fadc2b20316a5231b5` |
| `agent/ocr-extraction-policy` | `4353eba4a85cfce75644575f249e0baeb12eb1ee` |
| `agent/ai-assistance-policy` | `3995a5c2861874e9585ee2bf9734e21d4adcca05` |
| `agent/email-ingestion-policy` | `e83cd0c326d680ed9d01fb29fb19491219f3d86c` |
| `agent/controlled-sharing-policy` | `b8df45474c16c4f5ef594776796d5e02a314e457` |
| `agent/provider-handoff-policy` | `1021916228806bf760e437710abdd3231e8872ec` |
| `agent/privacy-safe-crash-reporting-policy` | `4dc607a05f2ed5c2fd41f4d080d883187e5776e2` |
| `agent/commercial-model-iap-decision-policy` | `1e6af6c40bef51382ac69ac24d4f2e76fdbfc56a` |
| `agent/store-disclosure-audit-policy` | `920bdeeab0ef074a60cb4bc8e9312e7f27964030` |
| `agent/submission-readiness-audit-policy` | `8e86a1f30020f7222b65154975656786d1ae4341` |
| `agent/full-system-acceptance-policy` | `eed7e81946bc1724a2b671812bdd10cedfb354e3` |

## 6. Explicit exclusions

Unless the owner changes scope through a separate recorded decision, exclude:

- budgeting, valuation and financial advice;
- insurance claim automation;
- advertising, tracking and behavioural analytics;
- automated provider payments;
- unrestricted public attachments;
- automatic OCR/AI writes or actions;
- production use of real household data in QA.

## 7. Hourly automation operating protocol

At each run:

1. Read this plan, `AGENTS.md` and every mandatory release/source-of-truth document.
2. Resolve exact `main`/integration heads, open PRs, review threads, workflows, artifacts and relevant remote heads.
3. Resume the earliest dependency-ready item without duplicating work.
4. Prefer completing one exact-green focused slice over starting several unfinished slices.
5. Use GitHub Actions for routine verification and preserve the Vercel milestone budget.
6. Merge only under the documented evidence gate and verify the resulting target.
7. Continue safe independent work around provider/client blockers.
8. Pause only for credentials, cost/provider/legal/commercial decisions, irreversible production changes, physical-device work, Apple agreements/signing/TestFlight/store actions, reviewer credentials or material product choices.
9. End every session with a short update: completed work and evidence, current exact state, blocker if any, and the next action.
