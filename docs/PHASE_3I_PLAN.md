# Phase 3I: Household Setup Guide

## Status

Complete.

## Goal

Give beginner households a calm path into HomeVault without adding a stored onboarding state or forcing a rigid setup order.

## Delivered

- A fallback-safe `/getting-started` route.
- Six practical steps covering household profile, rooms, assets, maintenance, warranties and records.
- Progress derived from existing household records.
- Creation links for unfinished steps and review links for completed steps.
- Direct dashboard access.
- Unit setup-state contracts and database-free route smoke.
- Mobile-first progress and step presentation.

## Behaviour

HomeVault calculates setup progress at request time. No onboarding flag, profile, analytics event or completion record is stored. Every step uses an existing route and existing guarded persistence behaviour.

## Scope

No schema, mutation, dependency, analytics, account, authentication, notification, upload, storage, AI, OCR, payment or native project is added.
