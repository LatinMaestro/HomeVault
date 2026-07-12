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

## Phase 1K - Complete

- Existing room and asset relationship fields offer valid current-home or sample choices.
- Maintenance frequency and document type use bounded controls.
- Existing date and receipt amount fields use appropriate native input behavior.
- Current routes, Server Actions and mutation capabilities remain unchanged.
- Missing or unavailable database states continue rendering useful choices and non-destructive messages.
- No new models, routes, deletes, auth, uploads, storage, OCR, email ingestion, reminders, financial workflows, analytics or native app work was added.

## Phase 1L - Complete

- A live Vercel preview loads the dashboard and receipt/document chooser successfully.
- The reviewed mobile viewport has no horizontal overflow and no browser console errors.
- Dashboard and Settings copy accurately reflects guarded create/edit persistence.
- GitHub Actions remains the authoritative automated gate while Vercel is behind `main`.
- No routes, models, actions, auth, deletes, uploads, storage, OCR, AI, notifications, payments, analytics or native app work was added.

## Phase 1M - Complete

- Home summarises existing maintenance, warranty, inventory, receipt and document data.
- Dashboard summaries link to existing list or detail routes.
- Runtime database data is used when all dashboard reads succeed.
- Missing or unavailable database access renders useful sample data.
- No build-time database access, schema change, mutation, dependency or new environment variable was added.
- No auth, deletes, uploads, storage, OCR, AI, notifications, payments, analytics or native app work was added.

## Phase 1N - Complete

- Existing list and detail screens use readable status, frequency and document-type labels.
- Stored enum values and form submission values remain unchanged.
- Unknown or user-authored display values remain unchanged.
- No routes, models, migrations, actions, dependencies or environment variables were added.
- No auth, deletes, uploads, storage, OCR, AI, notifications, payments, analytics or native app work was added.

## Phase 1O - Complete

- Rooms, assets, maintenance, warranties and receipt/document lists accept a `q` search parameter.
- Search works consistently with configured database records and curated sample records.
- Searches match relevant visible record fields and readable status/type labels.
- Empty lists and zero-match searches provide distinct, useful states.
- Search is keyboard accessible, resettable and browser-navigation friendly.
- No schema, index, action, dependency or environment-variable change was added.
- No auth, deletes, uploads, storage, OCR, AI, notifications, payments, analytics or native app work was added.

## Phase 1P - Complete

- Existing maintenance dates render overdue, due-soon, scheduled or missing-date states.
- Existing warranty dates render expired, expiring-soon, current or missing-date states.
- Date status is visible on Home, maintenance and warranty review surfaces.
- Calculations use the Australia/Brisbane calendar date.
- Derived status is not persisted and does not mutate records.
- No reminders, notifications, jobs, queues, schema changes, dependencies or environment variables were added.
- No auth, deletes, uploads, storage, OCR, AI, payments, analytics or native app work was added.

## Phase 1Q - Complete

- Rooms can open the existing asset list filtered to their name.
- Asset details link to existing related warranty, receipt and document routes.
- Maintenance, warranty and receipt/document details link to their associated asset when present.
- Warranty details link to related document metadata when present.
- Database and curated sample relationships use the same navigation behavior.
- Missing optional relationships do not render misleading actions.
- No routes, queries, schema changes, migrations, actions, dependencies or environment variables were added.
- No auth, deletes, uploads, storage, OCR, AI, notifications, payments, analytics or native app work was added.

## Phase 1R - Complete

- Asset create/edit captures serial number, purchase date, purchase place and lifecycle status.
- Purchase date uses a date control and rejects unreadable submitted dates.
- Asset status is restricted to existing Prisma AssetStatus values.
- Added metadata persists only when the configured database and current home are available.
- Missing database access remains non-destructive.
- Asset detail and search use the completed metadata.
- Home, asset and room views revalidate after asset saving.
- No schema, migrations, dependencies or environment variables were added.
- No auth, deletes, uploads, storage, OCR, AI, notifications, payments, analytics or native app work was added.

## Phase 1S - Complete

- Asset create/edit offers existing current-home or sample category choices.
- Category selection remains optional.
- Guarded saving persists the existing Asset.categoryId relationship.
- Category resolution is scoped to the temporary current home.
- Missing or unmatched category states are non-destructive and clearly messaged.
- Vercel visual review is recorded as deferred until client access is available.
- No schema, migration, route, category CRUD, dependency or environment variable was added.
- No auth, deletes, uploads, storage, OCR, AI, notifications, payments, analytics or native app work was added.

