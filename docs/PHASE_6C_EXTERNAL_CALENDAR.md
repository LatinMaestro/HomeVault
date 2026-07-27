# Phase 6C: User-Controlled External Calendar Sync

Status: staged policy contract; calendar providers and native calendar access remain disabled.

## Approved Direction

- External calendar integration is opt-in per verified user and explicitly selected property.
- Initial sync is one-way from HomeVault to a selected external calendar.
- HomeVault does not import, scan or profile unrelated personal calendar events.
- Device calendars, Google Calendar and Microsoft calendars are candidate connection types; each requires platform/provider, privacy, cost and credential review before enablement.
- The user selects maintenance, reminder and/or warranty topics independently.
- No property or calendar is selected by fallback.

## Connection Boundary

- Linking requires a verified session, credential reconfirmation and current property membership.
- Request the minimum event-management scope for the selected calendar only.
- Store provider and calendar identifiers plus encrypted refresh credentials only where technically required.
- Never log access/refresh tokens or unrelated calendar metadata.
- One active connection per user, property, provider and selected calendar is enforced unless a later reviewed UI supports more.

## Safe Synchronisation

- Each local occurrence has an opaque dedupe key and optional mapping to one provider event created by HomeVault.
- Create, update and delete are permitted only for exact property-scoped records and enabled topics.
- HomeVault never updates or deletes an event without a current mapping marked as HomeVault-managed.
- Mapping, provider response and local sync state change atomically where possible; retries remain idempotent.
- Current membership, connection state, record state and mapping are rechecked before every write.
- Conflict handling treats HomeVault as authoritative only for its managed event. User edits can be surfaced for confirmation or overwritten according to an explicit later product choice; unrelated events remain untouched.
- Event content uses the minimum useful record details and never includes attachment URLs, receipt amounts or unrelated household data.

## Revocation And Deletion

- Users can revoke a connection at any time after credential reconfirmation.
- Revocation offers an explicit choice to remove or retain external events previously created by HomeVault.
- Removal targets only validated mapped HomeVault event IDs.
- Token revocation occurs even if external event cleanup partially fails; cleanup failure is reported and retried safely.
- Member removal, property deletion and account deletion revoke credentials, cancel jobs and clean mappings/provider copies.
- Export includes connection preferences and event mappings without secrets.

## Verification

Production integration requires provider/client-account approval, OAuth/native permission review, encrypted token storage, webhook/polling choice, concurrency and rate-limit handling, DST/timezone tests, revocation and cleanup evidence, store-disclosure updates, physical-device testing and exact-head standard/native CI.
