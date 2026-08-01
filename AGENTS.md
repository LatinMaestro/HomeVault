# Agent Instructions

HomeVault is in App Store completion mode. The current authority is `docs/APP_STORE_DELIVERY_PLAN_CURRENT_STATUS_2026-08-01.md`. Historical phase documents remain evidence but must not override that plan.

## Working Rules

- Deliver the complete core product and all 17 approved optional capabilities before final submission readiness, subject to recorded provider, cost, legal, commercial, signing and physical-device gates.
- Treat merged Phase 5 policy contracts as foundations, not completed user-facing features.
- Use focused branches and pull requests; lock exact source heads and extract the smallest coherent patch from stale or divergent branches.
- Require executable exact-head GitHub Actions, full diff review and zero unresolved threads before merge.
- A zero-step or `startup_failure` workflow is neither a pass nor a source failure.
- Keep documentation current and record durable decisions in `docs/DECISION_LOG.md`.
- Use fictional QA data only. Never commit secrets, signing material, provider credentials, real household records or private attachments.
- Preserve server-side household/property authorisation, private files and complete export/deletion across every enabled processor and device surface.
- Keep OCR and AI outputs as untrusted user-reviewed drafts; never auto-write records or trigger provider actions.
- Never enable paid providers, perform irreversible production changes, sign/distribute builds or submit publicly without the matching approval.

## Online-First Workflow

- GitHub `main` is the source of truth.
- Work through hosted GitHub branches, pull requests and Actions; never require client-side development tools.
- Automatic Vercel Git deployments are disabled in `vercel.json`.
- Use Vercel only for the milestone deployments authorised by the current delivery plan.
- Batch each slice into one final push where practical and never create no-op or deployment-only commits.
- Prefer one exact-green dependency-ready slice over several unfinished stacks.
- Continue safe independent work around client-owned gates.

## Technical Defaults

- Next.js App Router, TypeScript and Tailwind CSS.
- shadcn-compatible component source in `src/components/ui`.
- Prisma and production Neon PostgreSQL.
- Better Auth with verified email, server-owned sessions and household/property membership checks.
- Private Vercel Blob objects accessed only through authorised server routes.
- Capacitor iOS and Android projects verified through GitHub-hosted native CI.
- Least-privilege providers and explicit user control for notifications, calendar, OCR/AI, ingestion, sharing and external handoffs.

## Quality Bar

- Mobile-first and native-safe behaviour before desktop enhancements.
- Run focused tests plus boundary, migration, Prisma, dependency, lint, strict TypeScript, production build, route smoke and every path-applicable native/security check.
- Verify accessibility, privacy, performance, export and deletion against one exact release candidate.
- Stop for explicit owner approval before Apple App Review submission or public release.
