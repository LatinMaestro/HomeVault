# HomeVault Plan

## Project Workflow

HomeVault now uses an online-first workflow for normal MVP development.

- GitHub `main` is the source of truth.
- Work happens through scoped branches and pull requests.
- Codex cloud/sandbox environments are preferred for implementation and checks.
- GitHub PRs are the preferred code review method.
- GitHub Actions is the primary automated check gate when Vercel usage is constrained.
- Vercel Preview Deployment URLs are the preferred UI review method when usage allows.
- Vercel production deployment comes from `main` after merge.
- The client should not be asked to run local development commands unless there is genuinely no online alternative.
- Local development instructions are optional developer reference only.

## Phase 1A: Foundation - Complete

- Created complete documentation suite.
- Scaffolded deployable Next.js shell.
- Added placeholder navigation and pages.
- Established visual direction and review workflow.

## Phase 1B: Data Model - Complete

- Added Prisma and PostgreSQL-compatible schema.
- Added seed data and lazy database helper structure.
- Kept storage references as metadata only until file storage is approved.
- Preserved Vercel builds without build-time database dependency.

## Phase 1C: Core Screen Shells - Complete

- Added approved rooms, assets, maintenance, warranties and receipts/documents screen shells.
- Added partially database-backed read-only screens with sample-data fallback.
- Kept create/edit pages as non-saving shells.
- Kept auth single-user and stubbed.

## Phase 1D: Review And Hardening - Complete

Phase 1D completed the controlled polish, accessibility, reliability and review-readiness pass for the Phase 1C screens. It improved existing read-only flows without adding persistent mutations, production auth, uploads, AI, OCR, notifications, payments, analytics or native app work.

Completed Phase 1D hardening includes:

- Clearer non-saving shell form states.
- Empty, loading, not-found and error states.
- Better page metadata and route navigation.
- Review summary panels for core list and hub screens.
- More accessible data-source and empty-state presentation.
- Online CI workflow for Prisma, lint, typecheck and build evidence.
- Online-first and Vercel-light workflow documentation.

See `docs/PHASE_1D_PLAN.md` for the detailed completion summary.

## Phase 1E: Persistence Readiness - Complete

Phase 1E prepared room and asset create/edit shells for future persistence without enabling real saving. It added shared field definitions, helper text, recommended-field cues and preview-only form checks while preserving fallback-safe read-only data behaviour.

Phase 1E did not add persistent mutations, production auth, uploads, OCR, AI, notifications, payments, analytics, native app work or local-client setup requirements.

See `docs/PHASE_1E_PLAN.md` for the detailed completion summary.

## Phase 1F: First Room Persistence - Complete

Phase 1F introduced the first real database-backed mutation workflow for rooms only. It enables room create/edit persistence when `DATABASE_URL` is configured while preserving database-independent builds and useful unavailable-database messaging.

Phase 1F did not add deletes, asset persistence, production auth, uploads, OCR, AI, notifications, payments, analytics, native app work or local-client setup requirements.

See `docs/PHASE_1F_PLAN.md` for the detailed completion summary.

## Phase 1G: Asset Persistence - Complete

Phase 1G extended the room mutation pattern to assets only. It enables asset create/edit persistence when `DATABASE_URL` is configured, including optional room association by room name, while preserving database-independent builds and useful unavailable-database messaging.

Phase 1G did not add deletes, warranty/receipt/document/maintenance persistence, production auth, uploads, OCR, AI, notifications, payments, analytics, native app work or local-client setup requirements.

See `docs/PHASE_1G_PLAN.md` for the detailed completion summary.

## Phase 1H: Maintenance Persistence - Complete

Phase 1H introduced maintenance task create/edit persistence and a simple additive completion workflow when `DATABASE_URL` is configured. It keeps recurrence automation, notifications, deletes, warranty persistence, production auth, uploads, OCR, AI, payments, analytics and native app work out of scope.

See `docs/PHASE_1H_PLAN.md` for the detailed completion summary.

## Phase 1I: Warranty Persistence - Complete

Phase 1I introduced metadata-only warranty create/edit persistence when `DATABASE_URL` is configured. It keeps document uploads, reminder delivery, deletes, production auth, OCR, AI, payments, analytics and native app work out of scope.

See `docs/PHASE_1I_PLAN.md` for the detailed completion summary.

## Phase 1J: Receipt And Document Metadata Persistence - Complete

