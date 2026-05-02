import { BottomNav } from "@/components/nav/BottomNav";
import { AppHeaderConditional } from "@/components/shared/AppHeaderConditional";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell bg-background">
      <AppHeaderConditional />
      <main className="app-main">{children}</main>
      <BottomNav />
    </div>
  );
}
