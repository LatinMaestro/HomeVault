# Phase 3T: Safe Provider Contact Actions

## Objective

Make stored service-provider contact metadata useful on mobile without introducing messaging, booking or third-party integrations.

## Delivered

- Added tap-to-call for valid phone metadata.
- Added email actions for safe email values.
- Added external website actions restricted to HTTP(S).
- Added focused unit contracts for normalisation and unsafe input rejection.
- Preserved the existing provider detail and task navigation.

## Security And Privacy

- Phone links contain dial-safe characters only.
- Email values containing line breaks are rejected.
- Website links reject non-HTTP(S) protocols and malformed URLs.
- External websites open as user-initiated navigation with noreferrer.
- HomeVault does not contact providers or transmit data automatically.

## Boundaries

- No messaging, booking, ratings, payments or external API.
- No schema, migration, mutation or new credential.
- No analytics or contact-action tracking.

## Acceptance Criteria

- Valid phone, email and website metadata produces familiar actions.
- Missing or unsafe values do not produce actions.
- Provider metadata remains visible as text.
- Existing edit and linked-task behavior remains unchanged.
- Unit tests cover common and unsafe values.

## Review Evidence

GitHub CI must pass the complete online app gate. Vercel visual review may be batched while usage is constrained.
