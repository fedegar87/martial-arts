import Link from "next/link";
import { CalendarPlus, Dumbbell, Library, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";

type Props = {
  reason: "no_schedule" | "expired" | "no_plan" | "empty_session";
  customMode?: boolean;
};

export function TodayEmptyState({ reason, customMode = false }: Props) {
  if (reason === "no_schedule") {
    return (
      <EmptyState
        icon={<CalendarPlus className="h-10 w-10" />}
        title="Definisci le tue sessioni"
        description="Scegli giorni, durata e cadenza. Distribuiamo noi le forme sulle tue settimane."
        action={
          <Button asChild>
            <Link href="/sessions/setup">Definisci sessioni</Link>
          </Button>
        }
      />
    );
  }

  if (reason === "expired") {
    return (
      <EmptyState
        icon={<Sparkles className="h-10 w-10" />}
        title="Le tue sessioni sono terminate"
        description="Aggiorna durata e cadenza per ripartire."
        action={
          <Button asChild>
            <Link href="/sessions/setup">Rinnova sessioni</Link>
          </Button>
        }
      />
    );
  }

  if (reason === "empty_session") {
    return (
      <EmptyState
        icon={<Dumbbell className="h-10 w-10" />}
        title="Nessun esercizio previsto oggi"
        description="Il piano di allenamento attivo non assegna esercizi a questa sessione. Controlla il piano o aggiorna le sessioni."
        action={
          <Button asChild>
            <Link href="/programma">Controlla piano</Link>
          </Button>
        }
      />
    );
  }

  if (customMode) {
    return (
      <EmptyState
        icon={<Library className="h-10 w-10" />}
        title="Nessuna forma selezionata"
        description="Apri la selezione personale e scegli forme e tecniche da praticare."
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
      description="Attiva un programma esame oppure passa alla selezione personale."
      action={
        <Button asChild>
          <Link href="/plan/exam">Programma esame</Link>
        </Button>
      }
    />
  );
}
