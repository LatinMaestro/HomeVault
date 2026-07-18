# Client Release Actions

Engineering can continue without these inputs until the matching release gate. Each item requires the client's account ownership, legal identity, payment approval or secret handling and must not be guessed.

## Gate 1: Production Services

Required before live account testing:

- Confirm the Vercel-managed HomeVault Neon default branch is the production database target.
- Create a current Neon restore point.
- Authorise the reviewed Prisma migration deployment.
- Configure a high-entropy `BETTER_AUTH_SECRET`.
- Set `BETTER_AUTH_URL=https://home-vault.vercel.app`.
- Verify a sending domain or address in Resend.
- Configure `AUTH_EMAIL_PROVIDER=resend`, `AUTH_EMAIL_FROM`, `RESEND_API_KEY` and `AUTH_SIGNUP_ENABLED=true`.
- Provision or confirm a Vercel Blob store with **Private** access.
- Configure `BLOB_READ_WRITE_TOKEN` or approved Vercel OIDC access.
- Confirm production and preview variables do not share preview switches or synthetic database targets.

Engineering then applies migrations from a controlled cloud workflow and runs synthetic end-to-end production tests. Vercel builds never apply migrations.

## Gate 2: Public Identity And Legal Copy

Required before public privacy/support publication and store records:

- Choose the legal developer/seller entity.
- Confirm a monitored public support email.
- Confirm business/contact address requirements for the intended markets.
- Approve final privacy policy, retention periods and processor list.
- Approve support response expectations.
- Complete public-name trademark/legal clearance and store-name availability checks.
- Choose final public name if **HomeVault Home Care** is not cleared.
- Confirm initial territories, pricing and category.
- Obtain legal advice where needed; repository drafts are not legal advice.

Engineering then replaces remaining bracketed or preview-stage public copy and verifies all public URLs.

## Gate 3: Apple Developer

Required before signed iOS artifacts:

- Hold active Apple Developer Program membership.
- Reserve `au.com.homevault.app` or approve a replacement before any app record is created.
- Create the App Store Connect app record.
- Confirm the 10-character Apple Team ID.
- Create an Apple Distribution certificate and App Store provisioning profile.
- Store base64 certificate/profile values and password in the protected GitHub `native-release` environment.
- Add `APPLE_TEAM_ID` to Vercel for Universal Links.
- Supply review contact, age-rating, territories, category and export-compliance answers.
- Approve the final Apple App Privacy declaration.

Engineering then creates the signed IPA, verifies Universal Links, runs TestFlight testing and assembles the submission.

## Gate 4: Google Play

Required before signed Android artifacts:

- Hold a verified Google Play Console developer account.
- Create the app record for `au.com.homevault.app` or approve a replacement first.
- Enrol in Play App Signing.
- Create or select the upload keystore.
- Store the keystore, passwords and alias in the protected GitHub `native-release` environment.
- Add the Play app-signing SHA-256 certificate fingerprint to Vercel.
- Supply developer identity, target audience, content rating, category, territories and pricing.
- Approve the final Data safety declaration and account-deletion URL.

Engineering then creates the signed AAB, verifies Android App Links, runs Play internal testing and assembles the submission.

## Gate 5: Final Acceptance

Required only after engineering validation is complete:

- Review the final Vercel production build.
- Test signed iOS and Android internal-distribution builds on at least one representative physical device each.
- Approve screenshots, listing copy and public name.
- Approve the final privacy, support and account-deletion pages.
- Approve public submission.
- Respond to any store-review request that requires legal, identity or account-owner confirmation.

## Secrets Handling

- Enter secrets only in the owning managed service or protected GitHub environment.
- Never send secrets in chat, email, issues, PRs or source files.
- Use distinct production and preview credentials.
- Rotate any credential accidentally exposed.
- Keep signing keys backed up in a client-controlled secure location.
- Do not store signing material on the client's OneDrive development folder.

## Current Blockers

As of 2026-07-19, engineering source and unsigned build foundations are ready. The following are not yet evidenced as live:

- production migration deployment and restore rehearsal;
- verified transactional auth email;
- private Blob lifecycle;
- final legal entity, support contact and retention periods;
- Apple/Google app records and signing credentials;
- signed physical-device and internal-distribution tests.

These are release blockers, not reasons to require local development on the client PC.
