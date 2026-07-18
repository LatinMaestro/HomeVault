# Phase 4I: Authorised Household Mutations

## Status

Implementation complete pending final automated PR validation.

## Delivered

- Migrated every existing Server Action to writable household access.
- OWNER and ADULT memberships may write household records.
- CHILD and GUEST memberships remain read-only.
- All writes use the authorised Home ID and database client from one server-owned context.
- Form availability is derived from the same server-side membership decision.
- Missing, unverified, membership-less and read-only sessions receive non-destructive unavailable responses.
- Controlled synthetic preview writes remain available only when production auth is absent.
- Added a CI contract preventing app routes from importing the preview switch, temporary current-home resolver or raw database helper.

## Covered Mutations

- room create and edit;
- asset and category create and edit;
- maintenance task create/edit and additive completion;
- service provider create and edit;
- reminder create and edit;
- warranty create and edit;
- receipt and document metadata create and edit;
- household profile edit.

No delete, membership administration, invitation, upload or notification mutation is introduced.

## Security Property

A form being visible is not sufficient to write. Every Server Action independently resolves the current verified membership and obtains its scoped Home ID before querying or changing data. Related record lookups are also scoped to that Home ID.

## Remaining Release Work

Production auth is still not enabled. Account screens, onboarding, email delivery, migrations, lifecycle controls and authenticated route presentation follow in dedicated phases.
