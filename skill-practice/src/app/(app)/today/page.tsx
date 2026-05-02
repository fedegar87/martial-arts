import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { getUserPlanItems } from "@/lib/queries/plan";
import { getThisWeekLogs } from "@/lib/queries/practice-log";
import { getUnreadNewsCount } from "@/lib/queries/news";
import { getTrainingSchedule } from "@/lib/queries/training-schedule";
import { getScheduledPlanItems, getScheduledSession } from "@/lib/session-scheduler";
import { localDateKey } from "@/lib/date";
import { NewsBanner } from "@/components/news/NewsBanner";
import { RestDayCard } from "@/components/today/RestDayCard";
import { TodayEmptyState } from "@/components/today/TodayEmptyState";
import { TodayPracticeSections } from "@/components/today/TodayPracticeSections";
import { TodaySessionHeader } from "@/components/today/TodaySessionHeader";
import { TodaySessionSummary } from "@/components/today/TodaySessionSummary";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import { gradeLabelForDiscipline } from "@/lib/grades";
import type { PlanMode, TrainingSchedule, UserProfile } from "@/lib/types";

export default async function TodayPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const sourceFilter =
    profile.plan_mode === "custom" ? "manual" : "exam_program";
  const [items, logs, unreadNewsCount, schedule] = await Promise.all([
    getUserPlanItems(profile.id, undefined, sourceFilter),
    getThisWeekLogs(profile.id),
    getUnreadNewsCount(profile),
    getTrainingSchedule(profile.id),
  ]);

  const todayStr = localDateKey();
  const dayName = new Date(`${todayStr}T00:00:00Z`).toLocaleDateString(
    "it-IT",
    { weekday: "long" },
  );
  const gradeSummary = buildGradeSummary(profile);
  const scopeLabel = buildScopeLabel(profile, schedule);
  const todayLogs = logs.filter((log) => log.date === todayStr);

  if (items.length === 0) {
    return (
      <TodayShell
        dayName={dayName}
        planMode={profile.plan_mode}
        gradeSummary={gradeSummary}
        scopeLabel={scopeLabel}
        unreadNewsCount={unreadNewsCount}
      >
        <TodayEmptyState
          reason="no_plan"
          customMode={profile.plan_mode === "custom"}
        />
      </TodayShell>
    );
  }

  if (!schedule) {
    return (
      <TodayShell
        dayName={dayName}
        planMode={profile.plan_mode}
        gradeSummary={gradeSummary}
        scopeLabel={null}
        unreadNewsCount={unreadNewsCount}
      >
        <TodayEmptyState reason="no_schedule" />
      </TodayShell>
    );
  }

  const scheduledItems = getScheduledPlanItems(items, schedule, profile.plan_mode);
  if (scheduledItems.length === 0) {
    return (
      <TodayShell
        dayName={dayName}
        planMode={profile.plan_mode}
        gradeSummary={gradeSummary}
        scopeLabel={scopeLabel}
        unreadNewsCount={unreadNewsCount}
      >
        <TodayEmptyState reason="empty_session" />
      </TodayShell>
    );
  }

  const session = getScheduledSession(todayStr, schedule, scheduledItems);

  if (session.kind === "no_schedule") {
    return (
      <TodayShell
        dayName={dayName}
        planMode={profile.plan_mode}
        gradeSummary={gradeSummary}
        scopeLabel={null}
        unreadNewsCount={unreadNewsCount}
      >
        <TodayEmptyState reason="no_schedule" />
      </TodayShell>
    );
  }

  if (session.kind === "expired") {
    return (
      <TodayShell
        dayName={dayName}
        planMode={profile.plan_mode}
        gradeSummary={gradeSummary}
        scopeLabel={scopeLabel}
        unreadNewsCount={unreadNewsCount}
      >
        <TodayEmptyState reason="expired" />
      </TodayShell>
    );
  }

  if (session.kind === "rest_day") {
    return (
      <TodayShell
        dayName={dayName}
        planMode={profile.plan_mode}
        gradeSummary={gradeSummary}
        scopeLabel={scopeLabel}
        unreadNewsCount={unreadNewsCount}
      >
        <RestDayCard nextTrainingDate={session.nextTrainingDate} />
      </TodayShell>
    );
  }

  const dailyItems = [
    ...session.focus,
    ...session.review,
    ...session.maintenance,
  ];
  const dailyCount = dailyItems.length;
  const completedCount = dailyItems.filter((item) =>
    todayLogs.some((log) => log.skill_id === item.skill_id && log.completed),
  ).length;
  const estimatedMinutes = Math.max(
    1,
    Math.round(
      (dailyItems.reduce(
        (total, item) => total + (item.skill.estimated_duration_seconds ?? 180),
        0,
      ) *
        schedule.reps_per_form) /
        60,
    ),
  );
  const weekDoneCount = new Set(
    logs.filter((log) => log.completed).map((log) => log.date),
  ).size;

  return (
    <TodayShell
      dayName={dayName}
      planMode={profile.plan_mode}
      gradeSummary={gradeSummary}
      scopeLabel={scopeLabel}
      unreadNewsCount={unreadNewsCount}
    >
      <TodaySessionSummary
        exerciseCount={dailyCount}
        completedCount={completedCount}
        estimatedMinutes={estimatedMinutes}
        repsPerForm={schedule.reps_per_form}
        cadenceWeeks={schedule.cadence_weeks}
        weekDoneCount={weekDoneCount}
      />
      <TodayPracticeSections
        session={session}
        todayLogs={todayLogs}
        repsPerForm={schedule.reps_per_form}
      />
    </TodayShell>
  );
}

function TodayShell({
  dayName,
  planMode,
  gradeSummary,
  scopeLabel,
  unreadNewsCount,
  children,
}: {
  dayName: string;
  planMode: PlanMode;
  gradeSummary: string;
  scopeLabel: string | null;
  unreadNewsCount: number;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <TodaySessionHeader
        dayName={dayName}
        planMode={planMode}
        gradeSummary={gradeSummary}
        scopeLabel={scopeLabel}
      />
      <NewsBanner unreadCount={unreadNewsCount} />
      {children}
    </section>
  );
}

function buildScopeLabel(
  profile: UserProfile,
  schedule: TrainingSchedule | null,
): string | null {
  if (!schedule) return null;
  if (profile.plan_mode !== "exam") return null;

  const hasShaolinGrade = profile.assigned_level_shaolin > 0;
  const hasTaichiGrade = profile.assigned_level_taichi > 0;
  if (!hasShaolinGrade || !hasTaichiGrade) return null;

  const disciplines = schedule.exam_disciplines ?? [];
  if (disciplines.length !== 1) return null;

  return `Solo ${DISCIPLINE_LABELS[disciplines[0]]}`;
}

function buildGradeSummary(profile: UserProfile): string {
  const parts = [
    `${DISCIPLINE_LABELS.shaolin} ${gradeLabelForDiscipline(
      "shaolin",
      profile.assigned_level_shaolin,
    )}`,
  ];

  if (profile.assigned_level_taichi > 0) {
    parts.push(
      `${DISCIPLINE_LABELS.taichi} ${gradeLabelForDiscipline(
        "taichi",
        profile.assigned_level_taichi,
      )}`,
    );
  }

  return parts.join(" / ");
}
