# UX Information Architecture

## Primary Navigation

- Home
- Vault
- Maintenance
- Warranties
- Receipts
- Settings

## Home

Shows upcoming maintenance, expiring warranties, recently added assets, receipt/document status and inventory summary.

## Vault

Organises rooms, assets, service history and document metadata.

### Phase 1C Vault Routes

- `/vault/rooms`: room list.
- `/vault/rooms/new`: non-saving create room shell.
- `/vault/rooms/[roomId]/edit`: non-saving edit room shell.
- `/vault/assets`: asset list.
- `/vault/assets/new`: non-saving create asset shell.
- `/vault/assets/[assetId]`: asset detail.
- `/vault/assets/[assetId]/edit`: non-saving edit asset shell.

## Maintenance

Shows upcoming tasks, recurring routines, completed records and seasonal checks.

### Phase 1C Maintenance Routes

- `/maintenance`: maintenance task list.
- `/maintenance/[taskId]`: maintenance task detail.

## Warranties

Shows active coverage, expiring warranties and asset links.

### Phase 1C Warranty Routes

- `/warranties`: warranty list.
- `/warranties/[warrantyId]`: warranty detail.

## Receipts

Shows receipt metadata and document categories.

### Phase 1C Receipt/Document Routes

- `/receipts`: metadata-only receipt/document list.
- `/receipts/[recordId]`: metadata-only receipt/document detail.

## Settings

Holds household preferences and future privacy/export controls.

