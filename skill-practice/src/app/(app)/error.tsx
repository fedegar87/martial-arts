"use client";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AppError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const tr = useTranslations("ui");
  return (
    <div className="mt-8 rounded-lg border border-border bg-card p-6 text-center shadow-[var(--shadow-sm)]">
      <h1 className="text-lg font-semibold">{tr("unexpectedError")}</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        {tr("pageLoadError")}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button onClick={retry}>{tr("retry")}</Button>
        <Button asChild variant="ghost">
          <Link href="/hub">{tr("backHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
