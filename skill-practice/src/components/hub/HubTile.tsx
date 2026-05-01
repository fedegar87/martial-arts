import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type HubTileProps = {
  href: string;
  Icon: LucideIcon;
  title: string;
  subtitle: string;
  animClassName: string;
};

export function HubTile({
  href,
  Icon,
  title,
  subtitle,
  animClassName,
}: HubTileProps) {
  return (
    <Link
      href={href}
      className={`tap-feedback flex items-center gap-4 rounded-xl border border-accent bg-transparent px-5 py-4 transition-colors hover:bg-accent/5 active:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${animClassName}`}
    >
      <Icon className="h-6 w-6 shrink-0 text-accent" aria-hidden />
      <div className="flex flex-col">
        <span className="label-font text-base font-semibold tracking-wide text-foreground">
          {title}
        </span>
        <span className="text-[13px] text-muted-foreground">{subtitle}</span>
      </div>
    </Link>
  );
}
