# HomeVault

HomeVault is a privacy-first home maintenance, warranty, receipt, asset and reminder vault for Australian homeowners and families.

Phase 3X is complete. HomeVault provides guarded household record workflows with curated sample fallback, controlled preview database access and automatic recurring maintenance schedule advancement. The app does not yet include production authentication, delete workflows, document uploads/storage, OCR, AI, notification delivery, billing, analytics or external integrations.

## Current Status

- Phase: `3X Warranty Review Filters` complete
- App: Next.js App Router, TypeScript, Tailwind CSS, shadcn-compatible components, installable metadata and phone-sized touch controls
- Auth: stubbed single-user mode with one shared earliest-home resolver only; household membership is visible as a privacy-safe read-only summary
- Data: curated sample fallback by default; Prisma runtime access requires both `DATABASE_URL` and the explicit controlled-preview switch; canonical demo seeding is repeat-safe
- Mutations: room, asset, maintenance task, warranty, receipt, document, service provider, asset category, household profile and reminder metadata create/edit only when controlled preview database access is explicitly enabled; maintenance completion records are additive only
- Storage: not implemented pending approval
- Current review posture: fallback-safe and contract-tested online for routes, security headers, health, install metadata, crawler rules and the non-sensitive offline shell
- Home: fallback-safe household snapshot and attention queue for maintenance, reminders, warranties, inventory, receipts and documents
- Presentation: household-friendly status, frequency and document labels
- Findability: server-rendered search across core lists plus household-wide search from the app header
- Date awareness: Brisbane-calendar maintenance due and warranty coverage states, strict guarded dates, coverage filters and warranty-linked follow-up reminders
- Navigation: direct links between existing rooms, assets, tasks, warranties and records
- Rooms: searchable list, guarded create/edit and detail views with assigned assets and linked maintenance
- Asset categories: searchable flat taxonomy with guarded create/edit and assigned-asset detail views
- Assets: guarded create/edit for identity, purchase, room, category and lifecycle metadata, with mobile-friendly room/category/status filters and linked care tasks, reminders, warranties and records
- Maintenance: guarded lifecycle, status/due/asset work-queue filters, editable starter templates, custom intervals, safe provider contact actions, documents, reminders, additive completion history, automatic next-due advancement and portable household calendar export; notification delivery remains off
- Records: receipt and document metadata with navigation to existing assets, warranties, source receipts and maintenance context
- Portability: one-way household calendar, structured metadata, spreadsheet-safe inventory and maintenance-history downloads, and a printable household summary
- Recovery: one archive view for inactive assets, closed maintenance tasks and finished reminders
- Onboarding: a derived six-step household setup guide with no tracking profile
- Navigation: a global Quick Add hub for every existing creation workflow
- Distribution: Apple App Store and Google Play are approved targets; native packaging follows production auth, deletion, privacy and storage gates

## Default Development Workflow

HomeVault is developed online-first. The client should not need to run the app, install packages or manage developer tooling on their local PC for normal MVP work.

1. Use GitHub `main` as the source of truth.
2. Work from scoped GitHub branches.
3. Use Codex cloud/sandbox environments for implementation and checks where available.
4. Open pull requests for review.
5. Use GitHub PR diffs and checks as code review evidence.
6. Use GitHub Actions as the primary automated check gate when Vercel usage is constrained.
7. Use Vercel Preview Deployment URLs as the preferred UI review method when usage allows.
8. Merge to `main` only after the PR is in scope and review evidence is acceptable.
9. Let Vercel deploy production from `main` after merge.

Do not ask the client to run local `npm`, PowerShell, Git, database, package-cache or dev-server commands unless there is genuinely no online alternative. Do not bypass, allowlist or disable antivirus protections casually.

See `docs/ONLINE_DEVELOPMENT_WORKFLOW.md` for the full workflow.

## Optional Developer Local Reference

The commands below are optional developer reference only. They are not the default client workflow and should not be required for normal MVP development.

