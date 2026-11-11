import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCalendarDayView,
  buildCalendarDayViewsInRange,
  categorizeLogsForDay,
  isMeaningfulLog,
} from "./calendar-logic.ts";
import type { ItemWithSkill } from "./session-scheduler.ts";
import { listSessionsInRange } from "./session-scheduler.ts";
import { buildSessionPeriodProgress } from "./session-progress.ts";
import type { PracticeLog, Skill, TrainingSchedule } from "./types.ts";

function skill(id: string, over: Partial<Skill> = {}): Skill {
  return {
    id,
    school_id: "school-1",
    name: id,
    name_italian: null,
    category: "forme",
    discipline: "shaolin",
    practice_mode: "solo",
    description: null,
    video_url: "",
    video_label: null,
    secondary_video_url: null,
    secondary_video_label: null,
    thumbnail_url: null,
    teacher_notes: null,
    estimated_duration_seconds: 180,
    minimum_grade_value: 1,
    is_extra: false,
    display_order: 0,
    created_at: "2026-05-01T00:00:00.000Z",
    ...over,
  };
}

function item(
  id: string,
  status: "focus" | "maintenance" = "focus",
  over: Partial<Skill> = {},
): ItemWithSkill {
  return {
    id: `plan-${id}`,
    user_id: "user-1",
    skill_id: id,
    status,
    source: "manual",
    is_hidden: false,
    last_practiced_at: null,
    added_at: "2026-05-01T00:00:00.000Z",
    skill: skill(id, over),
  };
}

function log(
  date: string,
  skillId: string,
  over: Partial<PracticeLog> = {},
): PracticeLog {
  return {
    id: `${date}-${skillId}`,
    user_id: "user-1",
    skill_id: skillId,
    date,
    completed: false,
    personal_note: null,
    reps_target: null,
    reps_done: 0,
    created_at: `${date}T00:00:00.000Z`,
    ...over,
  };
}

test("isMeaningfulLog ignores empty inactive logs", () => {
  assert.equal(isMeaningfulLog(log("2026-05-04", "a")), false);
  assert.equal(
    isMeaningfulLog(log("2026-05-04", "a", { completed: true })),
    true,
  );
  assert.equal(
    isMeaningfulLog(log("2026-05-04", "a", { reps_done: 1 })),
    true,
  );
  assert.equal(
    isMeaningfulLog(log("2026-05-04", "a", { personal_note: "nota" })),
    true,
  );
});

test("calendar ranges reject invalid dates and stop at the last supported date", () => {
  const input = {
    rows: [], logs: [], skillById: new Map(), todayKey: "9999-12-31",
    repsPerForm: 3, hasSchedule: false, scheduleStart: null, scheduleEnd: null,
  };
  assert.deepEqual(buildCalendarDayViewsInRange("invalid", "2026-05-01", input), []);
  assert.deepEqual(buildCalendarDayViewsInRange("2026-05-01", "2026-02-30", input), []);
  assert.deepEqual(buildCalendarDayViewsInRange("2026-05-02", "2026-05-01", input), []);
  assert.deepEqual(buildCalendarDayViewsInRange("9999-12-30", "9999-12-31", input).map((day) => day.date), ["9999-12-30", "9999-12-31"]);
});

test("categorizeLogsForDay separates scheduled and free practice", () => {
  const result = categorizeLogsForDay({
    scheduledSkillIds: new Set(["scheduled"]),
    logs: [
      log("2026-05-04", "scheduled", { reps_done: 1 }),
      log("2026-05-04", "free", { completed: true }),
    ],
  });

  assert.equal(result.scheduledLogs.get("scheduled")?.reps_done, 1);
  assert.deepEqual(
    result.freePracticeLogs.map((entry) => entry.skill_id),
    ["free"],
  );
});

