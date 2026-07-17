# Technical Architecture

## Stack

- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- shadcn-compatible source components.
- Prisma planned.
- PostgreSQL planned.
- Vercel deployment.

## Phase 1A Architecture

The app is a static visual shell using Server Components and placeholder data. There are no production services, database calls, file uploads or authenticated user sessions.

## Phase 1B Data Foundation

Prisma is added with PostgreSQL as the target database. The schema and seed script are ready for local development, but the app shell does not query the database yet.

Database access must use lazy initialization through `src/lib/db.ts`. Importing app modules must not require `DATABASE_URL`, and Vercel builds must not depend on a live database connection.

## Future Boundaries

- Data access should be isolated behind server-only modules.
- Production auth must be approved before account-specific behavior ships.
- File storage must be approved before document uploads ship.
- External integrations require separate approval.

## Mobile Store Distribution Boundary

Apple App Store and Google Play distribution are product requirements.

- Next.js remains the shared UI, server-rendering and web delivery foundation.
- Prisma/PostgreSQL remains the server-side data foundation.
- Production identity and household authorization must be enforced by the server before real-data launch.
- Installable web metadata is maintained in the shared app.
- Capacitor is the preferred future native-shell candidate after authenticated workflows are stable.
- Native projects must add meaningful device integration and app-like utility before submission.
- The native shell must not contain database credentials or bypass server authorization.
- Store signing, certificates and application IDs remain client-controlled secrets/configuration.


## Production Identity Boundary

Production authentication is an upcoming release phase, not part of the current preview.

- Selected provider: self-hosted Better Auth using the existing Next.js, Prisma and PostgreSQL boundary.
- Neon Managed Better Auth remains Beta and is not on the production critical path.
- Auth state must be environment-isolated and use managed secrets.
- An external auth identity must map to one HomeVault `User`; email addresses are not authorisation keys.
- Every household read and mutation must resolve a signed-in user and verify `HouseholdMember` access on the server.
- The temporary earliest-home resolver and preview database switch must not remain in production data paths.
- Route redirects improve UX but do not replace server-side checks.
- Account export and deletion are part of the same production identity phase.

## Production Attachment Storage

- Selected provider: Vercel Private Blob, which reached general availability in June 2026.
- All attachment operations remain behind server-validated sessions and household membership.
- Database records store opaque private blob keys, not public URLs.
- Vercel OIDC is preferred over long-lived Blob credentials.
- Builds and sample fallback never require a Blob store.
- See `docs/STORAGE_ARCHITECTURE.md`.
