# Phase 5K: Safe Social Identity Linking

Status: staged contract; production social sign-in and account linking remain disabled.

## Identity Boundary

- HomeVault keeps one immutable internal user ID. A provider identity is an optional sign-in method, never a replacement account.
- Linking starts only inside a verified, signed-in session after credential reconfirmation.
- Apple and Google are the only initially approved providers; each requires a separate provider, privacy and store-disclosure review before enablement.
- Provider email, name or profile claims never merge accounts, select a household or transfer ownership.
- Provider identities are keyed by the provider issuer and stable subject, with a database uniqueness constraint.

## Callback And Takeover Controls

- Generate a short-lived, single-use link request bound to the current user, current session and chosen provider.
- Use provider-standard authorization code flow with verified redirect URI, state, nonce and PKCE.
- Validate issuer, audience, signature, timestamps and stable subject server-side.
- Enforce exact expiry and reject cancelled, superseded, linked or replayed requests.
- If the provider subject already belongs to another HomeVault user, return a generic unavailable result. Never reveal or reassign the other account.
- Complete the provider link and consume the request in one transaction after re-reading the current session and uniqueness constraint.
- Linking cannot change the verified HomeVault email, household roles, property access or recovery destination.

## Unlink And Recovery

- Unlinking requires a current verified session and credential reconfirmation.
- At least one other verified sign-in method must remain, such as password access or another linked provider.
- A user must verify a new recovery method before removing the last existing one.
- Account recovery, verified email change and ownership transfer remain separate workflows.
- Security notifications go to the verified HomeVault address after link or unlink without including household content.

## Privacy And Operations

- Request the minimum provider scopes needed for authentication; do not request contacts, calendar, drive, profile enrichment or advertising permissions.
- Store only provider, stable subject, required token metadata and audit timestamps. Encrypt refresh tokens if a provider flow genuinely requires them; otherwise do not retain them.
- Never log authorization codes, tokens, provider claims or private relay addresses.
- Account export identifies linked providers without exposing secrets. Account deletion removes provider links, tokens, pending requests and processor copies.
- Rate limits and generic errors prevent account/provider enumeration.
- Store privacy disclosures, support guidance and reviewer instructions must be updated before production enablement.

Production integration requires provider-console configuration, reviewed Better Auth integration, migration, concurrent-link, callback substitution, replay, unlink/recovery, export/deletion and exact-head CI/native evidence.
