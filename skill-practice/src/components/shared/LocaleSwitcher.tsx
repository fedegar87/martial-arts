"use client";
import { useTranslations } from "next-intl";

import { setLocale } from "@/lib/actions/locale";
import { FormSelect } from "@/components/primitives/FormSelect";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LocaleSwitcher() {
  const tr = useTranslations("ui");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
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
    <div className="space-y-4" aria-busy={pending}>
      <FormSelect
        aria-label={tr("language")}
        value={locale}
        disabled={pending}
        onChange={(event) => changeLocale(event.target.value)}
      >
        {options}
      </FormSelect>
      {failed && (
        <Alert variant="destructive">
          <AlertDescription>{tr("localeSaveError")}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
