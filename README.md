# HomeVault

HomeVault is a privacy-first home maintenance, warranty, receipt, asset and reminder vault for Australian homeowners and families.

Phase 1G is planned as the asset persistence phase. It will extend the room mutation pattern to asset create/edit only, using the existing Prisma/PostgreSQL foundation when `DATABASE_URL` is configured and preserving safe messaging when a database is unavailable. The app does not include production authentication, deletes, warranty/receipt/document/maintenance persistence, uploads, OCR, AI, notifications, billing, analytics or external integrations.

## Current Status

- Phase: `1G Asset Persistence` planned
- App: Next.js App Router, TypeScript, Tailwind CSS and shadcn-compatible components
- Auth: stubbed single-user mode only
- Data: Prisma runtime reads when `DATABASE_URL` is configured, curated sample fallback otherwise
- Mutations: room create/edit only; asset create/edit planned next
- Storage: not implemented pending approval
- Current review posture: fallback-safe and Vercel-build-safe without live database access
- Next implementation focus: asset create/edit persistence only

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
npm run prisma:validate
npm run prisma:generate
npm run db:push
npm run db:seed
```

## Optional Prisma Local Reference

Local database setup is optional developer reference only. Normal MVP development should not require local secrets, local databases or local dependency installs.

If a developer explicitly chooses local database work, set `DATABASE_URL` in `.env` before running database commands. See `docs/PRISMA_LOCAL_SETUP.md`.

Vercel builds do not require a live database connection. Runtime pages render sample data if `DATABASE_URL` is absent or unavailable. Room create/edit actions show a clear unavailable-database message when saving cannot run.

## Core Routes

- `/`
- `/vault`
- `/vault/rooms`
- `/vault/rooms/new`
- `/vault/rooms/[roomId]/edit`
- `/vault/assets`
- `/vault/assets/new`
- `/vault/assets/[assetId]`
- `/vault/assets/[assetId]/edit`
- `/maintenance`
- `/maintenance/[taskId]`
- `/warranties`
- `/warranties/[warrantyId]`
- `/receipts`
- `/receipts/[recordId]`
- `/settings`

## Vercel Notes

Connect the GitHub repository to Vercel and choose the Next.js preset. No production database connection is required for current builds. Authentication, file storage and paid integrations must not be configured until their approaches are approved.

When Vercel usage is capped, batch app changes into fewer PRs and use GitHub Actions as the primary automated build evidence. Avoid extra Vercel inspection unless diagnosing a Vercel-specific problem.

