# Seed Data

HomeVault includes a canonical Prisma seed for approved development and preview databases.

## Sample Records

- Taylor Family Home in Carindale, Queensland.
- Kitchen, Laundry, Garage and Backyard rooms.
- Appliance, outdoor equipment and tool categories.
- Fisher & Paykel fridge with warranty, receipt and manual metadata.
- Ryobi lawn mower with receipt and maintenance history.
- Air conditioner filter maintenance task and service note.
- Sample Brisbane service providers.
- Reminder records for maintenance and warranty review.

## Repeat-safe Behaviour

The seed first upserts the synthetic Sam Taylor user, then checks whether that user already owns a Taylor Family Home. If it exists, seeding exits successfully without creating another household or duplicating its records.

The seed intentionally does not overwrite an existing demo household. This protects review changes made after the first seed.

## Running The Seed

Normal MVP development uses an approved Codex/cloud or connected Neon environment. With `DATABASE_URL` configured in that approved environment:

```bash
npm run db:seed
```

Local use is optional developer reference only. Never commit a database URL or ask the client to configure a local database for normal review.

Use only synthetic or non-sensitive data until production authentication and server-side authorization are approved.
