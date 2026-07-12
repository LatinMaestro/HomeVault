# Build Plan

## Phase 1A: Foundation - Complete

Create the docs, app shell, placeholder routes, visual identity and Vercel review workflow.

## Phase 1B: Data Model - Complete

Implement Prisma, a PostgreSQL-compatible schema, seed data and lazy database helper structure while keeping Vercel builds free of live database dependency.

## Phase 1C: Core Screen Shells - Complete

Build controlled read-only list/detail screens and non-saving create/edit shells for rooms, assets, maintenance tasks, warranties and receipt/document metadata.

## Phase 1D: Review And Hardening - Complete

Improve the existing foundation before adding persistence:

- Polish mobile-first layouts and navigation consistency.
- Clarify empty, fallback and non-saving shell states.
- Improve accessibility basics across existing screens.
- Preserve sample-data fallback when `DATABASE_URL` is missing or unavailable.
- Use GitHub Actions as the primary automated check gate when Vercel usage is constrained.
- Use Vercel Preview Deployment as the UI review gate when usage allows.
- Keep GitHub PRs as the code review gate.

Completed Phase 1D hardening includes review summaries, clearer shell-form guardrails, branded error/loading/not-found states, stronger metadata, explicit back navigation, accessible data-source/empty-state presentation, online CI evidence and Vercel-light workflow documentation.

Phase 1D did not add persistent mutations, production auth, uploads, OCR, AI, notifications, payments, analytics or native iOS work.

## Phase 1E: Persistence Readiness - Complete

Prepared the room and asset create/edit shells for future persistence while keeping saving disabled:

- Added reusable room and asset form field metadata.
- Added preview-only helper text and recommended-field communication.
- Added non-persistent Save checks that clearly state no records changed.
- Preserved fallback-safe runtime reads and database-independent builds.
- Added documentation and acceptance criteria for the later persistence phase.

Phase 1E did not add persistent mutations, production auth, uploads, OCR, AI, notifications, payments, analytics, native iOS work or local-client setup requirements.

## Phase 1F: First Room Persistence - Complete

Introduced the first real database-backed mutation workflow for rooms only:

- Added runtime-only room create and edit server actions.
- Kept deletes out of scope.
- Kept asset and other record persistence out of scope.
- Preserved database-independent builds and fallback/sample reads.
- Added clear success, validation and unavailable-database messages.
- Kept stubbed current-home assumptions explicit until production auth is approved.

Phase 1F did not add production auth, uploads, OCR, AI, notifications, payments, analytics, native iOS work or local-client setup requirements.

## Phase 1G: Asset Persistence - Complete

Extended the proven mutation pattern to assets only:

- Added runtime-only asset create and edit server actions.
- Supported optional room association by matching room name.
- Kept deletes out of scope.
- Kept warranty, receipt, document and maintenance persistence out of scope.
- Preserved database-independent builds and fallback/sample reads.
- Added clear success, validation and unavailable-database messages.

Phase 1G did not add production auth, uploads, storage, OCR, AI, notifications, payments, analytics, native iOS work or local-client setup requirements.

## Phase 1H: Maintenance Persistence - Complete

Introduced the next controlled mutation workflow for maintenance only:

- Added runtime-only maintenance task create and edit server actions.
- Added a simple additive task completion action.
- Kept deletes out of scope.
- Kept recurrence automation, notifications and calendar integrations out of scope.
- Kept warranty, receipt and document persistence out of scope.
- Preserved database-independent builds and fallback/sample reads.
- Added clear success, validation and unavailable-database messages.

Phase 1H did not add production auth, uploads, storage, OCR, AI, notifications, payments, analytics, native iOS work or local-client setup requirements.

## Phase 1I: Warranty Persistence - Complete

Extended the proven mutation pattern to warranty metadata only:

- Added runtime-only warranty create and edit server actions.
- Added warranty create and edit routes.
- Required an existing asset association.
- Kept warranty records metadata-only.
- Kept deletes out of scope.
- Kept document uploads, production storage and reminder delivery out of scope.
- Preserved database-independent builds and fallback/sample reads.
- Added clear success, validation and unavailable-database messages.

Phase 1I did not add production auth, uploads, storage, OCR, AI, notifications, payments, analytics, native iOS work or local-client setup requirements.

## Phase 1J: Receipt And Document Metadata Persistence - Complete

Introduced guarded metadata writes for the combined records area:

- Added a record type chooser and separate receipt/document create forms.
- Added type-aware receipt/document edit behavior.
- Reused the existing Prisma models without a schema migration.
- Kept optional asset association within the current sample home.
- Kept document records metadata-only.
- Kept receipt totals as archival reference metadata, not budgeting or expense tracking.
- Preserved database-independent builds and fallback/sample reads.
- Kept deletes, uploads, storage, OCR, email ingestion and reminders out of scope.

## Phase 1K: Form Choice Usability - Complete

Improved the existing persisted forms without adding capability:

- Populated room and asset relationship choices from fallback-safe current-home reads.
- Used bounded menus for maintenance frequency and document type.
- Used native date and amount inputs where appropriate.
- Preserved current Server Actions, routes, data models and fallback behavior.
- Kept auth, deletes, uploads, storage, OCR, email ingestion, reminders and financial workflows out of scope.

## Phase 1L: Workflow Consistency Review - Complete

Reviewed the available Vercel deployment at desktop and mobile sizes, confirmed useful fallback rendering without console errors, and corrected stale dashboard and Settings persistence-status copy. No routes, models, actions or new capabilities were added.

## Phase 1M: Household Dashboard - Complete

Aggregated the existing fallback-safe household reads into a useful Home snapshot covering maintenance, warranty, inventory, receipt and document records. The dashboard remains runtime-only and database-independent at build time.

## Phase 1N: Readable Household Labels - Complete

Added a shared presentation formatter so existing stored enum values render as beginner-friendly household language across lists and details, without changing persistence contracts.

## Phase 1O: Core List Search - Complete

Added server-rendered GET search across all existing core lists. Filtering uses each page's already-loaded database or sample records and introduces no database search dependency.

## Phase 1P: Maintenance And Warranty Date Awareness - Complete

Added runtime-only Brisbane-calendar status cues for existing maintenance due dates and warranty expiry dates across Home, list and detail surfaces. No reminder delivery or persisted status was added.

## Phase 1Q: Linked Record Navigation - Complete

Connected existing room, asset, task, warranty, receipt and document relationships to their current routes using relation IDs already loaded by the data layer.

## Phase 1R: Asset Record Completeness - Complete

Completed guarded asset metadata persistence for serial number, purchase date, purchase place and lifecycle status using existing schema fields and Server Actions.

## Phase 1S: Asset Category Linking - Complete

Connected guarded asset create/edit to existing seeded AssetCategory records with database/sample fallback choices and no schema or category-management expansion. Vercel visual review is deferred until client access is restored.

## Phase 1T: Maintenance Lifecycle Control - Complete

Added guarded lifecycle status selection and persistence to existing maintenance create/edit using the current MaintenanceStatus enum. Completion history remains independent and additive. Vercel visual review is deferred.

## Phase 1U: Maintenance Service Provider Linking - Complete

Connected guarded maintenance create/edit to existing ServiceProvider records with database/sample fallback choices, list visibility and search. Provider management remains out of scope and Vercel visual review is deferred.

## Phase 1V: Custom Maintenance Interval Metadata - Complete

Completed the existing Custom frequency with validated day-interval metadata, persistence, readable display and search. Recurrence automation remains out of scope and Vercel visual review is deferred.

## Future Phases

Add production auth, approved storage, reminders, sharing and native app exploration only after explicit decisions.
