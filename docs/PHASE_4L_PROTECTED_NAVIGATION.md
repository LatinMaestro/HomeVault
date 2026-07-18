# Phase 4L: Protected Navigation

## Status

Implementation complete pending final automated PR validation.

## Delivered

- Made the shared AppShell enforce authenticated navigation when the production auth runtime is configured.
- Redirects missing or unverified sessions to sign in.
- Redirects verified accounts without household membership to onboarding.
- Keeps privacy and support publicly reachable through an explicit public-access opt-out.
- Keeps the non-sensitive offline screen public.
- Preserves all sample review routes when production auth is absent.
- Added CI contracts for the redirect and public-page boundaries.

## Defence In Depth

The AppShell guard prevents confusing access to private navigation. It is not the data security control:

- reads still require the resolved household access object;
- writes still require OWNER or ADULT writable access;
- every database query remains scoped to the authorised Home ID;
- cross-household records remain non-revealing.

## Public Routes

- /sign-in
- /sign-up
- /onboarding, after verified sign in
- /privacy
- /support
- /offline
- deployment health and install metadata endpoints

## Authenticated Routes

All normal household screens rendered through AppShell require both a verified session and household membership when auth is configured.

## Build Behaviour

Without the auth runtime, no session lookup occurs and the existing curated sample experience remains deployable and useful.
