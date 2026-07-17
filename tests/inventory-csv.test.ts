import assert from "node:assert/strict";
import test from "node:test";

import { buildInventoryCsv } from "../src/lib/inventory-csv";

test("inventory export quotes fields and preserves record counts", () => {
  const csv = buildInventoryCsv([
    {
      name: 'Fridge, "Main"',
      categoryName: "Appliances",
      roomName: "Kitchen",
      brand: "Example",
      model: "Cool 2",
      serialNumber: "ABC-123",
      status: "ACTIVE",
      purchaseDate: "14 Mar 2024",
      purchasePlace: "Local store",
      warranties: [{}],
      receipts: [{}, {}],
      documents: [],
    },
  ]);

  assert.ok(csv.startsWith('"Asset","Category","Room"'));
  assert.ok(csv.includes('"Fridge, ""Main"""'));
  assert.ok(csv.includes('"1","2","0"'));
  assert.ok(csv.endsWith("\r\n"));
});

test("inventory export neutralises spreadsheet formulas", () => {
  const csv = buildInventoryCsv([
    {
      name: '=HYPERLINK("https://example.invalid")',
      warranties: [],
      receipts: [],
      documents: [],
    },
  ]);

  assert.ok(csv.includes("\"'=HYPERLINK(\"\"https://example.invalid\"\")\""));
  assert.ok(!csv.includes("\"=HYPERLINK"));
});
