# Backlog And Roadmap

> Current completion order and scope are governed by `docs/APP_STORE_DELIVERY_PLAN_CURRENT_STATUS_2026-08-01.md`. Earlier deferred or excluded wording below is historical and does not remove any of the 17 approved optional capabilities from version 1.0 delivery.

## Complete

- Phase 1A foundation and visual shell.
- Phase 1B Prisma data model foundation.
- Phase 1C read-only core screen shells with non-saving create/edit shells.
- Phase 1D review and hardening.
- Phase 1E persistence readiness for room and asset shell forms.
- Phase 1F first room persistence.
- Phase 1G asset persistence.
- Phase 1H maintenance persistence.
- Phase 1I warranty persistence.
- Phase 1J receipt and document metadata persistence.
- Phase 1K form choice usability.
- Phase 1L workflow consistency review and stale-status correction.
- Phase 1M fallback-safe household dashboard.
- Phase 1N readable status, frequency and document labels.
- Phase 1O fallback-safe search across core lists.
- Phase 1P maintenance due and warranty expiry awareness.
- Phase 1Q navigation between existing linked household records.
- Phase 1R complete identifying, purchase and lifecycle asset metadata.
- Phase 1S optional asset category linking.
- Phase 1T maintenance lifecycle status control.
- Phase 1U optional maintenance service-provider linking.
- Phase 1V custom maintenance interval metadata.
- Online-first development workflow.

## Near Term

- Publish the canonical-domain source revision when Vercel build capacity permits.
- Enable the approved Better Auth, Resend and private Blob production services.
- Rehearse and deploy the reviewed Prisma migration baseline after a current Neon restore point.
- Create the synthetic reviewer household and execute the final web acceptance protocol.
- Produce signed iOS and Android candidates after client-owned store identities and credentials are available.

## Future Approved-Decision Candidates

- Reminder delivery.
- Advanced household invitations and role management.
- Multi-property support.
- Biometric native re-entry.
- Optional privacy-reviewed crash reporting.

## Not Planned For The Initial Release

- OCR or AI extraction.
- Budgeting, valuation or other financial features.
- Public attachment links.
- Insurance claim automation.
- Advertising or behavioural analytics.
- Paid third-party integrations without separate approval.

## Phase 1W Complete

Added searchable provider list/detail routes and linked-task navigation. Provider mutations and external service integrations remain deferred.

## Phase 1X Complete

Added warranty start/expiry consistency validation without adding automation, reminders or schema changes.

## Phase 2K Complete

Added household-wide, fallback-safe search across existing household record types with grouped navigation. Search persistence, analytics and external search services remain out of scope.

## Phase 2V Complete

Prepared dual-store listing copy and screenshot/reviewer inputs. Final public naming, trademark clearance, legal identity, support details and store-account setup remain client-controlled submission gates.


## Completed Product Expansion

- Phase 3C automatic maintenance schedule advancement after completion.

## Independent Next Candidates

- Read-only calendar feeds and portable calendar export for due maintenance, reminders and warranties.
- Household data export in portable structured formats.
- Home inventory print and household handover summary without claim automation. Complete in Phase 3G.
- Maintenance templates for common Australian household equipment. Complete in Phase 3F.
- Archive and recovery workflows before destructive deletion is introduced. Complete in Phase 3H.


## Phase 3I Complete

Added a derived beginner setup guide across the existing household profile, room, asset, maintenance, warranty and record workflows. No onboarding state or analytics is stored.


## Phase 3J Complete

Added a global mobile-first Quick Add hub over all existing guarded creation workflows. No mutation capability changed.

## Phase 3M Complete

Added fallback-safe room detail pages with assigned asset and linked maintenance navigation. No schema or mutation capability changed.

## Phase 3N Complete

Connected asset detail to existing maintenance and reminder records. No schema, scheduling or notification capability changed.

## Phase 3O Complete

Added fallback-safe asset category detail pages and assigned-asset navigation. The taxonomy and persistence model remain unchanged.

## Phase 3P Complete

Surfaced existing reminder metadata on warranty detail without adding delivery, scheduling or persistence capability.

## Phase 3Q Complete

Exposed existing receipt and document relationships without adding storage, uploads, inferred links or new persistence.

## Phase 3R Complete

Surfaced existing maintenance document and reminder relationships without changing persistence, scheduling or delivery.

## Phase 3S Complete

Added a generated, spreadsheet-safe maintenance completion export with no storage, external destination or financial behavior.

## Phase 3T Complete

Added safe, user-initiated call, email and website actions for provider metadata without messaging, booking or external APIs.

## Phase 3U Complete

Added a privacy-safe, read-only summary of current household members in Settings and the portable household export. Invitations, role changes and real household sharing remain gated on production authentication and server-side household authorisation.

## Phase 3V Complete

