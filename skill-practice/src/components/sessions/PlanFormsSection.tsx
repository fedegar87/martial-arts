"use client";

import { useEffect, useTransition, useOptimistic } from "react";
import { updatePlanItemStatus } from "@/lib/actions/plan";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import { PLAN_STATUS_VISUALS } from "@/lib/marker-visuals";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Discipline, PlanStatus, Skill, UserPlanItem } from "@/lib/types";

const FocusIcon = PLAN_STATUS_VISUALS.focus.Icon;
const MaintenanceIcon = PLAN_STATUS_VISUALS.maintenance.Icon;

type ItemWithSkill = UserPlanItem & { skill: Skill };

const STATUS_SELECTOR_WIDTH_CLASS = "w-[164px] sm:w-[176px]";

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
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2"
                    >
                      <span className="min-w-0 truncate text-sm">
                        {it.skill.name}
                      </span>
                      <StatusSelector
                        status={it.status}
                        skillName={it.skill.name}
                        onChange={(next) => applyStatus(it.skill_id, next)}
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
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 px-3">
      <span aria-hidden="true" />
      <div
        className={cn(
          STATUS_SELECTOR_WIDTH_CLASS,
          "grid grid-cols-2 text-[9px] font-semibold uppercase leading-none tracking-wide sm:text-[10px]",
        )}
      >
        <span className="text-primary flex items-center gap-0.5">
          <FocusIcon className="h-3 w-3" />
          Focus
        </span>
        <span className="flex items-center justify-end gap-0.5 text-[var(--status-info)]">
          Mantenimento
          <MaintenanceIcon className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}

function StatusSelector({
  status,
  skillName,
  onChange,
}: {
  status: PlanStatus;
  skillName: string;
  onChange: (next: PlanStatus) => void;
}) {
  const isFocus = status === "focus";
  return (
    <div
      role="radiogroup"
      aria-label={`Stato nel piano per ${skillName}`}
      className={cn(
        STATUS_SELECTOR_WIDTH_CLASS,
        "bg-muted/70 relative grid h-8 shrink-0 grid-cols-2 rounded-full border p-0.5 shadow-inner transition-colors",
        isFocus ? "border-primary/40" : "border-[color:var(--status-info)]",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0.5 w-[calc(50%-0.125rem)] rounded-full shadow-sm transition-all duration-200",
          isFocus
            ? "left-0.5 bg-primary"
            : "left-[50%] bg-[var(--status-info)]",
        )}
      />
      <button
        type="button"
        role="radio"
        aria-checked={isFocus}
        aria-label={`${skillName}: focus`}
        onClick={() => onChange("focus")}
        className={cn(
          "relative z-10 flex min-w-0 items-center justify-center gap-0.5 rounded-full px-1 text-[10px] font-semibold leading-none transition-colors sm:text-[11px]",
          isFocus
            ? "text-primary-foreground"
            : "text-muted-foreground hover:text-primary",
        )}
      >
        <FocusIcon className="h-3.5 w-3.5 shrink-0" />
        <span>Focus</span>
      </button>
      <span
        aria-hidden="true"
        className="bg-border/70 absolute left-1/2 top-2 h-4 w-px -translate-x-1/2"
      />
      <button
        type="button"
        role="radio"
        aria-checked={!isFocus}
        aria-label={`${skillName}: mantenimento`}
        onClick={() => onChange("maintenance")}
        className={cn(
          "relative z-10 flex min-w-0 items-center justify-center gap-0.5 rounded-full px-1 text-[9px] font-semibold leading-none transition-colors sm:text-[10px]",
          isFocus
            ? "text-muted-foreground hover:text-[var(--status-info)]"
            : "text-background",
        )}
      >
        <span>Mantenimento</span>
        <MaintenanceIcon className="h-3.5 w-3.5 shrink-0" />
      </button>
    </div>
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
