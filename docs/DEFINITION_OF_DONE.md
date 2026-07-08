# Definition Of Done

A change is done when:

- It matches approved phase scope.
- It is documented where needed.
- It uses the online-first workflow by default.
- It has review evidence from GitHub, Codex/cloud checks or Vercel where available.
- Lint, typecheck and build pass for app-code changes.
- Prisma validation/generation pass when Prisma or database access changes.
- Vercel Preview has been reviewed when UI changes are present.
- It preserves fallback behaviour when `DATABASE_URL` is missing unless a later approved phase changes that contract.
- It does not introduce unapproved auth, storage, OCR, AI, integrations, billing, analytics, notifications or native app work.
- It records durable product or technical decisions in the decision log or product decisions file.

For documentation-only changes, app builds may be skipped when no app files, dependencies or runtime behaviour are changed.

