# Review Gates

## Pull Request Gate

- Scope matches the approved phase.
- Documentation is updated where needed.
- Diff is small enough to review confidently.
- PR summary includes what changed, assumptions, checks and client actions.
- GitHub PR remains the preferred code review surface.

## Check Gate

For app-code changes:

- Lint passes.
- Typecheck passes.
- Build passes.
- Prisma validation/generation pass when Prisma or database access changes.

For documentation-only changes, app builds may be skipped when no app files, dependencies or runtime behaviour are changed.

## Vercel Visual Gate

- Preview deployment loads.
- Mobile layout is usable.
- Navigation works.
- Visual style matches HomeVault principles.
- No out-of-scope features appear.
- Fallback/sample-data states remain useful when `DATABASE_URL` is absent.
- Non-saving shell pages do not imply records were saved.

## Scope Gate

Phase 1D review and hardening must not introduce:

- Production authentication.
- Real uploads or storage.
- OCR or AI.
- Email ingestion.
- Notifications.
- Payments or subscriptions.
- Analytics.
- Native iOS.
- Persistent create/edit/delete mutations.
- Financial or budgeting features.