## Phase 1T - Complete

- Maintenance create/edit offers Active, Paused, Completed and Archived status choices.
- Submitted status is validated against existing Prisma values.
- New tasks default to Active and edits preserve the current value.
- Guarded saving persists MaintenanceTask.status.
- Completion records remain additive and do not silently change task status.
- Missing database access remains non-destructive.
- Vercel visual review is recorded as deferred until client access is available.
- No schema, migration, reminder automation, notification, dependency or environment variable was added.
- No auth, deletes, uploads, storage, OCR, AI, payments, analytics or native app work was added.

## Phase 1U - Complete

- Maintenance create/edit offers existing current-home or sample service-provider choices.
- Provider selection remains optional.
- Guarded saving persists MaintenanceTask.serviceProviderId.
- Provider resolution is scoped to the temporary current home.
- Provider names appear in maintenance list, search and detail views.
- Missing or unmatched provider states remain non-destructive and clearly messaged.
- Vercel visual review remains deferred until client access is available.
- No schema, migration, route, provider CRUD, dependency or environment variable was added.
- No auth, deletes, uploads, storage, OCR, AI, notifications, payments, analytics or native app work was added.

## Phase 1V - Complete

- Maintenance create/edit accepts a custom interval of 1 to 3650 whole days.
- Custom frequency requires a valid interval.
- Non-custom frequencies clear custom interval metadata.
- Guarded saving persists the existing MaintenanceTask.customIntervalDays field.
- Lists, details and search use a readable "Every N days" label.
- Missing database access remains non-destructive.
- No recurrence calculation, reminders, jobs, queues, schema changes, dependencies or environment variables were added.
- Vercel visual review remains deferred until client access is available.
- No auth, deletes, uploads, storage, OCR, AI, payments, analytics or native app work was added.

## Phase 1W Acceptance

- Existing providers are searchable by name, trade, contact metadata and linked task.
- Provider details show contact metadata and navigable linked tasks.
- Linked maintenance tasks can navigate to their provider.
- All provider screens remain useful without `DATABASE_URL`.
- No provider mutation or external integration is introduced.

## Phase 1X Acceptance

- Warranty create and edit reject an expiry date earlier than the start date.
- The error explains that nothing was changed.
- Optional dates and valid date ordering retain existing behavior.
- Validation does not require `DATABASE_URL`.

## Phase 1Y Acceptance

- Future maintenance completion dates are rejected using the Brisbane calendar.
- Today and past dates retain existing behavior.
- The message confirms nothing was changed.
- Validation does not require `DATABASE_URL`.

## Phase 1Z Acceptance

- Future asset purchase, receipt purchase and document issue dates are rejected.
- Today, past and blank dates retain existing behavior.
- Validation uses the Brisbane calendar and confirms nothing was changed.
- Validation does not require `DATABASE_URL`.

## Phase 2A Acceptance

- All persisted date fields accept valid YYYY-MM-DD dates and optional blanks.
- Impossible dates and alternate date strings are rejected before database access.
- Existing future-date and warranty-order guards continue to apply.
- No schema or route behavior changes.

## Phase 2B Acceptance

- Blank and representable non-negative receipt totals retain existing behavior.
- Totals above 21474836.47 or unsafe numeric conversions are rejected.
- The validation message confirms nothing was changed.
- No budgeting or financial analysis is introduced.

## Phase 2C Acceptance

- Room create rejects a current-home name that differs only by case.
- Room edit excludes itself but rejects another case-insensitive match.
- Existing room persistence and fallback behavior remain unchanged.
- No schema migration is required.

## Phase 2D Acceptance

- Task, warranty, receipt and document edits retain the previous asset ID before updating.
- Both previous and new asset detail routes are revalidated after a successful reassignment.
- Existing mutation validation and ownership checks remain unchanged.
- No schema or route additions are required.

## Phase 2E Acceptance

- Providers can be created and edited only when `DATABASE_URL` is configured.
- Provider names are required and case-insensitive duplicates are rejected per home.
- Optional email and website values receive basic validation.
- Missing database and sample-record edits remain non-destructive.
- No delete or external provider interaction is added.
