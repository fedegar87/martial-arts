"use client";

import { Button } from "@/components/ui/button";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mt-8 rounded-lg border border-border bg-card p-6 text-center shadow-[var(--shadow-sm)]">
      <h1 className="text-lg font-semibold">Qualcosa è andato storto</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Non è stato possibile caricare la pagina. Riprova.
      </p>
      <Button onClick={reset} className="mt-4">
        Riprova
      </Button>
    </div>
  );
}
