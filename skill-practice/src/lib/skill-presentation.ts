function comparableName(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function skillItalianSubtitle(name: string, italian: string | null): string | null {
  const subtitle = italian?.trim();
  if (!subtitle) return null;
  const original = comparableName(name);
  const translated = comparableName(subtitle);
  return translated === original || translated === `forma${original}` ? null : subtitle;
}

export function formatEstimatedMinutes(seconds: number | null): string | null {
  if (seconds === null || !Number.isFinite(seconds) || seconds <= 0) return null;
  return seconds < 60 ? "< 1 min" : `${Math.round(seconds / 60)} min`;
}
