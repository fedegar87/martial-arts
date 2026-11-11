"use client";

import { FormSelect } from "@/components/primitives/FormSelect";
import type { CustomProgram } from "@/lib/types";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Props = {
  programs: CustomProgram[];
  current: string;
  active: string;
  discipline: string;
};

export function ProgramSelector({ programs, current, active, discipline }: Props) {
  const tr = useTranslations("ui");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const optionLabel = (name: string, value: string) =>
    value === active ? `${name} · ${tr("active")}` : name;

  return (
    <FormSelect
      label={tr("viewedProgram")}
      value={current}
      disabled={pending}
      onChange={(event) => {
        const params = new URLSearchParams({ program: event.target.value, d: discipline });
        startTransition(() => router.push(`/programma?${params.toString()}`));
      }}
    >
      <optgroup label={tr("exam")}>
        <option value="exam">{optionLabel(tr("examProgram"), "exam")}</option>
      </optgroup>
      {programs.length > 0 && (
        <optgroup label={tr("personalPrograms")}>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {optionLabel(program.name, program.id)}
            </option>
          ))}
        </optgroup>
      )}
    </FormSelect>
  );
}
