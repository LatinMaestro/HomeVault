# Final Acceptance Test

Run this protocol only after production services, signed internal-distribution builds and final public copy are ready. Use synthetic accounts and files. Record the build SHA, app version, device/OS, tester, timestamp and result for every run.

## Entry Criteria

- Standard CI and Native CI pass for the submitted commit.
- Vercel production deploys that commit successfully.
- Production migrations report current.
- Auth email, private Blob and verified links are configured.
- Signed TestFlight and Google Play internal-test builds are installed.
- Privacy, support and deletion URLs are public.
- Store reviewer account is verified and populated with synthetic data.

## Web And Account

- [ ] Public privacy, support, account-deletion, health, manifest and association URLs respond correctly.
- [ ] Signup requires email verification.
- [ ] Unverified and invalid credentials reveal no household data.
- [ ] Sign-in reaches only the member household.
- [ ] Password recovery is enumeration-safe and the reset link works.
- [ ] Password change requires the current password and revokes other sessions.
- [ ] Sign out other devices ends those sessions.
- [ ] First-home onboarding creates one OWNER membership and is retry-safe.
- [ ] CHILD and GUEST cannot mutate records.
- [ ] Unknown or cross-household IDs do not reveal record existence.

## Core Household Workflows

- [ ] Edit the household profile.
- [ ] Create and edit a room and category.
- [ ] Create and edit an asset with room/category links.
- [ ] Create and edit maintenance, warranty, reminder and provider records.
- [ ] Record maintenance completion and verify recurrence advancement/history.
- [ ] Create and edit receipt/document metadata and linked-record context.
- [ ] Search, filters, archive/recovery, Quick Add and setup guide work.
- [ ] Calendar, printable report and JSON/CSV/ICS exports are accurate and no-store.
- [ ] Empty, error and not-found states are useful and non-revealing.

## Attachments

- [ ] Upload a valid PDF below 4 MB.
- [ ] Upload a valid JPEG or PNG below 4 MB.
- [ ] Reject invalid extension, MIME, signature and oversized files.
- [ ] Authorised download uses a no-store attachment response.
- [ ] Direct object-store URL is never exposed.
- [ ] Replacement removes the prior object.
- [ ] Removal clears metadata and the private object.
- [ ] Another household cannot read or mutate the attachment.
- [ ] Account deletion removes eligible attachment objects or reports cleanup failure.

## iOS Internal Build

- [ ] Fresh install, launch, sign-in and session re-entry work.
- [ ] Safe areas, keyboard, rotation policy and Dynamic Type remain usable.
- [ ] Backgrounding obscures household content.
- [ ] Universal Links and `homevault://` open trusted internal routes.
- [ ] Malformed and external links are rejected or opened safely outside the app.
- [ ] Platform sharing sends only the generic label and protected link.
- [ ] Offline launch and network loss show the safe fallback without cached household records.
- [ ] Attachment upload/download works through the container.
- [ ] Account export and deletion are reachable.
- [ ] Xcode privacy report matches the disclosure matrix.
- [ ] No unexpected permission prompt, crash, placeholder or developer banner appears.

## Android Internal Build

- [ ] Fresh install, launch, sign-in and session re-entry work.
- [ ] Back navigation, keyboard, edge-to-edge and supported screen sizes work.
- [ ] Screenshots/recording and app-switcher exposure match the privacy design.
- [ ] Application data is excluded from backup.
- [ ] App Links and `homevault://` open trusted internal routes.
- [ ] Malformed and external links are rejected or opened safely outside the app.
- [ ] Platform sharing sends only the generic label and protected link.
- [ ] Offline launch and network loss show the safe fallback without cached household records.
- [ ] Attachment upload/download works through the container.
- [ ] Account export and deletion are reachable.
- [ ] Android merged manifest contains no unexpected permission or component.
- [ ] Play pre-launch report has no unresolved crash, accessibility or security issue.

## Accessibility And Presentation

- [ ] Core workflows are keyboard accessible on web.
- [ ] VoiceOver and TalkBack can identify navigation, controls, fields, errors and status.
- [ ] Focus order and visible focus are coherent.
- [ ] Touch targets are at least 44 CSS pixels where applicable.
- [ ] Text remains readable at enlarged system text sizes.
- [ ] Colour is not the only status signal and contrast is adequate.
- [ ] Mobile, tablet and desktop layouts have no overlap, clipping or horizontal scrolling.
- [ ] Store screenshots match the final submitted UI and synthetic data.

## Privacy And Release

- [ ] No real household data appears in review fixtures, logs, screenshots or artifacts.
- [ ] No analytics, advertising, AI/OCR, payment or unapproved integration traffic exists.
- [ ] Apple and Google disclosures match the signed dependency/service inventory.
- [ ] Export and deletion behavior matches public legal copy.
- [ ] Signing artifacts came from the reviewed main commit.
- [ ] Version/build numbers are unique and match store records.
- [ ] Reviewer credentials and notes are complete.
- [ ] Client approves final name, copy, screenshots and submission.

## Exit Rule

A failed security, privacy, authorization, data-loss, crash, attachment or account-lifecycle item blocks release. Cosmetic issues may be waived only with an owner, reason and follow-up date recorded in the release evidence. Never waive inaccurate store disclosures or inaccessible account deletion.
