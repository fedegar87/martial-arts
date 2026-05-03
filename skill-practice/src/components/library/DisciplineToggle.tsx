import { SegmentedNav } from "@/components/shared/SegmentedNav";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import type { Discipline } from "@/lib/types";

type Props = {
  current: Discipline;
  basePath: string;
  hiddenTaichi?: boolean;
  extraParams?: Record<string, string | undefined>;
};

const DISCIPLINES: Discipline[] = ["shaolin", "taichi"];

export function DisciplineToggle({
  current,
  basePath,
  hiddenTaichi = false,
  extraParams,
}: Props) {
  const visible = hiddenTaichi
    ? DISCIPLINES.filter((d) => d !== "taichi")
    : DISCIPLINES;

  if (visible.length < 2) return null;

  return (
    <SegmentedNav
      ariaLabel="Disciplina"
      items={visible.map((discipline) => ({
        href: disciplineHref(basePath, discipline, extraParams),
        label: DISCIPLINE_LABELS[discipline],
        active: current === discipline,
      }))}
    />
  );
}

function disciplineHref(
  basePath: string,
  discipline: Discipline,
  extraParams?: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(extraParams ?? {})) {
    if (value) params.set(key, value);
  }
  params.set("d", discipline);
  return `${basePath}?${params.toString()}`;
}
