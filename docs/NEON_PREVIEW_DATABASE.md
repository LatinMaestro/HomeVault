# Neon Preview Database

## Status

Provisioned and verified on 17 July 2026.

## Resource Boundary

- Neon project: `HomeVault`.
- Default `production` branch: intentionally empty.
- Child `preview` branch: HomeVault schema plus canonical synthetic seed data.
- Database: `neondb`.
- Region: selected by the client for the HomeVault project.
- Neon Auth: not provisioned.
- Neon Data API: not provisioned.

The branch and project names are operational references, not credentials. Connection strings, role passwords and API keys must remain in provider-managed environment settings.

## Preview Contents

The preview branch contains:

- one Taylor Family Home;
- four rooms;
- three asset categories;
- two assets;
- two maintenance tasks and one completion;
- one warranty;
- two receipt records;
- two document metadata records;
- two reminders;
- two service providers.

All records are synthetic. No personal household data is approved for this unauthenticated preview mode.

## Application Access

HomeVault requires both values at runtime:

```text
DATABASE_URL=<pooled Neon preview branch connection string>
HOMEVAULT_PREVIEW_DATABASE_ACCESS=enabled
```

Set these only in the Vercel Preview environment until production authentication and household authorisation are complete. `DATABASE_URL` alone fails closed.

Do not expose the preview database to Production, commit credentials to GitHub, or place secrets in documentation or chat.

## Schema Workflow

The repository Prisma schema remains the source of truth. The current project uses `prisma db push` for controlled preview schema synchronisation and has not adopted production migration deployment yet.

Before public production use:

1. adopt reviewed Prisma migrations;
2. provision production authentication;
3. enforce household authorisation for every read and mutation;
4. add database-backed cross-household denial tests;
5. define backup, restore and retention operations;
6. provision production data separately from synthetic preview data.

## Verification Evidence

Connector verification confirmed the preview schema contains all HomeVault application tables and indexes. Record counts match the canonical seed. A separate production-branch query confirmed zero application tables.
