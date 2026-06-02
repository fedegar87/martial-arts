"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpenText, CalendarDays, Megaphone, Target } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  Icon: typeof CalendarDays;
  match?: string[];
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/today",
    label: "Allenamento",
    shortLabel: "Allenamento",
    Icon: CalendarDays,
    match: ["/calendar", "/sessions"],
  },
  {
    href: "/programma",
    label: "Programma",
    shortLabel: "Programma",
    Icon: Target,
    match: ["/plan"],
  },
  {
    href: "/library",
    label: "Scuola Chang",
    shortLabel: "Scuola",
    Icon: BookOpenText,
    match: ["/skill"],
  },
  {
    href: "/progress",
    label: "Progressi",
    shortLabel: "Progressi",
    Icon: BarChart3,
  },
  { href: "/news", label: "Bacheca", shortLabel: "Bacheca", Icon: Megaphone },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="app-nav material-bar hairline" aria-label="Navigazione principale">
      <div className="app-nav__inner">
        {NAV_ITEMS.map(({ href, label, shortLabel, Icon, match }) => {
          const matches = [href, ...(match ?? [])];
          const active = matches.some(
            (m) => pathname === m || pathname.startsWith(m + "/"),
          );
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={`app-nav__link tap-feedback label-font ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {active && (
                <span className="app-nav__active-dot" aria-hidden="true" />
              )}
              <Icon className="h-5 w-5" />
              <span className="app-nav__label">{shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
