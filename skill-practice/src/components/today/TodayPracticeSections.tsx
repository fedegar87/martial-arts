import { TodaySkillCard } from "@/components/today/TodaySkillCard";
import { TodayEmptyState } from "@/components/today/TodayEmptyState";
import type { ScheduledSession } from "@/lib/session-scheduler";
import type { PracticeLog } from "@/lib/types";

type TrainingSession = Extract<ScheduledSession, { kind: "training" }>;

type Props = {
  session: TrainingSession;
  todayLogs: PracticeLog[];
  repsPerForm: number;
};

export function TodayPracticeSections({
  session,
  todayLogs,
  repsPerForm,
}: Props) {
  const dailyItems = [...session.focus, ...session.maintenance];

  if (dailyItems.length === 0) {
    return <TodayEmptyState reason="empty_session" />;
  }

  const doneTodaySkillIds = new Set(
    todayLogs.filter((log) => log.completed).map((log) => log.skill_id),
  );

  const repsByLog = new Map(todayLogs.map((log) => [log.skill_id, log]));

  return (
    <div className="space-y-4" aria-label="Forme di oggi">
      {dailyItems.map((item) => (
        <TodaySkillCard
          key={item.id}
          skill={item.skill}
          status={item.status}
          alreadyDoneToday={doneTodaySkillIds.has(item.skill.id)}
          repsTarget={repsByLog.get(item.skill.id)?.reps_target ?? repsPerForm}
          repsDone={repsByLog.get(item.skill.id)?.reps_done ?? 0}
          todayNote={repsByLog.get(item.skill.id)?.personal_note ?? undefined}
        />
      ))}
    </div>
  );
}