test("buildCalendarDayView attaches scheduled logs and free practice", () => {
  const scheduled = item("scheduled", "focus");
  const free = skill("free", { name_italian: "Libera" });
  const view = buildCalendarDayView("2026-05-04", {
    row: {
      date: "2026-05-04",
      session: {
        kind: "training",
        sessionIndex: 2,
        focus: [scheduled],
        maintenance: [],
      },
    },
    logs: [
      log("2026-05-04", "scheduled", {
        completed: true,
        reps_target: 3,
        reps_done: 3,
      }),
      log("2026-05-04", "free", {
        completed: true,
        personal_note: "extra",
      }),
    ],
    skillById: new Map([[free.id, free]]),
    todayKey: "2026-05-05",
    repsPerForm: 3,
    hasSchedule: true,
    scheduleStart: "2026-05-01",
    scheduleEnd: "2026-05-31",
  });

  assert.equal(view.sessionKind, "training");
  assert.equal(view.sessionIndex, 2);
  assert.equal(view.scheduled[0].done, true);
  assert.equal(view.scheduled[0].repsDone, 3);
  assert.equal(view.freePractice[0].skill.name_italian, "Libera");
  assert.equal(view.freePractice[0].hasNote, true);
});

test("buildCalendarDayViewsInRange includes days without schedule rows", () => {
  const free = skill("free");
  const views = buildCalendarDayViewsInRange("2026-05-04", "2026-05-06", {
    rows: [
      {
        date: "2026-05-04",
        session: {
          kind: "rest_day",
          nextTrainingDate: "2026-05-06",
        },
      },
    ],
    logs: [log("2026-05-05", "free", { completed: true })],
    skillById: new Map([[free.id, free]]),
    todayKey: "2026-05-05",
    repsPerForm: 3,
    hasSchedule: true,
    scheduleStart: "2026-05-01",
    scheduleEnd: "2026-05-31",
  });

  assert.equal(views.length, 3);
  assert.equal(views[1].sessionKind, "no_schedule");
  assert.equal(views[1].freePractice.length, 1);
  assert.equal(views[2].canToggle, false);
});

test("calendar preserves each saved repetition target when the schedule target changes", () => {
  const date = "2026-05-04";
  for (const currentTarget of [1, 3, 5, 10]) {
    for (const savedTarget of [1, 3, 5, 10]) {
      const focus = item("focus", "focus");
      const maintenance = item("maintenance", "maintenance", { discipline: "taichi" });
      const view = buildCalendarDayView(date, {
        row: { date, session: { kind: "training", sessionIndex: 0, focus: [focus], maintenance: [maintenance] } },
        logs: [log(date, "focus", { reps_target: savedTarget, reps_done: 1, completed: savedTarget === 1 })],
        skillById: new Map(),
        todayKey: date,
        repsPerForm: currentTarget,
        hasSchedule: true,
        scheduleStart: date,
        scheduleEnd: "2026-05-31",
      });

      assert.equal(view.scheduled[0].repsTarget, savedTarget);
      assert.equal(view.scheduled[0].repsDone, 1);
      assert.equal(view.scheduled[0].done, savedTarget === 1);
      assert.equal(view.scheduled[1].repsTarget, currentTarget);
      assert.equal(view.scheduled[1].repsDone, 0);
      assert.equal(view.scheduled[1].status, "maintenance");
    }
  }
});

test("calendar keeps a saved repetition target after all repetitions were undone", () => {
  const date = "2026-05-04";
  const focus = item("focus");
  const view = buildCalendarDayView(date, {
    row: { date, session: { kind: "training", sessionIndex: 0, focus: [focus], maintenance: [] } },
    logs: [
      log(date, "focus", { reps_target: 3, reps_done: 0 }),
      log(date, "empty-free", { reps_target: 3, reps_done: 0 }),
    ],
    skillById: new Map([["empty-free", skill("empty-free")]]),
    todayKey: date,
    repsPerForm: 10,
    hasSchedule: true,
    scheduleStart: date,
    scheduleEnd: "2026-05-31",
  });

  assert.equal(view.scheduled[0].repsTarget, 3);
  assert.equal(view.scheduled[0].repsDone, 0);
  assert.equal(view.scheduled[0].done, false);
  assert.equal(view.freePractice.length, 0);
});

