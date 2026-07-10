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

## Later Phases

- Production authentication.
- Approved file storage.
- Reminder delivery.
- Multi-home or family sharing if validated.
- Native app only if the web app proves the need.
