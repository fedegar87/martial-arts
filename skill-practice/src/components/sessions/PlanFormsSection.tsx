"use client";

import { useEffect, useTransition, useOptimistic } from "react";
import { updatePlanItemStatus } from "@/lib/actions/plan";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Discipline, PlanStatus, Skill, UserPlanItem } from "@/lib/types";

type ItemWithSkill = UserPlanItem & { skill: Skill };

type Props = {
  items: ItemWithSkill[];
  scope: "both" | Discipline;
  onCountsChange?: (counts: { focus: number; maintenance: number }) => void;
};

export function PlanFormsSection({ items, scope, onCountsChange }: Props) {
  const [optimistic, setOptimistic] = useOptimistic(
    items,
    (state, update: { skillId: string; status: PlanStatus }) =>
      state.map((it) =>
        it.skill_id === update.skillId ? { ...it, status: update.status } : it,
      ),
  );
  const [, startTransition] = useTransition();

  const filtered = optimistic.filter(
    (it) => scope === "both" || it.skill.discipline === scope,
  );
  const focusCount = filtered.filter((i) => i.status === "focus").length;
  const maintCount = filtered.filter((i) => i.status === "maintenance").length;

  useEffect(() => {
    onCountsChange?.({ focus: focusCount, maintenance: maintCount });
  }, [focusCount, maintCount, onCountsChange]);

  const grouped = groupByDisciplineAndCategory(filtered);

  function toggle(item: ItemWithSkill) {
    const next: PlanStatus = item.status === "focus" ? "maintenance" : "focus";
    startTransition(async () => {
      setOptimistic({ skillId: item.skill_id, status: next });
      const result = await updatePlanItemStatus(item.skill_id, next);
      if (result && "error" in result) {
        console.error("Errore aggiornamento status:", result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Forme nel piano</CardTitle>
        <p className="text-muted-foreground text-xs">
          {filtered.length} forme · {focusCount} focus · {maintCount} mantenimento
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {grouped.map((group) => (
          <div key={group.discipline} className="space-y-2">
            <h3 className="text-muted-foreground text-xs font-semibold uppercase">
              {DISCIPLINE_LABELS[group.discipline]} ({group.items.length})
            </h3>
            {group.categories.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <h4 className="text-muted-foreground/70 text-[11px] font-semibold tracking-wide uppercase">
                  {cat.category}
                </h4>
                <ul className="divide-border bg-card divide-y rounded-lg border">
                  {cat.items.map((it) => (
                    <li
                      key={it.id}
                      className="flex items-center justify-between gap-3 px-3 py-2"
                    >
                      <span className="text-sm">{it.skill.name}</span>
                      <button
                        type="button"
                        onClick={() => toggle(it)}
                        className={cn(
                          "rounded-md border px-2 py-1 text-xs font-medium",
                          it.status === "focus"
                            ? "border-primary text-primary"
                            : "border-border text-muted-foreground",
                        )}
                        aria-label={`Cambia stato di ${it.skill.name}`}
                      >
                        {it.status === "focus" ? "Focus" : "Mantenimento"}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Nessuna forma nel piano per l&apos;ambito selezionato.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function groupByDisciplineAndCategory(items: ItemWithSkill[]) {
  const byDisc = new Map<Discipline, ItemWithSkill[]>();
  for (const it of items) {
    const arr = byDisc.get(it.skill.discipline) ?? [];
    arr.push(it);
    byDisc.set(it.skill.discipline, arr);
  }
  return Array.from(byDisc.entries()).map(([discipline, list]) => {
    const byCat = new Map<string, ItemWithSkill[]>();
    for (const it of list) {
      const arr = byCat.get(it.skill.category) ?? [];
      arr.push(it);
      byCat.set(it.skill.category, arr);
    }
    return {
      discipline,
      items: list,
      categories: Array.from(byCat.entries())
        .map(([category, items]) => ({
          category,
          items: [...items].sort(
            (a, b) => a.skill.display_order - b.skill.display_order,
          ),
        }))
        .sort((a, b) => a.category.localeCompare(b.category)),
    };
  });
}
