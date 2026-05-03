import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { CalendarDays, CalendarPlus, ShieldCheck } from "lucide-react";
import { getCurrentProfileAccount } from "@/lib/queries/user-profile";
import { getExamProgramById } from "@/lib/queries/exam-programs";
import { getUserPlanCount } from "@/lib/queries/plan";
import { getTrainingSchedule } from "@/lib/queries/training-schedule";
import { getPendingAccountDeletionRequest } from "@/lib/queries/account";
import { SignOutButton } from "@/components/profile/SignOutButton";
import { GradeEditor } from "@/components/profile/GradeEditor";
import { ChangePasswordSection } from "@/components/profile/ChangePasswordSection";
import { PlanModeSection } from "@/components/profile/PlanModeSection";
import { PrivacyDataSection } from "@/components/profile/PrivacyDataSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrainingSchedule, UserRole } from "@/lib/types";

export default async function ProfilePage() {
  const profile = await getCurrentProfileAccount();
  if (!profile) redirect("/login");

  const planSource = profile.plan_mode === "custom" ? "manual" : "exam_program";
  const [
    examShaolin,
    examTaichi,
    planCount,
    schedule,
    pendingDeletionRequest,
  ] = await Promise.all([
    profile.preparing_exam_id
      ? getExamProgramById(profile.preparing_exam_id)
      : Promise.resolve(null),
    profile.preparing_exam_taichi_id
      ? getExamProgramById(profile.preparing_exam_taichi_id)
      : Promise.resolve(null),
    getUserPlanCount(profile.id, planSource),
    getTrainingSchedule(profile.id),
    getPendingAccountDeletionRequest(profile.id),
  ]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{profile.display_name}</h1>
        <p className="text-muted-foreground text-sm">
          Profilo, sicurezza e dati dell&apos;account.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-border divide-y text-sm">
            <InfoRow label="Email" value={profile.email ?? "non disponibile"} />
            <InfoRow
              label="Scuola"
              value={profile.school_name ?? "non assegnata"}
            />
            <InfoRow label="Ruolo" value={<RoleBadge role={profile.role} />} />
            <InfoRow label="Membro dal" value={formatDate(profile.created_at)} />
          </dl>
          <p className="text-muted-foreground mt-3 flex gap-2 text-xs">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            Ruolo e scuola sono gestiti dagli amministratori.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">I tuoi gradi</CardTitle>
        </CardHeader>
        <CardContent>
          <GradeEditor
            assignedLevelShaolin={profile.assigned_level_shaolin}
            assignedLevelTaichi={profile.assigned_level_taichi}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Programma</CardTitle>
        </CardHeader>
        <CardContent>
          <PlanModeSection
            planMode={profile.plan_mode}
            examShaolin={examShaolin}
            examTaichi={examTaichi}
            planCount={planCount}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Allenamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-muted-foreground text-sm">
            {scheduleSummary(schedule)}
          </div>
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

      <ChangePasswordSection />

      <PrivacyDataSection
        pendingDeletionRequestedAt={pendingDeletionRequest?.requested_at ?? null}
      />

      <SignOutButton />
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <Badge variant={role === "student" ? "outline" : "secondary"}>
      {roleLabel(role)}
    </Badge>
  );
}

function roleLabel(role: UserRole): string {
  if (role === "admin") return "Admin";
  if (role === "instructor") return "Istruttore";
  return "Studente";
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function scheduleSummary(schedule: TrainingSchedule | null): string {
  if (!schedule) return "Nessuna cadenza di allenamento configurata.";

  const days = [...schedule.weekdays]
    .sort((a, b) => a - b)
    .map((day) => WEEKDAYS[day] ?? String(day))
    .join(", ");
  const cadence =
    schedule.cadence_weeks === 1
      ? "ogni settimana"
      : `ogni ${schedule.cadence_weeks} settimane`;

  return `${days} - ${cadence} - ${schedule.reps_per_form} ripetizioni per forma`;
}

const WEEKDAYS: Record<number, string> = {
  1: "lun",
  2: "mar",
  3: "mer",
  4: "gio",
  5: "ven",
  6: "sab",
  7: "dom",
};
