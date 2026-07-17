# Testing Protocol

## Default Online Gate

Every app-code pull request runs the GitHub Actions CI workflow in a clean Node.js environment:

1. Install the locked dependency graph.
2. Validate the Prisma schema.
3. Generate the Prisma client.
4. Run ESLint.
5. Run TypeScript checking without emit.
6. Build the production Next.js application.
7. Start the production server without `DATABASE_URL`.
8. Request the approved core routes and require a successful HomeVault response.

The client is not expected to run these checks locally.

## Database-free Route Smoke

`npm run smoke:routes` is an optional developer command and the automated post-build CI check. It removes `DATABASE_URL` from the server process, starts the built app, and verifies the dashboard, search, vault, room, category, asset, maintenance, reminder, provider, warranty, receipt/document and settings routes.

Dynamic routes use canonical sample IDs. This proves that fallback data and route rendering remain useful without a live database.

The same smoke run asserts security headers, health response semantics, manifest identity, no-crawl robots rules and service-worker cache/scope policy.

## Database-backed Review

Database-backed runtime behavior is reviewed only in an approved Codex/cloud or Neon preview environment with synthetic data.

- Prisma schema changes require validation and generation.
- Seed checks require an approved `DATABASE_URL`.
- Build and database-free route checks must never require that variable.
- Real household data must not be used before production authentication and authorization.

## Visual Review

Vercel previews are the preferred visual gate when a UI review is scheduled and usage allows. Until final review, GitHub diffs, CI and focused browser verification provide implementation evidence.

Before release, visually review:

- mobile and desktop navigation;
- dashboard and household search;
- create/edit feedback;
- empty, missing and error states;
- long labels and narrow layouts;
- browser console and runtime failures.

## Future Production Gates

Production household-data launch still requires:

- authenticated end-to-end authorization tests;
- approved storage access tests if uploads are introduced;
- automated accessibility checks;
- data export and deletion tests;
- security review against the final deployment configuration.


## Data Boundary Contract

Every pull request runs `pnpm run check:data-boundary` before compilation.

The dependency-free check scans `src` and fails when:

- runtime database environment variables are inspected outside `src/lib/db.ts`;
- Prisma client or adapter construction appears outside the approved database module;
- a client component imports database modules, Prisma Client or database credentials;
- the database helper no longer requires the explicit controlled-preview switch.

Prisma command and seed configuration remain allowed outside `src` because they are developer/automation entry points, not application runtime modules. This static contract complements runtime route smoke; it does not replace future authenticated authorisation tests.


## Preview Database Unit Contract

After Prisma client generation, CI runs `pnpm run test:unit`.

The current unit contract verifies that:

- no database configuration keeps preview access closed;
- `DATABASE_URL` alone keeps access closed;
- the preview switch alone keeps access closed;
- lookalike switch values remain closed;
- only `DATABASE_URL` plus the exact documented `enabled` switch opens controlled preview access.

The test uses a non-resolving example URL and never creates a database connection.


## Transport And Resource Header Contracts

Database-free production smoke verifies that the Home route returns:

- two-year HTTPS transport security with subdomain coverage;
- `Cross-Origin-Resource-Policy: same-origin`;
- disabled DNS prefetching;
- disabled legacy cross-domain policy files.

These checks run alongside the existing CSP, anti-framing, permissions, health, install, crawler and offline-worker contracts.
