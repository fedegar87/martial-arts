"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { addSkillToPlan, removeSkillFromPlan } from "@/lib/actions/plan";

type Props = {
  skillId: string;
  inPlan: boolean;
};

export function AddToPlanButton({ skillId, inPlan }: Props) {
  const [pending, start] = useTransition();

  function handleClick() {
    start(async () => {
      if (inPlan) {
        await removeSkillFromPlan(skillId);
      } else {
        await addSkillToPlan(skillId, "review");
      }
    });
  }

  return (
    <Button
      onClick={handleClick}
      disabled={pending}
      variant={inPlan ? "outline" : "default"}
      className="w-full"
    >
      {inPlan ? (
        <Minus className="mr-2 h-4 w-4" />
      ) : (
        <Plus className="mr-2 h-4 w-4" />
      )}
      {pending
        ? "..."
        : inPlan
          ? "Rimuovi dal piano"
          : "Aggiungi al mio piano (ripasso)"}
    </Button>
  );
}
