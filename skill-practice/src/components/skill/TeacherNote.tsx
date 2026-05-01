import { Lightbulb } from "lucide-react";

type Props = {
  note: string | null;
  compact?: boolean;
};

export function TeacherNote({ note, compact = false }: Props) {
  if (!note) return null;

  if (compact) {
    return (
      <aside className="surface-inset flex gap-2 rounded-sm p-3 text-sm">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" />
        <div className="min-w-0 space-y-1">
          <div className="label-font text-primary text-[0.68rem]">
            Nota maestro
          </div>
          <p className="text-muted-foreground italic">{note}</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="surface-inset rounded-md p-4">
      <div className="flex gap-3">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0 space-y-1">
          <div className="font-medium">Nota del maestro</div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {note}
          </p>
        </div>
      </div>
    </aside>
  );
}
