"use client";
import { useTranslations } from "next-intl";

import { setLocale } from "@/lib/actions/locale";
import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LocaleSwitcher() {
  const tr = useTranslations("ui");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex flex-col items-end gap-1">
      <label className="label-font flex min-h-11 items-center gap-2 text-xs text-muted-foreground">
        <Languages className="h-4 w-4" aria-hidden />
        <span className="sr-only">{tr("language")}</span>
        <select
          value={locale}
          disabled={pending}
          className="min-h-11 rounded-md border border-border bg-background px-2 text-base text-foreground"
          onChange={(event) => {
            const value = event.target.value;
            setFailed(false);
            startTransition(async () => {
              try {
                await setLocale(value);
                router.refresh();
              } catch {
                setFailed(true);
              }
            });
          }}
        >
          <option value="it" lang="it">
            Italiano
          </option>
          <option value="fr" lang="fr">
            Français
          </option>
        </select>
      </label>
      {failed && (
        <p role="alert" className="text-xs text-destructive">
          {tr("localeSaveError")}
        </p>
      )}
    </div>
  );
}
