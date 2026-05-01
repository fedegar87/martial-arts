import { Flame, Repeat, Wrench } from "lucide-react";
import { TodaySkillCard } from "@/components/today/TodaySkillCard";
import { TodayEmptyState } from "@/components/today/TodayEmptyState";
import { PLAN_STATUS_VISUALS } from "@/lib/marker-visuals";
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
  const dailyItems = [
    ...session.focus,
    ...session.review,
    ...session.maintenance,
  ];

  if (dailyItems.length === 0) {
    return <TodayEmptyState reason="empty_session" />;
  }

  const doneTodaySkillIds = new Set(
    todayLogs.filter((log) => log.completed).map((log) => log.skill_id),
  );

  const repsByLog = new Map(todayLogs.map((log) => [log.skill_id, log]));

  return (
    <div className="space-y-6">
      {session.focus.length > 0 && (
        <PracticeSection
          icon={<Flame className={`h-4 w-4 ${PLAN_STATUS_VISUALS.focus.textClassName}`} />}
          title={PLAN_STATUS_VISUALS.focus.label}
        >
          {session.focus.map((item) => (
            <TodaySkillCard
              key={item.id}
              skill={item.skill}
              status={item.status}
              alreadyDoneToday={doneTodaySkillIds.has(item.skill.id)}
              repsTarget={
                repsByLog.get(item.skill.id)?.reps_target ?? repsPerForm
              }
              repsDone={repsByLog.get(item.skill.id)?.reps_done ?? 0}
            />
          ))}
        </PracticeSection>
      )}

      {session.review.length > 0 && (
        <PracticeSection
          icon={<Repeat className={`h-4 w-4 ${PLAN_STATUS_VISUALS.review.textClassName}`} />}
          title={PLAN_STATUS_VISUALS.review.label}
        >
          {session.review.map((item) => (
            <TodaySkillCard
              key={item.id}
              skill={item.skill}
              status={item.status}
              alreadyDoneToday={doneTodaySkillIds.has(item.skill.id)}
              repsTarget={
                repsByLog.get(item.skill.id)?.reps_target ?? repsPerForm
              }
              repsDone={repsByLog.get(item.skill.id)?.reps_done ?? 0}
            />
          ))}
        </PracticeSection>
      )}

      {session.maintenance.length > 0 && (
        <PracticeSection
          icon={<Wrench className={`h-4 w-4 ${PLAN_STATUS_VISUALS.maintenance.textClassName}`} />}
          title={PLAN_STATUS_VISUALS.maintenance.label}
        >
          {session.maintenance.map((item) => (
            <TodaySkillCard
              key={item.id}
              skill={item.skill}
              status={item.status}
              alreadyDoneToday={doneTodaySkillIds.has(item.skill.id)}
              repsTarget={
                repsByLog.get(item.skill.id)?.reps_target ?? repsPerForm
              }
              repsDone={repsByLog.get(item.skill.id)?.reps_done ?? 0}
            />
          ))}
        </PracticeSection>
      )}
    </div>
  );
}

function PracticeSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 font-medium">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}
