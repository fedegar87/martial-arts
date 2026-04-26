"use client";

import { useActionState } from "react";
import { PenLine } from "lucide-react";
import { saveWeeklyReflection } from "@/lib/actions/reflections";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/progress/SectionHeader";

export function WeeklyReflectionCard() {
  const [state, action, pending] = useActionState(saveWeeklyReflection, null);

  if (state && "success" in state) {
    return (
      <section className="space-y-2 rounded-lg border p-4">
        <SectionHeader icon={PenLine} title="Riflessione settimanale" />
        <p className="text-muted-foreground text-sm">Riflessione salvata.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-lg border p-4">
      <SectionHeader icon={PenLine} title="Riflessione settimanale" />
      <form action={action} className="space-y-3">
        <label className="block space-y-1.5 text-sm">
          <span className="text-muted-foreground">
            Cosa ha funzionato meglio questa settimana?
          </span>
          <textarea
            name="prompt_1_text"
            rows={3}
            className="border-input bg-background min-h-24 w-full resize-y rounded-sm border px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="text-muted-foreground">
            Cosa vuoi rendere piu stabile nella prossima pratica?
          </span>
          <textarea
            name="prompt_2_text"
            rows={3}
            className="border-input bg-background min-h-24 w-full resize-y rounded-sm border px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
        </label>

        {state && "error" in state && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={pending}>
          {pending ? "Salvataggio..." : "Salva riflessione"}
        </Button>
      </form>
    </section>
  );
}
