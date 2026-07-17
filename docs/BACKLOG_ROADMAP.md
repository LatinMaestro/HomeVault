# Backlog And Roadmap

## Complete

- Phase 1A foundation and visual shell.
- Phase 1B Prisma data model foundation.
- Phase 1C read-only core screen shells with non-saving create/edit shells.
- Phase 1D review and hardening.
- Phase 1E persistence readiness for room and asset shell forms.
- Phase 1F first room persistence.
- Phase 1G asset persistence.
- Phase 1H maintenance persistence.
- Phase 1I warranty persistence.
- Phase 1J receipt and document metadata persistence.
- Phase 1K form choice usability.
- Phase 1L workflow consistency review and stale-status correction.
- Phase 1M fallback-safe household dashboard.
- Phase 1N readable status, frequency and document labels.
- Phase 1O fallback-safe search across core lists.
- Phase 1P maintenance due and warranty expiry awareness.
- Phase 1Q navigation between existing linked household records.
- Phase 1R complete identifying, purchase and lifecycle asset metadata.
- Phase 1S optional asset category linking.
- Phase 1T maintenance lifecycle status control.
- Phase 1U optional maintenance service-provider linking.
- Phase 1V custom maintenance interval metadata.
- Online-first development workflow.

## Near Term

- Review the latest merged dashboard on Vercel after deployment catches up with `main`.
- Continue controlled database and sample-fallback review across create, edit and detail flows.
- Keep deletes, production auth, file storage, uploads, OCR, email ingestion and reminder delivery out of scope until separately approved.
- Use GitHub PRs and GitHub Actions as the default review evidence while Vercel usage is constrained.
- Use Vercel previews for visual review when usage allows or when a deployment issue needs investigation.

## Future Approved-Decision Candidates

- Production authentication.
- Approved file storage.
- Reminder delivery.
- Household sharing.
- Multi-property support.
- Capacitor-based iOS and Android packaging after auth, deletion, privacy and storage gates.

## Not Planned For Phase 1

- OCR.
- AI extraction.
- Budgeting or financial features.
- Paid integrations.
- Native packaging during the current shared-app phase; dual-store distribution remains the approved later target.

## Phase 1W Complete

Added searchable provider list/detail routes and linked-task navigation. Provider mutations and external service integrations remain deferred.

## Phase 1X Complete

Added warranty start/expiry consistency validation without adding automation, reminders or schema changes.

## Phase 2K Complete

Added household-wide, fallback-safe search across existing household record types with grouped navigation. Search persistence, analytics and external search services remain out of scope.

## Phase 2V Complete

Prepared dual-store listing copy and screenshot/reviewer inputs. Final public naming, trademark clearance, legal identity, support details and store-account setup remain client-controlled submission gates.


## Completed Product Expansion

- Phase 3C automatic maintenance schedule advancement after completion.

## Independent Next Candidates

- Read-only calendar feeds and portable calendar export for due maintenance, reminders and warranties.
- Household data export in portable structured formats.
- Home inventory print and household handover summary without claim automation. Complete in Phase 3G.
- Maintenance templates for common Australian household equipment. Complete in Phase 3F.
- Archive and recovery workflows before destructive deletion is introduced. Complete in Phase 3H.


## Phase 3I Complete

Added a derived beginner setup guide across the existing household profile, room, asset, maintenance, warranty and record workflows. No onboarding state or analytics is stored.


## Phase 3J Complete

Added a global mobile-first Quick Add hub over all existing guarded creation workflows. No mutation capability changed.

## Phase 3M Complete

Added fallback-safe room detail pages with assigned asset and linked maintenance navigation. No schema or mutation capability changed.

## Phase 3N Complete

Connected asset detail to existing maintenance and reminder records. No schema, scheduling or notification capability changed.

## Phase 3O Complete

Added fallback-safe asset category detail pages and assigned-asset navigation. The taxonomy and persistence model remain unchanged.

## Phase 3P Complete

Surfaced existing reminder metadata on warranty detail without adding delivery, scheduling or persistence capability.

## Phase 3Q Complete

Exposed existing receipt and document relationships without adding storage, uploads, inferred links or new persistence.

## Phase 3R Complete

Surfaced existing maintenance document and reminder relationships without changing persistence, scheduling or delivery.

## Phase 3S Complete

Added a generated, spreadsheet-safe maintenance completion export with no storage, external destination or financial behavior.

## Phase 3T Complete

Added safe, user-initiated call, email and website actions for provider metadata without messaging, booking or external APIs.

## Phase 3U Complete

Added a privacy-safe, read-only summary of current household members in Settings and the portable household export. Invitations, role changes and real household sharing remain gated on production authentication and server-side household authorisation.

## Phase 3V Complete

Added mobile-friendly room, category and lifecycle filters to the existing asset inventory. Filtering uses URL query parameters and already-loaded records only; no preference or search history is stored.

## Phase 3W Complete

Added status, Brisbane due-state and linked-asset filters to the maintenance work queue. Filter state remains transparent URL state and creates no notification, schedule or persistence behavior.

## Phase 3X Complete

Added coverage-state, asset and provider filters to warranty review, including missing-expiry and missing-provider records. No reminder delivery or claim automation was introduced.

## Phase 3Y Complete

Added record-type, linked-asset and document-type filters to receipt and document metadata review, including unlinked records. File storage and uploads remain separate release gates.

## Phase 3Z Complete

Added lifecycle, due-state and linked-record filters to reminder metadata review. Notification delivery, queues and background scheduling remain unimplemented.

## Phase 4A Complete

Added trade, linked-task and contact-detail filters to the provider directory, including explicit data-gap views. Booking, messaging, payments and external provider services remain out of scope.

## Phase 4B Complete

Added floor/zone and linked-asset filters to Rooms, including missing-floor and empty-room records. Floor plans and occupancy tracking remain outside HomeVault's practical record scope.
