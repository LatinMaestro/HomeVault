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

## Phase 2F Acceptance

- Categories can be searched, created and edited with a configured database.
- Category names are required and case-insensitive duplicates are rejected per home.
- New and renamed categories remain available to existing asset forms.
- Fallback data remains useful without `DATABASE_URL`.
- No delete or nested category hierarchy is added.

## Phase 2G Acceptance

- Runtime reads and all existing mutations use one lazy current-home resolver.
- Changing household display metadata cannot break resolution by name.
- Missing-home behavior remains non-destructive and fallback-safe.
- No production auth, multi-home selection or build-time database query is added.

## Phase 2H Acceptance

- Settings renders database or sample household profile data without build-time database access.
- Household name is required; state and postcode values receive Australian validation.
- Saving is guarded by `DATABASE_URL` and missing-home states are non-destructive.
- Renaming the household does not break subsequent current-home reads.
- No auth, multi-home, member or role workflow is added.

## Phase 2I Acceptance

- Reminder list and detail routes render database or sample records without build-time access.
- Search covers reminder, status, linked-record and note metadata.
- Due status uses the Australia/Brisbane calendar.
- Related asset, warranty and maintenance routes are navigable.
- No reminder mutation or notification delivery is added.

## Phase 2J Acceptance

- Reminders can be created and edited only when `DATABASE_URL` and the current home are available.
- Title, strict due date and recognised lifecycle status are required.
- Optional asset, warranty and maintenance links are restricted to the current home.
- Missing database access and sample-record edits remain non-destructive and clearly messaged.
- Successful saves revalidate reminder and related household routes.
- No notification is scheduled or sent, and no delivery credentials or background automation are added.
- No delete, production auth, upload, OCR, AI, payment, analytics or native app capability is introduced.

## Phase 2K Acceptance

- Search is available from the app header and works on mobile and desktop layouts.
- One query can match rooms, categories, assets, tasks, warranties, reminders, providers, receipts and documents.
- Results are grouped and navigate to useful existing record routes.
- A configured database returns current-home records; missing database access returns curated sample results.
- Blank and unmatched searches have clear, non-destructive states.
- No search term is persisted and no analytics, schema, mutation or external search service is added.

## Phase 2L Acceptance

- The home dashboard shows the next pending reminder when one exists.
- The reminder card shows a readable due state and links to reminder detail.
- Empty reminder data links to the reminder centre without misleading delivery claims.
- Database and sample modes remain useful without build-time database access.
- No notification delivery, schema, mutation, analytics or external service is added.

## Phase 2M Acceptance

- All routes receive CSP, anti-framing, MIME-sniffing, referrer and permissions-policy headers.
- Production builds do not allow eval in the script policy.
- Search-engine indexing and following are disabled.
- Optional development mode remains compatible with the Next.js toolchain.
- Documentation states that unauthenticated deployments must not expose real household data.
- No auth, schema, dependency, storage or external service is added.

## Phase 2N Acceptance

- The first seed run creates the canonical synthetic household.
- A later run for the same synthetic owner exits successfully without another home.
- Existing seeded records are not overwritten or deleted.
- Build and Prisma checks remain independent of a live database.
- No schema, migration, dependency, production database or product workflow is added.

## Phase 2O Acceptance

- CI builds and starts the production app without `DATABASE_URL`.
- Every approved route family returns a successful response containing the HomeVault shell.
- Dynamic fallback routes use canonical sample identifiers.
- The server is stopped after success or failure.
- The smoke runner adds no dependency, secret, live database or local client requirement.

## Phase 2P Acceptance

- `GET /api/health` returns successful stable JSON with no-store caching.
- The health route does not access Prisma, `DATABASE_URL` or household data.
- The database-free route smoke verifies the endpoint.
- Generated robots rules disallow crawling of all preview routes.
- No monitoring service, dependency, schema, secret or environment variable is added.

## Phase 2Q Acceptance

- The dashboard groups overdue, due-soon and expiring task, reminder and warranty records.
- Urgency uses the existing Australia/Brisbane date rules.
- Each item links to its existing detail route.
- Normal future and missing-date records do not appear as urgent.
- Database and sample modes remain useful without build-time database access.
- No notification, scheduler, mutation, schema or external service is added.

## Phase 2R Acceptance