Phase 1J added guarded create/edit persistence for receipt and document metadata while keeping files, storage, OCR, email ingestion, deletes and financial workflows out of scope.

See `docs/PHASE_1J_PLAN.md` for the completion record.

## Phase 1K: Form Choice Usability - Complete

Phase 1K improved existing forms with controlled room, asset, enum, date and amount inputs while preserving current routes, actions and scope.

See `docs/PHASE_1K_PLAN.md` for the completion record.

## Phase 1L: Workflow Consistency Review - Complete

Phase 1L reviewed the deployed app at desktop and mobile sizes, confirmed fallback screens load without browser errors, and corrected stale dashboard and Settings copy that still described approved create/edit persistence as unavailable.

The review did not add routes, mutations, data models or product features. See `docs/PHASE_1L_REVIEW.md` for the review evidence.

## Phase 1M: Household Dashboard - Complete

Phase 1M turned Home into a useful household snapshot using existing fallback-safe runtime reads. It surfaces upcoming maintenance, warranty coverage, inventory counts and receipt/document counts without adding models, mutations or integrations.

See `docs/PHASE_1M_PLAN.md` for the completion record.

## Phase 1N: Readable Household Labels - Complete

Phase 1N replaced database-style enum text on existing list and detail screens with household-friendly labels while preserving stored values and form contracts.

See `docs/PHASE_1N_PLAN.md` for the completion record.

## Phase 1O: Core List Search - Complete

Phase 1O added accessible query-parameter search to the existing room, asset, maintenance, warranty and receipt/document lists using each page's already-loaded fallback-safe records.

See `docs/PHASE_1O_PLAN.md` for the completion record.

## Phase 1P: Maintenance And Warranty Date Awareness - Complete

Phase 1P added runtime status cues for existing maintenance due dates and warranty expiry dates using the Brisbane calendar, without introducing reminders, notifications or persisted status changes.

See `docs/PHASE_1P_PLAN.md` for the completion record.

## Phase 1Q: Linked Record Navigation - Complete

Phase 1Q made existing room, asset, maintenance, warranty, receipt and document relationships navigable using current routes and already-loaded relation IDs.

See `docs/PHASE_1Q_PLAN.md` for the completion record.

## Phase 1R: Asset Record Completeness - Complete

Phase 1R completed the existing asset metadata workflow with serial number, purchase date, purchase place and lifecycle status using the current guarded Server Actions and Asset model.

See `docs/PHASE_1R_PLAN.md` for the completion record.

## Phase 1S: Asset Category Linking - Complete

Phase 1S connected asset create/edit to the existing optional AssetCategory relationship using current-home database choices and canonical sample fallback choices.

Vercel visual review is deferred until client access is restored. See `docs/PHASE_1S_PLAN.md` for the completion and review record.

## Phase 1T: Maintenance Lifecycle Control - Complete

Phase 1T added guarded Active, Paused, Completed and Archived lifecycle control to existing maintenance create/edit while keeping completion history additive and reminders unimplemented.

Vercel visual review is deferred until client access is restored. See `docs/PHASE_1T_PLAN.md` for the completion record.

## Phase 1U: Maintenance Service Provider Linking - Complete

Phase 1U connected maintenance create/edit to existing current-home ServiceProvider records with canonical sample fallback choices, list visibility and search.

Vercel visual review remains deferred until client access is restored. See `docs/PHASE_1U_PLAN.md` for the completion record.

## Phase 1V: Custom Maintenance Interval Metadata - Complete

Phase 1V completed the existing Custom maintenance frequency with validated day-interval metadata and readable display, without adding recurrence automation.

Vercel visual review remains deferred until client access is restored. See `docs/PHASE_1V_PLAN.md` for the completion record.

## Phase 1W: Read-only Service Provider Directory - Complete

Phase 1W exposed existing service provider records as a searchable, read-only maintenance directory with contact details and linked task navigation.

It did not add provider CRUD, external integrations, authentication, notifications or new data models. Vercel visual review remains deferred until client access is restored. See `docs/PHASE_1W_PLAN.md` for the completion record.

## Phase 1X: Warranty Date Consistency - Complete

Phase 1X prevents warranty create/edit actions from accepting an expiry date earlier than the coverage start date. Validation runs before database access and leaves existing fallback behavior unchanged.

Vercel visual review remains deferred until client access is restored. See `docs/PHASE_1X_PLAN.md` for the completion record.

