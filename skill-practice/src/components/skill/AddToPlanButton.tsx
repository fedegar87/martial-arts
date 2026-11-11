"use client";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { addSkillToPlan, removeSkillFromPlan } from "@/lib/actions/plan";
import { Check, Plus } from "lucide-react";
import { useState, useTransition } from "react";

type Props = {
  skillId: string;
  inPersonalSelection: boolean;
  programName?: string | null;
};

export function AddToPlanButton({ skillId, inPersonalSelection, programName }: Props) {
  const tr = useTranslations("ui");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    start(async () => {
      setError(null);
      try {
        const result = inPersonalSelection
          ? await removeSkillFromPlan(skillId)
          : await addSkillToPlan(skillId, "maintenance");
        if (result && "error" in result) setError(result.error);
      } catch {
        setError(tr("saveConfirmationFailed"));
      }
    });
  }

  return (
    <div className="min-w-0 space-y-1">
    <Button
      onClick={handleClick}
      disabled={pending}
      variant="outline"
      aria-pressed={inPersonalSelection}
      className={
        inPersonalSelection
          ? "h-auto min-h-11 w-full whitespace-normal border-primary/60 py-2 text-primary"
          : "h-auto min-h-11 w-full whitespace-normal py-2"
      }
    >
      {inPersonalSelection ? (
        <Check className="mr-2 h-4 w-4" />
      ) : (
        <Plus className="mr-2 h-4 w-4" />
      )}
      <span className="min-w-0 wrap-break-word">{pending ? tr("savingEllipsis") : programName
        ? tr(inPersonalSelection ? "removeFromNamedProgram" : "addToNamedProgram", { p0: programName })
        : tr(inPersonalSelection ? "inReview" : "addToPersonalProgram")}</span>
    </Button>
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
