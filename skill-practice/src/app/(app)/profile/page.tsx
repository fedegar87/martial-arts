import { Disclosure } from "@/components/primitives/Disclosure";
import { ChangePasswordSection } from "@/components/profile/ChangePasswordSection";
import { GradeEditor } from "@/components/profile/GradeEditor";
import { PrivacyDataSection } from "@/components/profile/PrivacyDataSection";
import { SignOutButton } from "@/components/profile/SignOutButton";
import { TrainingReminderSettings } from "@/components/profile/TrainingReminderSettings";
import { LocaleSwitcher } from "@/components/shared/LocaleSwitcher";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UiTranslator } from "@/lib/i18n/config";
import { getPendingAccountDeletionRequest } from "@/lib/queries/account";
import { getTrainingReminderSettings } from "@/lib/queries/push-notifications";
import { getTrainingSchedule } from "@/lib/queries/training-schedule";
import { getCurrentProfileAccount } from "@/lib/queries/user-profile";
import type { UserRole } from "@/lib/types";
import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function ProfilePage() {
  const tr = await getTranslations("ui");
  const profile = await getCurrentProfileAccount();
  if (!profile) redirect("/login");

  const pushVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
  const pushEnabled = Boolean(pushVapidKey);
  const [schedule, reminderSettings, pendingDeletionRequest] =
    await Promise.all([
      pushEnabled ? getTrainingSchedule(profile.id) : Promise.resolve(null),
      pushEnabled
        ? getTrainingReminderSettings(profile.id)
        : Promise.resolve(null),
      getPendingAccountDeletionRequest(profile.id),
    ]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold wrap-anywhere">
          {profile.display_name}
        </h1>
        <p className="text-muted-foreground text-sm">
          <span className="block wrap-anywhere">
            {profile.email ?? tr("emailUnavailable")}
          </span>
          <span className="block wrap-anywhere">
            {profile.school_name ?? tr("schoolUnassigned")}
          </span>
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{tr("yourGrades")}</CardTitle>
        </CardHeader>
        <CardContent>
          <GradeEditor
            assignedLevelShaolin={profile.assigned_level_shaolin}
            assignedLevelTaichi={profile.assigned_level_taichi}
            locked={profile.profile_locked}
          />
        </CardContent>
      </Card>

      <Disclosure title={tr("accountDetails")}>
        <dl className="divide-border divide-y text-sm">
          <InfoRow
            label={tr("role")}
            value={<RoleBadge role={profile.role} />}
          />
          <InfoRow
            label={tr("memberSince")}
            value={formatDate(tr, profile.created_at)}
          />
        </dl>
        <p className="text-muted-foreground mt-3 flex gap-2 text-xs">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {tr("managedAccount")}
        </p>
      </Disclosure>

      <Disclosure title={tr("language")}>
        <LocaleSwitcher variant="settings" />
      </Disclosure>

      {pushEnabled && reminderSettings && (
        <TrainingReminderSettings
          settings={reminderSettings}
          hasSchedule={Boolean(schedule)}
          publicVapidKey={pushVapidKey}
        />
      )}

      <ChangePasswordSection />

      <PrivacyDataSection
        pendingDeletionRequestedAt={
          pendingDeletionRequest?.requested_at ?? null
        }
      />

      <SignOutButton />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const tr = useTranslations("ui");
  return (
    <Badge variant={role === "student" ? "outline" : "secondary"}>
      {roleLabel(tr, role)}
    </Badge>
  );
}

function roleLabel(tr: UiTranslator, role: UserRole): string {
  if (role === "admin") return tr("admin");
  if (role === "instructor") return tr("instructor");
  return tr("student");
}

function formatDate(tr: UiTranslator, value: string): string {
  return new Intl.DateTimeFormat(tr("locale"), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
