# Phase 3P: Warranty Follow-up Context

## Objective

Keep warranty coverage, supporting metadata and follow-up dates together.

## Delivered

- Added linked reminder presentation to warranty detail.
- Added direct navigation to existing reminder detail.
- Kept linked documents visible with a clear empty state.
- Updated stale warranty copy that implied reminder metadata was unavailable.
- Kept database and curated sample relationships aligned.

## Boundaries

- Existing Warranty and Reminder relationships only.
- No schema, migration, mutation, reminder delivery or scheduling service.
- No file upload, storage, OCR, AI, payment, analytics or external integration.

## Acceptance Criteria

- Warranty detail shows linked reminder title, due date and lifecycle status.
- Reminder cards open existing reminder detail.
- Document and reminder empty states are clear.
- Sample fallback and database records use the same presentation.
- Existing warranty editing behavior remains unchanged.

## Review Evidence

GitHub CI must pass the complete online app gate. Vercel visual review may be batched while the account is build-rate-limited.
