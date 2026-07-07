# Data Model

This is a proposed model only. No production database is implemented in Phase 1A.

## Proposed Entities

- `Household`: the single home context.
- `Room`: a room or home zone.
- `Asset`: appliance, tool, fixture, equipment or important home item.
- `Warranty`: warranty details linked to an asset.
- `Receipt`: purchase metadata linked to an asset or document.
- `MaintenanceTask`: recurring or one-off task.
- `ServiceRecord`: completed maintenance or repair.
- `Document`: metadata for manuals, receipts or important records.
- `Category`: simple grouping for assets and documents.

## Phase 1 Data Rule

Store metadata first. Do not store production files until the storage approach is approved.

