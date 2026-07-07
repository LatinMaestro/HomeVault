# Testing Protocol

## Phase 1A Checks

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Manual responsive review on mobile and desktop widths.
- Vercel Preview visual review.

## Phase 1B Checks

- `npm run prisma:validate`
- `npm run prisma:generate`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

Local seed verification additionally requires a configured PostgreSQL `DATABASE_URL`.

## Future Checks

- Unit tests for data utilities.
- Component tests for core workflows.
- End-to-end tests for asset, warranty, receipt and maintenance flows.
- Accessibility checks before release.

