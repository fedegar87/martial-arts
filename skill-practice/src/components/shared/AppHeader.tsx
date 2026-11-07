import Link from "next/link";
import { Bell } from "lucide-react";
import { TempleHomeIcon } from "./TempleHomeIcon";
import { Button } from "@/components/ui/button";

export function AppHeader({ newsActive = false }: { newsActive?: boolean }) {
  return (
    <header className="material-bar hairline flex min-h-14 items-center justify-between border-b px-5 pt-[env(safe-area-inset-top)]">
      <Link
        href="/hub"
        aria-label="Torna alla home"
        className="tap-feedback inline-flex min-h-12 min-w-12 items-center justify-center text-primary transition-all hover:opacity-90 active:scale-95"
      >
        <TempleHomeIcon className="h-6 w-6 drop-shadow-[0_0_8px_var(--tint-glow)]" aria-hidden />
      </Link>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className={`min-h-12 min-w-12 ${newsActive ? "text-primary" : "text-muted-foreground"}`}
      >
        <Link
          href="/news"
          aria-label="Bacheca"
          title="Bacheca"
          aria-current={newsActive ? "page" : undefined}
        >
          <Bell className="h-5 w-5" aria-hidden />
        </Link>
      </Button>
    </header>
  );
}
