# Online Development Workflow

HomeVault uses an online-first development workflow. GitHub, Codex cloud/sandbox workspaces, pull requests and Vercel previews are the normal development path.

## Default Workflow

1. Treat GitHub `main` as the source of truth.
2. Create a scoped feature branch for each approved task or phase.
3. Implement changes in a Codex/cloud or GitHub-backed environment where available.
4. Open a pull request for code and documentation review.
5. Use GitHub PR diffs and checks as the code review record.
6. Use Vercel Preview Deployments as the preferred UI review method.
7. Use GitHub Actions checks as online build evidence, especially when Vercel is unavailable or quota-limited.
8. Merge to `main` only after the PR is in scope and review evidence is acceptable.
9. Let Vercel deploy production from `main` after merge.

## Client Local Machine Policy

The client should not be asked to run local development commands for normal MVP work. Avoid requests for:

- Local `npm install`, `npm run dev`, `npm run build` or package-cache commands.
- Local PowerShell, Git or database commands.
- Local dev servers.
- Local secrets, local databases or local dependency installs.
- Antivirus bypasses, allowlists or disabled protections.

If a task normally requires local commands, first use an online alternative such as Codex cloud/sandbox checks, GitHub branches and PRs, GitHub Actions where configured, Vercel preview/build logs, or browser-based Vercel review.

## Local Development Exception

Local development is optional developer reference only. It may be used by a developer who explicitly chooses it, but it is not the default client workflow and should not be required for normal MVP delivery.

Local development may be requested only when there is genuinely no online alternative and the reason is documented in the PR or task notes.

## Secrets And Databases

No local secrets, local database setup or local dependency installation should be required for normal MVP development. Preview/runtime services such as Neon should be configured through approved hosted environments and Vercel environment variables when needed.

Vercel builds must continue to avoid build-time database dependency. Runtime database usage must keep graceful fallback behaviour unless a later approved phase changes that contract.

## Review Gates

- Code review: GitHub pull requests.
- Automated checks: GitHub Actions lint, typecheck, Prisma validation/generation and build where configured.
- UI review: Vercel Preview Deployment URLs.
- Deployment review: Vercel build/deployment status and preview smoke checks.
- Product review: approved phase scope, documentation and decision log alignment.

