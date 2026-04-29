import { Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  nextTrainingDate: string | null;
};

export function RestDayCard({ nextTrainingDate }: Props) {
  const label = nextTrainingDate
    ? new Date(`${nextTrainingDate}T00:00:00Z`).toLocaleDateString("it-IT", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Moon className="h-4 w-4" /> Giorno di riposo
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        {label ? <p>Prossima sessione: {label}.</p> : <p>Nessuna sessione futura programmata.</p>}
      </CardContent>
    </Card>
  );
}
