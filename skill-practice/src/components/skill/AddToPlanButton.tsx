"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { addSkillToPlan, removeSkillFromPlan } from "@/lib/actions/plan";
import type { PlanMode } from "@/lib/types";

type Props = {
  skillId: string;
  inPersonalSelection: boolean;
  planMode: PlanMode;
};

export function AddToPlanButton({
  skillId,
  inPersonalSelection,
  planMode,
}: Props) {
  const [pending, start] = useTransition();
  const customActive = planMode === "custom";

  function handleClick() {
    start(async () => {
      if (inPersonalSelection) {
        await removeSkillFromPlan(skillId);
      } else {
        await addSkillToPlan(skillId, "review");
      }
    });
  }

  const label = inPersonalSelection
    ? customActive
      ? "Rimuovi dalle sessioni"
      : "Rimuovi dalla selezione personale"
    : customActive
      ? "Aggiungi alle sessioni come ripasso"
      : "Aggiungi alla selezione personale come ripasso";

  return (
    <Button
      onClick={handleClick}
      disabled={pending}
      variant={inPersonalSelection ? "outline" : "default"}
      className="w-full"
    >
      {inPersonalSelection ? (
        <Minus className="mr-2 h-4 w-4" />
      ) : (
        <Plus className="mr-2 h-4 w-4" />
      )}
      {pending ? "..." : label}
    </Button>
  );
}
