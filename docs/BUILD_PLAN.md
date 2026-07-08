# Build Plan

## Phase 1A: Foundation - Complete

Create the docs, app shell, placeholder routes, visual identity and Vercel review workflow.

## Phase 1B: Data Model - Complete

Implement Prisma, a PostgreSQL-compatible schema, seed data and lazy database helper structure while keeping Vercel builds free of live database dependency.

## Phase 1C: Core Screen Shells - Complete

Build controlled read-only list/detail screens and non-saving create/edit shells for rooms, assets, maintenance tasks, warranties and receipt/document metadata.

## Phase 1D: Review And Hardening - Next

Improve the existing foundation before adding persistence:

- Polish mobile-first layouts and navigation consistency.
- Clarify empty, fallback and non-saving shell states.
- Improve accessibility basics across existing screens.
- Preserve sample-data fallback when `DATABASE_URL` is missing or unavailable.
- Keep Vercel Preview Deployment as the UI review gate.
- Keep GitHub PRs as the code review gate.

Phase 1D must not add persistent mutations, production auth, uploads, OCR, AI, notifications, payments, analytics or native iOS work.

## Future Phases

Add approved persistence, production auth, approved storage, reminders, sharing and native app exploration only after explicit decisions.

