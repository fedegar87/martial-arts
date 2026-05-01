import assert from "node:assert/strict";
import test from "node:test";
import { isProfileOnboarded } from "./onboarding-state.ts";

test("isProfileOnboarded: con esame kung fu torna true", () => {
  assert.equal(
    isProfileOnboarded({
      preparing_exam_id: "exam-1",
      preparing_exam_taichi_id: null,
    }),
    true,
  );
});

test("isProfileOnboarded: con esame tai chi torna true", () => {
  assert.equal(
    isProfileOnboarded({
      preparing_exam_id: null,
      preparing_exam_taichi_id: "tc-1",
    }),
    true,
  );
});

test("isProfileOnboarded: plan_mode custom senza esami torna true", () => {
  assert.equal(
    isProfileOnboarded({
      preparing_exam_id: null,
      preparing_exam_taichi_id: null,
      plan_mode: "custom",
    }),
    true,
  );
});

test("isProfileOnboarded: senza esami e senza plan_mode custom torna false", () => {
  assert.equal(
    isProfileOnboarded({
      preparing_exam_id: null,
      preparing_exam_taichi_id: null,
    }),
    false,
  );
});

test("isProfileOnboarded: plan_mode exam senza esami torna false", () => {
  assert.equal(
    isProfileOnboarded({
      preparing_exam_id: null,
      preparing_exam_taichi_id: null,
      plan_mode: "exam",
    }),
    false,
  );
});
