# Product Decisions

This file records durable product and workflow decisions that affect future HomeVault phases.

| Date | Decision | Rationale | Status |
| --- | --- | --- | --- |
| 2026-07-08 | Use an online-first development workflow for HomeVault. | The client wants development to happen through GitHub, Codex cloud/sandbox workspaces, pull requests and Vercel previews instead of relying on the client PC. | Accepted |
| 2026-07-08 | Do not require local development commands for normal MVP delivery. | Local dependency installs, package caches, dev servers and PowerShell activity use client storage and can trigger security warnings. | Accepted |
| 2026-07-08 | Use Vercel Preview Deployment URLs as the preferred UI review method. | Preview deployments give the client a browser-based review path without running the app locally. | Accepted |
| 2026-07-08 | Use GitHub pull requests as the preferred code review method. | PRs keep scope, diffs, review comments and checks visible in the source-of-truth system. | Accepted |
| 2026-07-08 | Do not bypass, allowlist or disable antivirus protections casually. | Security tooling warnings should be respected. Prefer online development alternatives instead of local workarounds. | Accepted |

## Notes

- Local development instructions may remain as optional developer reference only.
- No local secrets, local databases or local dependency installs should be required for normal MVP development.
- Phase 1D has not started; this decision only changes the workflow model for future work.

