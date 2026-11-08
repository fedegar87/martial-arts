"use client";
import { localizedBrand } from "@/lib/brand";

import type { UiTranslator } from "@/lib/i18n/config";
import { useTranslations } from "next-intl";

import {
  BarChart3,
  BookOpenText,
  CalendarDays,
  Target,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  Icon: typeof CalendarDays;
  match?: string[];
};

function NAV_ITEMS(tr: UiTranslator): NavItem[] {
  return [
    {
      href: "/today",
      label: tr("training"),
      shortLabel: tr("training"),
      Icon: CalendarDays,
      match: ["/sessions"],
    },
    {
      href: "/programma",
      label: tr("program"),
      shortLabel: tr("program"),
      Icon: Target,
      match: ["/plan"],
    },
    {
      href: "/library",
      label: localizedBrand(tr("locale")).lineageLabel,
      shortLabel: tr("school"),
      Icon: BookOpenText,
      match: ["/skill"],
    },
    {
      href: "/progress",
      label: tr("progressPlural"),
      shortLabel: tr("progressPlural"),
      Icon: BarChart3,
    },
    {
      href: "/profile",
      label: tr("profile"),
      shortLabel: tr("profile"),
      Icon: User,
    },
  ];
}

export function BottomNav() {
  const tr = useTranslations("ui");
  const pathname = usePathname();

  return (
    <nav
      className="app-nav material-bar hairline"
      aria-label={tr("mainNavigation")}
    >
      <div className="app-nav__inner">
        {NAV_ITEMS(tr).map(({ href, label, shortLabel, Icon, match }) => {
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
              <span
                aria-hidden="true"
                className={`app-nav__active-dot transition-opacity duration-[var(--duration-feedback)] ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              />
              <Icon className="h-5 w-5" />
              <span className="app-nav__label">{shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
