# Phase 1E Plan: Persistence Readiness

Phase 1E prepares HomeVault for future persistent create and edit workflows without turning on real mutations yet. It keeps the app reviewable, fallback-safe and online-first while tightening form structure, data contracts and review evidence.

## Status

Phase 1E is the next planned phase after Phase 1D. It may begin with safe, non-persistent implementation work once this plan is merged.

## Goals

- Make rooms and assets create/edit shells feel closer to their future production workflows.
- Add shared form field definitions or lightweight validation helpers where useful without adding new dependencies unless clearly justified.
- Keep all save actions non-destructive and non-persistent.
- Preserve runtime database reads with curated sample fallback when `DATABASE_URL` is missing or unavailable.
- Prepare clear acceptance criteria for a later persistence phase.
- Keep the visual style calm, practical, mobile-first and beginner-friendly.

## Approved Work

- Improve non-saving create/edit shell field structure for rooms and assets.
- Add reusable field metadata for preview forms where it reduces duplication.
- Add inline, client-side helper text and required-field indicators for preview only.
- Add non-persistent preview validation or review messages if they do not imply records are saved.
- Refine route copy so users understand what will be enabled later.
- Update documentation and acceptance criteria for the future persistence phase.
- Continue using GitHub Actions as the main automated evidence when Vercel usage is constrained.

## Out Of Scope

- Persistent create, edit or delete mutations.
- Server Action mutations.
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
- Role or permission systems.
- Requiring local client commands, local secrets or local databases.

## Data And Database Behaviour

- Database reads remain runtime-only and fallback-safe.
- No build step may require live database access.
- `DATABASE_URL` remains optional for preview rendering.
- Create/edit pages remain non-saving shells until a later persistence phase explicitly approves mutations.
- No new secrets or service credentials are required for Phase 1E.

## Review Approach

- Use GitHub PRs for code review.
- Use GitHub Actions for Prisma, lint, typecheck and build evidence when app code changes.
- Avoid manual Vercel inspection unless a deployment issue needs investigation or a visual checkpoint is explicitly useful.
- Keep PRs small enough to merge safely while Vercel usage is constrained.

## Completion Criteria

Phase 1E is complete when:

- Room and asset shell forms have clear, reusable field structure.
- Preview-only validation or required-field communication is understandable and non-misleading.
- No save action persists data or implies persistence.
- Documentation clearly separates Phase 1E readiness from the later persistence phase.
- CI evidence passes for app-code changes.

## Client Actions

No client action is required for Phase 1E unless a later task needs a hosted database decision, production auth decision, file storage decision, secret, paid service or product-scope change.

