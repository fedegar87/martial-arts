import Link from "next/link";
import type { ReactNode } from "react";

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
};

export function SegmentedNav({ items, ariaLabel, compact = false }: Props) {
  return (
    <nav
      aria-label={ariaLabel}
      className="inline-flex max-w-full rounded-lg bg-muted p-1 shadow-[inset_0_0_0_0.5px_var(--separator)]"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={`tap-feedback label-font flex min-h-10 items-center justify-center gap-1.5 rounded-md px-3 text-sm transition-colors ${
            compact ? "min-w-0" : "min-w-20"
          } ${
            item.active
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {item.icon}
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
