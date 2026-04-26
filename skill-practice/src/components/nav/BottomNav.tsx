"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpenText, Home, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/today", label: "Oggi", Icon: Home },
  { href: "/library", label: "Programma", Icon: BookOpenText },
  { href: "/progress", label: "Progressi", Icon: BarChart3 },
  { href: "/profile", label: "Profilo", Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="material-bar hairline fixed bottom-0 left-0 right-0 z-50 border-t pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-2xl items-center justify-around px-1">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`tap-feedback label-font relative flex min-h-16 flex-1 flex-col items-center justify-center gap-1 rounded-md ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {active && (
                <span className="bg-primary absolute top-1 h-1 w-1 rounded-full" />
              )}
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
