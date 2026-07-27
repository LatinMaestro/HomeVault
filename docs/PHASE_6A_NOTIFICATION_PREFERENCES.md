# Phase 6A: Notification Preferences And Quiet Hours

Status: staged policy contract; notification delivery and provider registration remain disabled.

## Scope And Consent

- Notification preferences belong to one verified user and one explicitly selected property.
- Maintenance, reminder and warranty topics are independently selectable.
- Local and push channels require explicit opt-in and current platform permission.
- Permission denial leaves all core HomeVault records and in-app due-date views available.
- Preferences are not inherited across users or properties and never fall back to the first property.
- The user can disable all delivery without deleting reminder or maintenance records.

## Timezone And Quiet Hours

- Store a validated IANA timezone per user/property preference.
- Quiet hours use local wall-clock minutes in that timezone and support overnight windows.
- Equal start/end values are rejected rather than interpreted as an ambiguous full-day window.
- The start boundary is quiet; the end boundary resumes delivery.
- Timezone changes, daylight-saving transitions and device-clock changes require rescheduling from the server-authoritative event time.
- Non-urgent HomeVault notifications defer until quiet hours end. HomeVault has no safety-critical or emergency notification class.

## Delivery Boundary

- Every delivery job is scoped to the exact user, property, topic, record occurrence and channel.
- Generate an internal opaque deduplication key; do not expose household or record identifiers to notification providers.
- Re-read current membership, preferences, permission/token state, record status and scheduled occurrence immediately before sending.
- Cancel jobs after opt-out, member removal, property deletion, record completion/deletion, token revocation or account deletion.
- Retry only transient provider failures with bounded backoff. A successful or terminal outcome consumes the deduplication key.
- Deep links carry an opaque route token and repeat server-side property authorisation after the app opens.
- Push payloads contain generic HomeVault copy by default and no addresses, asset names, provider details, receipt amounts or attachment metadata.

## Privacy And Lifecycle

- Store only required device token, platform, property/user scope, preference state and delivery audit outcome.
- Never use notification engagement for behavioural analytics, advertising or profiling.
- Export includes readable preferences and delivery history without secrets.
- Deletion removes tokens, preferences, pending jobs, dedupe records and provider copies.
- Provider selection, cost, credentials, Apple Push Notification capability and Firebase configuration remain separate approval/client-account gates.
- Store privacy disclosures and reviewer instructions must be reopened before production enablement.

Production integration requires database schema, token registration, background scheduling, retry/cancellation workers, safe deep links, provider review, denial/opt-out journeys, timezone/DST tests and exact-head native/standard CI.
