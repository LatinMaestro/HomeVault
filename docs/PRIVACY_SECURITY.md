# Privacy And Security

## Principles

- Collect the least information needed.
- Scope every authenticated household read and mutation to verified membership.
- Do not add analytics or persist search terms.
- Do not send household data to AI or OCR services.
- Avoid paid or external integrations without explicit approval.
- Keep database-free previews useful and non-destructive.
- Never present the single-user preview as production-secure.

## Preview Deployment Boundary

HomeVault implements verified email/password authentication, session-bound household membership and server-side role checks, but those controls remain fail-closed until the complete production environment is configured. Deployments without that configuration render curated sample data only.

- Never enable the synthetic preview database switch for real household data.
- Keep sample previews free of real documents, credentials and sensitive identifiers.
- Keep preview surfaces out of search indexes.
- Use managed environment secrets for approved credentials; never commit them.
- Production data may be enabled only after migrations, auth email, private storage and end-to-end household-boundary checks pass.

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

Authenticated runtime access resolves one verified session and explicit HouseholdMember relationship before any household database read or mutation. OWNER and ADULT roles may write; CHILD and GUEST remain read-only. Authentication-enabled requests never fall back to the synthetic preview identity.

Without the complete auth runtime, use only synthetic or non-sensitive review data. `DATABASE_URL` alone never enables the legacy preview mode, and private attachments remain unavailable without verified household access.

## Production Decision Gates

A real household-data launch now requires operational enablement and evidence for:

- production database migration with a confirmed restore point;
- auth secret, canonical URL, verified transactional sender and signup gate;
- private Blob provisioning and attachment lifecycle verification;
- account creation, recovery, household authorization, exports and deletion;
- secret rotation and incident-response ownership;
- production/preview separation, backup policy and retained test evidence;
- final security, privacy and store-disclosure review.

## Deferred Capabilities

The app includes guarded private document attachments and Capacitor iOS/Android candidates. It does not include OCR, AI, email ingestion, notification delivery, payments, analytics, advertising, camera capture or external account integrations.

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


## Native Privacy Boundary

The iOS and Android containers load only the canonical HTTPS runtime and contain no database, email, Blob or auth secrets. App-switcher content is obscured on both platforms; Android also blocks screenshots, recording, backup, cleartext and mixed content. Verified website links fail closed until store signing identities are configured.

The iOS target contains a privacy manifest declaring linked account and household data used only for app functionality, with tracking disabled. The engineering disclosure source for Apple App Privacy and Google Play Data safety is `docs/STORE_PRIVACY_DISCLOSURE_MATRIX.md`. It must be re-audited against every signed release.

## Production Readiness Boundary

The public liveness route confirms only that the web process can answer requests. A separate fail-closed readiness route checks that the approved database, authentication, transactional email, private attachment storage, canonical URL and production-mode boundaries are configured, then verifies database connectivity. It returns only a generic ready/not-ready result, never environment names, values, database details or user data. The manual GitHub Production Readiness workflow uses that contract for final cloud-based release evidence.