## Phase 1Y: Maintenance Completion Date Guard - Complete

Phase 1Y prevents additive maintenance history from accepting completion dates after the current Australia/Brisbane calendar date.

Validation runs before database access and does not add scheduling, recurrence automation or notifications. Vercel visual review remains deferred. See `docs/PHASE_1Y_PLAN.md`.

## Phase 1Z: Historical Record Date Guards - Complete

Phase 1Z prevents asset purchase dates, receipt purchase dates and document issue dates from being saved after the current Australia/Brisbane calendar date.

The shared validation runs before database access and does not add financial analysis, automation or schema changes. Vercel visual review remains deferred. See `docs/PHASE_1Z_PLAN.md`.

## Phase 2A: Strict Calendar Date Validation - Complete

Phase 2A centralised form date parsing and rejects impossible or non-calendar values instead of allowing JavaScript date rollover.

All existing optional date fields keep their current behavior. Vercel visual review remains deferred. See `docs/PHASE_2A_PLAN.md`.

## Phase 2B: Receipt Amount Boundary - Complete

Phase 2B validates optional receipt totals against the PostgreSQL/Prisma integer-cent storage boundary before database access.

Receipt totals remain archival metadata only; no budgeting or financial analysis was introduced. Vercel visual review remains deferred. See `docs/PHASE_2B_PLAN.md`.

## Phase 2C: Room Name Consistency - Complete

Phase 2C makes room duplicate checks case-insensitive, matching the existing case-insensitive room relationship resolver.

No schema or room workflow changes were introduced. Vercel visual review remains deferred. See `docs/PHASE_2C_PLAN.md`.

## Phase 2D: Linked Asset Revalidation - Complete

Phase 2D invalidates both previous and new asset detail routes when existing tasks, warranties, receipts or documents are reassigned.

No data model or mutation capability changed. Vercel visual review remains deferred. See `docs/PHASE_2D_PLAN.md`.

## Phase 2E: Service Provider Persistence - Complete

Phase 2E adds guarded create/edit persistence for current-home service provider contact metadata and connects those actions to the existing maintenance directory.

Deletes, booking, messaging, ratings, payments and external integrations remain out of scope. Vercel visual review remains deferred. See `docs/PHASE_2E_PLAN.md`.

## Phase 2F: Asset Category Management - Complete

Phase 2F adds guarded list, create and edit workflows for the existing current-home AssetCategory model and refreshes the Vault hub's stale persistence copy.

Deletes and nested category taxonomies remain out of scope. Vercel visual review remains deferred. See `docs/PHASE_2F_PLAN.md`.

## Phase 2G: Shared Current-home Resolver - Complete

Phase 2G replaces repeated name-based home lookup with one lazy earliest-home resolver across runtime reads and writes. This removes the household-name coupling while preserving the explicitly temporary single-home model.

Production authentication and household isolation remain separate decision gates. Vercel visual review remains deferred. See `docs/PHASE_2G_PLAN.md`.

## Phase 2H: Household Profile Settings - Complete

Phase 2H adds guarded editing for the current home's name and Australian address metadata in Settings, backed by the shared temporary current-home resolver.

Multi-home switching, members, roles and production authentication remain separate decision gates. Vercel visual review remains deferred. See `docs/PHASE_2H_PLAN.md`.

## Phase 2I: Read-only Reminder Centre - Complete

Phase 2I exposes existing reminder metadata in a searchable, fallback-safe list and detail workflow with links to related assets, warranties and maintenance tasks.

No reminder create/edit, scheduling automation or notification delivery was introduced. Vercel visual review remains deferred. See `docs/PHASE_2I_PLAN.md`.

## Later Phases

- Production authentication.
- Approved file storage.
- Reminder delivery.
- Multi-home or family sharing if validated.
- Native app only if the web app proves the need.

## Phase 2J: Reminder Metadata Persistence - Complete

Phase 2J extends the reminder centre with guarded metadata create and edit workflows. Reminder title, due date, lifecycle status, notes and optional links can persist when `DATABASE_URL` is configured, while curated sample data and clear unavailable-database feedback keep previews useful without a live database.

This phase does not schedule or send notifications. It adds no delivery channel, background job, queue, delete action, production auth, upload, OCR, AI, payment, analytics or native app capability.

See `docs/PHASE_2J_PLAN.md` for the completion summary.

## Phase 2K: Household-wide Search - Complete

