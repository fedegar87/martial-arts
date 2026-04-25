import Link from "next/link";
import { redirect } from "next/navigation";
import { Flame, Library, Repeat, Wrench } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { getUserPlanItems } from "@/lib/queries/plan";
import { getThisWeekLogs } from "@/lib/queries/practice-log";
import { getTodayPractice } from "@/lib/practice-logic";
import { TodaySkillCard } from "@/components/today/TodaySkillCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

export default async function TodayPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const items = await getUserPlanItems(profile.id);
  const logs = await getThisWeekLogs(profile.id);

  const todayStr = new Date().toISOString().split("T")[0];
  const doneTodaySkillIds = new Set(
    logs
      .filter((l) => l.date === todayStr && l.completed)
      .map((l) => l.skill_id),
  );

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Library className="h-10 w-10" />}
        title="Nessuna skill nel tuo piano"
        description="Vai in libreria e aggiungi le skill che vuoi praticare."
        action={
          <Button asChild>
            <Link href="/library">Vai alla libreria</Link>
          </Button>
        }
      />
    );
  }

  const daily = getTodayPractice(items);

  const dayName = new Date().toLocaleDateString("it-IT", { weekday: "long" });
  const weekDoneCount = new Set(
    logs.filter((l) => l.completed).map((l) => l.date),
  ).size;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-muted-foreground text-sm">
          Ciao {profile.display_name}
        </p>
        <h1 className="text-2xl font-semibold capitalize">Oggi — {dayName}</h1>
      </header>

      {daily.focus.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-medium">
            <Flame className="text-primary h-4 w-4" />
            Focus
          </h2>
          {daily.focus.map((item) => (
            <TodaySkillCard
              key={item.id}
              skill={item.skill}
              status={item.status}
              alreadyDoneToday={doneTodaySkillIds.has(item.skill.id)}
            />
          ))}
        </section>
      )}

      {daily.review.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-medium">
            <Repeat className="h-4 w-4 text-amber-500" />
            Ripasso
          </h2>
          {daily.review.map((item) => (
            <TodaySkillCard
              key={item.id}
              skill={item.skill}
              status={item.status}
              alreadyDoneToday={doneTodaySkillIds.has(item.skill.id)}
            />
          ))}
        </section>
      )}

      {daily.maintenance.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-medium">
            <Wrench className="text-muted-foreground h-4 w-4" />
            Mantenimento
          </h2>
          {daily.maintenance.map((item) => (
            <TodaySkillCard
              key={item.id}
              skill={item.skill}
              status={item.status}
              alreadyDoneToday={doneTodaySkillIds.has(item.skill.id)}
            />
          ))}
        </section>
      )}

      <footer className="text-muted-foreground border-border border-t pt-4 text-sm">
        Questa settimana: {weekDoneCount} giorni di pratica
      </footer>
    </div>
  );
}
