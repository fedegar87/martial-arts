import { SegmentedNav } from "@/components/shared/SegmentedNav";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import type { Discipline } from "@/lib/types";

type FilterValue = Discipline | "all";

type Props = {
  current: FilterValue;
};

const OPTIONS: Array<{ value: FilterValue; label: string }> = [
  { value: "all", label: "Tutte" },
  { value: "shaolin", label: DISCIPLINE_LABELS.shaolin },
  { value: "taichi", label: DISCIPLINE_LABELS.taichi },
];

export function DisciplineFilter({ current }: Props) {
  return (
    <SegmentedNav
      ariaLabel="Filtro disciplina"
      items={OPTIONS.map((option) => ({
        href: option.value === "all" ? "/today" : `/today?d=${option.value}`,
        label: option.label,
        active: current === option.value,
      }))}
    />
  );
}