Phase 2K adds one fallback-safe search surface across existing rooms, categories, assets, maintenance tasks, warranties, reminders, service providers, receipts and documents. Results are grouped and link into existing HomeVault routes.

The search reuses lazy runtime reads, remains useful without `DATABASE_URL`, and does not store searches or introduce analytics. No schema, mutation, auth, storage, OCR, AI, notification, payment or native app capability is added.

See `docs/PHASE_2K_PLAN.md` for the completion summary.

## Phase 2L: Dashboard Reminder Visibility - Complete

Phase 2L adds the next pending reminder to the fallback-safe household dashboard with a due-state badge and direct navigation. Reminder data now participates in the dashboard source assessment.

This remains metadata presentation only. No notification delivery, scheduling automation, schema, mutation, analytics or external service is added.

See `docs/PHASE_2L_PLAN.md` for the completion summary.

## Phase 2M: Preview Security Hardening - Complete

Phase 2M adds a conservative browser security-header baseline and excludes the unauthenticated preview from search indexing. It also makes the boundary explicit: current deployments are suitable for curated sample or controlled non-sensitive review data only.

These controls do not replace production authentication or authorization. No auth, schema, dependency, environment variable, storage, OCR, AI, notification, payment, analytics or external integration is added.

See `docs/PHASE_2M_PLAN.md` for the completion summary.

## Phase 2N: Repeat-safe Demo Seeding - Complete

Phase 2N prevents repeated canonical seed runs from creating duplicate Taylor Family Home records. Existing demo data is preserved rather than overwritten.

No database reset, delete, schema, migration, dependency, environment variable or product workflow is added.

See `docs/PHASE_2N_PLAN.md` for the completion summary.

## Phase 2O: Online Route Smoke Gate - Complete

Phase 2O extends GitHub Actions beyond compilation: CI starts the production build without `DATABASE_URL` and requests the approved core and dynamic sample routes.

The smoke runner uses Node.js platform APIs only. No dependency, secret, live database, local client command, Vercel deployment or app behavior change is required.

See `docs/PHASE_2O_PLAN.md` and `docs/TESTING_PROTOCOL.md`.

## Phase 2P: Operational Health Surface - Complete

Phase 2P adds a no-store `/api/health` liveness response that does not touch household data, inspect database configuration or require a secret. The endpoint is included in database-free route smoke coverage.

A generated `robots.txt` also reinforces the no-index preview posture. No monitoring integration, dependency, schema or environment variable is added.

See `docs/PHASE_2P_PLAN.md`.

## Phase 2Q: Household Attention Queue - Complete

Phase 2Q brings overdue and near-term active maintenance, pending reminders and warranty expiries into one compact dashboard panel using the existing Brisbane date rules.

The queue is read-only and fallback-safe. No notification delivery, scheduling, mutation, schema, dependency or external service is added.

See `docs/PHASE_2Q_PLAN.md`.

## Phase 2R: Store Distribution Foundation - Complete

Phase 2R records Apple App Store and Google Play as approved distribution targets and adds the shared installable-web foundation: branded icon, manifest, standalone metadata, safe-area support and install-asset smoke coverage.

The recommended later path is a Capacitor shell only after production auth, authorization, deletion, privacy and storage gates, with meaningful native utility before submission. No native project, signing credential, store account, device permission, dependency or external service is added yet.

See `docs/PHASE_2R_PLAN.md` and `docs/APP_STORE_READINESS.md`.

## Phase 2S: Privacy-safe Offline Shell - Complete

Phase 2S adds network-first navigation with a calm offline fallback for installed mobile use. Only the offline shell and versioned static assets are cached; household pages, data responses and mutations are never cached.

No offline household store, background sync, push delivery, dependency, schema or native project is added.

See `docs/PHASE_2S_PLAN.md`.

## Phase 2T: Mobile Touch Target Hardening - Complete

Phase 2T standardizes frequent buttons, icon actions, inputs, selects and primary navigation at a 44 CSS pixel minimum target for reliable phone use.

The change preserves existing semantics, keyboard focus and visual language. No route, data, dependency, schema or native project is added.

See `docs/PHASE_2T_PLAN.md`.

## Phase 2U: Deployment Contract Smoke - Complete

Phase 2U extends the database-free production smoke from route availability to executable security, health, crawler, install-manifest and service-worker header contracts.

The checks use built-in Node.js APIs and require no live database, secret, Vercel deployment, dependency or client machine.

