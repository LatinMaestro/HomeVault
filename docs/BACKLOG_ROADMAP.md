# Backlog And Roadmap

## Complete

- Phase 1A foundation and visual shell.
- Phase 1B Prisma data model foundation.
- Phase 1C read-only core screen shells with non-saving create/edit shells.
- Phase 1D review and hardening.
- Phase 1E persistence readiness for room and asset shell forms.
- Phase 1F first room persistence.
- Phase 1G asset persistence.
- Online-first development workflow.

## Near Term

- Plan maintenance and warranty persistence as separate controlled slices.
- Keep each persistence slice focused on one workflow family at a time.
- Preserve fallback-safe rendering and unavailable-database messaging.
- Keep deletes, production auth, file storage and unrelated persistence out of each mutation slice until separately approved.
- Use GitHub PRs and GitHub Actions as the default review evidence while Vercel usage is constrained.
- Use Vercel previews for visual review when usage allows or when a deployment issue needs investigation.

## Future Approved-Decision Candidates

- Persistent maintenance and warranty workflows.
- Receipt/document metadata improvements.
- Production authentication.
- Approved file storage.
- Reminder delivery.
- Household sharing.
- Multi-property support.
- Native app exploration only if the web app proves the need.

## Not Planned For Phase 1

- OCR.
- AI extraction.
- Budgeting or financial features.
- Paid integrations.
- Native iOS app.
