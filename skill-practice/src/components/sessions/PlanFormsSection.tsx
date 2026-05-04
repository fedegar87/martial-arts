"use client";

import { useEffect, useTransition, useOptimistic } from "react";
import { Anchor, Flame } from "lucide-react";
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

const TOGGLE_WIDTH_CLASS = "w-[68px]";

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

  function applyStatus(skillId: string, next: PlanStatus) {
    startTransition(async () => {
      setOptimistic({ skillId, status: next });
      const result = await updatePlanItemStatus(skillId, next);
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
        {filtered.length > 0 && <PolarHeader />}
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
                      className="grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-2"
                    >
                      <span className="min-w-0 truncate text-sm">
                        {it.skill.name}
                      </span>
                      <StatusToggle
                        status={it.status}
                        onChange={(next) => applyStatus(it.skill_id, next)}
                        ariaLabel={`${it.skill.name}: ${
                          it.status === "focus" ? "focus" : "mantenimento"
                        }, premi per cambiare`}
                      />
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

function PolarHeader() {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-3">
      <span aria-hidden="true" />
      <div
        className={cn(
          TOGGLE_WIDTH_CLASS,
          "flex justify-between text-[10px] font-semibold tracking-widest uppercase",
        )}
      >
        <span className="text-muted-foreground">Mant.</span>
        <span className="text-primary">Focus</span>
      </div>
    </div>
  );
}

function StatusToggle({
  status,
  onChange,
  ariaLabel,
}: {
  status: PlanStatus;
  onChange: (next: PlanStatus) => void;
  ariaLabel: string;
}) {
  const isFocus = status === "focus";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isFocus}
      aria-label={ariaLabel}
      onClick={() => onChange(isFocus ? "maintenance" : "focus")}
      className={cn(
        TOGGLE_WIDTH_CLASS,
        "relative inline-flex h-7 shrink-0 items-center rounded-full border transition-colors",
        isFocus
          ? "border-primary/50 bg-primary/20"
          : "border-border bg-muted",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-all duration-200",
          isFocus
            ? "left-[calc(100%-1.625rem)] bg-primary text-primary-foreground"
            : "left-0.5 bg-muted-foreground/30 text-muted-foreground",
        )}
      >
        {isFocus ? (
          <Flame className="h-3.5 w-3.5" />
        ) : (
          <Anchor className="h-3.5 w-3.5" />
        )}
      </span>
    </button>
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