See `docs/PHASE_2U_PLAN.md`.

## Phase 2V: Store Listing Readiness - Complete

Phase 2V drafts accurate Apple and Google listing copy, screenshot storytelling, review notes, privacy inputs and submission ownership.

Current store research shows multiple existing HomeVault listings, including overlapping home-inventory products. The repository codename remains unchanged, while final public naming and legal clearance are now explicit submission gates.

See `docs/PHASE_2V_PLAN.md` and `docs/STORE_LISTING_DRAFT.md`.


## Phase 2W: Privacy And Support Surfaces - Complete

Phase 2W adds public, static privacy and support routes, links them throughout the application shell and includes them in the database-free route gate. The copy explains the current preview honestly without inventing a legal entity, support mailbox or completed account controls.

See `docs/PHASE_2W_PLAN.md`.

## Remaining Release Plan

The shared HomeVault product surface is substantially complete. Remaining work is organised around production safety and mobile distribution:

1. **Release architecture:** approve the production identity, authentication and storage boundaries; define production, preview and test environments.
2. **Authentication and household authorisation:** replace the temporary earliest-home resolver with signed-in ownership checks on every server read and mutation.
3. **Account lifecycle:** add onboarding, profile management, data export, in-app account deletion and the public deletion path required for mobile distribution.
4. **Document storage:** add approved private file storage, access control, retention, deletion and malware-safe handling. OCR and AI remain separate future decisions.
5. **Production data operations:** use reviewed migrations, backups, restore evidence, environment separation and database-backed workflow tests.
6. **Native mobile delivery:** add iOS and Android projects after the production privacy boundary is complete, with meaningful native utility rather than a minimal web wrapper.
7. **Release validation:** complete accessibility, physical-device, TestFlight and Play internal testing; finalise the public name, legal/privacy text, support channel, screenshots, signing and store forms.

The first five items can proceed in scoped pull requests once their provider and policy gates are approved. Store account ownership, legal identity, final public naming, signing and submission remain client-controlled release actions.


## Phase 2X: Preview Database Safety Lock - Complete

Phase 2X makes the temporary unauthenticated database mode fail closed. `DATABASE_URL` alone no longer enables household reads or writes; controlled non-sensitive preview access requires the separate `HOMEVAULT_PREVIEW_DATABASE_ACCESS=enabled` switch.

All forms use the shared gate, database reads fall back to sample data, and the database helper enforces the boundary even if a caller forgets an earlier check. This is not authentication and must be removed in favour of signed-in household authorisation before production use.


## Phase 2Y: Production Identity Architecture - Complete

Phase 2Y records the production identity boundary without provisioning a service or changing account behavior. Neon Managed Better Auth is the preferred candidate after general availability, with self-hosted Better Auth as the fallback if the managed service remains Beta or cannot meet release requirements.

The phase also refreshes database-source copy and store readiness documentation to match the fail-closed preview behavior. No auth package, secret, schema migration, account route or external project is added.


## Phase 2Z: Data Boundary Contract - Complete

Phase 2Z adds a dependency-free source contract that prevents application code from bypassing the fail-closed database helper. GitHub Actions now rejects direct credential access, Prisma construction outside the approved server module and database imports from client components.

The gate also verifies the explicit controlled-preview switch remains present. It adds no runtime feature, package, secret, schema or external service.


## Phase 3A: Preview Lock Unit Contracts - Complete

Phase 3A adds an executable unit contract for the two-part controlled-preview database gate. CI proves credentials alone, the switch alone and lookalike switch values all fail closed before the app build proceeds.

The test does not connect to a database, add a package or alter runtime behavior.


## Phase 3B: Transport And Resource Header Hardening - Complete

Phase 3B extends the shared browser response baseline with HTTPS transport security, same-origin resource policy, disabled DNS prefetching and rejection of legacy cross-domain policies.

The database-free deployment smoke asserts every new header. No route, dependency, data behavior, external service or Vercel-specific configuration is added.


## Phase 3C: Maintenance Schedule Automation - Complete

Phase 3C turns existing recurrence metadata into useful behavior. Recording a completion advances weekly, fortnightly, monthly, quarterly, six-monthly, yearly and valid custom schedules in the same transaction as completion history. One-off tasks close automatically.

The calculator preserves future cadence, recovers overdue schedules from the actual work date and handles month-end and leap-year boundaries. No notification delivery, queue, external service, schema or dependency is added.


