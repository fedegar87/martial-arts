import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SegmentedNavItem = {
  href: string;
  label: string;
  active: boolean;
  icon?: ReactNode;
};

type Props = {
  items: SegmentedNavItem[];
  ariaLabel: string;
  compact?: boolean;
  fullWidth?: boolean;
  className?: string;
};

export function SegmentedNav({
  items,
  ariaLabel,
  compact = false,
  fullWidth = false,
  className,
}: Props) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "inline-flex max-w-full overflow-x-auto rounded-lg bg-muted/80 p-1 border border-border/50",
        fullWidth && "flex w-full",
        className,
      )}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "tap-feedback label-font flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 text-sm text-muted-foreground transition-all hover:text-foreground",
            compact ? "min-w-0" : "min-w-20",
            fullWidth && "flex-1",
            item.active && "border-border/80 bg-card text-foreground font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.4)]",
          )}
        >
          {item.icon}
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
