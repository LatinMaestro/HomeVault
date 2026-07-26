# Phase 5I: Property Record And File Isolation

Status: staged contract; production queries and file routes are unchanged.

## Shared Boundary

Every list, detail, mutation and private-file request must begin with one server-resolved property access object containing the current user, selected property, membership and role.

- OWNER and ADULT retain current write/file-write access.
- OWNER, ADULT, CHILD and GUEST retain current read/file-read access.
- A later role-policy change must update this shared contract and its privacy/export/deletion effects together.
- Client-supplied property IDs, record IDs, routes, filenames and storage keys never establish authorization.

## Query Requirements

- Root list queries filter by the authorized property ID before returning data.
- Detail, edit, delete and file-metadata queries require both record ID and authorized property ID.
- Linked rooms, categories, assets, tasks, warranties, receipts, documents, reminders and providers must match the same property.
- A mixed-property, duplicate, malformed or unexpectedly unscoped result fails the request; do not silently remove foreign rows after an unscoped query.
- Search, dashboard summaries, archive, quick add, exports, calendar, notifications and background work use the same property scope.
- Cache keys and request memoization include the immutable user/property scope and never reuse household data across accounts or properties.

## Private File Requirements

- Authorize the Document metadata row by record ID and property before reading its private object reference.
- Upload destinations use server-generated object names and a property/document namespace.
- Never accept a Blob URL or storage key from the client as proof of access.
- Download and inline viewing remain server-proxied with private, no-store responses.
- Replacement/removal rechecks property write access immediately before database and object-store changes.
- Compensating cleanup remains idempotent and cannot delete an object referenced by another property.
- Attachment logs contain operational identifiers only, never filenames, household content, URLs, keys or secrets.

## Verification

Production integration requires table-by-table list/detail/mutation/file denial tests using two fictional users and at least two properties, plus exact-head unit, lint, typecheck, build, route, migration and native evidence.
