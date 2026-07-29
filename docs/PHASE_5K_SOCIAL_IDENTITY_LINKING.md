# Phase 5K: Safe Social Identity Linking

Status: staged contract; production social sign-in and account linking remain disabled.

## Identity Boundary

- HomeVault keeps one immutable internal user ID. Provider identities are optional sign-in methods, never replacement accounts.
- Linking starts only inside an exactly verified session after credential reconfirmation.
- Apple and Google are the only initially approved providers; each requires separate provider, privacy and store review before enablement.
- Provider email, profile or name claims never merge accounts, select households, change the verified HomeVault email or transfer ownership.
- Provider identities are uniquely keyed by approved provider issuer and stable subject.

## Bound Callback And Takeover Controls

- Each short-lived request binds canonical request, user, initiating-session, provider, state, nonce and PKCE challenge identifiers.
- Callback evidence must repeat those exact bindings and independently verify state, nonce, PKCE, issuer, audience, signature and token timestamps.
- Every verification result must be the exact server boolean `true`; truthy runtime values fail closed.
- Unknown providers, malformed identifiers, consumed state, invalid dates, expired or terminal requests and callback substitutions fail closed.
- Existing-link evidence must match the exact provider and subject before the policy returns already-linked or generic unavailable.
- The atomic allow plan consumes the request while preserving the internal user and verified email, explicitly prohibiting email-based merge or identity reassignment.

## Unlink And Recovery

- Unlinking requires the exact current user, verified session, verified HomeVault email and credential reconfirmation.
- A count is insufficient: one alternate sign-in method must be bound to the same user and independently verified.
- The unlink allow plan preserves the user, revokes sessions authenticated through the removed provider and notifies the verified HomeVault email.
- Account recovery, verified email change and ownership transfer remain separate workflows.

## Privacy And Operations

- Request only authentication scopes; never request contacts, calendar, drive, profile enrichment or advertising permissions.
- Store only provider, stable subject, required token metadata and audit timestamps.
- Never log authorization codes, tokens, provider claims or private relay addresses.
- Export identifies providers without secrets; deletion removes links, tokens, requests, sessions and processor copies.
- Rate limits and generic errors prevent account/provider enumeration.

Production integration still requires provider-console configuration, reviewed Better Auth integration, migration, concurrent-link and substitution tests, replay/unlink/recovery coverage, export/deletion verification, exact-head standard/native CI and client approval.
