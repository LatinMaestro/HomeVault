# Phase 3G: Printable Household Summary

## Status

Complete.

## Goal

Provide a readable, printable handover view of a home's core records without storing a generated document or automating an insurance claim.

## Delivered

- A fallback-safe `/home-report` summary route.
- Household identity and high-level record counts.
- Asset identity, location and serial metadata.
- Active maintenance schedules.
- Warranty register.
- Service contact directory.
- Receipt and document metadata index.
- Browser print and save-to-PDF support.
- Privacy guidance and database-free route smoke coverage.

## Privacy Boundary

The report is rendered on request and is not retained by HomeVault. It can contain serial numbers and provider contact details, so the screen reminds users to keep copies private.

Production release still requires signed-in household authorisation. File attachments are excluded because storage is not approved.

## Scope

No insurance claim automation, valuation, budgeting, generated-file storage, upload, external destination, dependency, schema, notification delivery, AI, OCR or native project is added.
