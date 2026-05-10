import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { getProgressData } from "@/lib/queries/progress";
import { ActiveCycleProgress } from "@/components/progress/ActiveCycleProgress";
import { GeneralProgressSummary } from "@/components/progress/GeneralProgressSummary";
import { PracticeCalendar } from "@/components/progress/PracticeCalendar";
import { Button } from "@/components/ui/button";

export default async function ProgressPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const data = await getProgressData(profile.id, profile);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Progresso</h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/calendar">
            <CalendarDays className="mr-2 h-3.5 w-3.5" />
            Apri calendario
          </Link>
        </Button>
      </header>

      {data.activeCycleProgress && (
        <ActiveCycleProgress progress={data.activeCycleProgress} />
      )}
      <GeneralProgressSummary progress={data.generalProgress} />
      <PracticeCalendar days={data.generalProgress.calendar} />
    </div>
  );
}
