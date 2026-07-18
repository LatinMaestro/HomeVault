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

## Offline Storage Boundary

HomeVault registers a minimal service worker for installed-mobile resilience. It caches only the offline page, brand icon and versioned static application assets.

It does not cache household pages, server-component data, API responses or submitted forms. Household records still require a live connection. Any future offline household-data capability requires separate encryption, retention, conflict and device-loss decisions.


## Temporary Preview Database Lock

Until production authentication and household authorisation exist, runtime database access requires two independent configuration values: a database connection and an explicit controlled-preview enablement switch. A database integration or credential alone does not expose household records.

The switch is suitable only for canonical demo or controlled non-sensitive review data. It must not be enabled for real household records, and it must be retired when session-bound household authorisation is implemented.


## Browser Transport And Resource Isolation

All HomeVault responses carry a shared browser security baseline that:

- instructs capable browsers to use HTTPS for two years, including subdomains;
- limits no-cors resource use to the same origin;
- disables speculative DNS prefetching;
- rejects legacy cross-domain policy files.

These headers complement the existing content security, anti-framing, referrer, MIME-sniffing and permissions policies. GitHub route smoke executes the contract on every pull request.


## User-controlled Data Exports

Settings provides on-request downloads for visible household metadata and asset inventory. Export responses use private, no-store caching instructions and are not retained by HomeVault after delivery.

The inventory CSV quotes every cell and neutralises values that spreadsheet software could interpret as formulas. Exports contain metadata only because file storage is not implemented.

Before production release, these routes must move behind signed-in household authorisation and become part of the tested account export and deletion lifecycle.


## Account Deletion Boundary

A verified user can delete their account in-app. The transaction removes the User, credential accounts, sessions and memberships. If they are the household's only member, the Home and all relational household records are deleted by cascade. Owners with remaining members are blocked until ownership can be transferred. Infrastructure backup expiry and future private attachment cleanup remain documented retention gates.


## Private Attachments

Document attachments are limited to small PDF, JPEG and PNG files in a Vercel Private Blob store. Upload and removal require an authenticated writable household role; download requires authenticated membership in the same household. Storage keys and private provider URLs are not exposed in browser data or portable exports. File responses are no-store downloads with content sniffing disabled. Format signatures are validated, but HomeVault does not claim to provide malware scanning.


## Account Security Controls

Verified users can update their display name, change their password and revoke other active sessions. Password changes require the current password and revoke other devices. Permanent deletion separately re-verifies the current password before any database transaction begins. Account email changes remain disabled pending a dedicated verified-email transition design.
