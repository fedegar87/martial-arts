import { BottomNav } from "@/components/nav/BottomNav";
import { AppHeaderConditional } from "@/components/shared/AppHeaderConditional";
import { useTranslations } from "next-intl";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const tr = useTranslations("ui");
  return (
    <div className="app-shell bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:shadow-[var(--shadow-md)]"
      >
        {tr("skipContent")}
      </a>
      <AppHeaderConditional />
      <main id="main" className="app-main">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
