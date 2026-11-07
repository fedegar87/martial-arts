import { ResetScheduleSection } from "@/components/sessions/ResetScheduleSection";
import { SetupForm } from "@/components/sessions/SetupForm";
import { getUserPlanItems } from "@/lib/queries/plan";
import { getTrainingSchedule } from "@/lib/queries/training-schedule";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import type { Discipline } from "@/lib/types";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function SetupPage() {
  const tr = await getTranslations("ui");
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const sourceFilter =
    profile.plan_mode === "custom" ? "manual" : "exam_program";
  const [schedule, items] = await Promise.all([
    getTrainingSchedule(profile.id),
    getUserPlanItems(profile.id, undefined, sourceFilter),
  ]);
  const disciplineCounts = countByDiscipline(items);

  const programLabel =
    profile.plan_mode === "custom"
      ? tr("customExerciseCount", { p0: items.length })
      : tr("examExerciseCount", { p0: items.length });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{tr("setupTraining")}</h1>
        <p className="text-muted-foreground text-sm">
          {tr("setupDescription")}
        </p>
      </header>
      <SetupForm
        current={schedule}
        programLabel={programLabel}
        planMode={profile.plan_mode}
        disciplineCounts={disciplineCounts}
        items={items}
      />
      {schedule && <ResetScheduleSection />}
    </div>
  );
}

function countByDiscipline(
  items: Array<{ skill: { discipline: Discipline } }>,
): Record<Discipline, number> {
  return items.reduce<Record<Discipline, number>>(
    (counts, item) => {
      counts[item.skill.discipline] += 1;
      return counts;
    },
    { shaolin: 0, taichi: 0 },
  );
}
