# Phase 1K Plan: Form Choice Usability

Phase 1K improves the existing persisted create/edit forms so beginners can choose valid relationships and enum values without typing internal names or codes. It does not add new records, mutations, integrations or product areas.

## Status

Phase 1K is in progress. The implementation adds shared field rendering, fallback-safe relationship choices and native bounded inputs without changing mutation capability.

## Implementation Slice

- Shared persisted-form controls for menus, dates, numbers, text and notes.
- Fallback-safe room choices for asset forms.
- Fallback-safe asset choices for maintenance, warranty, receipt and document forms.
- Bounded maintenance-frequency and document-type menus.
- Native date controls with separate raw edit values.
- Native non-negative decimal control for receipt totals.
- No new routes, models, actions or schema migration.

## Goals

- Replace brittle free-text relationship entry with controlled choices where useful.
- Use native date and numeric inputs for fields with known data types.
- Preserve the current forms, routes, Server Actions and database behavior.
- Keep controls useful with database records or curated sample fallback.
- Reduce validation failures caused by misspelled room, asset, frequency or document-type values.
- Maintain mobile-first accessibility and the current HomeVault visual style.

## Planned Improvements

- Asset forms: choose an optional room from current-home rooms.
- Maintenance forms: choose a supported frequency and optional linked asset.
- Warranty forms: choose a required linked asset.
- Receipt/document forms: choose an optional linked asset.
- Document forms: retain the supported document-type menu.
- Maintenance and warranty forms: use native date controls.
- Receipt forms: retain native date and non-negative decimal amount controls.
- Shared field metadata: add controlled options and input-type hints in a reusable way.

## Data Behavior

- Use existing fallback-safe room and asset reads to populate choices.
- Do not query the database at module import time.
- Do not add a schema migration.
- Do not change the temporary Taylor Family Home resolver.
- Continue submitting room and asset names to the existing actions so mutation behavior stays narrow.
- If the database is unavailable, forms must still render curated sample choices.
- If no choices exist, optional relationships may remain unlinked and required relationships must show clear guidance.

## UI Behavior

- Use menus for bounded option sets.
- Use date inputs for dates and number inputs for receipt totals.
- Keep labels, helper text, required cues and status messages accessible.
- Preserve record-type immutability and metadata-only document behavior.
- Avoid a broad visual redesign.

## Out Of Scope

- New models or routes.
- New mutation types.
- Delete actions.
- Production authentication.
- File uploads or storage.
- OCR, AI or email ingestion.
- Notifications or reminder delivery.
- Payments, subscriptions, budgets or spending analytics.
- Analytics.
- Native iOS.
- Advanced household sharing.
- Requiring local client commands or local databases.

## Review And Validation

- Use a focused GitHub pull request.
- Use GitHub Actions for Prisma validation/generation, lint, typecheck and production build evidence.
- Confirm existing fallback/sample routes remain build-safe without `DATABASE_URL`.
- Apply the React accessibility and component-quality checklist.
- Use Vercel only for a deliberate visual checkpoint or deployment investigation.

## Completion Criteria

Phase 1K will be complete when:

- Existing relationship fields present valid current-home or sample choices.
- Existing enum fields use bounded controls.
- Existing date/amount fields use appropriate native input behavior.
- Current Server Actions and routes remain unchanged in capability.
- Database-unavailable fallback remains useful and non-destructive.
- No unapproved feature or integration is added.

## Client Actions

No client action is required.
