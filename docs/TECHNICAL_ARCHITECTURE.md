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
