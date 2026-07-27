# Phase 6B: Notification Scheduling, Retry And Deep Links

Status: staged policy contract; background jobs, push providers and native capabilities remain disabled.

## Scheduling

- Create one job for the exact user, property, record occurrence, topic and channel.
- Persist a unique opaque deduplication key and enforce it with a database constraint.
- Read current property membership, preferences, record state and device token before scheduling.
- Never copy a schedule between properties or infer a default property.
- Rescheduling cancels the superseded job before creating the replacement.
- Property deletion, member removal, account deletion, opt-out and record completion/deletion cancel pending jobs.

## Delivery And Retry

- Re-authorise current membership, preference, permission/token and record state immediately before every attempt.
- Record a successful provider acceptance atomically with the deduplication outcome.
- Retry transient transport/provider failures only.
- Use bounded exponential delay with no more than five total attempts and a maximum one-hour delay.
- Invalid tokens, permission denial, malformed payloads and provider policy rejection are terminal.
- Sent, cancelled and terminal jobs cannot be replayed.
- Worker leases and compare-and-set state transitions prevent concurrent duplicate sends.
- Payloads remain generic and contain no address, record title, provider name, receipt amount or attachment metadata.

## Secure Deep Links

- Push/local payloads contain an opaque HomeVault grant identifier, not a Blob URL or raw record path.
- A verified session resolves the grant server-side.
- Every open rechecks the grant user, selected property, current membership, target record and exact expiry.
- Revoked, expired, deleted, foreign-property and stale-session grants fail closed.
- The server returns only an allowlisted internal route for maintenance, reminder or warranty details.
- Routes encode record identifiers and repeat normal page-level authorisation.
- Opening a notification never performs a mutation, completes a task or changes a reminder silently.

## Operations

- Delivery audit stores generic state, provider response class, attempts and timestamps; it excludes message content and provider secrets.
- Export includes readable preferences and delivery outcomes, not tokens or dedupe secrets.
- Deletion removes jobs, grants, device tokens, dedupe records and processor copies.
- Provider dashboards must use least-privilege credentials, short retention and no behavioural analytics.
- APNs/FCM selection, accounts, cost, credentials and native entitlements remain approval/client-owned gates.

Production integration requires durable queue/provider selection, schema constraints, worker concurrency tests, cancellation races, token rotation, deep-link penetration tests, physical-device permission/denial testing and exact-head standard/native CI.
