# Phase 9A: Controlled Guest And Public Sharing

Status: prepared policy contract; guest/public sharing remains disabled.

## Explicit Grant

- OWNER and ADULT may share one selected active record from their current property after an explicit confirmation.
- Creation and revocation bind the exact verified user to an active, versioned property membership. Caller-supplied role or membership booleans are not authorisation evidence.
- Confirmation uses a short-lived, single-use proof bound to the exact user, property, record revision, selected fields, attachment IDs/digests, audience, recipient hash, download choice and start/expiry times. Replay or substitution fails closed.
- A grant binds the exact record revision, selected allowlisted fields and exact clean attachment digests. Record or file changes make the grant stale rather than exposing new content silently.
- Grants last between five minutes and seven days. Indefinite or automatically renewed public access is unavailable.
- CHILD and GUEST remain read-only. An ADULT may revoke grants they created; an OWNER may immediately revoke any grant in the property.

## Audience

- `PUBLIC_LINK` grants are possession-based and disclose only the selected record surface.
- `VERIFIED_RECIPIENT` grants additionally require the same currently verified HomeVault recipient identity at exchange and every later request.
- Recipient email matching uses a server-created canonical hash and constant-time comparison. Raw recipient addresses do not become route parameters.
- Recipient-hash evidence is bound to the exact creator, property and record when creating a recipient-scoped grant, and to the exact grant and verified recipient on every exchange, view and download.
- A grant never creates household membership, grants navigation/search/export access or changes the record's normal role policy.

## Secret And Session Boundary

- Generate at least 16 bytes of entropy for the opaque grant ID and at least 32 bytes for its secret; store only the secret hash and the grant-ID entropy proof.
- Put the one-time delivered secret in the URL fragment so it is not sent in the initial request, access log or referrer.
- Exchange the fragment secret only by a rate-limited POST with a constant-time server comparison, then clear it from the browser.
- Token and rate-limit evidence bind the exact grant, route identifier and stored token hash. A successful check from another grant cannot be substituted.
- Issue a maximum 15-minute `HttpOnly`, `Secure`, `SameSite=Strict` cookie scoped to that grant. Revalidate the live grant, record revision, attachment digests, exact current verified recipient user/email hash and expiry on every view/download.
- Session evidence binds the exact grant and versioned session identifier on every request. Public-link requests reject recipient evidence, while recipient-scoped requests require it.
- Unknown, malformed, expired, revoked, cross-property and stale requests fail closed without confirming that a property or record exists.
- The authorisation boundary returns the complete immutable grant envelope (creator, audience, recipient hash, start/expiry, download choice, record revision and entropy proofs) so persistence cannot silently drift from the confirmed request.

## Private Presentation

- Render only selected allowlisted fields and selected protected attachment handles.
- Send `private, no-store`, `noindex`, `nofollow`, `noarchive`, `no-referrer` and no-framing controls.
- Do not expose household names, addresses, membership, navigation, related records, provider metadata, storage keys or private Blob URLs.
- A disabled-download grant may support protected inline viewing but cannot download.
- An allowed download is streamed through a server route after fresh authorization; it never redirects to the storage provider.

## Audit, Revocation And Deletion

- Record bounded creation, exchange, denial, view, download, revocation and expiry events.
- Audit data excludes the raw token, Blob URL, request body, IP address and user agent. Retain it for at most 30 days after the event.
- Revocation immediately removes the token hash and invalidates every share session.
- Grant, record, attachment, property and account lifecycle actions revoke matching grants and remove sessions/share views. Audit cleanup is bounded and retryable.
- Cleanup also purges browser/CDN cache state, device/offline copies, queued share actions, notification references and sensitive audit payloads before claiming completion.
- Sharing does not create a second copy of an accepted household record or attachment; normal record/file deletion remains authoritative.

## Verification

Before enablement, run exact-head unit, standard and native CI; public and recipient grant creation; entropy/TTL/field/file bounds; URL-fragment exchange; access-log/referrer inspection; constant-time token and recipient checks; route guessing/rate limiting; record/file revision changes; expiry boundary; concurrent view/revoke; download-disabled and server-streamed download; no-cache/no-index/no-frame headers; cross-property denial; account/member/property/file deletion; audit expiry; accessibility; privacy/store disclosure; and fictional external-recipient physical-device tests.
