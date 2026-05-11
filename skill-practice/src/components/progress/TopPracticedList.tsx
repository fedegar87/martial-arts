import Link from "next/link";
import { ListOrdered } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/progress/SectionHeader";
import type { TopPracticedSkill } from "@/lib/queries/progress";

type Props = { items: TopPracticedSkill[] };

export function TopPracticedList({ items }: Props) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
      <SectionHeader
        icon={ListOrdered}
        title="I contenuti più praticati"
        right={<span className="text-xs text-muted-foreground">da sempre</span>}
      />
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.skillId}>
            <Link
              href={`/skill/${item.skillId}`}
              className="flex items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-muted/50"
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm">{item.skillName}</span>
                {item.skillNameItalian && (
                  <span className="truncate text-xs text-muted-foreground">
                    {item.skillNameItalian}
                  </span>
                )}
              </span>
              <Badge variant="secondary" className="shrink-0">
                {item.practiceDays}{" "}
                {item.practiceDays === 1 ? "giorno" : "giorni"}
              </Badge>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
