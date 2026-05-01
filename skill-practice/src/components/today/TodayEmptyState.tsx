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
      description="Attiva un programma esame oppure passa alla selezione libera."
      action={
        <Button asChild>
          <Link href="/plan/exam">Programma esame</Link>
        </Button>
      }
    />
  );
}
