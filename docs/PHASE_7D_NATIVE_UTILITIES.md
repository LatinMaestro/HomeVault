# Phase 7D: Low-Permission Native Utilities

Status: prepared policy contract; widgets, App Shortcuts and import extensions remain disabled.

## Approved Direction

- Native utilities are opt-in conveniences and never become an authentication or household-authorisation boundary.
- The initial utility set is a redacted status widget, allowlisted App Shortcuts and a share/import extension for approved document formats.
- Utilities request no location, contacts, microphone, broad photo-library, payment or advertising permission.
- Record titles, household names, addresses, provider details, attachment bytes and private object URLs do not appear in widget storage or intent donations.

## Widgets

- A widget may show only redacted counts for attention items, due maintenance, expiring warranties and reminders.
- Refresh requires a live verified session and current membership in the explicitly selected property.
- Widget state is bound to user, property, device and installation, encrypted at rest, excluded from backup and limited to 24 hours.
- Offline widget reads remain counts-only and visibly stale until a live refresh; known membership revocation fails closed and purges the snapshot.
- Property change, opt-out, sign-out, membership removal, account deletion, device loss or reinstall purges the snapshot.
- Widget links open an allowlisted HomeVault route, require app unlock and repeat server authorisation before household content is shown.

## App Shortcuts

- The first App Intents release stays narrow: open Maintenance, start Quick Add or start user-initiated document capture.
- Use one dedicated intents module and one explicit main-scene handoff router; do not mirror the app navigation tree.
- The first pass requires no `AppEntity` exposure because each action opens a fixed workflow and private record discovery is intentionally excluded.
- Publish the three actions through a small `AppShortcutsProvider` using clear, task-oriented titles and phrases.
- Shortcuts donate only generic action labels, never private record names or content.
- Every invocation requires an unlocked device, the current installation, a verified session and current property membership.
- Quick Add and capture require OWNER or ADULT access. CHILD and GUEST remain read-only.
- No shortcut can delete data, change identity or roles, create invitations, publish a share or contact/pay a provider.

## Share And Import Extension

- The extension accepts only PDF, JPEG and PNG files within the existing 4 MB attachment limit.
- Source access is released after the file is copied into a protected, backup-excluded app-group container.
- The extension performs no upload and cannot select a property or save a household record.
- The main app must open within 30 minutes, unlock, re-establish a verified session, select an authorised property, review the file and explicitly confirm upload.
- File type, size and signature are revalidated before the existing private attachment boundary is invoked.
- Cancellation, expiry, completion, sign-out, account switch, membership removal, account deletion, device loss and reinstall delete temporary files.
- HEIC/HEIF and multi-attachment imports remain part of the separately reviewed expanded-attachments phase.

## Verification

Production enablement requires exact-head standard and native CI, generated-project drift checks, widget and extension entitlement review, App Group data-protection inspection, lock-screen redaction tests, shortcut permission and role tests, extension timeout/interruption tests, account/property residue tests, accessibility review, physical-device testing, final privacy-manifest and store-disclosure updates.
