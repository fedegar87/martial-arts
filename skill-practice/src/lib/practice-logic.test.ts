import assert from "node:assert/strict";
import test from "node:test";
import { getTodayPractice } from "./practice-logic.ts";
import type { UserPlanItem } from "./types.ts";

function item(
  id: string,
  status: UserPlanItem["status"],
  lastPracticedAt: string | null = null,
): UserPlanItem & { skill: { discipline: "shaolin" | "taichi" } } {
  return {
    id,
    user_id: "user-1",
    skill_id: id,
    status,
    source: "manual",
    is_hidden: false,
    last_practiced_at: lastPracticedAt,
    added_at: "2026-04-01T00:00:00.000Z",
    skill: { discipline: "shaolin" },
  };
}

test("getTodayPractice keeps all focus and rotates oldest review/maintenance", () => {
  const result = getTodayPractice([
    item("focus-1", "focus"),
    item("review-new", "review", "2026-04-10T00:00:00.000Z"),
    item("review-old", "review", "2026-04-01T00:00:00.000Z"),
    item("review-never", "review", null),
    item("review-extra", "review", "2026-04-02T00:00:00.000Z"),
    item("maintenance-old", "maintenance", "2026-04-01T00:00:00.000Z"),
    item("maintenance-new", "maintenance", "2026-04-10T00:00:00.000Z"),
  ]);

  assert.deepEqual(
    result.focus.map((entry) => entry.id),
    ["focus-1"],
  );
  assert.deepEqual(
    result.review.map((entry) => entry.id),
    ["review-never", "review-old", "review-extra"],
  );
  assert.deepEqual(
    result.maintenance.map((entry) => entry.id),
    ["maintenance-old"],
  );
});

test("getTodayPractice filters by discipline", () => {
  const shaolin = item("shaolin", "focus");
  const taichi = {
    ...item("taichi", "focus"),
    skill: { discipline: "taichi" as const },
  };

  const result = getTodayPractice([shaolin, taichi], "taichi");

  assert.deepEqual(
    result.focus.map((entry) => entry.id),
    ["taichi"],
  );
});
