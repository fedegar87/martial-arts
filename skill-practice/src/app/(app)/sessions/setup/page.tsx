import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { getTrainingSchedule } from "@/lib/queries/training-schedule";
import { getUserPlanItems } from "@/lib/queries/plan";
import { SetupForm } from "@/components/sessions/SetupForm";
import { ResetScheduleSection } from "@/components/sessions/ResetScheduleSection";
import type { Discipline } from "@/lib/types";

export default async function SetupPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const schedule = await getTrainingSchedule(profile.id);
  const sourceFilter = profile.plan_mode === "custom" ? "manual" : "exam_program";
  const items = await getUserPlanItems(profile.id, undefined, sourceFilter);
  const disciplineCounts = countByDiscipline(items);

  const programLabel =
    profile.plan_mode === "custom"
      ? `Selezione personale · ${items.length} esercizi`
      : `Programma esame · ${items.length} esercizi`;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Sessioni di allenamento</h1>
        <p className="text-muted-foreground text-sm">
          Definisci giorni, durata e lunghezza del ciclo. Le sessioni vengono
          generate dal piano di allenamento attivo.
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
