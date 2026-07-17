# Decision Log

| Date | Decision | Reason | Status |
| --- | --- | --- | --- |
| 2026-07-07 | Use Next.js App Router with TypeScript and Tailwind CSS. | Matches preferred stack and Vercel deployment target. | Accepted |
| 2026-07-07 | Keep Phase 1A static with stubbed single-user context. | Avoids unapproved auth, database and storage decisions. | Accepted |
| 2026-07-07 | Use a teal, mint and warm neutral visual direction. | Calm home organisation tone without feeling financial or technical. | Accepted |
| 2026-07-08 | Add Prisma with PostgreSQL as the Phase 1B data model foundation. | Matches the approved database approach while keeping Vercel builds independent of a live database. | Accepted |
| 2026-07-08 | Store document records as metadata only in Phase 1B. | File uploads and production storage are not approved yet. | Accepted |
| 2026-07-08 | Build Phase 1C as read-only core screens with sample fallback. | Provides useful reviewable workflows while avoiding unapproved CRUD persistence and keeping Vercel builds database-safe. | Accepted |
| 2026-07-08 | Keep create/edit pages as non-saving UI shells. | Persistent mutations, delete actions and Server Actions are not approved for Phase 1C. | Accepted |
| 2026-07-08 | Harden non-saving shell forms before persistence. | Phase 1D should make preview forms clearer and accessible without implying records are saved. | Accepted |
| 2026-07-08 | Add shared empty states and current-nav semantics during Phase 1D. | Blank database-backed screens should remain useful, and navigation state should be clear for assistive technology. | Accepted |
| 2026-07-08 | Use useful missing-record states on detail pages. | Unknown IDs should explain the current data source and give users a clear path back to the relevant list. | Accepted |
| 2026-07-08 | Refresh the home dashboard as a review hub. | The landing screen should reflect the current read-only app state and route users into reviewable sections without adding new workflows. | Accepted |
| 2026-07-08 | Polish detail field and related-record displays. | Detail pages should reduce placeholder noise and present linked metadata clearly before persistence work begins. | Accepted |
| 2026-07-08 | Add GitHub Actions CI as an online check gate. | Vercel previews remain the visual gate, but GitHub Actions provides lint, typecheck and build evidence when Vercel is unavailable or quota-limited. | Accepted |
| 2026-07-08 | Treat Settings as a read-only readiness page in Phase 1D. | Settings should clarify privacy and preview guardrails without introducing unapproved account, storage or integration behaviour. | Accepted |
| 2026-07-08 | Add a branded not-found page. | Unknown routes should keep users inside the HomeVault experience and provide a clear path back to the dashboard. | Accepted |
| 2026-07-08 | Add a branded app error boundary. | Unexpected runtime failures should provide calm recovery actions without exposing framework-default error UI. | Accepted |
| 2026-07-08 | Add a branded loading state. | Dynamic route transitions should preserve the HomeVault visual style and provide accessible loading feedback. | Accepted |
| 2026-07-08 | Use beginner-friendly data-source copy. | Review screens should explain database and sample-data states without exposing environment variable details to non-technical users. | Accepted |
| 2026-07-08 | Add skip navigation and stronger shell landmarks. | Keyboard and assistive-technology users should be able to jump directly to the main content and identify the dashboard link clearly. | Accepted |
| 2026-07-08 | Polish app metadata. | Browser metadata should describe HomeVault as a home records vault across assets, maintenance, warranties, receipts and documents. | Accepted |
| 2026-07-08 | Add section-specific route metadata. | Main app sections should produce meaningful browser titles and descriptions without changing runtime behaviour. | Accepted |
| 2026-07-08 | Add shell and detail route metadata. | Create, edit and detail screens should remain clear in browser chrome while staying read-only and fallback-safe. | Accepted |
| 2026-07-08 | Add explicit back navigation on shell and detail pages. | Reviewers should be able to move through read-only flows confidently without relying on browser controls. | Accepted |
| 2026-07-08 | Use a shared icon back-link button. | Repeated back actions should be visually consistent and easier to maintain across read-only shell and detail pages. | Accepted |
| 2026-07-08 | Add list review summary panels. | Core list screens should show record counts, data mode and read-only status so visual review is easier without adding workflows. | Accepted |
| 2026-07-08 | Add Vault and Rooms review summaries. | The Vault hub and rooms list should match the review summary pattern used by other core list screens. | Accepted |
| 2026-07-08 | Add shell form guardrail panels. | Preview forms should make it immediately clear what can be reviewed and that Save does not persist data. | Accepted |
| 2026-07-08 | Use Vercel-light mode when usage is constrained. | HomeVault should batch changes and rely on GitHub Actions as the primary check gate when Vercel preview usage is capped. | Accepted |
| 2026-07-08 | Improve data-source notice accessibility. | Database and sample-data fallback states should be visually scannable and announced as a distinct page note. | Accepted |
| 2026-07-09 | Improve empty-state presentation. | Empty and missing-record states should be easier to identify visually while preserving clear explanatory copy and actions. | Accepted |
| 2026-07-09 | Close Phase 1D review and hardening. | The approved hardening scope is complete and the repository is ready for the next approved phase to be planned without starting it in this docs-only change. | Accepted |
| 2026-07-09 | Plan Phase 1E as persistence readiness before real mutations. | Room and asset forms can be made more production-like while saving remains disabled and future persistence is kept as an explicit later gate. | Accepted |
| 2026-07-09 | Use shared shell form field metadata for rooms and assets. | Create and edit shells should stay consistent while adding helper text and preview readiness without introducing persistence. | Accepted |
| 2026-07-09 | Add preview-only checks for recommended shell fields. | Save actions can guide future-ready form completion while remaining non-persistent and non-destructive. | Accepted |
| 2026-07-09 | Close Phase 1E persistence readiness. | The approved readiness scope is complete, and the next major gate is whether to approve real room and asset persistence. | Accepted |
| 2026-07-09 | Start Phase 1F with room persistence only. | Proving create/edit mutations on the smallest core record type reduces risk before assets, deletes, auth or storage are introduced. | Accepted |
| 2026-07-09 | Use Server Actions for room create/edit persistence. | Room mutations need progressive form behavior, route revalidation and runtime database checks without adding API routes or client-side database access. | Accepted |
| 2026-07-09 | Close Phase 1F first room persistence. | Room create/edit persistence is implemented and CI-verified, so asset persistence can be planned as a separate next slice. | Accepted |
| 2026-07-10 | Start Phase 1G with asset persistence only. | Assets are the next core vault record after rooms, and can reuse the proven mutation pattern without adding deletes, storage, auth or other workflows. | Accepted |
| 2026-07-10 | Use Server Actions for asset create/edit persistence. | Asset mutations need the same progressive form behavior, route revalidation and runtime database checks proven by room persistence. | Accepted |
| 2026-07-10 | Close Phase 1G asset persistence. | Asset create/edit persistence is implemented and CI-verified, so maintenance and warranty persistence can be planned as separate controlled slices. | Accepted |
| 2026-07-10 | Plan Phase 1H as maintenance persistence only. | Maintenance tasks are the next practical homeowner workflow and should be handled separately from warranties, reminders, recurrence automation and deletes. | Accepted |
| 2026-07-10 | Use Server Actions for maintenance task persistence and completion records. | Maintenance mutations need progressive form behavior, additive completion history and runtime database checks without adding reminders, recurrence automation or API routes. | Accepted |
| 2026-07-10 | Close Phase 1H maintenance persistence. | Maintenance task create/edit and additive completion records are implemented and CI-verified, so warranty persistence can be planned as a separate controlled slice. | Accepted |
| 2026-07-10 | Plan Phase 1I as warranty persistence only. | Warranty records are the next practical home record after assets and maintenance, and should remain metadata-only until file storage and reminders are separately approved. | Accepted |
| 2026-07-10 | Use Server Actions for warranty metadata persistence. | Warranty mutations need progressive form behavior, required asset association and runtime database checks without adding uploads, reminders or API routes. | Accepted |
| 2026-07-10 | Close Phase 1I warranty persistence. | Warranty metadata create/edit persistence is implemented and CI-verified, so receipt/document metadata improvements can be planned as a separate controlled slice. | Accepted |
| 2026-07-10 | Plan Phase 1J as receipt and document metadata persistence. | The combined records area is the next practical vault workflow and can use the existing schema without approving file storage, OCR, email ingestion or deletes. | Accepted |
| 2026-07-10 | Treat receipt totals as archival metadata only. | Purchase totals may support warranty and household records, but HomeVault must not become a budgeting, spending analytics or payment product. | Accepted |
| 2026-07-10 | Use separate Server Actions for receipt and document metadata. | The records share list/detail UI but map to distinct Prisma models, so separate writes keep validation and record-type behavior explicit. | Accepted |
| 2026-07-10 | Keep record type immutable during edit. | Changing a receipt into a document would require destructive cross-model behavior and could mislead users, so edits remain within the original record type. | Accepted |
| 2026-07-10 | Close Phase 1J receipt and document metadata persistence. | Receipt and document metadata create/edit workflows are implemented and CI-verified with database-safe fallback behavior and no file or financial scope expansion. | Accepted |
| 2026-07-10 | Plan Phase 1K as form choice usability only. | Existing persistence is functional, but controlled room, asset and enum choices will reduce beginner errors without expanding data or product scope. | Accepted |
| 2026-07-10 | Use shared persisted-form field controls. | Asset, maintenance, warranty and record forms need the same accessible menu, date, number, text and helper behavior, so one renderer removes repeated control logic. | Accepted |
| 2026-07-10 | Populate relationship menus from fallback-safe reads. | Existing room and asset loaders already provide database or sample data without build-time database dependency, preserving useful forms in every environment. | Accepted |
| 2026-07-10 | Close Phase 1K form choice usability. | Existing persisted forms now use controlled relationship and enum choices plus typed date and amount inputs, with CI-verified fallback-safe builds and no capability expansion. | Accepted |
| 2026-07-10 | Correct stale persistence status copy after live preview review. | The dashboard and Settings page must accurately describe the guarded create/edit workflows already merged to `main`. | Accepted |
| 2026-07-10 | Keep GitHub Actions authoritative while Vercel deployment lags `main`. | Automated Prisma, lint, typecheck and build evidence should remain dependable without consuming extra manual Vercel deployments. | Accepted |
| 2026-07-10 | Use existing fallback-safe loaders for the household dashboard. | The Home screen can become useful immediately without adding a new query contract, schema change or build-time database dependency. | Accepted |
| 2026-07-10 | Treat mixed dashboard data sources as sample mode. | The UI must not imply that every dashboard value came from the configured database when any area used fallback data. | Accepted |
| 2026-07-10 | Format stored enum values only at the presentation boundary. | Homeowners should see natural language while Prisma values and Server Action contracts remain stable. | Accepted |
| 2026-07-10 | Use server-rendered GET search over existing loaded records. | Core lists are small in the current single-household MVP, and query-parameter filtering is accessible, shareable and database-independent without premature search infrastructure. | Accepted |
| 2026-07-10 | Derive due and expiry status at runtime from existing date metadata. | Homeowners need timely context now, while reminders and notifications remain separate unapproved capabilities. | Accepted |
| 2026-07-10 | Use the Australia/Brisbane calendar for household date status. | Vercel server regions must not shift an Australian household's due-today or expiry-today state. | Accepted |
| 2026-07-11 | Expose existing related-record IDs in presentation shapes. | Relationship navigation should use stable route identifiers already loaded by Prisma rather than name matching or extra queries. | Accepted |
| 2026-07-11 | Complete asset identifying and purchase metadata before adding new workflows. | The existing detail screen exposed fields that create/edit could not maintain, creating a practical record-quality gap. | Accepted |
| 2026-07-11 | Use lifecycle status instead of delete for normal asset transitions. | Stored, repair, retired and disposed states preserve household history while delete remains out of scope. | Accepted |
| 2026-07-12 | Link assets only to existing current-home categories. | The current schema and seed data support useful categorisation without prematurely adding category management. | Accepted |
| 2026-07-12 | Defer Vercel visual review while client access is unavailable. | GitHub Actions can safely gate this bounded form/data change, and visual review can be completed later without repeated deployment activity. | Accepted |
| 2026-07-12 | Add maintenance lifecycle status without delete behavior. | Pausing, completing and archiving tasks preserves useful household history while delete remains out of scope. | Accepted |
| 2026-07-12 | Keep completion records independent from task lifecycle. | Recording work should not silently archive a task or calculate recurrence before those product rules are approved. | Accepted |
| 2026-07-12 | Link maintenance tasks only to existing current-home service providers. | Seeded provider records can improve service history now without prematurely adding contact management or provider CRUD. | Accepted |
| 2026-07-12 | Require explicit day metadata for Custom maintenance frequency. | A Custom label without an interval is ambiguous, while storing the interval remains useful without approving recurrence automation. | Accepted |

