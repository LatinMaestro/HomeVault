# Agent Instructions

HomeVault is in foundation mode. Keep implementation narrow, practical and privacy-first.

## Working Rules

- Do not add unapproved product features.
- Do not implement production auth, uploads, OCR, AI, notifications, billing, analytics or external integrations in Phase 1A.
- Use branches and pull requests after initial setup.
- Keep documentation current with code changes.
- Log durable decisions in `docs/DECISION_LOG.md`.
- Treat Vercel Preview Deployments as the visual review gate.

## Technical Defaults

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-compatible component source in `src/components/ui`
- Prisma and PostgreSQL are planned, but no real database functionality is implemented yet.
- Stubbed single-user auth only until auth is approved.

## Quality Bar

- Mobile-first layout works before desktop enhancements.
- `npm run lint`, `npm run typecheck` and `npm run build` should pass before PR review.
- Accessibility basics apply: semantic landmarks, readable contrast, keyboard-friendly navigation and descriptive labels.

