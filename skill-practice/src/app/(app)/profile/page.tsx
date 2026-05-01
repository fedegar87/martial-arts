import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, CalendarDays, CalendarPlus, Trophy } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { listExamProgramsForSchool } from "@/lib/queries/exam-programs";
import { getRecentLogsForUser } from "@/lib/queries/practice-log";
import { getUserPlanCount } from "@/lib/queries/plan";
import { LevelBadge } from "@/components/skill/LevelBadge";
import { SignOutButton } from "@/components/profile/SignOutButton";
import { GradeEditor } from "@/components/profile/GradeEditor";
import { PlanModeSection } from "@/components/profile/PlanModeSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { gradeLabel } from "@/lib/grades";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const exams = await listExamProgramsForSchool(profile.school_id);
  const preparingExam = exams.find((e) => e.id === profile.preparing_exam_id);
  const preparingExamTaichi = exams.find(
    (e) => e.id === profile.preparing_exam_taichi_id,
  );
  const logs = await getRecentLogsForUser(profile.id, 30);
  const planCount = await getUserPlanCount(profile.id);
  const uniqueDays = new Set(
    logs.filter((l) => l.completed).map((l) => l.date),
  ).size;

  const taichiLabel =
    profile.assigned_level_taichi === 0
      ? "Non praticato"
      : gradeLabel(profile.assigned_level_taichi);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{profile.display_name}</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">I tuoi gradi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Shaolin</span>
            <LevelBadge level={profile.assigned_level_shaolin} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">T&apos;ai Chi</span>
            <span className="text-sm font-medium">{taichiLabel}</span>
          </div>
          <GradeEditor
            assignedLevelShaolin={profile.assigned_level_shaolin}
            assignedLevelTaichi={profile.assigned_level_taichi}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4" />
            Esame in preparazione
          </CardTitle>
        </CardHeader>
        <CardContent>
          {preparingExam ? (
            <>
              <div className="font-medium">{preparingExam.level_name}</div>
              {preparingExam.description && (
                <p className="text-muted-foreground text-sm">
                  {preparingExam.description}
                </p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              Nessun esame selezionato
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Piano di pratica</CardTitle>
        </CardHeader>
        <CardContent>
          <PlanModeSection
            planMode={profile.plan_mode ?? "exam"}
            examShaolin={preparingExam}
            examTaichi={preparingExamTaichi}
            planCount={planCount}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Allenamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild variant="outline" className="w-full justify-start">
            <Link href="/sessions/setup">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Modifica sessioni
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start">
            <Link href="/sessions/calendar">
              <CalendarDays className="mr-2 h-4 w-4" />
              Calendario sessioni
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            Pratica ultimi 30 giorni
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{uniqueDays} giorni</div>
          <p className="text-muted-foreground text-sm">su 30</p>
        </CardContent>
      </Card>

      <SignOutButton />
    </div>
  );
}