## 2026-07-12: Read-only service provider directory

Expose existing current-home ServiceProvider records through maintenance before approving provider CRUD. Provider reads use the existing lazy Prisma layer and curated fallback data, keeping builds independent of `DATABASE_URL`.

## 2026-07-12: Validate warranty date order

Reject warranty expiry dates earlier than their start dates before database access so create and edit share the same non-destructive record-quality rule.

## 2026-07-12: Guard maintenance completion dates

Reject completion dates after the current Australia/Brisbane date before database access so historical service records cannot represent work that has not happened.

## 2026-07-12: Guard historical record dates

Reject future asset purchase, receipt purchase and document issue dates using the Australia/Brisbane calendar before database access, while keeping each date optional.

## 2026-07-12: Parse form dates strictly

Use one UTC-based YYYY-MM-DD parser for all persisted form actions so invalid calendar dates cannot silently roll into a different month.

## 2026-07-12: Bound receipt totals to storage capacity

Validate optional receipt totals against the existing signed 32-bit integer-cent field before database access, while retaining receipt amounts as archival metadata only.

## 2026-07-12: Match room uniqueness to relationship lookup

Treat current-home room names as duplicates regardless of letter case because asset relationship resolution already matches room names case-insensitively.

## 2026-07-12: Revalidate both sides of asset relationship changes

