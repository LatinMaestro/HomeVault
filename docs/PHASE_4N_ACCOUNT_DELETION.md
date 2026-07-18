# Phase 4N: Account Export And Deletion

## Status

Implementation complete pending final automated PR validation.

## Delivered

- Added signed-in permanent account deletion.
- Added an explicit DELETE confirmation.
- Added a public account-deletion information route for store policy links.
- Added account export and deletion controls.
- Made calendar and metadata export endpoints require household access when production auth is configured.
- Added transaction-safe deletion planning and unit contracts.

## Routes

- /account/delete
- /account-deletion

## Deletion Rules

- Identity is derived only from the verified server session.
- Credential accounts, sessions and the User are removed together.
- A sole-member household is deleted, cascading its rooms, assets, maintenance, warranties, receipts, documents, reminders, categories and providers.
- A non-owner member of a shared household loses only their membership.
- An OWNER cannot delete their account while other members remain; ownership must be transferred first.
- Any transaction failure prevents partial deletion from being committed.

## Export Before Deletion

The account screen and confirmation page link to the existing no-store household export. When production auth is configured, export and calendar endpoints return an authentication error unless household access is present. Sample exports remain available only in no-auth review deployments.

## Retention Note

Active database records are removed immediately by the application transaction. Encrypted infrastructure backups may remain until provider-managed expiry. Legal or security exceptions must be documented in the final public policy.

## Not Included

Ownership transfer and invitations remain unavailable. Attachment deletion is added with the private Blob lifecycle because file uploads are not enabled yet.
