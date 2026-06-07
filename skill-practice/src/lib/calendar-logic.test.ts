import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCalendarDayView,
  buildCalendarDayViewsInRange,
  categorizeLogsForDay,
  isMeaningfulLog,
} from "./calendar-logic.ts";
import type { ItemWithSkill } from "./session-scheduler.ts";
import type { PracticeLog, Skill } from "./types.ts";

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
