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



## Neon Preview Checklist

- [x] HomeVault's canonical Vercel-managed Neon project is identified.
- [x] Child preview branch contains the Prisma schema.
- [x] Canonical synthetic seed counts are verified.
- [x] Managed default branch contains zero HomeVault application tables.
- [x] Provider-managed Neon Auth tables are not used as HomeVault production authentication, and Data API use remains unapproved.
- [ ] Add preview-branch `DATABASE_URL` to Vercel Preview only.
- [ ] Add `HOMEVAULT_PREVIEW_DATABASE_ACCESS=enabled` to Vercel Preview only.
- [ ] Redeploy and verify database-backed read/write workflows.
- [ ] Keep all production database variables unset until authentication and authorisation are complete.


## Production Database Checklist

- [x] A reviewed PostgreSQL migration baseline is committed.
- [x] CI checks model coverage and destructive baseline SQL.
- [x] Production status and deploy commands are documented.
- [ ] Rehearse the baseline on a disposable Neon child branch.
- [ ] Confirm the production Neon target and a current restore point.
- [ ] Apply migrations from a controlled cloud environment, never during a Vercel build.
- [ ] Confirm migration status and application tables after deployment.
- [ ] Do not run the synthetic seed against production.


## Native Candidate Checklist

- [x] iOS and Android source projects are committed.
- [x] Platform projects synchronise from the locked Capacitor dependencies.
- [x] Branded app icons and splash resources are generated.
- [x] Android Debug/unsigned Release and iOS Debug/Release Simulator cloud builds are configured.
- [x] Manual signed AAB/IPA artifact workflow is fail-closed and does not auto-submit.
- [ ] Confirm bundle/application IDs in both developer accounts.
- [ ] Protect the GitHub `native-release` environment and configure cloud-held signing credentials.
- [ ] Produce a signed iOS archive and Android App Bundle.
- [ ] Test account, attachment, offline and deletion workflows through internal distribution.
- [ ] Complete store policy forms, reviewer access and final screenshots.


## Native Privacy And Links Checklist

- [x] App-switcher content is obscured.
- [x] Android screenshot, backup and cleartext protections are enabled.
- [x] Custom scheme handling accepts only HomeVault destinations.
- [ ] Publish signed Apple and Android website association identities.
- [ ] Test trusted, malformed and external links on both platforms.
- [ ] Confirm the screenshot restriction matches final support and store-review expectations.


## Signed Candidate Checklist

- [ ] Run only from a reviewed `main` commit with green standard and Native CI.
- [ ] Use a unique positive build number and three-part marketing version.
- [ ] Keep all signing inputs in protected GitHub environment secrets.
- [ ] Inspect the workflow provenance and signed artifacts before store upload.
- [ ] Verify signed Universal Links and Android App Links on physical devices.
- [ ] Upload first to TestFlight and Google Play internal testing, never directly to public release.
- [ ] Complete final account, attachment, export, recovery and deletion tests.


## Store Privacy Checklist

- [x] iOS privacy manifest is bundled and contract-tested.
- [x] Tracking and tracking domains are explicitly disabled.
- [x] Current account, household, purchase-metadata and attachment classes are mapped.
- [x] Processor and native SDK inventory is documented.
- [ ] Inspect the final Xcode privacy report and Android merged manifest.
- [ ] Confirm production processor contracts, regions and backup/log retention.
- [ ] Publish final legal privacy copy naming the client-controlled developer entity.
- [ ] Submit Apple App Privacy and Google Play Data safety answers matching the signed build.
