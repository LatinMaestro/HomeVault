# Privacy And Security

## Principles

- Collect the least information needed.
- Keep Phase 1 data local/static until storage and auth are approved.
- Do not add analytics in Phase 1.
- Do not send household data to AI or OCR services in Phase 1.
- Avoid paid or external integrations without explicit approval.

## Future Requirements

- Approved production authentication.
- Approved file storage and retention policy.
- Data export and deletion story.
- Server-side authorization checks.
- Secrets managed through Vercel environment variables.

## Phase 1B Database Boundary

The Prisma schema supports local development and future approved provisioning only. Do not connect a production database, store real household documents, or add live user accounts until the relevant approaches are approved.

