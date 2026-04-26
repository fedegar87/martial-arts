import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCurriculumCells,
  buildPracticeCalendar,
  computeBestStreak,
  computeCategoryProgress,
  computeCurrentStreak,
} from "./progress-logic.ts";
import type { Skill } from "./types.ts";

function skill(id: string, minimumGradeValue: number, category: Skill["category"]): Skill {
  return {
    id,
    school_id: "school-1",
    name: id,
    name_italian: null,
    category,
    discipline: "shaolin",
    practice_mode: "solo",
    description: null,
    video_url: "https://www.youtube.com/watch?v=PLACEHOLDER",
    thumbnail_url: null,
    teacher_notes: null,
    estimated_duration_seconds: null,
    minimum_grade_value: minimumGradeValue,
    display_order: 1,
    created_at: "2026-04-01T00:00:00.000Z",
  };
}

test("buildCurriculumCells marks future grades as locked", () => {
  const plan = new Map([["available-skill", "focus" as const]]);
  const cells = buildCurriculumCells(
    [skill("locked-skill", 4, "forme"), skill("available-skill", 7, "forme")],
    plan,
    "shaolin",
    6,
  );

  assert.deepEqual(
    cells.map((cell) => [cell.skill.id, cell.status]),
    [
      ["locked-skill", "locked"],
      ["available-skill", "focus"],
    ],
  );
});

test("computeCategoryProgress groups active curriculum coverage", () => {
  const cells = buildCurriculumCells(
    [
      skill("forme-active", 7, "forme"),
      skill("forme-empty", 7, "forme"),
      skill("weapon", 7, "armi_forma"),
    ],
    new Map([
      ["forme-active", "review" as const],
      ["weapon", "maintenance" as const],
    ]),
    "shaolin",
    7,
  );

  assert.deepEqual(computeCategoryProgress(cells), [
    { label: "Forme", percent: 50 },
    { label: "Armi", percent: 100 },
  ]);
});

test("practice calendar computes current and best streak", () => {
  const today = new Date("2026-04-25T12:00:00.000Z");
  const calendar = buildPracticeCalendar(
    [
      log("2026-04-21"),
      log("2026-04-23"),
      log("2026-04-24"),
      log("2026-04-25"),
    ],
    today,
  );

  assert.equal(computeCurrentStreak(calendar), 3);
  assert.equal(computeBestStreak(calendar), 3);
});

function log(date: string) {
  return {
    id: date,
    user_id: "user-1",
    skill_id: "skill-1",
    date,
    completed: true,
    personal_note: null,
    created_at: `${date}T00:00:00.000Z`,
  };
}
