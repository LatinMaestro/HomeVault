# Phase 4E: Release Architecture Lock

## Status

Complete.

## Decisions

- Production authentication: self-hosted Better Auth with Next.js, Prisma and PostgreSQL.
- Initial sign-in method: verified email and password.
- Household authorisation: HomeVault-owned User and HouseholdMember checks on every server operation.
- Production attachment storage: Vercel Private Blob.
- Auth email delivery: provider-neutral internal interface; client-owned sender/domain connected before live signup.
- Environments: isolated Production, Preview and Test state.
- Native delivery: Capacitor after authenticated web workflows are stable.
- Public name and bundle identifiers: remain client/legal gates and do not block backend implementation.

## Why

Neon Managed Better Auth remains Beta. Vercel Private Blob is now generally available and supports private access, signed delivery and Vercel OIDC. This combination avoids a beta identity dependency while staying aligned with the current Vercel, Prisma and Neon architecture.

## Implementation Order

1. Better Auth dependency and schema foundation.
2. Session and HomeVault identity mapping.
3. Household-scoped read and mutation enforcement.
4. Sign-in and onboarding UI.
5. Verification/recovery provider connection.
6. Export, deletion and production operations.
7. Private attachment storage.
8. Native packaging and store validation.

## Client Gates

Implementation can proceed without interruption until one of these is required:

- transactional email account and verified sending domain;
- Vercel Private Blob store connection;
- final public name, legal entity and support contact;
- Apple and Google developer accounts, identifiers and signing.

No secret, provider account or paid plan is created by this documentation phase.
