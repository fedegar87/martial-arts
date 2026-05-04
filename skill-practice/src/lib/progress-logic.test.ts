import assert from "node:assert/strict";
import test from "node:test";
import {
  activePlanSource,
  buildCurriculumCells,
  buildPracticeCalendar,
  computeBestStreak,
  computeCurrentStreak,
  computePlanProgress,
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

test("buildCurriculumCells keeps active next-grade plan items unlocked", () => {
  const cells = buildCurriculumCells(
    [skill("next-exam-skill", 7, "forme")],
    new Map([["next-exam-skill", "focus" as const]]),
    "shaolin",
    8,
  );

  assert.equal(cells[0].status, "focus");
});

test("activePlanSource follows the same active plan rule as the app", () => {
  assert.equal(activePlanSource("custom"), "manual");
  assert.equal(activePlanSource("exam"), "exam_program");
});

test("computePlanProgress is not complete just because an exam plan exists", () => {
  const requiredSkills = [
    skill("form", 7, "forme"),
    skill("kick", 7, "tui_fa"),
  ];
  const progress = computePlanProgress({
    discipline: "shaolin",
    mode: "exam",
    title: "Shaolin 7 Chi",
    requiredSkills,
    planBySkillId: new Map([
      ["form", "focus" as const],
      ["kick", "focus" as const],
    ]),
    logs: [],
    today: new Date("2026-05-01T12:00:00.000Z"),
  });

  assert.equal(progress.covered, 2);
  assert.equal(progress.total, 2);
  assert.equal(progress.practicedRecent, 0);
  assert.equal(progress.readinessPercent, 34);
});

test("computePlanProgress rewards recent practice and mature statuses", () => {
  const requiredSkills = [
    skill("form", 7, "forme"),
    skill("kick", 7, "tui_fa"),
  ];
  const progress = computePlanProgress({
    discipline: "shaolin",
    mode: "exam",
    title: "Shaolin 7 Chi",
    requiredSkills,
    planBySkillId: new Map([
      ["form", "maintenance" as const],
      ["kick", "maintenance" as const],
    ]),
    logs: [
      log("2026-04-28", "form"),
      log("2026-03-10", "kick"),
    ],
    today: new Date("2026-05-01T12:00:00.000Z"),
  });

  assert.equal(progress.practicedRecent, 1);
  assert.equal(progress.practicedTotal, 2);
  assert.equal(progress.readinessPercent, 80);
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

function log(date: string, skillId = "skill-1") {
  return {
    id: date,
    user_id: "user-1",
    skill_id: skillId,
    date,
    completed: true,
    personal_note: null,
    reps_target: null,
    reps_done: 0,
    created_at: `${date}T00:00:00.000Z`,
  };
}
