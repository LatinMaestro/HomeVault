# Phase 4J: Account Entry Experience

## Status

Implementation complete pending final automated PR validation.

## Delivered

- Added responsive sign-in and sign-up routes.
- Added a verified account status page and sign-out control.
- Added a Better Auth browser client with email/password forms.
- Exposed verified session identity separately from household membership.
- Added account-mode visibility in the existing app shell.
- Added clear unavailable states for deployments without auth secrets.
- Kept signup hidden and rejected unless transactional email and the explicit signup switch are configured.
- Added no-database smoke coverage for all account entry routes.

## Routes

- /sign-in
- /sign-up
- /account

## Fail-closed Behaviour

- No auth runtime: account pages explain that accounts are unavailable; sample review remains usable.
- Auth runtime without a verified session: account status redirects to sign in.
- Verified identity without membership: account status reports that household setup is required.
- Signup without configured email: no signup form is offered and the API remains disabled.
- Sign out clears the Better Auth session before returning to sign in.

## Privacy

- Email is displayed only to the signed-in account holder.
- Email is not used as a household authorisation key.
- No account or credential data is included in sample fallback.
- No social provider, tracking, analytics or password logging is introduced.

## Remaining Work

First-home onboarding, route presentation protection, recovery UI, production migrations, live email and account deletion remain later release gates.
