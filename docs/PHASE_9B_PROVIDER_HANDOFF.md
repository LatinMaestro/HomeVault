# Phase 9B: Provider Booking And Message Handoff

Status: prepared provider-neutral policy contract; connectors and automated sending remain disabled.

## Provider Directory

- OWNER and ADULT may maintain property-scoped provider profiles as user-supplied contact data.
- Every profile, draft, send, response-review and cancellation decision requires current membership evidence bound to the exact user, property, role and membership revision. Caller-supplied session, membership and role booleans are not accepted.
- Profiles remain functional directory entries, not advertisements, endorsements, ratings or behavioural profiles.
- Provider categories must match the selected maintenance task before a handoff can be drafted.
- CHILD and GUEST remain read-only.

## Reviewable Minimum Disclosure

- The user explicitly selects and confirms every outbound field from a fixed allowlist: service category, sanitized task summary, contact preference/details, suburb/postcode, service address and availability windows. Confirmation evidence is short-lived, single-use and bound to the server-recomputed draft digest.
- Bind the draft to the exact property, maintenance-task revision, provider revision and server-canonical payload digest. Expire unsubmitted drafts after 24 hours.
- Show a final disclosure preview immediately before handoff. Its proof binds the exact handoff, task/provider revisions, payload digest and server-generated idempotency key. Task or provider changes make the draft stale.
- Do not include unrelated household records, attachments, Blob URLs, authentication data, payment credentials, insurance-claim instructions, budgets, valuations, financial advice, advertising identifiers or tracking data. Each prohibited-data scan must return an exact negative result before a draft is authorized.
- Documents remain governed by the separate controlled-sharing grant rather than being copied into a provider payload.

## User-mediated Handoff

- For a directory email address, open the user's email client with the reviewed payload.
- Do not send from HomeVault, put internal IDs in the URI or claim that the message was sent.
- Require the user to confirm the outcome if they want to record it in HomeVault.

## Approved Connector Boundary

- Keep provider, HomeVault account, cost, privacy, region and retention approval as independent fail-closed gates during profile activation, sending and response receipt. Approval evidence is versioned, time-bounded and bound to the exact connector and external provider account.
- Hold credentials only on the server and request the minimum allowlisted scopes for the selected message or booking-request action.
- Use one server-generated idempotency key and the verified canonical payload digest. Mark sent only after provider acknowledgement.
- Treat malformed booleans, arrays, dates, kinds, states, scopes and connector envelopes as unavailable; do not coerce them at this trust boundary.
- A booking request is not a confirmed appointment. It remains pending until a provider response is reviewed.
- No connector may initiate a payment, refund, insurance claim or unrelated household read.

## Provider Responses

- Accept only signed, scoped webhooks no more than five minutes old for a request that actually reached sending/sent state. Webhook evidence binds the exact handoff, property, provider, connector, external account, event ID and server-recomputed response digest. Revalidate the provider revision and deduplicate event IDs inside the same boundary.
- Quarantine an allowlisted plain-text status/message or future proposed time for user review. Never load provider-returned URLs.
- Provider responses cannot automatically change maintenance records, create appointments, contact another provider or trigger payment.
- OWNER or ADULT must review the response using short-lived, single-use evidence bound to the exact response status, text, proposed time and provenance, then use the ordinary task update flow.

## Cancellation And Deletion

- A cancellation action requires fresh evidence bound to the exact handoff state and provider revision. It sends or opens a cancellation request but does not claim external cancellation until the provider or user confirms it.
- Cancellation never automates refunds or payments.
- Provider, task, property and account lifecycle cleanup requires short-lived server evidence bound to the exact scope, property and subject. It cancels pending handoffs, removes drafts, responses, provider copies, webhook queues, idempotency keys, caches, device/offline copies, queued actions and notification references; revokes credentials/webhooks; redacts sensitive audit payloads; and uses a retryable cleanup ledger.
- Retain a privacy-safe operational audit for at most 30 days; exclude credentials, payload bodies, unrelated record data and external tracking identifiers.

## Verification

Before enablement, run exact-head unit, standard and native CI; property/role/category isolation; field-by-field disclosure review; stale task/provider revisions; email URI encoding and internal-ID exclusion; connector approval/scopes/credential storage; idempotent send and acknowledgement; signed webhook/replay/deduplication; malformed/hostile response text; proposed-time review; concurrent cancellation/acknowledgement; provider/task/property/account deletion; accessibility; privacy/store disclosure; and fictional provider sandbox/physical-device tests.
