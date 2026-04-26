import Link from "next/link";
import type { ReactNode } from "react";
import { SKILL_CATEGORY_LABELS } from "@/lib/labels";
import type { Discipline, SkillCategory } from "@/lib/types";

type Props = {
  basePath: string;
  discipline: Discipline;
  current?: SkillCategory;
  categories: SkillCategory[];
};

export function CategoryFilter({
  basePath,
  discipline,
  current,
  categories,
}: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <Chip href={`${basePath}?d=${discipline}`} active={!current}>
        Tutte
      </Chip>
      {categories.map((category) => (
        <Chip
          key={category}
          href={`${basePath}?d=${discipline}&category=${category}`}
          active={current === category}
        >
          {SKILL_CATEGORY_LABELS[category]}
        </Chip>
      ))}
    </div>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`tap-feedback label-font flex min-h-10 shrink-0 items-center rounded-md border px-3 text-sm transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