When an existing linked record changes assets, invalidate both the previous and new asset detail routes so each relationship section reflects the completed mutation.

## 2026-07-12: Complete service provider contact management

Allow guarded current-home provider create/edit because the model, seed data, maintenance links and read-only directory are established. Keep deletes and external service interactions out of scope.

## 2026-07-12: Complete simple asset category management

Allow guarded current-home category list/create/edit because asset forms already depend on seeded categories. Keep the taxonomy flat and preserve delete as out of scope.

## 2026-07-12: Centralise temporary current-home resolution

Resolve the earliest Home record lazily through one server helper instead of matching the editable sample-home name. Retain this only for the explicitly temporary single-home mode until production auth and tenant isolation are approved.

## 2026-07-12: Allow current household profile editing

Expose guarded name and Australian address metadata editing after removing name-based current-home resolution. Keep multi-home behavior, members and roles behind the production authentication decision gate.

## 2026-07-12: Separate reminder visibility from delivery

Expose existing reminder metadata and relationships now, while keeping record mutations, scheduling automation and notification channels behind later approval gates.

## 2026-07-17 - Reminder Persistence Remains Metadata-only

**Decision:** Allow guarded reminder create and edit persistence using the existing Prisma model, current-home resolver and fallback-safe mutation pattern.

**Rationale:** Homeowners benefit from recording due dates and linked household context before HomeVault introduces any delivery infrastructure. Keeping persistence separate from delivery makes the privacy and product boundary explicit.