## Phase 3D: Household Calendar And Portable Export - Complete

Phase 3D combines active maintenance dates, pending or snoozed reminders and warranty expiries in one fallback-safe timeline. A no-store `.ics` endpoint lets households import those dates into Apple Calendar, Google Calendar, Outlook or another standards-compatible app.

The export is user-controlled and one-way. No external calendar account, OAuth connection, background sync, notification delivery, dependency, schema or paid integration is added.


## Phase 3E: Household Data And Inventory Exports - Complete

Phase 3E adds user-controlled downloads from Settings: a versioned JSON copy of visible household metadata and a spreadsheet-safe CSV inventory. Both are generated on request, returned as no-store attachments and remain useful with canonical sample data.

The CSV neutralises formula-like user input. Exports include metadata only and add no storage, external destination, financial analysis, insurance claim automation, dependency or schema.


## Phase 3F: Maintenance Starter Templates - Complete

Phase 3F adds eight editable Australian household maintenance starting points and connects them to the existing guarded task form. Templates improve beginner onboarding without automatically creating records or presenting generic intervals as universal safety advice.

No schema, notification delivery, external service, dependency, AI, OCR, storage or native project is added.


## Phase 3G: Printable Household Summary - Complete

Phase 3G combines existing home, asset, maintenance, warranty, provider and record metadata in a privacy-aware printable handover view. Users can print or save a personal PDF through the browser; HomeVault does not retain a generated report.

The report is not an insurance claim, valuation or financial product. No schema, storage, external destination, dependency, upload, AI, OCR, notification or native project is added.


## Phase 3H: Archive And Recovery Centre - Complete

Phase 3H gathers existing inactive lifecycle states in one fallback-safe archive and links each record back to its guarded edit flow. Households can recover a record by changing its status without losing history.

The view is derived and read-only. No delete action, undo log, schema, migration, dependency, storage, external service or native project is added.


## Phase 3I: Household Setup Guide - Complete

Phase 3I adds a six-step beginner setup guide covering the home profile, rooms, assets, maintenance, warranties and household records. Progress is derived from existing records and links directly to current creation or review workflows.

No onboarding profile, analytics, schema, mutation, dependency, account service, notification, upload, storage or native project is added.


## Phase 3J: Global Quick Add - Complete

Phase 3J adds one mobile-first hub and header shortcut for all existing room, category, asset, maintenance, reminder, provider, warranty, receipt and document creation workflows.

Quick Add only improves navigation. It introduces no action, mutation, schema, dependency, analytics, storage, external service or native project.


## Phase 3K: Neon Preview Database Foundation - Complete

Phase 3K provisions an isolated child `preview` branch in the Vercel-managed Neon project connected to HomeVault. It contains the repository Prisma schema and canonical synthetic Taylor Family Home data, with connector-verified tables, indexes and record counts.

The managed default branch retains provider-owned Neon Auth tables but contains zero HomeVault application tables. Production HomeVault authentication, Data API use and production household data access remain unapproved.

## Phase 3M: Room Detail - Complete

Phase 3M adds a fallback-safe detail page for every room, showing its household metadata, assigned assets and maintenance linked through those assets.

The page reuses existing reads and routes. No schema, mutation, delete action, dependency or external service is added. See `docs/PHASE_3M_PLAN.md`.

## Phase 3N: Asset Care Context - Complete

Phase 3N surfaces existing maintenance tasks and reminders on asset detail, with direct links to their established workflows and clear empty states.

The feature reuses existing relationships and fallback-safe reads. No schema, mutation, notification delivery, dependency or external service is added. See `docs/PHASE_3N_PLAN.md`.

## Phase 3O: Asset Category Detail - Complete

Phase 3O turns asset categories into fallback-safe navigation destinations, showing assigned assets with status, brand and room context before users enter editing.

The detail is composed from existing reads and relationships. No schema, mutation, taxonomy expansion, dependency or external service is added. See `docs/PHASE_3O_PLAN.md`.

## Phase 3P: Warranty Follow-up Context - Complete

Phase 3P surfaces existing linked reminders beside warranty coverage and document metadata, with direct navigation and honest empty states.

No schema, mutation, reminder delivery, dependency or external service is added. See `docs/PHASE_3P_PLAN.md`.

## Phase 3Q: Connected Record Context - Complete

Phase 3Q exposes existing receipt and document relationships to assets, warranties, source receipts, maintenance tasks and related document metadata.

