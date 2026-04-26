import Link from "next/link";
import { Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";

type Props = {
  customMode?: boolean;
};

export function TodayEmptyState({ customMode = false }: Props) {
  if (customMode) {
    return (
      <EmptyState
        icon={<Library className="h-10 w-10" />}
        title="Nessuna forma selezionata"
        description="Apri la selezione libera e scegli forme e tecniche da praticare."
        action={
          <Button asChild>
            <Link href="/plan/custom">Apri selezione</Link>
          </Button>
        }
      />
    );
  }

  return (
    <EmptyState
      icon={<Library className="h-10 w-10" />}
      title="Nessun contenuto nel tuo piano"
      description="Vai nel programma e aggiungi forme o tecniche da praticare."
      action={
        <Button asChild>
          <Link href="/library">Vai al programma</Link>
        </Button>
      }
    />
  );
}
