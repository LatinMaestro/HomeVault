import assert from "node:assert/strict";
import test from "node:test";

import { buildSetupSteps } from "../src/lib/setup-guide";

test("setup guide directs an empty household to creation workflows", () => {
  const steps = buildSetupSteps({
    homeName: "",
    suburb: "",
    postcode: "",
    roomCount: 0,
    assetCount: 0,
    taskCount: 0,
    warrantyCount: 0,
    recordCount: 0,
  });

  assert.equal(steps.some((step) => step.complete), false);
  assert.equal(steps.find((step) => step.id === "rooms")?.href, "/vault/rooms/new");
  assert.equal(steps.find((step) => step.id === "maintenance")?.href, "/maintenance/templates");
});

test("setup guide recognises existing household records", () => {
  const steps = buildSetupSteps({
    homeName: "Taylor Family Home",
    suburb: "Carindale",
    postcode: "4152",
    roomCount: 4,
    assetCount: 2,
    taskCount: 1,
    warrantyCount: 1,
    recordCount: 2,
  });

  assert.equal(steps.every((step) => step.complete), true);
  assert.equal(steps.find((step) => step.id === "assets")?.href, "/vault/assets");
  assert.equal(steps.find((step) => step.id === "records")?.href, "/receipts");
});

test("household profile needs a name and location signal", () => {
  const [missingLocation] = buildSetupSteps({
    homeName: "My Home",
    roomCount: 1,
    assetCount: 1,
    taskCount: 1,
    warrantyCount: 1,
    recordCount: 1,
  });

  assert.equal(missingLocation.complete, false);
});
