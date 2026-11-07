import { disciplineLabel } from "@/lib/labels";

import { SegmentedNav } from "@/components/primitives/SegmentedNav";
import type { Discipline } from "@/lib/types";
import { useTranslations } from "next-intl";

type Props = {
  current: Discipline;
  basePath: string;
  hiddenTaichi?: boolean;
  hiddenShaolin?: boolean;
  extraParams?: Record<string, string | undefined>;
};

const DISCIPLINES: Discipline[] = ["shaolin", "taichi"];

export function DisciplineToggle({
  current,
  basePath,
  hiddenTaichi = false,
  hiddenShaolin = false,
  extraParams,
}: Props) {
  const tr = useTranslations("ui");
  const visible = DISCIPLINES.filter(
    (d) =>
      !(d === "taichi" && hiddenTaichi) && !(d === "shaolin" && hiddenShaolin),
  );

  if (visible.length < 2) return null;

  return (
    <SegmentedNav
      ariaLabel={tr("discipline")}
      fullWidth
      items={visible.map((discipline) => ({
        href: disciplineHref(basePath, discipline, extraParams),
        label: disciplineLabel(discipline, tr),
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
