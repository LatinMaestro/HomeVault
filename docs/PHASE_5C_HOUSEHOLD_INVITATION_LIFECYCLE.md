# Phase 5C — Household invitation lifecycle

Status: implementation policy complete on an isolated development branch; not
merged, provider-enabled, or production-activated.

## Contract

- Stored lifecycle records fail closed unless the invitation, household,
  non-owner role, version, email, status, expiry, and terminal timestamps are
  structurally valid.
- Acceptance requires an exact verified account email and canonical user ID.
- Successful acceptance evidence is bound to the invitation ID, household,
  invited role, expected pending status, expected version, accepting user, and
  server time.
- Revocation requires a canonical actor, the owner role, and the invitation's
  exact household.
- Successful revocation evidence is bound to the invitation ID, household,
  expected pending status, expected version, revoking owner, and server time.
- Persistence must use the returned expected status and version as a
  compare-and-set condition so replay, races, and cross-invitation substitution
  fail.
- Route handlers must map policy failures to generic client messages and must
  not disclose whether an email has a pending invitation.

## Verification boundary

The unit suite covers exact expiry, verified-email matching, malformed runtime
records, terminal-state coherence, owner-only revocation, household isolation,
and acceptance/revocation evidence binding. Hosted exact-head standard and
native CI remain required after dependency-ordered extraction.
