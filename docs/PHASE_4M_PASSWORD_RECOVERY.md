# Phase 4M: Password Recovery And Email Adapter

## Status

Implementation complete pending final automated PR validation. Live delivery remains a client-owned setup gate.

## Delivered

- Added a fail-closed Resend implementation behind the internal auth email interface.
- Added password reset request and token completion routes.
- Added a generic request result that does not reveal registered emails.
- Kept the 12-character password policy.
- Kept Better Auth session revocation after reset.
- Added clear unavailable states without complete auth and email runtime configuration.
- Strengthened environment tests and no-database route smoke coverage.

## Routes

- /forgot-password
- /reset-password

## Required Runtime

Email delivery is available only when all values are present:

- AUTH_EMAIL_PROVIDER=resend
- AUTH_EMAIL_FROM using a verified sending domain
- RESEND_API_KEY
- the existing database and Better Auth runtime values

A provider label without a key does not enable signup or recovery.

## Provider Decision

Resend is the first delivery adapter because its HTTP API supports text email, verified senders and standard bearer credentials without adding an SDK dependency. The adapter remains behind HomeVault's internal interface so authentication semantics do not depend on provider-specific code.

Official references:

- https://resend.com/docs/api-reference/emails/send-email
- https://better-auth.com/docs/authentication/email-password

## Client Gate

Before live signup or recovery can be enabled, the client must:

1. own or approve the sending domain;
2. create or connect the Resend account;
3. verify the sending domain;
4. place the API key and sender only in managed Vercel environment settings;
5. approve AUTH_SIGNUP_ENABLED=true after end-to-end delivery testing.

No secret or live sender is committed.
