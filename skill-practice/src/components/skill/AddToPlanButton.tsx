"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";
import { addSkillToPlan, removeSkillFromPlan } from "@/lib/actions/plan";

type Props = {
  skillId: string;
  inPersonalSelection: boolean;
};

export function AddToPlanButton({ skillId, inPersonalSelection }: Props) {
  const [pending, start] = useTransition();

  function handleClick() {
    start(async () => {
      if (inPersonalSelection) {
        await removeSkillFromPlan(skillId);
      } else {
        await addSkillToPlan(skillId, "maintenance");
      }
    });
  }

  return (
    <Button
      onClick={handleClick}
      disabled={pending}
      variant="outline"
      aria-pressed={inPersonalSelection}
      className={
        inPersonalSelection
          ? "h-11 w-full border-primary/60 text-primary"
          : "h-11 w-full"
      }
    >
      {inPersonalSelection ? (
        <Check className="mr-2 h-4 w-4" />
      ) : (
        <Plus className="mr-2 h-4 w-4" />
      )}
      {pending ? "..." : inPersonalSelection ? "Nel ripasso" : "Ripasso"}
    </Button>
  );
}
