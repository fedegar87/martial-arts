import type { PracticeLog } from "@/lib/types";

type Props = {
  notes: PracticeLog[];
};

export function PersonalNotesPanel({ notes }: Props) {
  if (notes.length === 0) return null;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-medium">Diario pratica</h2>
        <p className="text-sm text-muted-foreground">
          Ultimi appunti salvati dopo aver lavorato su questo video.
        </p>
      </div>
      <div className="space-y-3">
        {notes.map((note) => (
          <article key={note.id} className="surface-inset rounded-md p-3">
            <time className="label-font text-primary text-[0.68rem]">
              {formatDate(note.date)}
            </time>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
              {note.personal_note}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
