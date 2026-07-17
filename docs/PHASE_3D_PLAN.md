# Phase 3D: Household Calendar And Portable Export

## Status

Complete.

## Goal

Make existing household dates useful together and portable without introducing a third-party calendar integration.

## Delivered

- Fallback-safe `/calendar` timeline.
- Active maintenance, pending/snoozed reminder and warranty-expiry events.
- Direct links from events to existing detail screens.
- Standard `/api/calendar.ics` download.
- All-day dates, stable event identifiers and escaped calendar text.
- No-store attachment headers.
- Maintenance navigation entry point.
- Unit and production-smoke contracts.

## Privacy Boundary

The export is generated on request and returned directly to the user. HomeVault does not request calendar permissions, connect an account, store external tokens, monitor imports or update external events.

Controlled preview database rules still apply. Without approved database access, the timeline and export use canonical sample data.

## Scope

No OAuth, external calendar API, background synchronization, notification delivery, dependency, schema, payment, analytics or Vercel review is added.
