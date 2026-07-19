# Production Database Operations

HomeVault keeps a reviewed Prisma migration history for PostgreSQL. The baseline in `prisma/migrations/0001_homevault_baseline` represents the complete application and Better Auth schema as of Phase 4O.

## Safety Rules

- GitHub `main` is the source of truth for schema and migration files.
- `prisma migrate deploy` is the only approved production migration command.
- `prisma db push` is limited to disposable development or preview databases.
- Vercel builds never run migrations and never require a database connection.
- Every production migration must be reviewed for destructive SQL before deployment.
- Take or confirm a Neon restore point or branch before changing the default branch.
- Never seed the production database with the synthetic Taylor Family Home.
- Never apply a migration to the Neon default branch merely to make CI pass.
- Never hand-edit Prisma migration records.

## Online Deployment Runbook

1. Merge the reviewed migration PR after CI passes.
2. Confirm the target Neon project, default branch and database.
3. Confirm a current restorable Neon branch or restore point exists.
4. Add the production Neon pooled connection string to the GitHub Actions secret `HOMEVAULT_PRODUCTION_DATABASE_URL`.
5. Trigger the `Production database migration` workflow from the GitHub Actions interface, or create the controlled `ops/production-database-migration` trigger branch.
6. The workflow validates the locked migration history and applies `prisma migrate deploy`.
7. The workflow verifies Prisma migration status, expected application tables and applied migration records.
8. Verify `/api/health`, `/api/readiness`, account entry, onboarding and one authorised household read.
9. Keep Vercel build and deployment steps independent from migration execution.

## Cloud Workflow Guardrails

- The workflow accepts only a PostgreSQL connection hosted by the approved Neon service.
- The credential exists only as an encrypted GitHub Actions secret.
- The migration job has read-only repository permissions and a single non-cancelling concurrency group.
- No seed command is present.
- Re-running the job is safe because `prisma migrate deploy` applies only pending reviewed migrations.
- Logs expose migration names and verification counts, never the database credential or household rows.

## Preview Validation

A disposable Neon child branch may be used to rehearse the migration and seed data. Preview validation must not mutate or reset the default branch. The synthetic seed remains preview-only.

## Rollback

Prisma migrations are forward-only. For a failed deployment, stop writes, capture logs and restore or branch from the confirmed Neon restore point. Prepare a reviewed forward repair migration before resuming. Do not hand-edit `_prisma_migrations`.

## Current Gate

The client confirmed the Vercel-managed Neon production target and created `pre-homevault-production-migration` from its default branch. The complete migration history was rehearsed on an isolated temporary branch and applied to production through the controlled GitHub workflow on 2026-07-19. Both reviewed migrations are recorded in Prisma's migration ledger, all expected HomeVault tables are present, the synthetic seed was not run, `/api/health` and `/api/readiness` return successfully, and the disposable production account validation completed with cleanup.
