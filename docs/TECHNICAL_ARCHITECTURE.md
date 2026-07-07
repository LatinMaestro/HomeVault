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

## Future Boundaries

- Data access should be isolated behind server-only modules.
- Production auth must be approved before account-specific behavior ships.
- File storage must be approved before document uploads ship.
- External integrations require separate approval.

