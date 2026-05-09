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
    <div className="wrap-chips">
      <Chip href={buildHref(undefined, withVideo)} active={!current} label="Tutte" />
      {categories.map((category) => (
        <Chip
          key={category}
          href={buildHref(category, withVideo)}
          active={current === category}
          label={SKILL_CATEGORY_LABELS[category]}
        />
      ))}
      <Chip
        href={buildHref(current, !withVideo)}
        active={withVideo}
        label="Con video"
        icon={<Video className="h-3.5 w-3.5 shrink-0" />}
      />
    </div>
  );
}

function Chip({
  href,
  active,
  label,
  icon,
}: {
  href: string;
  active: boolean;
  label: string;
  icon?: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      title={label}
      className={`tap-feedback label-font flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-md border px-2 text-sm transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </Link>
  );
}
