# Phase 3R: Maintenance Record Context

## Objective

Keep maintenance instructions, history, supporting document metadata and follow-up dates together.

## Delivered

- Added linked document metadata to maintenance task detail.
- Added linked reminders to maintenance task detail.
- Added direct navigation to existing document and reminder workflows.
- Kept explicit empty states and sample fallback behavior.

## Boundaries

- Existing MaintenanceTask relationships only.
- No schema, migration, mutation, notification delivery or new scheduling behavior.
- No file upload, storage, OCR, AI, payment, analytics or external integration.

## Acceptance Criteria

- Task detail shows linked documents with readable types.
- Task detail shows linked reminders with status and due date.
- Each relationship opens its existing authoritative detail route.
- Empty relationship states are clear.
- Completion recording and schedule advancement remain unchanged.
- The route renders without database access.

## Review Evidence

GitHub CI must pass the complete online Prisma, lint, typecheck, build, boundary and route-smoke gate. Visual review may be batched while Vercel usage is constrained.
