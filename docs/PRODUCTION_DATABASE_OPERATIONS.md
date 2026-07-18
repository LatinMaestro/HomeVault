# Production Database Operations

HomeVault now keeps a reviewed Prisma migration history for PostgreSQL. The baseline in `prisma/migrations/0001_homevault_baseline` represents the complete application and Better Auth schema as of Phase 4O.

## Safety Rules

- GitHub `main` is the source of truth for schema and migration files.
- `prisma migrate deploy` is the only approved production migration command.
- `prisma db push` is limited to disposable development or preview databases.
- Vercel builds never run migrations and never require a database connection.
- Every production migration must be reviewed for destructive SQL before deployment.
- Take or confirm a Neon restore point or branch before changing the default branch.
- Never seed the production database with the synthetic Taylor Family Home.
- Never apply a migration to the Neon default branch merely to make CI pass.

## Online Deployment Runbook

1. Merge the reviewed migration PR after CI passes.
2. Confirm the target Neon project, default branch and database.
3. Confirm a current restorable Neon branch or restore point exists.
4. Run `pnpm run db:migrate:status` from a controlled cloud environment using the production `DATABASE_URL`.
5. Run `pnpm run db:migrate:deploy` once from that controlled environment.
6. Re-run migration status and inspect the application tables.
7. Verify `/api/health`, sign-in, onboarding and one authorised household read.
8. Keep Vercel build and deployment steps independent from migration execution.

## Preview Validation

A disposable Neon child branch may be used to rehearse the migration and seed data. Preview validation must not mutate or reset the default branch. The synthetic seed remains preview-only.

## Rollback

Prisma migrations are forward-only. For a failed deployment, stop writes, capture logs and restore or branch from the confirmed Neon restore point. Prepare a reviewed forward repair migration before resuming. Do not hand-edit `_prisma_migrations`.

## Current Gate

The migration baseline is ready for review and disposable-branch rehearsal. Applying it to the live Neon default branch remains intentionally deferred until the production auth and email environment is ready and the target/restore point are confirmed.
