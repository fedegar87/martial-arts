import assert from "node:assert/strict";
import test from "node:test";
import { resolveLandingDestination } from "./landing.ts";

test("resolveLandingDestination: senza profilo torna /login", () => {
  assert.equal(resolveLandingDestination(null), "/login");
});

test("resolveLandingDestination: profilo senza esami torna /onboarding", () => {
  const profile = {
    preparing_exam_id: null,
    preparing_exam_taichi_id: null,
  };
  assert.equal(resolveLandingDestination(profile), "/onboarding");
});

test("resolveLandingDestination: profilo con kung fu exam torna /today", () => {
  const profile = {
    preparing_exam_id: "exam-1",
    preparing_exam_taichi_id: null,
  };
  assert.equal(resolveLandingDestination(profile), "/today");
});

test("resolveLandingDestination: profilo con tai chi exam torna /today", () => {
  const profile = {
    preparing_exam_id: null,
    preparing_exam_taichi_id: "tc-1",
  };
  assert.equal(resolveLandingDestination(profile), "/today");
});
