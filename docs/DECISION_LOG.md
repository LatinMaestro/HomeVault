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

