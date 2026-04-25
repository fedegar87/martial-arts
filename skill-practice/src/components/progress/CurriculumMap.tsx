import Link from "next/link";
import { Grid3X3 } from "lucide-react";
import { SectionHeader } from "@/components/progress/SectionHeader";
import type { CurriculumCell } from "@/lib/queries/progress";

type Props = {
  cells: CurriculumCell[];
};

export function CurriculumMap({ cells }: Props) {
  return (
    <section className="space-y-4 rounded-lg border p-4">
      <SectionHeader icon={Grid3X3} title="Copertura curriculum" />
      <div className="grid grid-cols-10 gap-1 sm:grid-cols-14">
        {cells.map((cell) => {
          const className = `h-5 rounded-sm ${statusClass(cell.status)}`;
          if (cell.status === "locked") {
            return (
              <div
                key={cell.skill.id}
                className={className}
                title={`${cell.skill.name}: bloccata`}
                aria-disabled
              />
            );
          }
          return (
            <Link
              key={cell.skill.id}
              href={`/skill/${cell.skill.id}`}
              className={className}
              title={cell.skill.name}
            />
          );
        })}
      </div>
      <div className="text-muted-foreground text-sm">
        {cells.filter((cell) => cell.status !== "locked").length} skill
        accessibili,{" "}
        {
          cells.filter(
            (cell) =>
              cell.status === "focus" ||
              cell.status === "review" ||
              cell.status === "maintenance",
          ).length
        }{" "}
        nel piano.
      </div>
    </section>
  );
}

function statusClass(status: CurriculumCell["status"]): string {
  if (status === "focus") return "bg-primary";
  if (status === "review") return "bg-amber-500";
  if (status === "maintenance") return "bg-green-500";
  if (status === "locked") return "bg-muted opacity-40";
  return "bg-muted-foreground/25";
}
