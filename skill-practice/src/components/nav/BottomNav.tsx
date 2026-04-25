"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Home, Library, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/today", label: "Oggi", Icon: Home },
  { href: "/library", label: "Libreria", Icon: Library },
  { href: "/progress", label: "Progresso", Icon: BarChart3 },
  { href: "/profile", label: "Profilo", Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-card/95 border-border fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-around">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`label-font relative flex min-h-16 flex-1 flex-col items-center justify-center gap-1 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {active && (
                <span className="bg-primary absolute top-0 h-0.5 w-10 rounded-full" />
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
