import assert from "node:assert/strict";
import test from "node:test";
import {
  activePlanSource,
  buildCurriculumCells,
  buildPracticeCalendar,
  computeBestStreakFromLogs,
  computeBestStreak,
  computeCurrentStreakFromLogs,
  computeCurrentStreak,
  computePlanProgress,
  countPracticeDays,
  countPracticedSkills,
  countGlobalFormReps,
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

test("computePlanProgress counts partial repetition logs as practice", () => {
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
    logs: [
      log("2026-04-28", "form", { completed: false, repsDone: 1 }),
    ],
    today: new Date("2026-05-01T12:00:00.000Z"),
  });

  assert.equal(progress.practicedRecent, 1);
  assert.equal(progress.practicedTotal, 1);
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

test("practice activity metrics count partial reps but not notes alone", () => {
  const logs = [
    log("2026-04-21", "form", { completed: false, repsDone: 1 }),
    log("2026-04-21", "kick", { completed: false, repsDone: 0 }),
    log("2026-04-22", "kick"),
  ];
  const calendar = buildPracticeCalendar(logs, new Date("2026-04-22T12:00:00.000Z"));

  assert.equal(countPracticeDays(logs), 2);
  assert.equal(countPracticedSkills(logs), 2);
  assert.deepEqual(calendar.slice(-2), [
    { date: "2026-04-21", practiced: true },
    { date: "2026-04-22", practiced: true },
  ]);
});

test("historical streaks are computed from all practice activity logs", () => {
  const logs = [
    log("2025-12-01"),
    log("2025-12-02"),
    log("2025-12-03"),
    log("2026-04-24", "form", { completed: false, repsDone: 1 }),
  ];
  const today = new Date("2026-04-25T12:00:00.000Z");

  assert.equal(computeCurrentStreakFromLogs(logs, today), 1);
  assert.equal(computeBestStreakFromLogs(logs), 3);
});

test("countGlobalFormReps sums all form repetition logs", () => {
  const skills = [
    skill("empty-hand-form", 7, "forme"),
    skill("weapon-form", 7, "armi_forma"),
    skill("kick", 7, "tui_fa"),
  ];

  assert.equal(
    countGlobalFormReps(skills, [
      { skill_id: "empty-hand-form", reps_done: 3 },
      { skill_id: "weapon-form", reps_done: 2 },
      { skill_id: "kick", reps_done: 10 },
      { skill_id: "unknown", reps_done: 4 },
      { skill_id: "empty-hand-form", reps_done: null },
    ]),
    5,
  );
});

test("practice calendar marks days without practice as practiced=false", () => {
  const today = new Date("2026-04-25T12:00:00.000Z");
  const calendar = buildPracticeCalendar([log("2026-04-25")], today);

  assert.equal(calendar.length, 90);
  assert.equal(calendar.at(-1)?.practiced, true);
  assert.equal(calendar.at(-2)?.practiced, false);
});

function log(
  date: string,
  skillId = "skill-1",
  options: { completed?: boolean; repsDone?: number } = {},
) {
  return {
    id: date,
    user_id: "user-1",
    skill_id: skillId,
    date,
    completed: options.completed ?? true,
    personal_note: null,
    reps_target: null,
    reps_done: options.repsDone ?? 0,
    created_at: `${date}T00:00:00.000Z`,
  };
}
