import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type FolderTabItem = {
  href: string;
  label: string;
  active: boolean;
  icon?: ReactNode;
};

type Props = {
  items: FolderTabItem[];
  ariaLabel: string;
};

export function FolderTabs({ items, ariaLabel }: Props) {
  return (
    <nav
      aria-label={ariaLabel}
      className="flex w-full border-b border-border"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "label-font tap-feedback flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-t-md px-3 text-sm transition-colors",
            item.active
              ? "-mb-px border border-border border-b-[color:var(--card)] bg-card text-foreground"
              : "border border-transparent bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          )}
        >
          {item.icon}
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
