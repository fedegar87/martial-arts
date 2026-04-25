import { redirect } from "next/navigation";
import { Calendar, Trophy } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { listExamProgramsForSchool } from "@/lib/queries/exam-programs";
import { getRecentLogsForUser } from "@/lib/queries/practice-log";
import { LevelBadge } from "@/components/skill/LevelBadge";
import { SignOutButton } from "@/components/profile/SignOutButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const exams = await listExamProgramsForSchool(profile.school_id);
  const preparingExam = exams.find((e) => e.id === profile.preparing_exam_id);
  const logs = await getRecentLogsForUser(profile.id, 30);
  const uniqueDays = new Set(
    logs.filter((l) => l.completed).map((l) => l.date),
  ).size;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{profile.display_name}</h1>
        <div className="flex items-center gap-2">
          <LevelBadge level={profile.assigned_level} />
        </div>
      </header>

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