**Consequences:**

- `DATABASE_URL` is used only for runtime reminder reads and writes.
- Missing database access remains non-destructive and sample data remains useful.
- Linked assets, warranties and maintenance tasks must belong to the current home.
- No email, push, SMS, in-app delivery, background job, queue or delivery credential is introduced.
- Deletes and production authentication remain outside this phase.

## 2026-07-17 - Household Search Reuses Existing Runtime Reads

**Decision:** Add household-wide search as a server-rendered aggregation over the existing current-home data functions and curated fallbacks.

**Rationale:** A unified search materially improves findability without requiring a search service, index, new dependency or schema change at the current product scale.

**Consequences:**

- Search covers existing record metadata and links to existing routes.
- No query runs at build time or module import.
- Missing database access yields sample results rather than a broken page.
- Search terms are not persisted and no analytics are introduced.
- A dedicated search service or index can be reconsidered only if future scale proves it necessary.

## 2026-07-17 - Dashboard Surfaces the Next Pending Reminder

**Decision:** Include the first due pending reminder in the existing household dashboard response and presentation.

**Rationale:** Reminder metadata is most useful when the next household action is visible at a glance alongside maintenance and warranty dates.

**Consequences:**

- Dashboard reads remain lazy and fallback-safe.
- The reminder card links to existing reminder routes.
- Reminder data contributes to the dashboard data-source note.
- No delivery, scheduling, analytics or new persistence behaviour is introduced.

## 2026-07-17 - Unauthenticated Deployments Are No-index Review Surfaces

**Decision:** Apply a conservative browser security-header baseline and prevent indexing while HomeVault remains an unauthenticated single-user preview.

**Rationale:** Review deployments should reduce accidental exposure and must not be mistaken for a production security boundary.

**Consequences:**

- All routes deny framing and unnecessary browser permissions.
- Application resources use a same-origin Content Security Policy.
- Search engines are instructed not to index or follow the app.
- Only synthetic or non-sensitive data is appropriate before production auth and authorization.
- Indexing can be reconsidered only with the future production access model.

## 2026-07-17 - Canonical Demo Seed Is Repeat-safe And Non-destructive

**Decision:** Detect the existing synthetic owner/home relationship and exit successfully instead of creating duplicate household data.

**Rationale:** Cloud and Neon setup commands may be repeated. Duplicate homes would make the temporary current-home resolver ambiguous and undermine review confidence.

**Consequences:**

- Repeated seed runs do not create another Taylor Family Home for the synthetic owner.
- Existing demo records are not overwritten or deleted.
- Refreshing the entire demo dataset remains an explicit future maintenance operation.
- CI continues to validate and build without requiring a live database.

## 2026-07-17 - Database-free Route Smoke Is A Merge Gate

**Decision:** Start the built production server in GitHub Actions with `DATABASE_URL` removed and request every approved route family.

**Rationale:** A successful build does not prove that runtime fallback pages render. Route smoke provides inexpensive evidence for the project's central database-optional contract.

**Consequences:**

- App-code PRs verify production startup and fallback rendering online.
- Dynamic routes use stable canonical sample IDs.
- The check requires no secret, database, Vercel deployment or client machine.
- Database-backed and visual review remain separate gates.

## 2026-07-17 - Health Checks Do Not Probe Household Data

**Decision:** Provide a process-liveness endpoint that returns a stable no-store response without checking the database or environment configuration.

**Rationale:** Deployment health should remain available during database outages and must not disclose sensitive operational details.

**Consequences:**

- `/api/health` confirms only that the application can serve a request.
- Database health requires a separately approved authenticated operational mechanism.
- The response exposes no version, secret, environment or household metadata.
- Route smoke continuously verifies the endpoint without `DATABASE_URL`.

## 2026-07-17 - Attention Is Derived At Read Time

**Decision:** Assemble candidate household dates in the dashboard data response and derive urgency with existing Brisbane-calendar status rules during rendering.

**Rationale:** The MVP can provide a useful attention view without storing duplicate status fields or adding scheduled processing.

**Consequences:**

- Active tasks, pending reminders and warranties share one presentation.
- Urgency stays consistent with existing list and detail badges.
- No background job, notification delivery or schema field is required.
- The queue remains useful with database or curated sample data.

## 2026-07-17 - HomeVault Targets Both Mobile Stores

**Decision:** Treat Apple App Store and Google Play distribution as product requirements while keeping Next.js as the shared foundation.

**Rationale:** The app should reach homeowners through familiar mobile distribution without duplicating the product prematurely or submitting a low-value website wrapper.

**Consequences:**

- Installable web metadata and safe-area behavior are maintained now.
- Capacitor is the preferred later packaging candidate.
- Native submission waits for production auth, authorization, account deletion, privacy URLs and approved storage.
- Store builds must add meaningful platform utility and pass platform review.
- Developer accounts, legal identity, signing and store listing actions remain client-controlled.

