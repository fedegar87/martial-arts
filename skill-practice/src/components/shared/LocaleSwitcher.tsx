"use client";
import { useTranslations } from "next-intl";

import { setLocale } from "@/lib/actions/locale";
import { FormSelect } from "@/components/primitives/FormSelect";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LocaleSwitcher({
  variant = "compact",
}: {
  variant?: "compact" | "settings";
}) {
  const tr = useTranslations("ui");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  const settings = variant === "settings";
  const changeLocale = (value: string) => {
    setFailed(false);
    startTransition(async () => {
      try {
        await setLocale(value);
        router.refresh();
      } catch {
        setFailed(true);
      }
    });
  };
  const options = (
    <>
      <option value="it" lang="it">
        Italiano
      </option>
      <option value="fr" lang="fr">
        Français
      </option>
    </>
  );
  return (
    <div
      className={settings ? "space-y-4" : "flex flex-col items-end gap-1"}
      aria-busy={pending}
    >
      {settings ? (
        <FormSelect
          label={tr("language")}
          value={locale}
          disabled={pending}
          onChange={(event) => changeLocale(event.target.value)}
        >
          {options}
        </FormSelect>
      ) : (
        <label className="label-font flex min-h-11 items-center gap-2 text-xs text-muted-foreground">
          <Languages className="h-4 w-4" aria-hidden />
          <span className="sr-only">{tr("language")}</span>
          <select
            value={locale}
            disabled={pending}
            className="min-h-11 rounded-md border border-border bg-background px-2 text-base text-foreground"
            onChange={(event) => changeLocale(event.target.value)}
          >
            {options}
          </select>
        </label>
      )}
      {failed &&
        (settings ? (
          <Alert variant="destructive">
            <AlertDescription>{tr("localeSaveError")}</AlertDescription>
          </Alert>
        ) : (
          <p role="alert" className="text-xs text-destructive">
            {tr("localeSaveError")}
          </p>
        ))}
    </div>
  );
}
