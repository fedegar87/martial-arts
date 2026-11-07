import { ActiveCycleSection } from "@/components/progress/sections/ActiveCycleSection";
import { GeneralProgressSection } from "@/components/progress/sections/GeneralProgressSection";
import { PracticeCalendarSection } from "@/components/progress/sections/PracticeCalendarSection";
import { ProgressSectionSkeleton } from "@/components/progress/sections/ProgressSectionSkeleton";
import { TopPracticedSection } from "@/components/progress/sections/TopPracticedSection";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { CalendarDays } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function ProgressPage() {
  const tr = await getTranslations("ui");
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold">{tr("progress")}</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/calendar">
            <CalendarDays className="mr-2 h-3.5 w-3.5" />
            {tr("openCalendar")}
          </Link>
        </Button>
      </header>

      <Suspense fallback={<ProgressSectionSkeleton heightClass="h-10" />}>
        <ActiveCycleSection profile={profile} />
      </Suspense>
      <Suspense fallback={<ProgressSectionSkeleton heightClass="h-16" />}>
        <GeneralProgressSection userId={profile.id} />
      </Suspense>
      <Suspense fallback={<ProgressSectionSkeleton heightClass="h-40" />}>
        <PracticeCalendarSection userId={profile.id} />
      </Suspense>
      <Suspense fallback={<ProgressSectionSkeleton heightClass="h-56" />}>
        <TopPracticedSection userId={profile.id} />
      </Suspense>
    </div>
  );
}
