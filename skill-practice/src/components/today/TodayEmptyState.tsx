import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Dumbbell, Library, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

type Props = {
  reason: "no_schedule" | "expired" | "no_plan" | "empty_session";
  customMode?: boolean;
};

export function TodayEmptyState({ reason, customMode = false }: Props) {
  const tr = useTranslations("ui");
  if (reason === "no_schedule") {
    return (
      <EmptyState
        icon={<CalendarPlus className="h-10 w-10" />}
        title={tr("defineSessions")}
        description={tr("defineSessionsDescription")}
        action={
          <Button asChild>
            <Link href="/sessions/setup">{tr("setupTraining")}</Link>
          </Button>
        }
      />
    );
  }

  if (reason === "expired") {
    return (
      <EmptyState
        icon={<Sparkles className="h-10 w-10" />}
        title={tr("sessionsEnded")}
        description={tr("restartSessions")}
        action={
          <Button asChild>
            <Link href="/sessions/setup">{tr("setupTraining")}</Link>
          </Button>
        }
      />
    );
  }

  if (reason === "empty_session") {
    return (
      <EmptyState
        icon={<Dumbbell className="h-10 w-10" />}
        title={tr("noExercisesToday")}
        description={tr("noExercisesTodayDescription")}
        action={
          <Button asChild>
            <Link href="/programma">{tr("checkPlan")}</Link>
          </Button>
        }
      />
    );
  }

  if (customMode) {
    return (
      <EmptyState
        icon={<Library className="h-10 w-10" />}
        title={tr("noFormsSelected")}
        description={tr("chooseFormsDescription")}
        action={
          <Button asChild>
            <Link href="/plan/custom">{tr("openSelection")}</Link>
          </Button>
        }
      />
    );
  }

  return (
    <EmptyState
      icon={<Library className="h-10 w-10" />}
      title={tr("emptyPlan")}
      description={tr("activatePlanDescription")}
      action={
        <Button asChild>
          <Link href="/plan/exam">{tr("examProgram")}</Link>
        </Button>
      }
    />
  );
}