```bash
npm install
npm run dev
```

If used by a developer, open `http://localhost:3000`.

## Optional Developer Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run smoke:routes
npm run prisma:validate
npm run prisma:generate
npm run db:push
npm run db:seed
```

## Optional Prisma Local Reference

Local database setup is optional developer reference only. Normal MVP development should not require local secrets, local databases or local dependency installs.

If a developer explicitly chooses controlled preview database work, set `DATABASE_URL` and `HOMEVAULT_PREVIEW_DATABASE_ACCESS=enabled` before exercising runtime reads or writes. See `docs/PRISMA_LOCAL_SETUP.md`.

Vercel builds do not require a live database connection. Runtime pages render sample data unless controlled preview database access is explicitly enabled and available. Room, asset, maintenance, warranty, receipt, document and reminder actions show clear unavailable-database messages when saving cannot run.

A child `preview` branch in HomeVault's Vercel-managed Neon project contains the Prisma schema and canonical synthetic seed household. The managed default branch contains no HomeVault application tables, and Vercel Production must not receive preview access. See `docs/NEON_PREVIEW_DATABASE.md`.

## Core Routes

- `/`
- `/offline` (privacy-safe connectivity fallback)
- `/calendar` (combined household dates and portable calendar download)
- `/home-report` (printable household handover summary)
- `/getting-started` (beginner household setup guide)
- `/api/calendar.ics` (no-store standard calendar export)
- `/api/export/household.json` (portable household metadata)
- `/api/export/inventory.csv` (spreadsheet-safe asset inventory)
- `/api/export/maintenance.csv` (spreadsheet-safe completion history)
- `/api/health` (data-independent deployment liveness)
- `/archive` (inactive-record recovery centre)
- `/add` (global creation-workflow hub)
- `/search`
- `/vault`
- `/vault/rooms`
- `/vault/rooms/new`
- `/vault/rooms/[roomId]`
- `/vault/rooms/[roomId]/edit`
- `/vault/categories`
- `/vault/categories/new`
- `/vault/categories/[categoryId]`
- `/vault/categories/[categoryId]/edit`
- `/vault/assets`
- `/vault/assets/new`
- `/vault/assets/[assetId]`
- `/vault/assets/[assetId]/edit`
- `/maintenance`
- `/maintenance/new`
- `/maintenance/templates`
- `/maintenance/reminders`
- `/maintenance/reminders/new`
- `/maintenance/reminders/[reminderId]`
- `/maintenance/reminders/[reminderId]/edit`
- `/maintenance/providers`
- `/maintenance/providers/new`
- `/maintenance/providers/[providerId]`
- `/maintenance/providers/[providerId]/edit`
- `/maintenance/[taskId]`
- `/maintenance/[taskId]/edit`
- `/warranties`
- `/warranties/new`
- `/warranties/[warrantyId]`
- `/warranties/[warrantyId]/edit`
- `/receipts`
- `/receipts/new`
- `/receipts/new/receipt`
- `/receipts/new/document`
- `/receipts/[recordId]`
- `/receipts/[recordId]/edit`
- `/settings` (household profile, read-only members and privacy settings)

## Vercel Notes

Connect the GitHub repository to Vercel and choose the Next.js preset. No production database connection is required for current builds. Authentication, file storage and paid integrations must not be configured until their approaches are approved.

When Vercel usage is capped, batch app changes into fewer PRs and use GitHub Actions as the primary automated build evidence. Avoid extra Vercel inspection unless diagnosing a Vercel-specific problem.


## Preview Database Safety

HomeVault does not have production authentication yet. To prevent an attached database from becoming a public shared household, `DATABASE_URL` alone does not enable runtime reads or writes. Controlled non-sensitive preview access additionally requires `HOMEVAULT_PREVIEW_DATABASE_ACCESS=enabled`.

Do not enable this switch for real household data or treat it as authentication. Production release must replace the temporary current-home resolver with signed-in, server-authorised household access.
