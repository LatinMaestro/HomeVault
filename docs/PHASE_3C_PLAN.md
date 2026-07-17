# Phase 3C: Maintenance Schedule Automation

## Status

Complete.

## Goal

Turn existing maintenance frequency metadata into practical schedule behavior when household work is recorded.

## Delivered

- Pure schedule calculation for every existing maintenance frequency.
- Transactional completion history and task schedule updates.
- Automatic closure of one-off tasks.
- Early-work cadence preservation and overdue-work recovery.
- UTC month-end and leap-year handling.
- Safe behavior for invalid legacy custom intervals.
- Closed-task completion protection.
- Updated completion UI copy and lifecycle state.
- Unit coverage for scheduling edge cases.

## Scheduling Rules

- The anchor is the later of the existing next due date and completion date.
- Weekly, fortnightly and Custom use day intervals.
- Monthly, Quarterly, Six monthly and Yearly use calendar-month arithmetic.
- Calendar dates clamp to the final valid day of the target month.
- Once clears the due date and changes status to Completed.
- Archived and Completed tasks require reactivation before another completion.

## Scope

No notification delivery, background queue, email, push permission, schema, dependency, external service or Vercel review is added.
