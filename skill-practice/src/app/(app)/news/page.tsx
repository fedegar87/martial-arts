import { Newspaper } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export default function NewsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Bacheca</h1>
      </header>
      <EmptyState
        icon={<Newspaper className="h-10 w-10" />}
        title="Nessuna comunicazione"
        description="La bacheca eventi e comunicazioni sarà attivata in Sprint 2."
      />
    </div>
  );
}
