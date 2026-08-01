# Store Reviewer Package

> Candidate-bound document: current feature and exclusion wording reflects the earlier baseline and must be regenerated from the exact signed release candidate. The approved completion programme includes notifications, advanced household/property controls, biometrics, capture, offline access, OCR/AI drafts, email ingestion, controlled sharing and provider handoff; none may be claimed until its implementation and disclosure gates pass.

This is the engineering handoff for Apple App Review and Google Play review. Replace every bracketed client-owned value before submission. Never place real passwords, signing credentials or private household information in this file or a pull request.

## Submitted Product

- Working name: **HomeVault Home Care** pending legal and store-name clearance.
- Apple bundle ID: `au.com.homevault.app`.
- Android application ID: `au.com.homevault.app`.
- Category: Productivity; Lifestyle as a secondary category where supported.
- Canonical service: `https://homevault.grovekind.com`.
- Privacy URL: `https://homevault.grovekind.com/privacy`.
- Support URL: `https://homevault.grovekind.com/support`.
- Account deletion URL: `https://homevault.grovekind.com/account-deletion`.
- Version: `1.0.0`.
- Build number: assigned uniquely at signed-candidate dispatch.

## Reviewer Account

Create one verified synthetic reviewer account after production auth, email and migrations pass.

- Email: supplied privately in the store review credential field.
- Password: supplied privately in the store review credential field.
- Household: **Taylor Family Home** or an equivalent clearly synthetic Australian household.
- Role: OWNER.
- Content: synthetic rooms, assets, maintenance, warranties, reminders, providers, receipt/document metadata and harmless sample attachments.
- Account must not depend on an expiring email link, one-time password, geofence, VPN or staff intervention.
- Do not reuse a personal account or real home records.

Keep the account active for the complete review window and any appeal. Rotate or delete it after the release is approved and the review period is closed.

## Primary Review Path

1. Sign in with the supplied verified reviewer account.
2. Review the Home attention queue and upcoming household dates.
3. Open Vault, filter Assets and inspect one linked asset.
4. Open Maintenance, review recurrence and add a synthetic completion if the submitted environment permits writes.
5. Review a linked warranty and its follow-up context.
6. Review receipt/document metadata and download a harmless private sample attachment.
7. Use household search and Quick Add.
8. Open Calendar and export the household calendar.
9. Open Settings and download the metadata/inventory exports.
10. Review profile, password and session controls.
11. Open the account-deletion flow but do not confirm deletion unless the reviewer explicitly needs to test it.
12. On native builds, test trusted links, offline fallback, background privacy cover and the platform share sheet.

## Expected Behaviour

- Every real record route requires a verified account and matching household membership.
- OWNER and ADULT roles may save household records; CHILD and GUEST roles are read-only.
- Private attachments are available only through authorised server routes.
- Shared record links do not grant access.
- Unknown and unauthorised records return non-revealing states.
- Offline mode shows a safe shell and never exposes cached household data.
- Account deletion requires the current password and explicit confirmation.
- Owners cannot strand a household that still has other members.

## Review Notes Draft

HomeVault is a privacy-first household maintenance and records organiser for homeowners and families. It stores user-entered home inventory, upkeep, warranty, reminder, provider and receipt/document information.

The app does not provide budgeting, financial advice, insurance claim automation, advertising, behavioural analytics, AI, OCR, email ingestion, payment processing or public social sharing.

The iOS and Android apps use a Capacitor container around the same server-authorised product. Native behavior includes a privacy cover, protected trusted links, offline-safe fallback, platform navigation and user-initiated sharing of protected record links. Household authorization is always enforced by the server.

Use the supplied synthetic reviewer account. No real household or personal data is required. The reviewer account includes safe sample records that exercise the core workflows. Support, privacy and account-deletion information is publicly available at the URLs above.

## Features That Must Not Be Claimed

- Push or local reminder delivery.
- Offline access to household records.
- OCR, AI classification or automatic extraction.
- Camera capture.
- Email forwarding or ingestion.
- Advanced invitations, role editing or ownership transfer.
- Public attachment or record links.
- Payments, subscriptions, budgeting or financial analysis.
- Insurance claim submission or valuation.
- Behavioural analytics or advertising.

## Attachment Test Material

Use only harmless synthetic files:

- one short PDF manual containing no personal information;
- one JPEG or PNG sample receipt with fictional merchant and address details;
- each file below 4 MB;
- filenames without secrets or real account identifiers.

Confirm upload, authorised download, replacement, removal and account-deletion cleanup. Confirm direct storage URLs are never visible.

## Reviewer Contact And Escalation

Client must add these values in App Store Connect and Play Console:

- review contact name;
- monitored review email;
- review phone number where requested;
- support email;
- legal developer/seller identity.

The engineering repository must not invent these values. Monitor review messages daily while a build is under review and preserve the exact submitted build, metadata and answers for any response.

## Submission Attachments

Before submission, attach or retain:

- signed-build workflow run and commit SHA;
- TestFlight and Play internal-test evidence;
- screenshot set from the submitted build;
- final privacy/data-safety declarations;
- Xcode privacy report and Android merged-manifest review;
- dependency inventory;
- account/export/deletion test evidence;
- release notes;
- any explanation Apple requests for minimum functionality.

## Final Gate

Do not submit until every item in `docs/CLIENT_RELEASE_ACTIONS.md`, `docs/RELEASE_CHECKLIST.md` and `docs/FINAL_ACCEPTANCE_TEST.md` is complete or has an explicit accountable waiver.
