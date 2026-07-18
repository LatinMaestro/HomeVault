# Private Attachment Lifecycle

HomeVault document attachments use Vercel Private Blob only. Metadata remains in PostgreSQL and Blob object identifiers are never sent directly to the browser.

## Supported Files

- PDF
- JPEG
- PNG
- Maximum 4 MB per file
- One attachment per Document record in the initial release

HomeVault checks the filename extension, declared media type and leading file signature before upload. This is format validation, not malware scanning. Users should upload only trusted household files.

## Authorisation

- Upload and removal require a verified Better Auth session.
- The user must be an OWNER or ADULT member of the Document's Home.
- Download requires verified membership in the same Home.
- Preview identity never grants attachment access.
- Private Blob URLs and storage keys are not rendered or exported.

## Storage Behaviour

- Objects are written with private access and random suffixes.
- Paths are scoped by Home and Document identifiers.
- Browser downloads are proxied through an authorised no-store route.
- Metadata is committed only after Blob upload succeeds.
- A failed database commit triggers compensating Blob deletion.
- Removal clears the database link before deleting the Blob and restores it if Blob deletion fails.
- Sole-member household account deletion attempts to remove all associated private objects after the database transaction.

## Runtime Gate

Attachments remain unavailable unless production auth, PostgreSQL and private Blob credentials or Vercel OIDC are all available. Builds and sample review do not call Blob.

## Client-owned Setup

Before live attachment testing:

1. Create or connect a Vercel Blob store with **Private** access.
2. Connect it to the HomeVault Vercel project.
3. Prefer the current OIDC connection; otherwise provide `BLOB_READ_WRITE_TOKEN`.
4. Apply reviewed Prisma migrations to the production database.
5. Enable and verify production auth.
6. Test upload, authorised download, removal and account deletion with non-sensitive files.

A Blob store's public/private access mode cannot be changed later, so a public store must not be reused for HomeVault household documents.
