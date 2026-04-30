import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { getTrainingSchedule } from "@/lib/queries/training-schedule";
import { getUserPlanItems } from "@/lib/queries/plan";
import { SetupForm } from "@/components/sessions/SetupForm";

export default async function SetupPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const schedule = await getTrainingSchedule(profile.id);
  const sourceFilter = profile.plan_mode === "custom" ? "manual" : "exam_program";
  const items = await getUserPlanItems(profile.id, undefined, sourceFilter);

  const programLabel =
    profile.plan_mode === "custom"
      ? `Selezione personalizzata: ${items.length} forme`
      : `Programma esame attivo · ${items.length} forme`;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Sessioni di allenamento</h1>
        <p className="text-muted-foreground text-sm">
          Definisci giorni, durata e ripasso. Le sessioni vengono generate dal
          programma attivo.
        </p>
      </header>
      <SetupForm
        current={schedule}
        programLabel={programLabel}
        approxFormCount={Math.max(1, Math.min(items.length, 6))}
      />
    </div>
  );
}
