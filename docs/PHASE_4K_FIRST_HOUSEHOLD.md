# Phase 4K: First Household Onboarding

## Status

Implementation complete pending final automated PR validation.

## Delivered

- Added a verified-account first-home setup route.
- Added a beginner-friendly Australian household form.
- Creates the Home and OWNER HouseholdMember in one transaction.
- Uses a deterministic per-user onboarding Home ID to prevent duplicate first homes during concurrent submissions.
- Rechecks membership after a transaction conflict so retries remain idempotent.
- Redirects existing members away from onboarding.
- Connects account status to the setup workflow.
- Adds unit and no-database route coverage.

## Route

- /onboarding

## Authorisation

The onboarding action requires a verified Better Auth session. It does not use the controlled preview identity and does not accept a user or owner ID from form data.

## Data Written

Required:

- household name;
- immutable verified session user as OWNER.

Optional:

- street address;
- suburb;
- Australian state or territory;
- four-digit postcode.

Country is fixed to Australia for the initial product audience.

## Atomicity And Retry Behaviour

The Home and membership are nested in one Prisma transaction. If concurrent requests race, the deterministic Home ID permits only one create. HomeVault then resolves the existing membership and returns success instead of creating an orphan or duplicate onboarding home.

## Not Included

Invitations, additional homes, role changes, shared accounts and production migration operations remain separate release work.
