# Phase 5H: Property-scoped Export Policy

Status: staged contract; existing production export routes are unchanged.

## Access Contract

- Export requires fresh server-resolved identity evidence and an explicit server-controlled property selection.
- Identity evidence must bind the exact verified user, active session, session version and expiry. Truthy, stale, expired, replayed or malformed verification evidence never authorizes an export.
- The selected property must match exactly one active, versioned current-user membership.
- Missing, inactive, stale, malformed, duplicate, cross-user, oversized, invalid-role or unknown-property evidence fails closed without throwing.
- Canonical identifiers reject whitespace, control characters and invisible Unicode format characters.
- The immutable decision binds the exact user, session/version, property, membership/version, role and requested export kind so one authorization cannot be applied to another identity, property, membership revision or format.
- The contract preserves the current household read model for OWNER, ADULT, CHILD and GUEST. Any later role restriction requires a separate product/privacy decision and migration plan.
- Export never falls back to the first, earliest or sole database property when the selected scope is unavailable.

## Required Query Boundary

Every export implementation must carry the authorized property ID and export kind through the complete read graph:

- household JSON;
- inventory CSV;
- maintenance-history CSV;
- calendar ICS and later external-calendar sync;
- printable household report;
- rooms, categories, assets, maintenance, warranties, receipts, documents, reminders and providers;
- membership metadata appropriate to the current role;
- attachment metadata, excluding private storage keys and Blob URLs;
- later notification, offline, OCR/AI, email-ingestion, sharing and integration data covered by portability requirements.

Every root query must filter by the authorized property ID. Every linked record must also match that property before serialization. A missing link, mixed-property relation or unscoped query must fail the export rather than omit evidence silently or include another property's data.

Before serialization and before any attachment stream is opened, production integration must revalidate the bound session and membership versions. A revoked session, removed membership or changed membership version invalidates the decision and requires a fresh authorization check.

## Output Contract

- Exports are generated on demand with private, no-store responses.
- Filenames may include a safe property label but never an address, email or internal identifier.
- Spreadsheet exports retain formula-injection defenses.
- JSON format versions remain explicit and forward-compatible.
- Calendar identifiers include a stable property namespace without exposing household data.
- Exports exclude credentials, sessions, verification tokens, notification tokens, storage keys, processor credentials, internal audit secrets and direct private-file URLs.
- Session and membership evidence in the internal decision is authorization metadata only and is never serialized into an export.
- A multi-property account export, if later offered, must be an explicit separate action that iterates only over independently authorized property scopes.

Production integration requires exact-head authorization, cross-property denial, export-content, lint, typecheck, build and native regression evidence.
