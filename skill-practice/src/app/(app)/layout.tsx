import { BottomNav } from "@/components/nav/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen pb-20">
      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
      <BottomNav />
    </div>
  );
}
