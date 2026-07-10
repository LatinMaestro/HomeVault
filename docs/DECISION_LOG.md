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
