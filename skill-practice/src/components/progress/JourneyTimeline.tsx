import { Route } from "lucide-react";
import { SectionHeader } from "@/components/progress/SectionHeader";
import type { Grade } from "@/lib/grades";

type Props = {
  grades: Grade[];
  currentLevel: number;
};

export function JourneyTimeline({ grades, currentLevel }: Props) {
  return (
    <section className="space-y-4 rounded-lg border p-4">
      <SectionHeader icon={Route} title="Posizione nei gradi" />
      <div className="space-y-2">
        {grades
          .filter((grade) => grade.value !== 0)
          .map((grade) => {
            const current = grade.value === currentLevel;
            const future = currentLevel !== 0 && grade.value < currentLevel;
            return (
              <div key={grade.value} className="flex items-center gap-3">
                <span
                  className={`h-3 w-3 rounded-full ${
                    current
                      ? "bg-primary ring-4 ring-primary/20"
                      : future
                        ? "bg-muted"
                        : "bg-green-500"
                  }`}
                />
                <span
                  className={
                    future ? "text-muted-foreground" : "text-foreground"
                  }
                >
                  {grade.label}
                </span>
                {current && (
                  <span className="text-muted-foreground text-xs">attuale</span>
                )}
              </div>
            );
          })}
      </div>
    </section>
  );
}