## 2026-07-17 - Offline Fallback Does Not Cache Household Records

**Decision:** Cache only a minimal offline page, brand icon and versioned static shell assets; keep household navigation network-first.

**Rationale:** Installed mobile users need a coherent connectivity failure state, but silent household-data storage would create privacy, staleness and mutation-conflict risks before offline behavior is explicitly designed.

**Consequences:**

- Offline navigation renders a clear reconnect message.
- Household pages, RSC payloads, API data and form submissions are not cached.
- No background sync or offline mutation queue exists.
- Rich offline access remains a future security and product decision.

## 2026-07-17 - Frequent Mobile Controls Use 44 Pixel Targets

**Decision:** Set the shared minimum height for buttons, form controls and primary navigation actions to 44 CSS pixels.

**Rationale:** HomeVault is intended for repeated phone use and both mobile stores. Consistent touch targets improve usability without adding platform-specific UI branches.

**Consequences:**

- Shared primitives enforce the target across existing workflows.
- Compact button variants retain compact horizontal padding but not a smaller tap height.
- Desktop layouts inherit slightly more comfortable control sizing.
- Physical-device review remains necessary before store submission.

## 2026-07-17 - Deployment Readiness Claims Are Executable Contracts

**Decision:** Assert security headers, health semantics, no-crawl behavior, install metadata and offline-worker caching in the existing production smoke.

**Rationale:** Store and deployment readiness documentation can drift. Lightweight response-level checks catch accidental regressions in properties that compilation cannot verify.

**Consequences:**

- Pull requests fail when key privacy or install contracts disappear.
- Checks remain database-free and Vercel-independent.
- Visual and physical-device review remain separate release gates.
- Native signing and store policy checks are added only when native projects exist.

## 2026-07-17 - Store Name Requires Clearance Before Reservation

**Decision:** Keep HomeVault as the repository/product codename but do not assume the unqualified name is available or defensible for public store distribution.

**Rationale:** Current Apple and Google listings already use HomeVault or Home Vault, including directly overlapping home-inventory products.

**Consequences:**

- HomeVault Home Care is a working listing candidate only.
- Final name, trademark review and store availability are client/legal gates.
- Bundle and application IDs wait for the cleared public identity.
- Listing claims remain limited to implemented functionality.


## 2026-07-17 - Public Privacy Copy Must Match Implemented Controls

**Decision:** Provide public privacy and support surfaces during preview, while labeling production authentication, deletion, storage, legal ownership and staffed support as release gates.

**Rationale:** Privacy information should be easy to find early, but an app must not imply that operational or legal controls exist before they are implemented and owned.

**Consequences:**

- Privacy and support routes remain static and database-independent.
- Preview users are warned to use sample or controlled non-sensitive data.
- Final legal policy, accountable entity, support contact and deletion workflow remain required before public release.
- Both routes participate in the online database-free smoke gate.


## 2026-07-17 - Database Credentials Do Not Imply Household Access

**Decision:** Require an explicit `HOMEVAULT_PREVIEW_DATABASE_ACCESS=enabled` switch in addition to `DATABASE_URL` for every temporary unauthenticated runtime read and write.

**Rationale:** Deployment integrations can inject database credentials automatically. Credentials alone must not turn a public preview into an unauthenticated household editor.

**Consequences:**

- Runtime database access fails closed by default.
- Reads render curated sample data when preview access is disabled.
- Forms show saving as unavailable and actions reject writes.
- The database helper enforces the gate as defence in depth.
- The switch is limited to controlled non-sensitive preview data and is not a substitute for production authentication or authorisation.


## 2026-07-17 - Prefer Branch-compatible Auth Without Delegating Authorisation

**Decision:** Prefer Neon Managed Better Auth once production-appropriate, retain self-hosted Better Auth as the fallback, and keep all HomeVault household authorisation in server-owned application logic.

**Rationale:** Neon auth aligns with the existing Postgres and preview-branch direction, but it is currently Beta and no dedicated HomeVault Neon project exists. Authentication identifies a user; it does not prove access to a household record.

**Consequences:**

- No auth service is provisioned during architecture planning.
- General availability or explicit beta-risk acceptance is required before using managed Neon auth for production.
- Every read and mutation must check signed-in household membership.
- Email is not used as the durable authorisation key.
- The temporary earliest-home resolver and preview database switch are removed from production paths.
- Self-hosted Better Auth remains the documented fallback.


## 2026-07-17 - Enforce The Data Boundary In CI

**Decision:** Scan every application source file in GitHub Actions and reject direct database credentials or Prisma construction outside the approved server module.

**Rationale:** A fail-closed helper only protects the product while future code continues to use it. An executable source contract catches accidental bypasses before merge.

**Consequences:**

- Client components cannot import the database layer.
- Runtime credential checks remain centralised.
- Prisma seed and command configuration stay outside the application-runtime scan.
- The check uses Node platform APIs and adds no dependency.
- Authenticated household authorisation tests are still required later.


## 2026-07-17 - Test Both Sides Of The Preview Database Gate

**Decision:** Unit-test every meaningful environment-variable combination for temporary preview database access.

