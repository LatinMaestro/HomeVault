# HomeVault

HomeVault is a privacy-first home maintenance, warranty, receipt, asset and reminder vault for Australian homeowners and families.

Phase 1B adds the Prisma data model foundation on top of the Phase 1A visual shell. It includes schema and seed setup only. It does not include production authentication, live database connection, uploads, OCR, AI, notifications, billing, analytics or external integrations.

## Current Status

- Phase: `1B Data Model Foundation`
- App: Next.js App Router, TypeScript, Tailwind CSS and shadcn-compatible components
- Auth: stubbed single-user mode only
- Data: Prisma schema and local seed setup, no runtime app queries yet
- Storage: not implemented pending approval

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

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

## Prisma Local Setup

Set `DATABASE_URL` in `.env` before running database commands. See `docs/PRISMA_LOCAL_SETUP.md`.

Vercel builds do not require a live database connection in Phase 1B.

## Development Workflow

1. Work from a feature branch, not `main`, after the initial setup.
2. Keep changes aligned to the phase prompts in `prompts/`.
3. Update relevant docs and `docs/DECISION_LOG.md` when decisions are made.
4. Run lint, typecheck and build before opening a pull request.
5. Use the Vercel Preview Deployment as the visual review gate.

## Vercel Notes

Connect the GitHub repository to Vercel and choose the Next.js preset. No production database connection is required for Phase 1B builds. Authentication, file storage and paid integrations must not be configured until their approaches are approved.

