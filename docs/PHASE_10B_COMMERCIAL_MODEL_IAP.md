# Phase 10B: Commercial Model And IAP Decision Policy

## Status

Dependency-ready policy hardening only. No commercial model has been selected, no price or product has been approved, and no billing SDK, store product, payment provider, entitlement route, schema, migration, credential or production feature is enabled.

## Boundary

HomeVault remains free of advertising, tracking, behavioural analytics, budgeting, valuation, financial advice and automated provider payments. A future subscription may activate only after exact, versioned client, legal, cost, store-policy and privacy approval evidence. The policy supports a separately approved free decision without accepting any store product.

If the client later selects subscriptions:

- digital access uses the approved platform in-app purchase mechanism only;
- an exact store-fetched product must match the approved decision, platform, identifier and version;
- external purchase links remain disabled;
- purchase and restore decisions use server-side store verification, signed-payload checks and exact user/account/product/transaction binding;
- receipts, client booleans and device entitlement state are never treated as authority;
- store notifications are signature-verified, deduplicated and applied with compare-and-set entitlement revisions;
- revoked, refunded, expired, malformed, replayed or substituted evidence fails closed.

## User Rights

Commercial status never blocks privacy/support information, export, account deletion or core household-data readability. Account deletion revokes entitlements and removes HomeVault receipt payloads, transaction mappings, notification payloads, queues, caches, offline/device state and provider-customer mappings through a retryable cleanup ledger.

Platform-managed transaction retention and subscription cancellation remain outside HomeVault's direct control and must be disclosed accurately. HomeVault does not pretend to cancel a store-managed renewal during account cleanup.

## Verification

The focused pure-policy suite covers:

- explicit client/legal/cost/store/privacy gates;
- free versus subscription decisions;
- exact store product and platform binding;
- server receipt verification, replay resistance and account isolation;
- entitlement compare-and-set and verified notification handling;
- protected export/deletion/privacy/support access;
- comprehensive HomeVault-side cleanup.

Standard and native exact-head CI, final store contracts, pricing, product creation, sandbox purchase tests, restore tests, signed builds and physical-device TestFlight checks remain later gates.
