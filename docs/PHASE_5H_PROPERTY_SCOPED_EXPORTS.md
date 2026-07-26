# Phase 5H: Property-scoped Export Policy

Status: staged contract; existing production export routes are unchanged.

## Access Contract

- Export requires a current verified user and an explicit server-controlled property selection.
- The selected property must match exactly one current-user membership.
- Missing, malformed, duplicate, cross-user or unknown-property evidence fails closed.
- The contract preserves the current household read model for OWNER, ADULT, CHILD and GUEST. Any later role restriction requires a separate product/privacy decision and migration plan.
- Export never falls back to the first, earliest or sole database property when the selected scope is unavailable.

## Required Query Boundary

Every export implementation must carry the authorized property ID through the complete read graph:

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

## Output Contract

- Exports are generated on demand with private, no-store responses.
- Filenames may include a safe property label but never an address, email or internal identifier.
- Spreadsheet exports retain formula-injection defenses.
- JSON format versions remain explicit and forward-compatible.
- Calendar identifiers include a stable property namespace without exposing household data.
- Exports exclude credentials, sessions, verification tokens, notification tokens, storage keys, processor credentials, internal audit secrets and direct private-file URLs.
- A multi-property account export, if later offered, must be an explicit separate action that iterates only over independently authorized property scopes.

Production integration requires exact-head authorization, cross-property denial, export-content, lint, typecheck, build and native regression evidence.
