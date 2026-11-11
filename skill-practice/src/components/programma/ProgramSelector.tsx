import { chipClassName } from "@/components/primitives/Chip";
import { ProgramManagement } from "@/components/programma/ProgramManagement";
import type { CustomProgram } from "@/lib/types";
import { useTranslations } from "next-intl";
import Link from "next/link";

type Props = {
  programs: CustomProgram[];
  current: string;
  discipline: string;
};

export function ProgramSelector({ programs, current, discipline }: Props) {
  const tr = useTranslations("ui");
  const options = [
    { id: "exam", name: tr("exam") },
    ...programs,
  ];

  return (
    <nav aria-label={tr("viewedProgram")} className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Link
          key={option.id}
          href={`/programma?${new URLSearchParams({ program: option.id, d: discipline }).toString()}`}
          aria-current={current === option.id ? "page" : undefined}
          className={chipClassName({
            active: current === option.id,
            tone: "neutral",
            className: "justify-start whitespace-normal text-left",
          })}
        >
          <span className="min-w-0 wrap-break-word">{option.name}</span>
        </Link>
      ))}
      <ProgramManagement />
    </nav>
  );
}
