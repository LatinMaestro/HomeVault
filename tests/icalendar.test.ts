import assert from "node:assert/strict";
import test from "node:test";

import { buildHouseholdCalendar } from "../src/lib/icalendar";

test("calendar export emits portable all-day events with escaped text", () => {
  const calendar = buildHouseholdCalendar(
    [
      {
        id: "maintenance/filter-check",
        title: "Check filters, vents",
        detail: "Clean; inspect\nRecord result",
        dateInput: "2026-08-31",
      },
    ],
    new Date("2026-07-17T03:00:00.000Z"),
  );

  assert.ok(calendar.startsWith("BEGIN:VCALENDAR\r\n"));
  assert.ok(calendar.endsWith("END:VCALENDAR\r\n"));
  assert.ok(calendar.includes("UID:maintenance-filter-check@homevault\r\n"));
  assert.ok(calendar.includes("DTSTAMP:20260717T030000Z\r\n"));
  assert.ok(calendar.includes("DTSTART;VALUE=DATE:20260831\r\n"));
  assert.ok(calendar.includes("SUMMARY:Check filters\\, vents\r\n"));
  assert.ok(calendar.includes("DESCRIPTION:Clean\\; inspect\\nRecord result\r\n"));
});

test("calendar export omits impossible dates", () => {
  const calendar = buildHouseholdCalendar(
    [
      {
        id: "bad-date",
        title: "Invalid",
        detail: "Should not export",
        dateInput: "2027-02-29",
      },
      {
        id: "good-date",
        title: "Valid",
        detail: "Should export",
        dateInput: "2028-02-29",
      },
    ],
    new Date("2026-07-17T03:00:00.000Z"),
  );

  assert.ok(!calendar.includes("bad-date"));
  assert.ok(calendar.includes("good-date@homevault"));
  assert.equal((calendar.match(/BEGIN:VEVENT/g) ?? []).length, 1);
});
