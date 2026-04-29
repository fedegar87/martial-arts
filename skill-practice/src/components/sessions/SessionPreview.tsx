type Props = {
  formCount: number;
  reps: number;
};

export function SessionPreview({ formCount, reps }: Props) {
  const minutes = Math.max(1, formCount * reps * 3);
  return (
    <p className="text-muted-foreground text-sm">
      Sessione tipo: ~{minutes} minuti, {formCount} forme × {reps} ripetizioni.
    </p>
  );
}
