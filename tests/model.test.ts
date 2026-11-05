import assert from "node:assert/strict";
import test from "node:test";
import schema from "../src/appmeta/settings.json" with { type: "json" };
import { AppModel } from "../src/model.ts";
import { schemaDefaults, type Settings } from "../src/lib.ts";
const NOW = 1700000000000;
const make = (values: Settings = {}, saved: Settings = {}, now = NOW) =>
  new AppModel({ ...schemaDefaults(schema.fields), ...values }, saved, now);

test("network failure is unknown rather than offline", () => {
  const a = make();
  a.receive({ live: true, title: "Live show", viewers: 42 }, NOW);
  a.fail("HTTP 503");
  assert.equal(a.view(NOW).value, "UNKNOWN");
});
test("older status cannot override a newer broadcast", () => {
  const a = make();
  a.receive({ live: true, updated_at: NOW }, NOW);
  a.receive({ live: false, updated_at: NOW - 1 }, NOW + 1);
  assert.equal(a.view(NOW + 1).value, "LIVE");
});
