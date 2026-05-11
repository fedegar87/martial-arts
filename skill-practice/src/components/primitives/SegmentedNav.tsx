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
        "inline-flex max-w-full overflow-x-auto rounded-md bg-muted p-1 shadow-[inset_0_0_0_0.5px_var(--separator)]",
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
            "tap-feedback label-font flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 text-sm text-muted-foreground transition-colors hover:text-foreground",
            compact ? "min-w-0" : "min-w-20",
            fullWidth && "flex-1",
            item.active && "border-border bg-card text-foreground shadow-sm",
          )}
        >
          {item.icon}
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
