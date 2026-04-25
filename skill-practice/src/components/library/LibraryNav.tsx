"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/library", label: "Mio livello", exact: true },
  { href: "/library/exam", label: "Per esame", exact: false },
  { href: "/library/all", label: "Tutto", exact: false },
];

export function LibraryNav() {
  const pathname = usePathname();

  function isActive(tab: (typeof TABS)[number]) {
    return tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
  }

  return (
    <nav className="border-border flex gap-1 border-b">
      {TABS.map((tab) => {
        const active = isActive(tab);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