- HomeVault exposes a valid manifest with standalone display, theme, orientation and branded icon metadata.
- Mobile viewport metadata enables safe-area layout.
- The shared shell respects top and bottom safe-area insets without changing desktop behavior.
- CI smoke verifies the manifest and install icon without `DATABASE_URL`.
- Documentation defines Apple and Google policy, privacy, deletion, signing and asset gates.
- No native project, device permission, dependency, store credential or external service is added.

## Phase 2S Acceptance

- A registered service worker provides the offline screen when navigation cannot reach the server.
- Only the offline shell, icon and versioned static assets are cached.
- Household pages, API/RSC responses and mutations are not cached.
- The worker script is served with refresh-safe no-store headers and root scope.
- CI smoke verifies the worker and offline route without `DATABASE_URL`.
- No background sync, push, offline data store, dependency or native project is added.

## Phase 2T Acceptance

- Default, compact and icon buttons have at least a 44 pixel target.
- Text inputs, selects and primary navigation links have at least a 44 pixel target.
- Brand navigation has a reliable mobile tap area.
- Existing focus rings, labels, disabled states and component variants remain intact.
- CI build and database-free route smoke pass.
- No route, data, schema, dependency or native capability is added.

## Phase 2U Acceptance

- CI verifies anti-framing, worker CSP and disabled unnecessary permission headers.
- CI verifies stable no-store health JSON.
- CI verifies standalone manifest identity, start URL and install icon.
- CI verifies no-crawl robots rules and service-worker refresh/scope headers.
- All checks run against the production build without `DATABASE_URL`.
- No dependency, secret, route behavior or native capability is added.

## Phase 2V Acceptance

- Draft Apple and Google listing copy reflects implemented HomeVault capabilities.
- Screenshot storyboards use synthetic data and exclude preview/placeholder states.
- Privacy and reviewer notes identify unresolved production inputs.
- Client-controlled and engineering-controlled submission items are separated.
- Final public naming is explicitly subject to legal and store-availability clearance.
- No app behavior, dependency, schema, credential or store account is added.


## Maintenance Scheduling

- Recording an active or paused recurring task completion adds immutable history and advances the next due date atomically.
- Early completion preserves a future cadence; overdue completion schedules from the work date.
- Calendar-month frequencies clamp safely at month end and across leap years.
- One-off task completion clears its due date and marks it complete.
- Completed or archived tasks reject additional completion records until reactivated.
- Schedule automation does not send notifications.


## Household Calendar

- Active maintenance due dates, Pending/Snoozed reminders and warranty expiries appear in one sorted timeline.
- Every timeline item links to its existing HomeVault detail record.
- The calendar remains useful with curated sample data and no live database.
- Download returns a standards-based all-day `.ics` calendar attachment.
- Calendar text is safely escaped and impossible dates are omitted.
- Calendar responses are not cached.
- Export does not connect to, modify or monitor an external calendar account.


## Household Exports

- Settings offers a structured household metadata download and asset inventory CSV.
- Structured export includes the current home, rooms, categories, assets, maintenance, warranties, records, reminders and service providers.
- Inventory CSV contains practical asset identity, location, purchase and linked-record counts.
- CSV cells are quoted and formula-like user input is neutralised.
- Both responses use stable filenames and private no-store caching.
- Exports contain metadata only and work with canonical sample data.
- Production release requires signed-in household authorisation around both routes.


## Maintenance Starter Templates

- Maintenance links to a mobile-friendly starter template library.
- Templates cover common Australian household upkeep without claiming universal schedules.
- Selecting a template prefills the existing create-task form.
- Prefilled title, description, frequency and status remain editable.
- Unknown template identifiers open a normal blank task form.
- Templates do not create records automatically or send notifications.
- Template and prefilled-form routes render without live database access.


## Printable Household Summary

- Settings links to a printable household summary.
- The summary combines household identity, assets, active maintenance, warranties, providers and record metadata.
- The route renders useful canonical sample content without live database access.
- Browser print and save-to-PDF are available without storing a generated report.
- The screen warns users that copies may contain serial numbers and contact details.
- File attachments, valuations, budgeting and insurance claim automation are excluded.


## Archive And Recovery Centre

- Settings links to one archive view.
- Retired/disposed assets, completed/archived maintenance tasks and done/cancelled reminders appear in the correct group.
- Active and snoozed records do not appear.
- Each archived record links to its existing guarded edit screen.
- Recovery is performed by changing lifecycle status; the archive itself is read-only.
- The route renders useful empty or sample states without live database access.
- No permanent delete action or schema change is introduced.
