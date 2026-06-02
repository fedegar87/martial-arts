"use client";

import Link from "next/link";
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
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button onClick={reset}>Riprova</Button>
        <Button asChild variant="ghost">
          <Link href="/hub">Torna alla home</Link>
        </Button>
      </div>
    </div>
  );
}
