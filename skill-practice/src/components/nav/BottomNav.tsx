"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpenText, CalendarDays, Target, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/today", label: "Oggi", shortLabel: "Oggi", Icon: CalendarDays },
  { href: "/programma", label: "Programma", shortLabel: "Piano", Icon: Target },
  {
    href: "/library",
    label: "Scuola Chang",
    shortLabel: "Scuola",
    Icon: BookOpenText,
  },
  {
    href: "/progress",
    label: "Progressi",
    shortLabel: "Progressi",
    Icon: BarChart3,
  },
  { href: "/profile", label: "Profilo", shortLabel: "Profilo", Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="app-nav material-bar hairline" aria-label="Navigazione principale">
      <div className="app-nav__inner">
        {NAV_ITEMS.map(({ href, label, shortLabel, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
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
