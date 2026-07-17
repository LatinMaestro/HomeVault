# Privacy And Security

## Principles

- Collect the least information needed.
- Keep household data scoped to the temporary current home.
- Do not add analytics or persist search terms.
- Do not send household data to AI or OCR services.
- Avoid paid or external integrations without explicit approval.
- Keep database-free previews useful and non-destructive.
- Never present the single-user preview as production-secure.

## Preview Deployment Boundary

HomeVault currently has no production authentication or per-user authorization. Preview and production deployments from the current codebase are suitable only for curated sample data or controlled development review.

- Do not connect a database containing real household data to a publicly accessible deployment.
- Do not store real documents, credentials or sensitive identifiers.
- Keep preview surfaces out of search indexes until the production access model is approved.
- Use Vercel-managed environment variables for approved secrets; never commit them.
- Database-backed mutations remain a development capability, not a production security boundary.

## Browser Security Baseline

All routes receive a conservative browser security baseline from Next.js:

- Content Security Policy limited to same-origin application resources.
- Framing denied to reduce clickjacking risk.
- MIME sniffing disabled.
- Strict referrer handling.
- Camera, microphone, geolocation, payment and USB browser capabilities disabled.
- Cross-origin opener isolation enabled.
- Search-engine indexing and following disabled through application metadata.

These controls reduce browser exposure but do not replace authentication, authorization or secure data handling.

## Database Boundary

The Prisma schema supports approved development and preview provisioning. Runtime reads and writes use `DATABASE_URL` only when configured, and builds do not require a live database.

Until production authentication is approved:

- use only synthetic or non-sensitive review data;
- do not treat the temporary current-home resolver as authorization;
- do not expose a real household database through a public deployment;
- do not enable document storage or uploads.

## Production Decision Gates

A real household-data launch requires explicit approval and implementation of:

- Production authentication.
- Server-side authorization for every read and mutation.
- Approved file storage, access control and retention policy.
- Data export and account/home deletion workflows.
- Secret rotation and incident-response procedures.
- Production environment separation and database backup policy.
- Security and privacy review of the deployed application.

## Deferred Capabilities

The current app does not include uploads, OCR, AI, email ingestion, notification delivery, payments, analytics, external integrations or native apps.
