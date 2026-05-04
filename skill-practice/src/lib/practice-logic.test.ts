import assert from "node:assert/strict";
import test from "node:test";
import { getTodayPractice } from "./practice-logic.ts";
import type { UserPlanItem } from "./types.ts";

type TestItem = UserPlanItem & { skill: { discipline: "shaolin" | "taichi" } };

function item(
  id: string,
  status: UserPlanItem["status"],
  lastPracticedAt: string | null = null,
): TestItem {
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

test("getTodayPractice keeps all focus and rotates oldest maintenance", () => {
  const result = getTodayPractice([
    item("focus-1", "focus"),
    item("maintenance-old", "maintenance", "2026-04-01T00:00:00.000Z"),
    item("maintenance-new", "maintenance", "2026-04-10T00:00:00.000Z"),
    item("maintenance-never", "maintenance", null),
    item("maintenance-extra", "maintenance", "2026-04-02T00:00:00.000Z"),
    item("maintenance-fifth", "maintenance", "2026-04-05T00:00:00.000Z"),
  ]);

  assert.deepEqual(
    result.focus.map((entry) => entry.id),
    ["focus-1"],
  );
  assert.deepEqual(
    result.maintenance.map((entry) => entry.id),
    ["maintenance-never", "maintenance-old", "maintenance-extra", "maintenance-fifth"],
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

test("non distingue piu' review: tutte le non-focus sono maintenance", () => {
  const items: TestItem[] = [
    item("focus-1", "focus", null),
    item("maint-1", "maintenance", null),
  ];
  const result = getTodayPractice(items);
  assert.deepEqual(
    result.focus.map((i) => i.id),
    ["focus-1"],
  );
  assert.deepEqual(
    result.maintenance.map((i) => i.id),
    ["maint-1"],
  );
  assert.equal("review" in result, false);
});
