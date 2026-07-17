# Phase 3Q: Connected Record Context

## Objective

Preserve the practical provenance of receipt and document metadata by exposing its existing HomeVault relationships.

## Delivered

- Receipt detail now lists document metadata linked to that receipt.
- Document detail now links to its existing warranty, source receipt and maintenance task.
- Asset links remain available in the same connected-record section.
- Unknown and unlinked records retain clear states.
- Added a representative document detail to database-free route smoke.

## Boundaries

- Existing Prisma relationships only.
- No schema, migration, mutation or inferred association.
- No file upload, storage, download, OCR, AI, email ingestion or external service.
- Receipt amounts remain archival metadata, not budgeting or financial analysis.

## Acceptance Criteria

- Existing links navigate to authoritative asset, warranty, receipt, maintenance or document detail.
- Only relationships present in the current data source are shown.
- Records without relationships explain that state.
- Sample fallback and controlled preview database behavior remain aligned.
- Build and route smoke remain database-independent.

## Review Evidence

GitHub CI must pass Prisma validation and generation, lint, typecheck, build, boundary contracts and database-free route smoke. Vercel visual review may be batched while build usage is constrained.
