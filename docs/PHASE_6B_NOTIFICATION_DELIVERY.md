# Phase 6B: Notification Scheduling, Retry And Deep Links

Status: staged fail-closed policy contract; durable queues, provider accounts, native entitlements and production delivery remain disabled.

## Scheduling

- Schedule one job for the exact canonical user, property, active membership, preference revision, device, record version, occurrence, topic and channel.
- Require an opaque 32–128 character deduplication key and an exact server-side duplicate result.
- Reject invalid runtime evidence, truthy booleans, unknown topics/channels, past occurrences and schedules more than 366 days ahead.
- Disabled preferences, inactive membership/records and removed topic/channel selections do not create jobs.
- Permission evidence must bind the exact device, user, property and channel and be both granted and actively registered.
- Rescheduling must cancel the superseded job before creating the replacement. Property deletion, member removal, account deletion, opt-out and record completion/deletion cancel pending jobs.

## Delivery And Retry

- Re-authorise the exact membership, preference revision, device permission and record version immediately before every attempt.
- A processing attempt requires an opaque, unexpired worker lease bound to the exact job and attempt number.
- Successful, terminal and retry decisions emit only content-free audit metadata.
- Retry only allowlisted transient provider classes. Unknown outcomes fail closed.
- Use bounded exponential delay with no more than five attempts and a maximum one-hour delay.
- Retry plans include an exact compare-and-set boundary over job ID, `PROCESSING` state, lease ID and completed-attempt count.
- Invalid tokens, permission denial, malformed payloads and provider policy rejection are terminal.
- Sent, cancelled, exhausted and terminal jobs cannot be replayed.
- Provider payloads remain generic and exclude addresses, record titles, provider names, receipt amounts, notes and attachment metadata.

## Secure Deep Links

- Notification payloads contain only an opaque grant identifier, never a Blob URL, raw record path or record metadata.
- A verified, unexpired session resolves the grant server-side.
- Grants are canonical-user/property bound, last no more than 15 minutes and contain valid issue/expiry instants.
- Every open rechecks the exact active membership, selected property and target record ID/type.
- Revoked, expired, future-issued, malformed, foreign-property and stale-session grants fail closed.
- The server returns only an allowlisted encoded internal route for maintenance, reminder or warranty details.
- Normal page-level server authorization runs again after routing.
- Opening a notification never mutates a record, completes a task or changes a reminder.

## Operations

- Delivery audit stores only job/user/property/device identifiers, provider response class, attempt number, outcome and deduplication key. It excludes content and provider secrets.
- Export includes readable preferences and delivery outcomes, not device tokens, worker leases or deduplication secrets.
- Deletion removes jobs, grants, device tokens, deduplication records and processor copies.
- Provider dashboards require least-privilege credentials, short retention and no behavioural analytics.
- APNs/FCM selection, accounts, cost, credentials and native entitlements remain approval/client-owned gates.

Production integration still requires durable queue/provider selection, schema constraints, worker concurrency and cancellation-race tests, token rotation, deep-link penetration testing, physical-device permission/denial testing and exact-head standard/native CI.
