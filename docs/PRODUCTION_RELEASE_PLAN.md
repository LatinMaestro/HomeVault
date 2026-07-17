# Production And Store Release Plan

## Current Position

HomeVault's shared responsive product experience is substantially complete: household records, maintenance, warranties, receipt/document metadata, reminders, providers, categories, search and dashboard workflows are present. The app is installable as a privacy-conscious web preview and builds without live database access.

It is not yet safe for public household data or mobile-store submission because production identity, authorisation, account lifecycle, private file storage and native projects do not yet exist.

## Delivery Sequence

### 1. Production Boundary

- Select and document the production authentication approach.
- Define production, preview and automated-test environments.
- Keep secrets in managed environment settings.
- Decide the approved private storage service and retention posture.
- Add threat modelling for household isolation and document access.

Exit gate: provider choices are approved and no production secret is committed.

### 2. Authentication And Authorisation

- Add production sign-up, sign-in, sign-out and session recovery.
- Bind each user to authorised household membership.
- Replace the temporary earliest-home resolver.
- Apply server-side ownership checks to every read and mutation.
- Remove sample fallback from authenticated production data paths.
- Add denial and cross-household isolation tests.

Exit gate: unauthorised and cross-household access is consistently rejected.

### 3. Account Lifecycle

- Add first-home onboarding.
- Add profile and session management.
- Add data export.
- Add in-app account deletion.
- Add a public account-deletion information/request path for Google Play.
- Define deletion timing, exceptions and confirmation handling.

Exit gate: creation, export and deletion are testable end to end and accurately documented.

### 4. Private Document Storage

- Add private receipt/document upload only after storage approval.
- Validate file type and size.
- Use non-public object access and short-lived authorised retrieval.
- Connect file deletion to record and account deletion.
- Add retention, recovery and abuse-handling procedures.

Exit gate: one household cannot access another household's objects, and deletion is verifiable.

### 5. Production Data Operations

- Replace development schema pushes with reviewed migrations.
- Establish backup and restore evidence.
- Add database-backed workflow and authorisation tests.
- Define seed behavior by environment.
- Add privacy-safe operational logging without product analytics.

Exit gate: migrations, rollback/restore and critical workflows pass in an isolated release environment.

### 6. Native Mobile Delivery

- Add iOS and Android projects after the web production boundary is stable.
- Use a shared-web packaging approach only if it preserves platform quality.
- Add meaningful device utility such as secure re-entry, approved document capture/share, deep links or carefully designed offline behavior.
- Keep permissions minimal and purpose-specific.
- Add native signing and store configuration without committing credentials.

Exit gate: physical-device builds are useful beyond a repackaged website and pass internal distribution review.

### 7. Submission Readiness

- Clear the public product name and reserve application identifiers.
- Publish final privacy, support and deletion URLs.
- Complete accessibility and physical-device test passes.
- Run TestFlight and Google Play internal testing.
- Finalise screenshots, descriptions, age/content ratings and privacy/data-safety forms.
- Complete Apple and Google review notes and release checklist.

Exit gate: all items in `docs/RELEASE_CHECKLIST.md` and `docs/APP_STORE_READINESS.md` are evidenced.

## Client-controlled Gates

These actions cannot be safely invented or completed solely in source code:

- Legal/accountable entity and final public product name.
- Apple Developer and Google Play Console ownership.
- Public support contact and domain ownership.
- Authentication and storage provider approval where account, legal or paid terms apply.
- Signing credentials, agreements, tax/banking details and final submission.
