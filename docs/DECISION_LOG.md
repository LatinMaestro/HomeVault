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

