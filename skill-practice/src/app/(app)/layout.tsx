import { BottomNav } from "@/components/nav/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-dvh pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
      <BottomNav />
    </div>
  );
}
