# Phase 6C: User-Controlled External Calendar Sync

Status: staged fail-closed policy contract; calendar providers, OAuth clients and native calendar permissions remain disabled.

## Approved Direction

- External calendar integration is opt-in for one verified user and one explicitly selected property.
- Initial sync is one-way from HomeVault to one explicitly selected external calendar.
- HomeVault does not import, scan or profile unrelated personal calendar events.
- Device calendars, Google Calendar and Microsoft calendars remain candidate connection types subject to platform/provider, privacy, cost and credential approval.
- The user selects maintenance, reminder and/or warranty topics independently. No user, property, provider or calendar is selected by fallback.

## Connection Boundary

- Linking requires a verified unexpired session, exact active property membership and single-use credential reconfirmation lasting no more than 15 minutes.
- Provider approval binds the exact provider, selected-calendar event scope, enablement and encrypted credential-storage approval.
- Remote providers require a single-use OAuth proof bound to the user, provider, selected calendar, state, nonce and PKCE/issuer/audience/signature verification.
- Device calendar access requires a single-use native permission proof bound to the user and selected calendar.
- Authorization proofs last no more than 15 minutes and are consumed atomically with connection creation.
- The only approved scope is `EVENTS_WRITE_SELECTED_CALENDAR`; unrelated calendar reads remain prohibited.
- One active connection per user, property, provider and selected calendar is enforced with an opaque duplicate key.
- Provider/calendar identifiers and refresh credentials are stored only where required, with refresh credentials encrypted. Tokens never enter logs, exports or policy outputs.

## Safe Synchronisation

- Each occurrence and operation uses an opaque deduplication key.
- Every create, update and delete rechecks the exact active membership, connection version/status, selected topic and property-scoped record/version.
- HomeVault never updates or deletes an event without an exact versioned mapping marked as HomeVault-managed.
- Operation plans bind the provider, selected external calendar, record/version, occurrence, mapping/version and compare-and-set boundary.
- Unmapped inactive records are ignored; duplicate operations are non-destructive.
- HomeVault is authoritative only for its managed event. Unrelated provider events remain untouched.
- Event payloads use the minimum useful HomeVault details and exclude attachment URLs, receipt amounts, notes, addresses and unrelated household data.

## Revocation And Deletion

- User revocation requires a verified session, current active membership and a fresh single-use `calendar-revoke` credential proof.
- Users explicitly choose whether to delete or retain HomeVault-created external events.
- External deletion targets only unique validated mapped event IDs owned by the exact connection/property.
- Provider credential revocation continues even when external-event cleanup partly fails.
- Revocation cancels jobs and removes mappings regardless of whether external copies are retained.
- Member removal, property deletion and account deletion use the same credential/job/mapping/provider cleanup boundary.
- Export includes readable connection preferences and mapping outcomes without credentials, tokens or deduplication secrets.

## Verification

Production integration still requires provider/client-account approval, OAuth/native permission review, encrypted token storage, webhook/polling choice, concurrency/rate-limit and DST/timezone tests, revocation/cleanup evidence, store-disclosure updates, physical-device testing and exact-head standard/native CI.