**Rationale:** The source boundary prevents bypasses, while a runtime contract proves the shared gate itself still fails closed under realistic deployment configuration states.

**Consequences:**

- Database credentials alone are covered by an explicit regression test.
- The enablement value remains exact and intentional.
- Tests use no live service or secret.
- Production authentication and household authorisation remain separate requirements.


## 2026-07-17 - Assert HTTPS And Same-origin Resource Policies

**Decision:** Apply transport security and same-origin resource controls through the shared Next.js header configuration and test them as deployment contracts.

**Rationale:** Household software should not depend only on hosting defaults for HTTPS persistence or cross-origin resource isolation, and documented controls can drift without response-level evidence.

**Consequences:**

- Capable browsers remember HTTPS-only access for two years.
- Cross-origin no-cors resource consumption is rejected.
- DNS prefetching and legacy cross-domain policy discovery are disabled.
- Future intentional cross-origin assets require an explicit reviewed policy change.


## 2026-07-17 - Advance Maintenance Schedules Atomically

**Decision:** Update a recurring task's next due date in the same transaction that records its completion, using the later of the existing due date and actual completion date as the scheduling anchor.

**Rationale:** Early work should preserve an intentional calendar cadence, while overdue work should not immediately produce another overdue occurrence. History and schedule state must not diverge.

**Consequences:**

- Weekly and custom schedules use exact day intervals.
- Calendar frequencies use UTC calendar arithmetic with month-end clamping.
- One-off tasks become completed and clear their due date.
- Invalid legacy custom intervals retain their current due date and still accept history.
- Notification delivery remains separate and disabled.


## 2026-07-17 - Calendar Portability Before Calendar Integration

**Decision:** Provide a standard one-way iCalendar download instead of connecting HomeVault to external calendar accounts.

**Rationale:** Portable export gives households immediate utility across major calendar apps without OAuth scopes, stored third-party tokens, background synchronization, integration cost or a new privacy boundary.

**Consequences:**

- HomeVault combines existing due metadata in one timeline.
- Exports use all-day events and no-store responses.
- Imported events do not update automatically.
- External calendar write access and two-way sync remain separate future decisions.


## 2026-07-17 - Portable Exports Are Generated, Not Stored

**Decision:** Generate versioned household JSON and spreadsheet-safe asset CSV on request, return them as no-store attachments and retain no export copy.

**Rationale:** Households should be able to take their records with them without creating a new storage surface or sending data to a third party. CSV input must be safe to open in common spreadsheet software.

**Consequences:**

- Export format versioning begins at 1.
- File attachments are excluded until storage is approved.
- Formula-like CSV values receive a protective text prefix.
- Production auth must protect both routes before real household data is allowed.
- Insurance preparation remains a record summary, not claim automation.


## 2026-07-17 - Maintenance Templates Remain Editable Guidance

**Decision:** Offer curated maintenance starting points that prefill the existing task form, while requiring the household to review timing and details before saving.

**Rationale:** Beginners benefit from practical examples, but maintenance needs vary by equipment, property, climate, regulation and manufacturer guidance.

**Consequences:**

- Templates never create or change records automatically.
- Safety-sensitive copy points users to manuals, local guidance and qualified providers.
- Due dates, linked assets and providers remain user choices.
- Existing controlled database access protects saving.
- Updating template guidance requires product review but no schema migration.


## 2026-07-17 - Printable Reports Are Rendered On Demand

**Decision:** Render the household summary as a server page and use the browser's print or save-to-PDF capability instead of generating or storing a report file.

**Rationale:** Households need a practical handover view, but generated-file storage would add retention, access-control and deletion obligations before production identity and storage are approved.

**Consequences:**

- The summary works with database or canonical sample records.
- HomeVault retains no generated copy.
- File attachments are excluded.
- Privacy copy warns that serial numbers and contact details may appear.
- Production authentication must authorise the route before real household data is released.
- The report does not provide valuation or insurance claim automation.


## 2026-07-17 - Recovery Uses Existing Lifecycle States

**Decision:** Build the archive as a derived view over existing inactive status values and recover records through their existing guarded edit screens.

**Rationale:** A visible recovery path reduces pressure for destructive deletion and preserves maintenance and household history without introducing another data model.

**Consequences:**

- The archive does not move or duplicate data.
- Retired and disposed assets remain available as historical inventory.
- Completed and archived tasks retain completion history.
- Done and cancelled reminders remain reviewable.
- Permanent deletion remains a later account-lifecycle and retention-policy decision.


## 2026-07-17 - Onboarding Progress Is Derived

**Decision:** Calculate setup progress from current household records instead of storing onboarding flags or a separate checklist profile.

**Rationale:** Existing records are the reliable evidence that a setup step is useful and complete. Separate state could become stale, add tracking concerns and require another mutation surface.

**Consequences:**

- Empty households receive direct creation links.
- Established households receive review links.
- Progress works with database and canonical sample records.
- Users can complete steps in any order.
- HomeVault stores no onboarding completion data or analytics event.


## 2026-07-17 - Quick Add Routes To Existing Forms

**Decision:** Provide one global creation hub that links to existing guarded forms instead of introducing a universal record mutation.

