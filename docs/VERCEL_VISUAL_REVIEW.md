# Vercel Visual Review

Vercel Preview Deployments are the visual review gate for pull requests. Production deployment comes from `main` after merge.

## Setup

The GitHub repository is connected to Vercel using the Next.js preset. Normal MVP review should happen from Vercel Preview URLs, not from local client-machine development commands.

Phase 1D does not require a live database for builds. If `DATABASE_URL` is absent or unavailable at runtime, database-backed pages should render built-in sample data or useful fallback states.

## Review Steps

- Open the Vercel Preview URL from the PR or GitHub commit status.
- Review mobile width first.
- Check the home dashboard, Vault, Rooms, Assets, Maintenance, Warranties, Receipts and Settings routes.
- Check a representative detail page and unknown detail URL.
- Confirm create/edit pages are clearly non-saving shells.
- Confirm empty states are useful when no records are available.
- Confirm no unapproved features appear or are implied as working.
- Record feedback on the PR when feedback is needed.

## Build Expectations

- No build-time database connection is required.
- No local client-machine commands are required for normal review.
- No production auth, storage, OCR, AI, notifications, payments, analytics or native iOS setup is required.

