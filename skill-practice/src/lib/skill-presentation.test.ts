import assert from "node:assert/strict";
import test from "node:test";
import { formatEstimatedMinutes, skillItalianSubtitle } from "./skill-presentation.ts";

test("Italian subtitles retain useful translations and omit missing or redundant names", () => {
  assert.equal(skillItalianSubtitle("Shaolin 1 Lu", "Prima sequenza fondamentale"), "Prima sequenza fondamentale");
  for (const italian of [null, "", "  ", "Shaolin 1 Lu", " shaolin 1 lu ", "Forma Shaolin 1 Lu", "Shaolin — 1 Lu"]) {
    assert.equal(skillItalianSubtitle("Shaolin 1 Lu", italian), null);
  }
  assert.equal(skillItalianSubtitle("Tan Tao", "  Sciabola  "), "Sciabola");
});

test("practice duration formatting omits invalid values and never rounds a short practice to zero", () => {
  for (const seconds of [null, 0, -1, NaN, Infinity]) assert.equal(formatEstimatedMinutes(seconds), null);
  assert.equal(formatEstimatedMinutes(1), "< 1 min");
  assert.equal(formatEstimatedMinutes(59), "< 1 min");
  assert.equal(formatEstimatedMinutes(60), "1 min");
  assert.equal(formatEstimatedMinutes(90), "2 min");
});