**Rationale:** Mobile users need predictable low-friction access, while each record type still needs its own validation, relationship choices and database boundary.

**Consequences:**

- The header has a familiar plus-icon shortcut with an accessible name.
- Record-specific Server Actions remain unchanged.
- Quick Add never pre-creates an empty record.
- Existing database and validation messages remain authoritative.
- New record types must be deliberately added to the hub.


## 2026-07-17 - Keep Neon Preview Data Isolated

**Decision:** Place the current Prisma schema and canonical synthetic household on a child `preview` branch while leaving Neon's default production branch empty.

**Rationale:** Database-backed workflow review is useful now, but the application has no production authentication or household authorisation. Preview capability must not be mistaken for production readiness.

**Consequences:**

- Only synthetic data is approved on the preview branch.
- Vercel Preview requires both the pooled connection string and explicit fail-closed switch.
- Vercel Production receives neither value at this stage.
- Neon Auth and Data API remain unprovisioned.
- Production migration, backup and retention operations remain release gates.

## 2026-07-17 - Use The Vercel-managed Neon Resource

**Decision:** Treat the Neon project managed by the connected Vercel team as HomeVault's canonical database resource, with HomeVault application tables and synthetic data isolated on its child `preview` branch.

**Rationale:** The existing Vercel integration already owns and supplies the project connection settings. Reusing that resource avoids competing database integrations while preserving the fail-closed preview boundary.

**Consequences:**

- The managed default branch retains provider-owned Neon Auth tables but contains zero HomeVault application tables.
- The child `preview` branch contains the Prisma schema and canonical Taylor Family Home seed.
- Production HomeVault authentication is still unimplemented; existing provider tables do not approve or enable it.
- Vercel Preview access still requires both the preview branch connection and `HOMEVAULT_PREVIEW_DATABASE_ACCESS=enabled`.
- The separately created standalone HomeVault project remains untouched until an explicit cleanup decision.

## 2026-07-17 - Room Context Reuses Existing Relationships

**Decision:** Build room detail by composing existing room, asset and maintenance reads, with maintenance included only when its linked asset belongs to the room.

**Rationale:** Rooms are a natural household navigation point, and the existing relationships already provide useful context without duplicating data or adding another persistence path.

**Consequences:**

- Room cards navigate to a dedicated detail route.
- Assigned assets and their maintenance tasks remain linked to existing detail workflows.
- Empty and unknown rooms retain useful fallback states.
- No schema, mutation, stored room dashboard or inferred unlinked maintenance relationship is introduced.

## 2026-07-17 - Asset Detail Is The Care Record Hub

**Decision:** Surface existing maintenance tasks and reminders alongside warranties, receipts and documents on asset detail.

**Rationale:** Homeowners usually think about care in the context of the appliance or equipment itself. Showing established relationships in one place reduces navigation effort without creating duplicate records or automation.

**Consequences:**

- Asset reads include existing task and reminder relationships.
- Linked records keep their own authoritative detail and edit workflows.
- Empty relationship states remain visible and non-prescriptive.
- No notification delivery, new scheduling behavior, schema or mutation is introduced.

## 2026-07-17 - Categories Navigate Before They Edit

**Decision:** Route asset category cards to a read-only detail page that lists assigned assets, with editing available as a deliberate secondary action.

**Rationale:** Opening an organisational record should first explain what it contains. Direct-to-edit navigation made accidental changes easier and hid the category's practical value.

**Consequences:**

- Category detail composes existing category and asset reads.
- Assigned assets retain their existing authoritative detail routes.
- The taxonomy remains flat and category persistence is unchanged.
- No usage analytics, stored counts, schema or mutation is introduced.

## 2026-07-17 - Warranty Follow-up Stays With Coverage

**Decision:** Present reminder metadata linked to a warranty on the warranty detail screen alongside supporting document metadata.

**Rationale:** Coverage dates and planned follow-up belong in the same review context, while reminder delivery remains a separate product and privacy boundary.

**Consequences:**

- Warranty reads include their existing reminder relationship.
- Reminder detail remains the authoritative workflow.
- Empty follow-up and document states are explicit.
- No notification channel, background scheduling, schema or mutation is introduced.

## 2026-07-17 - Metadata Shows Only Explicit Relationships

**Decision:** Present receipt and document connections only when an existing relationship is stored in HomeVault.

**Rationale:** Provenance makes household records easier to understand, but inferred links could misrepresent warranty, maintenance or purchase evidence.

**Consequences:**

- Receipt detail can list its related document metadata.
- Document detail can link to its asset, warranty, source receipt and maintenance task.
- Unlinked records state that no connection is recorded.
- No fuzzy matching, OCR, AI, schema or mutation is introduced.

## 2026-07-17 - Maintenance Detail Collects Its Existing Context

**Decision:** Present document metadata and reminders linked to a maintenance task alongside its instructions and completion history.

**Rationale:** A practical care record should make supporting notes and planned follow-up easy to reach without duplicating their authoritative workflows.

**Consequences:**

- Maintenance reads include existing document and reminder relationships.
- Document and reminder detail routes remain authoritative.
- Completion and recurrence behavior is unchanged.
- No notification delivery, schema, inferred association or mutation is introduced.