Added mobile-friendly room, category and lifecycle filters to the existing asset inventory. Filtering uses URL query parameters and already-loaded records only; no preference or search history is stored.

## Phase 3W Complete

Added status, Brisbane due-state and linked-asset filters to the maintenance work queue. Filter state remains transparent URL state and creates no notification, schedule or persistence behavior.

## Phase 3X Complete

Added coverage-state, asset and provider filters to warranty review, including missing-expiry and missing-provider records. No reminder delivery or claim automation was introduced.

## Phase 3Y Complete

Added record-type, linked-asset and document-type filters to receipt and document metadata review, including unlinked records. File storage and uploads remain separate release gates.

## Phase 3Z Complete

Added lifecycle, due-state and linked-record filters to reminder metadata review. Notification delivery, queues and background scheduling remain unimplemented.

## Phase 4A Complete

Added trade, linked-task and contact-detail filters to the provider directory, including explicit data-gap views. Booking, messaging, payments and external provider services remain out of scope.

## Phase 4B Complete

Added floor/zone and linked-asset filters to Rooms, including missing-floor and empty-room records. Floor plans and occupancy tracking remain outside HomeVault's practical record scope.

## Phase 4C Complete

Added assigned-asset counts and used-versus-empty filtering to asset categories. The taxonomy remains broad and flat, with no automatic classification or nested structure.

## Phase 4D Complete

Added search and record-type filters to the derived archive. Permanent deletion and account-lifecycle retention remain production identity and policy gates.

## Phase 4E Complete

Locked self-hosted Better Auth, verified email/password, HomeVault-owned household authorisation and Vercel Private Blob as the production release architecture. Implementation proceeds before client-owned email, storage, legal and store-account gates.

## Phase 4F Complete

Added the fail-closed Better Auth package, schema and runtime foundation. Live signup, email delivery, onboarding and household authorisation remain disabled until their dedicated phases and provider gate.


## Phase 4G Completed

- [x] Resolve verified sessions to immutable application users.
- [x] Require explicit household membership before selecting a home.
- [x] Prevent authenticated environments from falling back to preview access.
- [x] Define shared write, administration and cross-household scope rules.
- [ ] Migrate every database read and mutation to the household access boundary.


## Phase 4H Completed

- [x] Scope all central household reads with the resolved access Home ID.
- [x] Select the database client from authenticated or controlled-preview access mode.
- [x] Preserve curated sample fallback when access or the database is unavailable.
- [x] Enforce the household read boundary in CI.
- [ ] Migrate all Server Actions and form availability checks to writable household access.


## Phase 4I Completed

- [x] Require OWNER or ADULT membership for every existing mutation.
- [x] Scope related-record validation and writes to the authorised Home ID.
- [x] Keep CHILD and GUEST memberships read-only.
- [x] Derive form availability from server-side household access.
- [x] Reject app-route access-boundary bypasses in CI.
- [ ] Add production account screens, onboarding and lifecycle workflows.


## Phase 4J Completed

- [x] Add verified email/password sign-in UI.
- [x] Gate signup on explicit enablement and transactional email readiness.
- [x] Add account status and sign-out.
- [x] Keep account routes useful without runtime secrets.
- [x] Smoke-test account routes without a database.
- [ ] Create the first household atomically for a verified member.
- [ ] Add recovery and account deletion lifecycle.


## Phase 4K Completed

- [x] Require a verified session for first-home setup.
- [x] Create Home and OWNER membership atomically.
- [x] Make concurrent/repeated onboarding idempotent.
- [x] Validate Australian household metadata.
- [x] Redirect existing members away from onboarding.
- [ ] Protect authenticated navigation presentation.
- [ ] Add password recovery and account deletion lifecycle.


## Phase 4L Completed

- [x] Protect shared household navigation when auth is configured.
- [x] Route unauthenticated users to sign in.
- [x] Route verified membership-less users to onboarding.
- [x] Keep privacy, support and offline access public.
- [x] Enforce navigation contracts in CI.
- [ ] Add password recovery and account deletion lifecycle.


## Phase 4M Completed

- [x] Add a concrete provider behind the internal auth email boundary.
- [x] Require provider, sender and credential before email is available.
- [x] Add enumeration-safe reset request UI.
- [x] Add token completion with session revocation.
- [x] Keep no-secret deployments useful and testable.
- [ ] Provision and verify the client-owned sending domain and credential.
- [ ] Add account export/deletion lifecycle.


## Phase 4N Completed

- [x] Add in-app permanent account deletion.
- [x] Delete sole-member households and their relational records atomically.
- [x] Block owners from abandoning other members.
- [x] Protect exports when production auth is configured.
- [x] Publish a public deletion-information route.
- [ ] Extend deletion to private Blob attachments after storage is provisioned.
- [ ] Baseline and apply production database migrations.
