# Phase 6A: Notification Preferences And Quiet Hours

Status: staged policy contract; notification delivery and provider registration remain disabled.

## Scope And Consent

- Notification preferences bind one canonical verified user, one active server-resolved membership and one explicitly selected property.
- Preference updates bind the exact stored preference revision so concurrent changes cannot be silently overwritten.
- Maintenance, reminder and warranty topics are independently selectable, including an explicit empty selection.
- Local and push channels require explicit opt-in and current device evidence bound to the exact user, property and channel.
- Permission denial leaves all core HomeVault records and in-app due-date views available.
- Preferences are not inherited across users or properties and never fall back to the first property.
- The user can disable all delivery without deleting reminder or maintenance records.

## Timezone And Quiet Hours

- Store one validated canonical IANA timezone per user/property preference.
- Quiet hours use local wall-clock minutes in that timezone and support overnight windows.
- Equal start/end values are rejected rather than interpreted as an ambiguous full-day window.
- The start boundary is quiet; the end boundary resumes delivery.
- Delivery derives local time from the server-authoritative scheduled instant and stored timezone; it never trusts a caller-supplied local minute.
- Malformed stored timezone, boolean or quiet-hour state fails closed and cannot bypass deferral.
- Timezone changes, daylight-saving transitions and device-clock changes require rescheduling and re-evaluation from the authoritative event time.
- Non-urgent HomeVault notifications defer until quiet hours end. HomeVault has no safety-critical or emergency notification class.

## Delivery Boundary

- Every decision binds the exact preference and revision, user, property, membership, device, topic, record occurrence, scheduled instant, channel and deduplication key.
- Deduplication keys must be opaque bounded base64url-like values; household or record identifiers are not accepted as provider-facing keys.
- Permission/registration and deduplication evidence must match the exact delivery. Truthy booleans, substitutions and consumed keys fail closed.
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

## Verification

The focused policy suite covers runtime-safe preference parsing, exact membership/permission/dedupe binding, explicit empty selections, canonical timezone handling, overnight boundaries, server-derived local time, corrupt quiet-hour fail-closure, opt-out and non-destructive permission denial. Production integration additionally requires database schema, token registration, background scheduling, retry/cancellation workers, safe deep links, provider review, denial/opt-out journeys, timezone/DST tests and exact-head native/standard CI.
