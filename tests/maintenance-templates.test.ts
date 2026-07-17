import assert from "node:assert/strict";
import test from "node:test";

import {
  applyMaintenanceTemplate,
  getMaintenanceTemplate,
  maintenanceTemplates,
} from "../src/lib/maintenance-templates";

test("maintenance template identifiers and titles are unique", () => {
  assert.equal(new Set(maintenanceTemplates.map((template) => template.id)).size, maintenanceTemplates.length);
  assert.equal(new Set(maintenanceTemplates.map((template) => template.title)).size, maintenanceTemplates.length);
});

test("a known template prefills editable task fields", () => {
  const template = getMaintenanceTemplate("air-conditioner-filters");
  const fields = applyMaintenanceTemplate(
    [
      { label: "Task title", name: "title" },
      { label: "Description", name: "description" },
      { label: "Frequency", name: "frequency" },
      { label: "Task status", name: "status" },
      { label: "Linked asset", name: "assetName", defaultValue: "Existing asset" },
    ],
    template,
  );

  assert.equal(fields.find((field) => field.name === "title")?.defaultValue, template?.title);
  assert.equal(fields.find((field) => field.name === "frequency")?.defaultValue, "QUARTERLY");
  assert.equal(fields.find((field) => field.name === "status")?.defaultValue, "ACTIVE");
  assert.equal(fields.find((field) => field.name === "assetName")?.defaultValue, "Existing asset");
});

test("an unknown template leaves fields unchanged", () => {
  const fields = [{ label: "Task title", name: "title", defaultValue: "Custom task" }];
  assert.deepEqual(applyMaintenanceTemplate(fields, getMaintenanceTemplate("unknown")), fields);
});
