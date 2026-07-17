# Authentication Architecture

## Status

Production direction locked. Implementation follows in scoped phases.

## Decision

HomeVault will use **self-hosted Better Auth** with the existing Next.js App Router, Prisma and PostgreSQL stack.

Neon Managed Better Auth remains Beta as of 17 July 2026. HomeVault will not place a public household-data release on that beta dependency. The self-hosted path uses Better Auth's supported Next.js integration and Prisma adapter while keeping identity records in HomeVault's controlled PostgreSQL boundary.

Initial production methods:

- email and password;
- verified email before household access;
- password reset with session revocation;
- no social providers in the first release;
- no anonymous or shared household account.

Official references:

- [Better Auth installation](https://better-auth.com/docs/installation)
- [Better Auth Next.js integration](https://better-auth.com/docs/integrations/next)
- [Better Auth Prisma adapter](https://better-auth.com/docs/adapters/prisma)
- [Better Auth email verification and reset](https://better-auth.com/docs/concepts/email)
- [Neon Auth status and overview](https://neon.com/docs/auth/overview)

## Identity And Application Models

Better Auth owns authentication accounts, sessions and verification tokens. HomeVault owns household profiles and authorisation.

- One immutable Better Auth user ID maps to one HomeVault application user.
- Email is profile/contact data, never the household authorisation key.
- A HomeVault user may access a home only through an active `HouseholdMember` relationship.
- The first verified account creates its Home, application User and OWNER membership in one transaction.
- Social account linking, invitations and advanced roles are deferred until the core boundary is proven.

## Non-negotiable Authorisation Boundary

Every protected server read and mutation must:

1. Validate the Better Auth session on the server.
2. Resolve the HomeVault application user from the immutable auth user ID.
3. Verify an active HouseholdMember relationship for the requested home.
4. Scope the database operation by that authorised home ID.
5. reject missing or cross-household access without revealing record existence.

A proxy redirect or cookie-existence check may improve navigation, but is never the data security control.

## Environment Strategy

- Production, Preview and Test use separate database/auth state.
- Production secrets exist only in managed Vercel environment settings.
- Preview uses synthetic accounts and household data.
- Trusted origins are explicit; localhost is optional developer reference only.
- `BETTER_AUTH_SECRET` is a high-entropy managed secret.
- `BETTER_AUTH_URL` is environment-specific.
- Authentication email credentials remain unset until a client-owned sender/domain is connected.
- Builds and static public routes remain safe when auth secrets or a live database are unavailable.

## Email Boundary

Production verification and recovery require a transactional email provider and client-controlled sending domain. Code will depend on a small internal email interface so provider setup can occur late without changing authentication or authorisation semantics.

Until that provider is connected:

- production signup stays disabled;
- no verification or reset flow claims successful delivery;
- synthetic automated tests use a non-delivery adapter;
- no secret is committed.

## Account Lifecycle Scope

Production identity includes:

- sign-up, sign-in, sign-out and recovery;
- verified email;
- first-home onboarding;
- session and profile management;
- household export;
- in-app account deletion;
- a public deletion information/request route;
- documented retention and exception rules;
- synthetic store-review credentials.

## Exit Criteria

Production identity is complete only when:

- all protected routes validate server sessions;
- every read and mutation enforces household membership;
- unauthenticated and cross-household tests pass;
- onboarding creates consistent ownership;
- verification, recovery, export and deletion work end to end;
- production signup is fail-closed without email delivery;
- the preview bypass is absent from production data paths.
