# Agent Instructions

HomeVault is in foundation mode. Keep implementation narrow, practical and privacy-first.

## Working Rules

- Do not add unapproved product features.
- Do not implement production auth, uploads, OCR, AI, notifications, billing, analytics or external integrations unless a later phase explicitly approves them.
- Use branches and pull requests after initial setup.
- Keep documentation current with code changes.
- Log durable decisions in `docs/DECISION_LOG.md` or `docs/PRODUCT_DECISIONS.md` as appropriate.
- Treat Vercel Preview Deployments as the visual review gate.
- Keep changes small, reviewable and scoped by phase.

## Online-First Workflow

HomeVault development is online-first by default.

- GitHub is the source of truth for code and documentation.
- Work from GitHub branches and pull requests.
- Prefer Codex cloud/sandbox environments for implementation and checks.
- Prefer Vercel Preview Deployment URLs for UI review.
- Prefer GitHub pull requests for code review.
- Do not ask the client to run local development commands unless there is genuinely no online alternative.
- Do not require local secrets, local databases or local dependency installs for normal MVP development.
- Do not bypass, allowlist or disable antivirus protections casually.

Avoid asking the client to run local `npm`, PowerShell, Git, database, package-cache or dev-server commands. If local development instructions exist, treat them as optional developer reference only, not the default client workflow.

## Technical Defaults

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-compatible component source in `src/components/ui`
- Prisma and PostgreSQL as the approved data-model foundation
- Runtime database reads may use `DATABASE_URL` with graceful fallback where implemented
- Stubbed single-user auth only until production auth is approved

## Quality Bar

- Mobile-first layout works before desktop enhancements.
- Run lint, typecheck and build checks in the Codex/cloud environment where available.
- Use GitHub and Vercel checks as review evidence.
- Accessibility basics apply: semantic landmarks, readable contrast, keyboard-friendly navigation and descriptive labels.

