# Release Checklist

## Standard PR Checklist

- [ ] Scope matches the approved phase.
- [ ] Diff is small and reviewable.
- [ ] Documentation is updated where needed.
- [ ] GitHub PR summary explains changes, checks and assumptions.
- [ ] Vercel Preview Deployment is available for UI changes.
- [ ] Vercel Preview Deployment is reviewed when UI changes are present.
- [ ] No local client-machine commands are required for normal review.

## App-Code Checklist

- [ ] Lint passes where available.
- [ ] Typecheck passes where available.
- [ ] Build passes where available.
- [ ] Database-free production route smoke passes.
- [ ] Prisma validation/generation passes when Prisma or database access changes.
- [ ] Vercel build does not require a live database connection.
- [ ] Runtime pages remain useful when `DATABASE_URL` is absent or unavailable.
- [ ] Security headers are present on deployed routes.
- [ ] `/api/health` responds successfully without database access.
- [ ] `/robots.txt` disallows crawling until production auth is approved.
- [ ] Manifest, install icon, theme colour and standalone metadata are valid.
- [ ] Safe-area layout is reviewed on representative iOS and Android devices.
- [ ] Store submission blockers in `docs/APP_STORE_READINESS.md` are resolved before native release.
- [ ] Unauthenticated deployments use sample or controlled non-sensitive data only.
- [ ] Search indexing remains disabled until the production access model is approved.

## Phase 1D Review Checklist

- [ ] Home dashboard routes users into reviewable app areas.
- [ ] Primary navigation is clear on mobile and desktop.
- [ ] Empty states are useful.
- [ ] Missing-record detail states are useful.
- [ ] Create/edit shells clearly state that saving is not enabled.
- [ ] No UI implies records were saved when they were not.
- [ ] No unapproved auth, uploads, OCR, AI, notifications, payments, analytics, native iOS or persistent mutations appear.

