# Phase 10A: Privacy-safe Crash Reporting

Status: prepared provider-neutral policy contract; SDK installation and production capture remain disabled.

## Explicit Operational Scope

- Crash reporting is opt-in and limited to fatal errors, unhandled exceptions, native crashes and Android ANRs.
- Use it only to diagnose product reliability. Do not enable behavioural analytics, performance tracing, session replay, screenshots, advertising, tracking or device fingerprinting.
- Keep the crash pipeline separate from HomeVault household records, product analytics and provider workflows.

## Minimum Event

- Send only platform, application version/build, exact release commit, allowlisted error code, redacted short message, bounded symbolic frames and a small allowlisted lifecycle breadcrumb set.
- Do not collect names, email addresses, property IDs, record content, filenames, private URLs, request/response bodies, credentials, tokens, contacts or location.
- Do not record navigation routes, search terms, field values, taps or screen journeys as breadcrumbs.
- Bind each event to a rotating processor pseudonym through short-lived installation evidence that identifies the exact installation, subject-mapping revision and upload token. The processor never receives a raw user, property or device identifier.

## Fail-closed Redaction

- Queue a bounded event locally, then submit it through a HomeVault redaction proxy.
- Recompute the input and canonical event digests on the server. Short-lived redaction evidence binds the exact event, processor subject, release commit, policy version and canonical digest; caller booleans cannot stand in for redaction or digest verification.
- Reject replayed, expired, malformed or substituted installation/redaction evidence. Any diagnostic-content flag other than exact `false` fails closed.
- Reject malformed runtime dates, arrays, diagnostic booleans, frame fields, future events and events more than 24 hours old. Deduplicate only inside the exact pseudonymous processor subject and bind upload authority to the exact release commit and canonical digest.
- Keep source maps as protected build artifacts. Never embed service secrets in the app or upload environment files.

## Provider Gates

- Keep provider, account, cost, privacy, region, data-processing agreement and retention approval as independent enablement gates. Approval is versioned, time-bounded and bound to the exact provider and project.
- Configure a maximum 14-day provider retention and require exact disabled states for provider training, session replay, screenshots, request bodies, performance tracing, analytics, advertising, tracking and device fingerprinting.
- Do not install an SDK or create production credentials until the provider/subprocessor inventory and store/legal disclosures are approved.

## Consent And Lifecycle

- Default the feature off and explain the exact operational purpose before opt-in.
- Opt-out takes effect immediately: revoke the installation upload token, purge queued events, delete processor events and remove the subject mapping through a retryable deletion ledger.
- Repeat the same cleanup for installation reset and account deletion. Cleanup requires short-lived server authority bound to the exact scope, installation, processor subject and consent revision.
- Cleanup covers provider backups, delivery queues, deduplication keys, caches, device/offline copies, source-map access grants and sensitive audit payloads as well as events, upload tokens and subject mappings.
- Crash reporting never blocks sign-in, core household functions, export, privacy/support access or account deletion.

## Store And Acceptance

- Conservatively review Crash Data as linked diagnostics because a revocable subject mapping exists; declare no tracking.
- Reopen the iOS privacy manifest, store disclosure matrix, privacy policy, processor list and retention schedule before enablement.
- Validate consent, opt-out, offline queue expiry, symbolication access, redaction, malformed payloads, deduplication, provider outage, deletion, and physical-device crash delivery on the exact signed candidate.
