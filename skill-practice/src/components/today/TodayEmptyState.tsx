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
        description="Apri la selezione libera e scegli le skill da praticare."
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
      title="Nessuna skill nel tuo piano"
      description="Vai in libreria e aggiungi le skill che vuoi praticare."
      action={
        <Button asChild>
          <Link href="/library">Vai alla libreria</Link>
        </Button>
      }
    />
  );
}
