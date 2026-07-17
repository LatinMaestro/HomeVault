# Risk Register

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Scope creep into uploads, OCR, AI or billing. | Slower delivery and privacy risk. | Enforce phase prompts and review gates. |
| Auth or storage selected too early. | Rework and security risk. | Require explicit client approval. |
| UI feels too complex for beginners. | Lower adoption. | Mobile-first reviews and simple language. |
| Vercel not connected. | No preview review. | Client connects GitHub repo to Vercel using Next.js preset. |
| Data model overbuilt. | Unnecessary complexity. | Start with household assets, warranties, receipts and tasks only. |
| Real household data exposed before authentication. | Serious privacy and security impact. | Keep deployments no-index, use sample/non-sensitive data only, and require auth plus server-side authorization before production data. |
| Browser defaults allow unnecessary capabilities or embedding. | Increased attack surface. | Apply CSP, anti-framing, referrer, MIME and permissions-policy headers across all routes. |
| HomeVault name conflicts with existing store products. | Store reservation, discoverability or legal risk. | Keep as codename until naming clearance; verify both stores and trademarks before bundle IDs and listing assets are finalized. |

