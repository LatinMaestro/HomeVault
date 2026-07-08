# Phase 1D Plan: Review And Hardening

Phase 1D is a controlled review and hardening phase. It improves confidence in the Phase 1A-1C foundation before HomeVault adds persistent mutations, production authentication, uploads or integrations.

## Goals

- Improve usability of the existing mobile-first shell and core read-only screens.
- Tighten empty, fallback, error and loading states where they already exist.
- Improve accessibility basics across navigation, forms, lists and detail pages.
- Keep Vercel builds safe without build-time database access.
- Keep database-backed reads fallback-safe when `DATABASE_URL` is missing or unavailable.
- Prepare clear review evidence for future persistence/mutation work.

## Approved Work

- Copy and layout refinements on existing Phase 1C screens.
- Navigation consistency checks across approved routes.
- Non-saving create/edit shell clarity.
- Empty-state and fallback-state polish.
- Accessibility improvements such as labels, landmarks, focus states and contrast fixes.
- Small component cleanup where it reduces duplication or improves readability.
- Documentation updates that clarify review, scope and implementation decisions.
- Lightweight tests/check scripts only if they do not require local client setup or paid services.

## Out Of Scope

- Production authentication.
- Real file uploads or storage.
- OCR.
- AI.
- Email ingestion.
- Notifications.
- Payments or subscriptions.
- Analytics.
- Native iOS.
- Advanced household sharing.
- Insurance claim automation.
- Financial or budgeting features.
- Persistent create, edit or delete mutations.
- Server Action mutations.
- Role or permission systems.

## Review Checklist

- All existing Phase 1C routes still render useful fallback/sample data without `DATABASE_URL`.
- Create/edit shells clearly state that saving is not enabled yet.
- No UI suggests a record was saved when it was not.
- Mobile navigation remains usable and predictable.
- Desktop layout remains clean without becoming a separate product direction.
- Visual tone stays calm, practical, home-focused and privacy-first.
- Vercel preview remains the preferred UI review surface.
- GitHub PR remains the preferred code review surface.

## Quality Gates

For code changes, use available Codex/cloud, GitHub or Vercel checks:

- Prisma validation/generation when Prisma files or database access are touched.
- Lint.
- Typecheck.
- Build.
- Vercel Preview visual review for UI changes.

Documentation-only changes may skip app builds when no app files, dependencies or runtime behavior are changed.

## Client Actions

No client action is required for Phase 1D hardening unless a later task needs a secret, paid service, hosted database change, production auth decision, storage decision or product-scope decision outside this plan.

