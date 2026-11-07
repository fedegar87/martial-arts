import { disciplineLabel } from "@/lib/labels";

import { NewsBanner } from "@/components/news/NewsBanner";
import { TrainingReminderPrompt } from "@/components/pwa/TrainingReminderPrompt";
import { RestDayCard } from "@/components/today/RestDayCard";
import { TodayEmptyState } from "@/components/today/TodayEmptyState";
import { TodayPracticeSections } from "@/components/today/TodayPracticeSections";
import { TodaySessionHeader } from "@/components/today/TodaySessionHeader";
import { TodaySessionSummary } from "@/components/today/TodaySessionSummary";
import { localDateKey } from "@/lib/date";
import { gradeLabelForDiscipline } from "@/lib/grades";
import type { UiTranslator } from "@/lib/i18n/config";
import { timed } from "@/lib/perf";
import { getUnreadNewsCount } from "@/lib/queries/news";
import { getUserPlanItems } from "@/lib/queries/plan";
import { getThisWeekLogs } from "@/lib/queries/practice-log";
import { getTrainingReminderSettings } from "@/lib/queries/push-notifications";
import { getTrainingSchedule } from "@/lib/queries/training-schedule";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import {
  getScheduledPlanItems,
  getScheduledSession,
} from "@/lib/session-scheduler";
import type { PlanMode, TrainingSchedule, UserProfile } from "@/lib/types";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function TodayPage() {
  const tr = await getTranslations("ui");
  const profile = await timed("today.profile", () => getCurrentProfile());
  if (!profile) redirect("/login");

  const sourceFilter =
    profile.plan_mode === "custom" ? "manual" : "exam_program";
  const pushVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
  const pushEnabled = Boolean(pushVapidKey);
  const [items, logs, unreadNewsCount, schedule, reminderSettings] =
    await Promise.all([
      timed("today.plan_items", () =>
        getUserPlanItems(profile.id, undefined, sourceFilter),
      ),
      timed("today.week_logs", () => getThisWeekLogs(profile.id)),
      timed("today.unread_news", () => getUnreadNewsCount(profile)),
      timed("today.schedule", () => getTrainingSchedule(profile.id)),
      pushEnabled
        ? timed("today.reminders", () =>
            getTrainingReminderSettings(profile.id),
          )
        : Promise.resolve(null),
    ]);

  const todayStr = localDateKey();
  const dayName = new Date(`${todayStr}T00:00:00Z`).toLocaleDateString(
    tr("locale"),
    { weekday: "long" },
  );
  const gradeSummary = buildGradeSummary(tr, profile);
  const scopeLabel = buildScopeLabel(tr, profile, schedule);
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

  const scheduledItems = getScheduledPlanItems(
    items,
    schedule,
    profile.plan_mode,
  );
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

  const dailyItems = [...session.focus, ...session.maintenance];
  const dailyCount = dailyItems.length;
  const completedCount = dailyItems.filter((item) =>
    todayLogs.some((log) => log.skill_id === item.skill_id && log.completed),
  ).length;
  const weekDoneCount = new Set(
    logs
      .filter((log) => log.completed || log.reps_done > 0)
      .map((log) => log.date),
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
        repsPerForm={schedule.reps_per_form}
        cadenceWeeks={schedule.cadence_weeks}
        weekDoneCount={weekDoneCount}
      />
      {pushEnabled && reminderSettings && completedCount < dailyCount && (
        <TrainingReminderPrompt
          settings={reminderSettings}
          publicVapidKey={pushVapidKey}
          exerciseCount={dailyCount - completedCount}
        />
      )}
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
  tr: UiTranslator,
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

  return tr("onlyDiscipline", { p0: disciplineLabel(disciplines[0], tr) });
}

function buildGradeSummary(tr: UiTranslator, profile: UserProfile): string {
  const parts = [
    `${disciplineLabel("shaolin", tr)} ${gradeLabelForDiscipline(
      "shaolin",
      profile.assigned_level_shaolin,
      tr,
    )}`,
  ];

  if (profile.assigned_level_taichi > 0) {
    parts.push(
      `${disciplineLabel("taichi", tr)} ${gradeLabelForDiscipline(
        "taichi",
        profile.assigned_level_taichi,
        tr,
      )}`,
    );
  }

  return parts.join(" / ");
}
