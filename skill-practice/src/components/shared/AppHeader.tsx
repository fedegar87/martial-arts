import { Button } from "@/components/ui/button";
import { Bell, House } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function AppHeader({ newsActive = false }: { newsActive?: boolean }) {
  const tr = useTranslations("ui");
  return (
    <header className="material-bar hairline flex min-h-14 items-center justify-between border-b px-5 pt-[env(safe-area-inset-top)]">
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="min-h-12 min-w-12 text-primary"
      >
        <Link href="/hub" aria-label={tr("backHome")}>
          <House className="h-5 w-5" aria-hidden />
        </Link>
      </Button>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className={`min-h-12 min-w-12 ${newsActive ? "text-primary" : "text-muted-foreground"}`}
      >
        <Link
          href="/news"
          aria-label={tr("news")}
          title={tr("news")}
          aria-current={newsActive ? "page" : undefined}
        >
          <Bell className="h-5 w-5" aria-hidden />
        </Link>
      </Button>
    </header>
  );
}
