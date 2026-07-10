# Phase 1J Plan: Receipt And Document Metadata Persistence

Phase 1J introduced create/edit persistence for receipt and document metadata as a controlled slice after warranty persistence. It makes the existing combined records area useful without adding file uploads, production storage, OCR, email ingestion, financial tracking, production auth or delete actions.

## Status

Phase 1J is complete. The implementation adds runtime-only receipt and document metadata create/edit actions and the planned routes while preserving database-independent builds and fallback data.

## Completed Work

- Runtime-only receipt and document Server Actions.
- A record type chooser plus separate receipt/document create forms.
- Type-aware metadata editing with immutable record type.
- Optional existing asset association by matching asset name.
- Raw edit values alongside formatted display values in the shared data layer.
- No schema migration, file fields, uploads, storage, OCR, email ingestion, deletes or financial workflows.

## Goals

- Enable receipt metadata create and edit when `DATABASE_URL` is configured.
- Enable document metadata create and edit when `DATABASE_URL` is configured.
- Keep receipt and document records easy to distinguish in the shared records list.
- Support optional asset association by matching an existing asset name.
- Preserve database-independent builds and useful fallback/sample rendering.
- Preserve clear non-destructive messaging when the database is missing or unavailable.
- Reuse the proven runtime-only Server Action pattern.
- Keep every document metadata-only until file storage is separately approved.

## Planned Routes

- `/receipts`: combined receipt and document metadata list.
- `/receipts/new`: beginner-friendly record type chooser.
- `/receipts/new/receipt`: receipt metadata create form.
- `/receipts/new/document`: document metadata create form.
- `/receipts/[recordId]`: existing type-aware metadata detail.
- `/receipts/[recordId]/edit`: type-aware metadata edit form.

## Receipt Metadata Scope

- Merchant.
- Purchase date.
- Optional purchase total stored as receipt reference metadata in AUD.
- Receipt or order number.
- Optional linked asset.
- Notes.

Purchase totals are archival receipt metadata only. Phase 1J will not add budgets, spending summaries, financial dashboards, payment handling or financial advice.

## Document Metadata Scope

- Title.
- Document type using the existing `DocumentType` values.
- Issue date.
- Optional linked asset.
- Notes.

`fileName` and `storageKey` will not be accepted by the create/edit forms. No file is selected, uploaded, stored or implied to exist.

## Data Behavior

- Use the existing `Receipt` and `Document` Prisma models; no schema migration is planned.
- Use `DATABASE_URL` only at runtime.
- Do not query the database or initialize Prisma at module import time.
- Resolve the temporary current home using the Taylor Family Home sample convention.
- Resolve optional asset links within the current home.
- Keep receipt and document writes in separate Server Actions even though the records share list/detail UI.
- Missing `DATABASE_URL` must show a clear message and must not imply a record was saved.
- Failed writes must not change fallback/sample data.
- Revalidate the dashboard, records list, record detail and related asset routes after successful writes.

## UI Behavior

- Keep the existing calm, mobile-first HomeVault style.
- Use a clear record type chooser before the create forms.
- Keep record type fixed during edit so a receipt cannot silently become a document or vice versa.
- Clearly label all forms as metadata-only.
- Explain that file upload, scanning and email forwarding are not available.
- Keep fallback/sample records useful when no database is configured.

## Out Of Scope

- Delete actions.
- File selection, uploads or production storage.
- OCR, AI extraction or document scanning.
- Email ingestion or forwarding.
- Notification or reminder delivery.
- Receipt image processing.
- Budgets, expense tracking, spending analytics or other financial features.
- Payments or subscriptions.
- Production authentication.
- Role or permission systems.
- Advanced household sharing.
- Analytics.
- Native iOS.
- Requiring local client commands, local secrets or local databases.

## Review And Validation

- Use a focused GitHub pull request.
- Use GitHub Actions for Prisma validation/generation, lint, typecheck and build evidence.
- Confirm the diff contains only Phase 1J implementation and documentation.
- Keep Vercel builds independent of live database access.
- Use Vercel inspection only for a deliberate visual checkpoint or deployment investigation.

## Completion Record

Phase 1J is complete because:

- Receipt create/edit persists when the configured database is reachable.
- Document create/edit persists when the configured database is reachable.
- Optional asset association is handled safely.
- Record type remains stable during edit.
- Missing or unavailable database states are non-destructive.
- Combined list/detail pages remain useful with sample fallback.
- No file upload, storage, OCR, email ingestion, delete, financial workflow or other unapproved feature is added.

## Client Actions

No immediate client action is required. Real runtime persistence requires the approved Neon `DATABASE_URL` in the target Vercel environment, but builds and fallback review must continue to work without it.
