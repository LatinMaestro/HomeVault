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

## Phase 1F - Planned

- Room create persists when `DATABASE_URL` is configured and the database is reachable.
- Room edit persists when `DATABASE_URL` is configured and the room exists in the database.
- Missing or unavailable database states show clear non-destructive messages.
- Room list/detail pages continue rendering useful sample/fallback data when database access is unavailable.
- Vercel builds do not require live database access.
- No delete actions, asset persistence, production auth, uploads, OCR, AI, notifications, payments, analytics or native app work is added.

