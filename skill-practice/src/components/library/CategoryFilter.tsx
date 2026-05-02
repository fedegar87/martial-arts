import Link from "next/link";
import { Video } from "lucide-react";
import type { ReactNode } from "react";
import { SKILL_CATEGORY_LABELS } from "@/lib/labels";
import type { Discipline, SkillCategory } from "@/lib/types";

type Props = {
  basePath: string;
  discipline: Discipline;
  current?: SkillCategory;
  categories: SkillCategory[];
  withVideo: boolean;
};

export function CategoryFilter({
  basePath,
  discipline,
  current,
  categories,
  withVideo,
}: Props) {
  const buildHref = (category?: SkillCategory, video?: boolean) => {
    const params = new URLSearchParams();
    params.set("d", discipline);
    if (category) params.set("category", category);
    if (video) params.set("withVideo", "1");
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="scroll-chips">
      <Chip href={buildHref(undefined, withVideo)} active={!current}>
        Tutte
      </Chip>
      {categories.map((category) => (
        <Chip
          key={category}
          href={buildHref(category, withVideo)}
          active={current === category}
        >
          {SKILL_CATEGORY_LABELS[category]}
        </Chip>
      ))}
      <Chip href={buildHref(current, !withVideo)} active={withVideo}>
        <Video className="mr-1 h-3.5 w-3.5" />
        Con video
      </Chip>
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
      className={`tap-feedback label-font flex min-h-11 shrink-0 items-center rounded-md border px-3 text-sm transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