The feature presents only established links. No schema, mutation, storage, upload, OCR, AI, email ingestion, dependency or external service is added. See `docs/PHASE_3Q_PLAN.md`.

## Phase 3R: Maintenance Record Context - Complete

Phase 3R surfaces existing linked document metadata and reminders on maintenance task detail alongside task instructions and completion history.

No schema, mutation, notification delivery, scheduling change, storage, dependency or external service is added. See `docs/PHASE_3R_PLAN.md`.

## Phase 3S: Maintenance History Export - Complete

Phase 3S adds a no-store, spreadsheet-safe CSV download for completed maintenance history using existing fallback-safe records.

The export is generated on request and retained nowhere. No schema, mutation, storage, financial analysis, dependency or external service is added. See `docs/PHASE_3S_PLAN.md`.

## Phase 3T: Safe Provider Contact Actions - Complete

Phase 3T adds guarded call, email and website actions to existing provider metadata for practical mobile use.

Contact actions are user-initiated and reject malformed or unsafe values. No messaging, booking, payment, analytics, schema, dependency or external API is added. See `docs/PHASE_3T_PLAN.md`.

## Phase 3U: Read-only Household Access Summary - Complete

Phase 3U surfaces the existing current household membership records in Settings and the portable household export using names, optional nicknames and roles only.

The feature is read-only and fallback-safe. It does not expose member email addresses or add invitations, role changes, production authentication, authorisation, schema changes, dependencies or external services. See `docs/PHASE_3U_PLAN.md`.

## Phase 3V: Inventory Filters - Complete

Phase 3V adds server-rendered room, category and lifecycle filters to the existing Assets screen, including explicit unassigned choices and clear combined-filter empty states.

All options are derived from already-loaded fallback-safe records. No new query, persistence, schema, dependency, analytics or external service is introduced. See `docs/PHASE_3V_PLAN.md`.

## Phase 3W: Maintenance Work Queue Filters - Complete

Phase 3W adds server-rendered task status, Brisbane due-state and linked-asset filters to the Maintenance list, with clear unassigned and empty-result behavior.

The feature reuses existing loaded task records and date rules. No query, persistence, notification delivery, scheduling change, schema, dependency or analytics is introduced. See `docs/PHASE_3W_PLAN.md`.

## Phase 3X: Warranty Review Filters - Complete

Phase 3X adds server-rendered coverage-state, asset and provider filters to the Warranties list using the existing Brisbane date-status rules.

No query, persistence, notification delivery, claim automation, schema, dependency or analytics is introduced. See `docs/PHASE_3X_PLAN.md`.

## Phase 3Y: Household Record Filters - Complete

Phase 3Y adds server-rendered record-type, linked-asset and document-type filters to the combined receipt and document metadata list.

Filtering reuses already-loaded fallback-safe records. No file access, storage, query, persistence, schema, dependency or analytics is introduced. See `docs/PHASE_3Y_PLAN.md`.

## Phase 3Z: Reminder Triage Filters - Complete

Phase 3Z adds server-rendered lifecycle, Brisbane due-state and linked-record filters to the reminder centre.

The feature reuses existing reminder metadata and date rules. It sends and schedules nothing, and introduces no query, persistence, schema, dependency or analytics. See `docs/PHASE_3Z_PLAN.md`.

## Phase 4A: Provider Directory Filters - Complete

Phase 4A adds server-rendered trade, maintenance-link and contact-state filters to the service provider directory.

Filtering uses already-loaded fallback-safe records and existing explicit task relationships. No contact, booking, query, persistence, schema, dependency or analytics is introduced. See `docs/PHASE_4A_PLAN.md`.

## Phase 4B: Room Organisation Filters - Complete

Phase 4B adds server-rendered floor/zone and asset-link filters to Rooms, including explicit missing-floor and empty-room views.

Filtering uses the existing fallback-safe room read and asset counts. No query, persistence, schema, dependency, occupancy tracking or analytics is introduced. See `docs/PHASE_4B_PLAN.md`.

## Phase 4C: Category Usage Visibility - Complete

Phase 4C exposes existing Asset relationship counts on category summaries and adds server-rendered used-versus-empty filtering.

The count is returned with the existing Prisma category query and canonical fallback data. No stored aggregate, extra request, mutation, schema, dependency, classification or analytics is introduced. See `docs/PHASE_4C_PLAN.md`.
