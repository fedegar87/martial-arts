"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const TABS = [
  { href: "/library", label: "Mio grado", exact: true },
  { href: "/library/exam", label: "Prossimo esame", exact: false },
  { href: "/library/program", label: "Curriculum", exact: false },
  { href: "/library/all", label: "Tutte", exact: false },
];

export function LibraryNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const discipline = searchParams.get("d");

  function isActive(tab: (typeof TABS)[number]) {
    return tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
  }

  return (
    <nav
      aria-label="Sezioni programma"
      className="hairline flex gap-1 overflow-x-auto border-b pb-px"
    >
      {TABS.map((tab) => {
        const active = isActive(tab);
        return (
          <Link
            key={tab.href}
            href={discipline ? `${tab.href}?d=${discipline}` : tab.href}
            aria-current={active ? "page" : undefined}
            className={`label-font tap-feedback -mb-px min-h-11 shrink-0 border-b-2 px-3 py-2 text-sm transition-colors ${
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