test("changing repetitions scales cycle workload without changing scheduled forms", () => {
  const items = [
    item("focus-shaolin", "focus"),
    item("focus-taichi", "focus", { discipline: "taichi" }),
    item("maintenance-shaolin", "maintenance"),
    item("maintenance-taichi", "maintenance", { discipline: "taichi" }),
  ];

  for (const cadence of [1, 2, 4] as const) {
    let baseline: string[][] | undefined;
    for (const reps of [1, 3, 5, 10]) {
      const start = "2026-05-04";
      const end = cadence === 1 ? "2026-05-10" : cadence === 2 ? "2026-05-17" : "2026-05-31";
      const schedule: TrainingSchedule = {
        user_id: "user-1", weekdays: [1, 3, 5], cadence_weeks: cadence,
        reps_per_form: reps, exam_disciplines: ["shaolin", "taichi"],
        start_date: start, end_date: end,
        created_at: "2026-05-01T00:00:00.000Z", updated_at: "2026-05-01T00:00:00.000Z",
      };
      const rows = listSessionsInRange(start, end, schedule, items);
      const training = rows.filter((row) => row.session.kind === "training");
      const composition = training.map((row) => row.session.kind === "training"
        ? [...row.session.focus, ...row.session.maintenance].map((entry) => entry.skill_id)
        : []);
      if (baseline === undefined) baseline = composition;
      assert.deepEqual(composition, baseline);

      const logs = training.flatMap((row) => row.session.kind === "training"
        ? [...row.session.focus, ...row.session.maintenance].map((entry) => log(row.date, entry.skill_id, {
          reps_target: reps, reps_done: reps, completed: true,
        }))
        : []);
      const summary = buildSessionPeriodProgress({
        rows, logs, from: start, to: end, repsPerForm: reps,
        today: new Date(2026, 5, 1, 12),
      });

      assert.equal(summary.exerciseTotal, 6);
      assert.equal(summary.exerciseCompleted, 6);
      assert.equal(summary.repsTarget, 6 * reps);
      assert.equal(summary.repsDone, 6 * reps);
      assert.equal(summary.completionPercent, 100);
    }
  }
});

test("progress counts saved targets, partial work and only logs for the scheduled date", () => {
  const date = "2026-05-04";
  const focus = item("focus", "focus");
  const maintenance = item("maintenance", "maintenance", { category: "armi_forma" });
  const technique = item("technique", "maintenance", { category: "tui_fa" });
  const rows = [{
    date,
    session: { kind: "training" as const, sessionIndex: 0, focus: [focus], maintenance: [maintenance, technique] },
  }];

  for (const currentTarget of [1, 3, 5, 10]) {
    const summary = buildSessionPeriodProgress({
      rows, from: date, to: date, repsPerForm: currentTarget,
      today: new Date(2026, 4, 5, 12),
      logs: [
        log(date, "focus", { reps_target: 3, reps_done: 3, completed: true }),
        log(date, "maintenance", { reps_target: 5, reps_done: 2 }),
        log(date, "technique", { completed: true }),
        log(date, "free", { reps_target: 10, reps_done: 10, completed: true }),
        log("2026-05-03", "maintenance", { reps_target: 5, reps_done: 5, completed: true }),
      ],
    });

    assert.equal(summary.repsTarget, 8);
    assert.equal(summary.repsDone, 5);
    assert.equal(summary.exerciseTotal, 3);
    assert.equal(summary.exerciseCompleted, 2);
    assert.equal(summary.completionPercent, 67);
    assert.equal(summary.rows[0].focusCompleted, 1);
    assert.equal(summary.rows[0].maintenanceCompleted, 1);
    assert.equal(summary.rows[0].status, "partial");
  }
});

test("calendar keeps past practice when a changed plan no longer schedules that form", () => {
  const date = "2026-05-04";
  const previouslyScheduled = skill("old-form");
  const view = buildCalendarDayView(date, {
    row: { date, session: { kind: "rest_day", nextTrainingDate: "2026-05-06" } },
    logs: [log(date, "old-form", { reps_target: 3, reps_done: 2 })],
    skillById: new Map([[previouslyScheduled.id, previouslyScheduled]]),
    todayKey: "2026-05-05", repsPerForm: 10,
    hasSchedule: true, scheduleStart: date, scheduleEnd: "2026-05-31",
  });

  assert.equal(view.scheduled.length, 0);
  assert.equal(view.freePractice.length, 1);
  assert.equal(view.freePractice[0].log.reps_target, 3);
  assert.equal(view.freePractice[0].log.reps_done, 2);
  assert.equal(view.freePractice[0].canToggle, true);
});
