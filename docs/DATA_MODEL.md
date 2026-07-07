# Data Model

Phase 1B adds a PostgreSQL-compatible Prisma schema. The schema is ready for local development and future approved database provisioning, but the app does not connect to a production database during Vercel builds.

## Core Entities

- `User`: future account identity. Production authentication is not implemented.
- `Home`: the household/property context.
- `HouseholdMember`: a user's role in a home.
- `Room`: a room or home zone.
- `AssetCategory`: simple grouping for assets.
- `Asset`: appliance, tool, fixture, equipment or important home item.
- `Warranty`: warranty details linked to an asset.
- `Receipt`: purchase metadata linked to a home and optionally an asset.
- `Document`: metadata for manuals, receipts, warranties, service records and other important records.
- `MaintenanceTask`: recurring or one-off task.
- `MaintenanceCompletion`: completed maintenance event.
- `Reminder`: due-date metadata only; notification delivery is not implemented.
- `ServiceProvider`: local trades or service contacts used by maintenance tasks.

## Relationship Summary

- A `Home` owns rooms, assets, categories, warranties, receipts, documents, reminders, service providers and tasks.
- A `User` joins a `Home` through `HouseholdMember`.
- An `Asset` may belong to a `Room` and `AssetCategory`.
- Warranties, receipts, documents, maintenance tasks and reminders can link back to assets.
- Maintenance completions record completed work against a task and optionally an asset.
- Documents store metadata only and can link to assets, warranties, receipts or maintenance tasks.

## Phase 1 Data Rule

Store metadata first. Do not store production files until the storage approach is approved.

