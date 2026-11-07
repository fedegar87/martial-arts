import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

type Props = {
  nextTrainingDate: string | null;
};

export function RestDayCard({ nextTrainingDate }: Props) {
  const tr = useTranslations("ui");
  const label = nextTrainingDate
    ? new Date(`${nextTrainingDate}T00:00:00Z`).toLocaleDateString(
        tr("locale"),
        {
          weekday: "long",
          day: "numeric",
          month: "long",
        },
      )
    : null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Moon className="h-4 w-4" /> {tr("restDay")}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground space-y-3 text-sm">
        {label ? (
          <p>
            {tr("nextSession")} {label}.
          </p>
        ) : (
          <>
            <p>{tr("cycleEnded")}</p>
            <Button asChild variant="secondary" size="sm">
              <Link href="/sessions/setup">{tr("setupTraining")}</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
