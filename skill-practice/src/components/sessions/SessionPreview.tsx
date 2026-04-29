// Stima rough: una performance (singola ripetizione di una forma) richiede ~3 minuti.
// Non usa estimated_duration_seconds reale per semplicità (l'anteprima è solo orientativa).
const MINUTES_PER_PERFORMANCE = 3;

type Props = {
  formCount: number;
  reps: number;
};

export function SessionPreview({ formCount, reps }: Props) {
  const minutes = Math.max(1, formCount * reps * MINUTES_PER_PERFORMANCE);
  return (
    <p className="text-muted-foreground text-sm">
      Sessione tipo: ~{minutes} minuti, {formCount} forme × {reps} ripetizioni.
    </p>
  );
}
