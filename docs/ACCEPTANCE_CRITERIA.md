# Acceptance Criteria

## Phase 1A - Complete

- Documentation suite exists.
- Next.js app shell exists.
- Home, Vault, Maintenance, Warranties, Receipts and Settings routes exist.
- Styling is mobile-first, calm and home-focused.
- README explains the project workflow.

## Phase 1B - Complete

- Prisma is configured with PostgreSQL as the target database.
- Core HomeVault models exist in the schema.
- Seed data exists for the Taylor Family Home sample household.
- Vercel builds do not require a live database connection.
- No production auth, uploads, OCR, AI, notifications, payments, analytics or native iOS work was added.

## Phase 1C - Complete

- Approved read-only list/detail routes exist for rooms, assets, maintenance, warranties and receipt/document metadata.
- Create/edit pages are non-saving shells only.
- Runtime reads use Prisma when `DATABASE_URL` is available and fallback/sample data when unavailable.
- No persistent create/edit/delete mutations were added.

## Phase 1D - Complete

- Online-first workflow is documented and followed.
- Empty and missing-record states are useful.
- Active navigation state is accessible.
- Home dashboard reflects current reviewable app areas.
- Visible copy does not imply unapproved features are working.
- GitHub Actions provides online Prisma, lint, typecheck and build evidence when app code changes.

## Phase 1E - Complete

- Room and asset create/edit shells use shared field definitions.
- Field helper text and recommended-field cues are visible and beginner-friendly.
- Save performs preview-only checks and clearly states that no records changed.
- No persistent create/edit/delete mutations were added.

## Phase 1F - Complete

- Room create persists when `DATABASE_URL` is configured and the database is reachable.
- Room edit persists when `DATABASE_URL` is configured and the room exists in the database.
- Missing or unavailable database states show clear non-destructive messages.
- Room list/detail pages continue rendering useful sample/fallback data when database access is unavailable.
- Vercel builds do not require live database access.
- No delete actions, asset persistence, production auth, uploads, OCR, AI, notifications, payments, analytics or native app work was added.

## Phase 1G - Complete

- Asset create persists when `DATABASE_URL` is configured and the database is reachable.
- Asset edit persists when `DATABASE_URL` is configured and the asset exists in the database.
- Optional room association is handled safely when a matching room exists.
- Missing or unavailable database states show clear non-destructive messages.
- Asset list/detail pages continue rendering useful sample/fallback data when database access is unavailable.
- Vercel builds do not require live database access.
- No delete actions, warranty/receipt/document/maintenance persistence, production auth, uploads, OCR, AI, notifications, payments, analytics or native app work was added.

## Phase 1H - Complete

- Maintenance task create persists when `DATABASE_URL` is configured and the database is reachable.
- Maintenance task edit persists when `DATABASE_URL` is configured and the task exists in the database.
- A simple completion action creates an additive maintenance completion record for an existing task.
- Missing or unavailable database states show clear non-destructive messages.
- Maintenance list/detail pages continue rendering useful sample/fallback data when database access is unavailable.
- Vercel builds do not require live database access.
- No delete actions, recurrence automation, notifications, warranty/receipt/document persistence, production auth, uploads, OCR, AI, payments, analytics or native app work was added.

## Phase 1I - Complete

- Warranty create persists when `DATABASE_URL` is configured and the database is reachable.
- Warranty edit persists when `DATABASE_URL` is configured and the warranty exists in the database.
- Warranty records are linked to an existing asset.
- Missing or unavailable database states show clear non-destructive messages.
- Warranty list/detail pages continue rendering useful sample/fallback data when database access is unavailable.
- Vercel builds do not require live database access.
- No delete actions, document uploads/storage, reminder delivery, production auth, OCR, AI, payments, analytics or native app work was added.

## Phase 1J - Complete

- Receipt metadata create/edit persists when `DATABASE_URL` is configured and reachable.
- Document metadata create/edit persists when `DATABASE_URL` is configured and reachable.
- Receipt and document record types remain distinct and stable during edit.
- Optional asset association is handled safely.
- Missing or unavailable database states show clear non-destructive messages.
- Combined record list/detail pages remain useful with sample fallback.
- Vercel builds do not require live database access.
- No delete actions, file uploads/storage, OCR, email ingestion, reminder delivery, budgeting, payments, production auth, analytics or native app work was added.

## Phase 1K - In Progress

- Existing room and asset relationship fields offer valid current-home or sample choices.
- Maintenance frequency and document type use bounded controls.
- Existing date and receipt amount fields use appropriate native input behavior.
- Current routes, Server Actions and mutation capabilities remain unchanged.
- Missing or unavailable database states continue rendering useful choices and non-destructive messages.
- No new models, routes, deletes, auth, uploads, storage, OCR, email ingestion, reminders, financial workflows, analytics or native app work is added.
