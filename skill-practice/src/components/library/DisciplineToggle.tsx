import { SegmentedNav } from "@/components/shared/SegmentedNav";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import type { Discipline } from "@/lib/types";

type Props = {
  current: Discipline;
  basePath: string;
  hiddenTaichi?: boolean;
};

const DISCIPLINES: Discipline[] = ["shaolin", "taichi"];

export function DisciplineToggle({
  current,
  basePath,
  hiddenTaichi = false,
}: Props) {
  const visible = hiddenTaichi
    ? DISCIPLINES.filter((d) => d !== "taichi")
    : DISCIPLINES;

  if (visible.length < 2) return null;

  return (
    <SegmentedNav
      ariaLabel="Disciplina"
      items={visible.map((discipline) => ({
        href: `${basePath}?d=${discipline}`,
        label: DISCIPLINE_LABELS[discipline],
        active: current === discipline,
      }))}
    />
  );
}
