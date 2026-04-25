"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { markPracticeDone } from "@/lib/actions/practice";

type Props = {
  skillId: string;
  alreadyDone: boolean;
};

export function PracticeCheckButton({ skillId, alreadyDone }: Props) {
  const [pending, start] = useTransition();

  if (alreadyDone) {
    return (
      <Button variant="outline" disabled className="w-full">
        <Check className="mr-2 h-4 w-4" />
        Praticato oggi
      </Button>
    );
  }

  function handleClick() {
    start(async () => {
      await markPracticeDone(skillId);
    });
  }

  return (
    <Button onClick={handleClick} disabled={pending} className="w-full">
      <Check className="mr-2 h-4 w-4" />
      {pending ? "..." : "Fatto"}
    </Button>
  );
}
