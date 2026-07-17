import assert from "node:assert/strict";
import test from "node:test";

import { buildMaintenanceHistoryCsv } from "../src/lib/maintenance-history-csv";

test("maintenance history export creates one row per completion", () => {
  const csv = buildMaintenanceHistoryCsv([
    {
      title: "Service mower",
      assetName: "Battery lawn mower",
      frequency: "SIX_MONTHLY",
      status: "ACTIVE",
      nextDueDate: "15 Oct 2026",
      completions: [
        {
          completedAt: "15 Apr 2026",
          completedBy: "Sam",
          notes: "Checked blade condition",
        },
        {
          completedAt: "15 Oct 2025",
          completedBy: "Sam",
          notes: null,
        },
      ],
    },
  ]);

  assert.ok(csv.startsWith('"Task","Asset","Completed date"'));
  assert.equal(csv.trim().split("\r\n").length, 3);
  assert.ok(csv.includes('"Service mower","Battery lawn mower","15 Apr 2026"'));
  assert.ok(csv.endsWith("\r\n"));
});

test("maintenance history export excludes tasks without completions", () => {
  const csv = buildMaintenanceHistoryCsv([
    {
      title: "Future task",
      frequency: "ONCE",
      status: "ACTIVE",
      completions: [],
    },
  ]);

  assert.equal(csv.trim().split("\r\n").length, 1);
});

test("maintenance history export neutralises spreadsheet formulas", () => {
  const csv = buildMaintenanceHistoryCsv([
    {
      title: "=DANGEROUS()",
      frequency: "ONCE",
      status: "COMPLETED",
      completions: [{ completedAt: "1 Jan 2026" }],
    },
  ]);

  assert.ok(csv.includes('"\'=DANGEROUS()"'));
  assert.ok(!csv.includes('"=DANGEROUS()"'));
});
