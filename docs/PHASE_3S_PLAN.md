# Phase 3S: Maintenance History Export

## Objective

Give households a portable spreadsheet record of completed maintenance without introducing stored reports or external integrations.

## Delivered

- Added `/api/export/maintenance.csv`.
- Added a Settings download action.
- Exports one row per recorded maintenance completion.
- Includes task, asset, completion, frequency, lifecycle and next-due context.
- Neutralises spreadsheet-formula input.
- Adds unit and deployment-contract coverage.

## Privacy And Data Boundary

- Generated on request and never retained by HomeVault.
- Returned with private, no-store headers.
- Uses existing fallback-safe maintenance reads.
- Contains metadata only; no document attachments.
- Production authentication must protect the export before real household data is allowed.

## Boundaries

- No schema, migration, mutation, storage, email or external destination.
- No budgeting, costing, valuation or insurance claim automation.
- No dependency added.

## Acceptance Criteria

- Completed maintenance produces one CSV row per completion.
- Tasks without completions do not create false history rows.
- Formula-like values are spreadsheet-safe.
- Response headers identify CSV, a stable filename and no-store behavior.
- Settings exposes the download clearly.
- Database-free smoke verifies a sample completion.

## Review Evidence

GitHub CI must pass the complete online app gate. Vercel visual review may be batched while build usage is constrained.
