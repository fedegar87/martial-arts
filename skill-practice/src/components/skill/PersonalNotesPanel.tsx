import type { UiTranslator } from "@/lib/i18n/config";

import type { PracticeLog } from "@/lib/types";
import { useTranslations } from "next-intl";

type Props = {
  notes: PracticeLog[];
};

export function PersonalNotesPanel({ notes }: Props) {
  const tr = useTranslations("ui");
  if (notes.length === 0) return null;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-medium">{tr("practiceJournal")}</h2>
        <p className="text-sm text-muted-foreground">
          {tr("journalDescription")}
        </p>
      </div>
      <div className="space-y-3">
        {notes.map((note) => (
          <article key={note.id} className="surface-inset rounded-md p-3">
            <time className="label-font text-primary text-xs">
              {formatDate(tr, note.date)}
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

function formatDate(tr: UiTranslator, value: string): string {
  return new Intl.DateTimeFormat(tr("locale"), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
