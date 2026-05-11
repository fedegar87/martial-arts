"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DisciplineBadge } from "@/components/skill/DisciplineBadge";
import { SKILL_CATEGORY_LABELS } from "@/lib/labels";
import { addFreePracticeForDate } from "@/lib/actions/calendar";
import type { CalendarSkill } from "@/lib/types";

type Props = {
  dateKey: string;
  skills: CalendarSkill[];
  scheduledSkillIds: string[];
  disabled?: boolean;
};

export function AddFreePracticeSheet({
  dateKey,
  skills,
  scheduledSkillIds,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [pendingSkillId, setPendingSkillId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const scheduled = useMemo(
    () => new Set(scheduledSkillIds),
    [scheduledSkillIds],
  );
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return skills;
    return skills.filter((skill) =>
      [skill.name, skill.name_italian, SKILL_CATEGORY_LABELS[skill.category]]
        .filter((value): value is string => typeof value === "string" && value.length > 0)
        .some((value) => value.toLowerCase().includes(needle)),
    );
  }, [query, skills]);

  function handleAdd(skillId: string) {
    startTransition(async () => {
      setPendingSkillId(skillId);
      setMessage(null);
      const result = await addFreePracticeForDate(skillId, dateKey);
      setPendingSkillId(null);
      if ("error" in result) {
        setMessage(result.error);
        return;
      }
      setOpen(false);
      setQuery("");
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={disabled}>
          <Plus className="h-3.5 w-3.5" />
          Aggiungi pratica libera
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-hidden">
        <SheetHeader>
          <SheetTitle>Aggiungi pratica libera</SheetTitle>
          <SheetDescription>{dateKey}</SheetDescription>
        </SheetHeader>
        <div className="space-y-3 overflow-hidden px-4 pb-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cerca forma o tecnica"
              className="pl-8"
            />
          </label>
          <div className="max-h-[52vh] space-y-2 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nessun contenuto trovato.</p>
            ) : (
              filtered.map((skill) => {
                const alreadyScheduled = scheduled.has(skill.id);
                return (
                  <div
                    key={skill.id}
                    className="flex min-h-14 items-center gap-3 rounded-md border border-border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{skill.name}</div>
                      {skill.name_italian && (
                        <div className="truncate text-xs text-muted-foreground">
                          {skill.name_italian}
                        </div>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        <DisciplineBadge discipline={skill.discipline} />
                        <span className="text-xs text-muted-foreground">
                          {SKILL_CATEGORY_LABELS[skill.category]}
                        </span>
                        {alreadyScheduled && (
                          <span className="text-xs text-primary">in sessione</span>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={alreadyScheduled ? "outline" : "secondary"}
                      disabled={pending}
                      onClick={() => handleAdd(skill.id)}
                    >
                      {pendingSkillId === skill.id
                        ? "..."
                        : alreadyScheduled
                          ? "Segna"
                          : "Aggiungi"}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
          {message && (
            <p className="text-sm text-destructive" role="status">
              {message}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
