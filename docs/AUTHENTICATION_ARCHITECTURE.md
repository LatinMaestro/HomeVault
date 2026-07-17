# Authentication Architecture

## Status

Preferred direction recorded. No production authentication is provisioned or implemented.

## Decision

HomeVault should prefer Neon Managed Better Auth when it is production-appropriate. Neon documents the service as Beta today and targets general availability, so the implementation gate is either:

- Managed Better Auth reaches general availability; or
- beta use is explicitly accepted after reviewing its production checklist and current roadmap.

If that gate is not met, use self-hosted Better Auth with the existing Next.js, Prisma and PostgreSQL stack.

Official references:

- [Neon Managed Better Auth overview](https://neon.com/docs/auth/overview)
- [Next.js integration](https://neon.com/docs/auth/quick-start/nextjs-api-only)
- [Production checklist](https://neon.com/docs/auth/production-checklist)
- [Current roadmap](https://neon.com/docs/auth/roadmap)
- [Branching authentication](https://neon.com/docs/auth/branching-authentication)
- [Better Auth Next.js integration](https://better-auth.com/docs/integrations/next)
- [Better Auth Prisma adapter](https://better-auth.com/docs/adapters/prisma)

## Why This Direction

- It fits the existing Next.js App Router and Neon/PostgreSQL direction.
- Managed auth state can follow isolated Neon branches, which suits GitHub PR and preview testing.
- It avoids introducing an unrelated identity data store by default.
- The fallback keeps the same underlying Better Auth concepts while trading managed convenience for greater operational control.

## Non-negotiable Authorisation Boundary

Authentication answers who is signed in. HomeVault must separately answer which homes that person can access.

Every server read and mutation must:

1. Validate the server session.
2. Resolve the HomeVault user from the immutable auth subject.
3. Verify an active `HouseholdMember` relationship for the requested home.
4. Scope the database query by that authorised home ID.
5. Reject missing, inactive or cross-household access without revealing record existence.

Route protection or a session cookie check may support navigation, but neither is an authorisation control on its own.

## Proposed Identity Mapping

- Keep the HomeVault `User` model as the application profile.
- Add a durable provider subject mapping during the auth schema phase.
- Do not use email as a foreign key or ownership proof.
- Keep household membership and future roles in HomeVault-owned tables.
- Create the first home and owner membership in one reviewed onboarding transaction.

Exact schema changes will be designed with the selected provider and migration plan. No speculative auth fields are added in this phase.

## Account Lifecycle Scope

The production identity phase includes:

- sign-up, sign-in, sign-out and recovery;
- email verification appropriate to the selected method;
- first-home onboarding;
- session and profile management;
- data export;
- in-app account deletion;
- public deletion instructions/request route;
- deletion retention and exception rules;
- synthetic review credentials for store testing.

Social sign-in, advanced roles, household invitations and multi-home switching are not required for the first production release.

## Environment And Preview Strategy

- Production, preview and test auth environments must be isolated.
- Secrets remain in managed environment settings.
- Trusted redirect domains must be explicit.
- Preview branches use synthetic users and non-sensitive household data.
- Auth tests must cover unauthenticated, authorised and cross-household-denied cases.
- The current `HOMEVAULT_PREVIEW_DATABASE_ACCESS` switch is removed from authenticated production paths.

## Provisioning Gate

No dedicated HomeVault Neon project currently exists in the connected account. Do not reuse another application's project.

Provisioning requires:

- a dedicated HomeVault project in the approved Australian region where available;
- acceptance of the provider's current production status and terms;
- managed Auth URL and cookie secret configuration;
- trusted Vercel domains;
- an email verification/recovery delivery decision;
- reviewed schema and migration changes.

## Exit Criteria

Production identity is complete only when:

- all protected routes validate server sessions;
- all reads and mutations enforce household membership;
- cross-household access tests pass;
- onboarding creates a consistent user, home and owner membership;
- export and deletion work end to end;
- recovery and verification flows are tested;
- privacy/support/deletion documentation matches actual behavior;
- the preview database bypass is absent from production paths.