## 2026-07-17 - Maintenance History Export Is Completion-based

**Decision:** Export one row per recorded maintenance completion rather than one row per task.

**Rationale:** A history file should represent work that actually occurred. Including tasks without completions would blur future plans with evidence of completed upkeep.

**Consequences:**

- Task, asset, completion, frequency, status and next-due context travel together.
- Tasks without history produce no false completion row.
- Formula-like cells are neutralised for spreadsheet safety.
- The response is private, no-store and not retained.
- No cost tracking, valuation, schema, storage or external destination is introduced.

## 2026-07-17 - Provider Contact Actions Are User-initiated Links

**Decision:** Convert valid provider phone, email and website metadata into standard device links after protocol and value validation.

**Rationale:** Mobile users should be able to act on records they saved, while HomeVault should not send messages, place calls or contact third parties itself.

**Consequences:**

- Phone values are reduced to dial-safe characters.
- Email values with header-injection characters are rejected.
- Websites are limited to HTTP(S).
- No action analytics, booking, messaging, payment, credential or external API is introduced.

## 2026-07-17 - Household Membership Is Visible Before It Is Editable

**Decision:** Show current household member names, optional nicknames and roles as read-only context, while omitting email addresses and withholding every membership mutation.

**Rationale:** Households benefit from understanding who a home record represents, but invitations and role administration are security-sensitive workflows that require production identity and server-side household authorisation.

**Consequences:**

- Settings and portable JSON can include the privacy-safe member summary.
- Member email addresses are not selected, rendered or exported by this feature.
- No invitation, removal, role change or sharing workflow is introduced.
- The existing preview database gate and sample fallback remain authoritative.
- Production authentication and household-scoped authorisation remain release gates.

## 2026-07-17 - Inventory Filters Are URL State

**Decision:** Filter the asset inventory with server-rendered query parameters over the existing loaded record set.

**Rationale:** URL state is shareable, transparent and resilient without adding client storage, a preference model, analytics or another database query.

**Consequences:**

- Search, room, category and lifecycle filters can be combined.
- Unassigned room and category records remain intentionally discoverable.
- Filter options reflect the records available from the current database or sample source.
- Clearing filters returns to the canonical Assets route.
- No filter history or household preference is retained.

## 2026-07-17 - Maintenance Urgency Reuses One Date Rule

**Decision:** Derive Maintenance list due-state filters from the same Australia/Brisbane status function used by task badges.

**Rationale:** Filtering and visible urgency labels must not disagree about whether work is overdue, near-term, scheduled later or missing a date.

**Consequences:**

- Overdue, next-30-day, later and no-date filters match the existing badge tones.
- Status and linked-asset filters can be combined with due state and search.
- Filter options come from already-loaded current-household records.
- No due state is persisted and no notification is scheduled.
- Changing the shared date rule intentionally changes both badges and filtering.

## 2026-07-17 - Warranty Filters Follow Visible Coverage State

**Decision:** Derive warranty review filters from the shared Australia/Brisbane coverage-status calculation and explicit stored relationships.

**Rationale:** Coverage filtering should agree with the status shown on every warranty card and should never infer a provider or asset association.

**Consequences:**

- Expired, next-30-day, current and no-expiry groups match visible badges.
- Asset and provider choices come from current loaded records.
- Missing provider metadata remains intentionally discoverable.
- No reminder is scheduled and no claim or financial behavior is added.
- Filter state is URL-only and retained nowhere.

## 2026-07-17 - Record Filters Use Explicit Metadata Only

**Decision:** Filter receipts and documents by their stored record type, document type and explicit asset relationship.

**Rationale:** Household filing should be easy to review, but HomeVault must not infer relationships or inspect unavailable file contents.

**Consequences:**

- Receipts and documents remain one collection with focused views.
- Unlinked records are intentionally discoverable.
- Document-type options come from current metadata.
- No file is opened, parsed or classified.
- Filter state is URL-only and retained nowhere.

## 2026-07-17 - Reminder Triage Does Not Imply Delivery

**Decision:** Allow users to filter reminder metadata by lifecycle, visible due state and explicit linked-record type without scheduling or sending notifications.

**Rationale:** Organising recorded due dates is useful on its own and should not imply that email, push or SMS delivery exists.

**Consequences:**

- Due filters share the Australia/Brisbane rule used by visible badges.
- Asset, warranty and maintenance links are recognised only when stored.
- Unlinked reminder metadata remains discoverable.
- No queue, worker, delivery credential or background job is introduced.
- Filter state is URL-only and retained nowhere.

## 2026-07-17 - Provider Gaps Are Filterable, Not Inferred

**Decision:** Let households filter providers by stored trade, explicit maintenance links and the presence of a recorded phone, email or website.

**Rationale:** A useful directory should expose missing details and unused contacts without rating providers, inferring services or contacting anyone.

**Consequences:**

- Missing trade, no-task and no-contact records remain discoverable.
- A contact method means metadata is present, not that HomeVault verified it.
- Maintenance workload reflects explicit linked tasks only.
- Existing validated device links remain user-initiated.
- No booking, messaging, payment or external provider integration is added.
