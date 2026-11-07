"use client";
import { categoryLabel } from "@/lib/labels";

import { useTranslations } from "next-intl";

import { DisciplineBadge } from "@/components/skill/DisciplineBadge";
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
import { addFreePracticeForDate } from "@/lib/actions/calendar";
import type { CalendarSkill } from "@/lib/types";
import { Plus, Search } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

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
  const tr = useTranslations("ui");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [pendingSkillId, setPendingSkillId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const scheduled = useMemo(
    () => new Set(scheduledSkillIds),
    [scheduledSkillIds],
  );
  const formattedDate = useMemo(
    () =>
      new Date(`${dateKey}T00:00:00Z`).toLocaleDateString(tr("locale"), {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    [dateKey, tr],
  );
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return skills;
    return skills.filter((skill) =>
      [
        skill.name,
        skill.subtitle ?? skill.name_italian,
        categoryLabel(skill.category, tr),
      ]
        .filter(
          (value): value is string =>
            typeof value === "string" && value.length > 0,
        )
        .some((value) => value.toLowerCase().includes(needle)),
    );
  }, [query, skills, tr]);

  function handleAdd(skillId: string) {
    startTransition(async () => {
      setPendingSkillId(skillId);
      setMessage(null);
      try {
        const result = await addFreePracticeForDate(skillId, dateKey);
        if ("error" in result) {
          setMessage(result.error);
          return;
        }
        setOpen(false);
        setQuery("");
      } catch {
        setMessage(tr("offlineRetry"));
      } finally {
        setPendingSkillId(null);
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={disabled}>
          <Plus className="h-3.5 w-3.5" />
          {tr("addFreePractice")}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-hidden pb-[env(safe-area-inset-bottom)]"
      >
        <SheetHeader>
          <SheetTitle>{tr("addFreePractice")}</SheetTitle>
          <SheetDescription className="capitalize">
            {formattedDate}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-3 overflow-hidden px-4 pb-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={tr("searchTechnique")}
              className="pl-8"
            />
          </label>
          <div className="max-h-[52vh] space-y-2 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {tr("noContentSentence")}
              </p>
            ) : (
              filtered.map((skill) => {
                const alreadyScheduled = scheduled.has(skill.id);
                return (
                  <div
                    key={skill.id}
                    className="flex min-h-14 items-center gap-3 rounded-md border border-border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {skill.name}
                      </div>
                      {(skill.subtitle ?? skill.name_italian) && (
                        <div className="truncate text-xs text-muted-foreground">
                          {skill.subtitle ?? skill.name_italian}
                        </div>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        <DisciplineBadge discipline={skill.discipline} />
                        <span className="text-xs text-muted-foreground">
                          {categoryLabel(skill.category, tr)}
                        </span>
                        {alreadyScheduled && (
                          <span className="text-xs text-primary">
                            {tr("inSession")}
                          </span>
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
                          ? tr("mark")
                          : tr("add")}
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
