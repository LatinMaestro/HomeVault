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
