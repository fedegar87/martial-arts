export function isProgramId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function normalizeProgramName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim();
  const hasControl = [...name].some((character) => {
    const code = character.codePointAt(0) ?? 0;
    return code < 32 || code === 127;
  });
  return name.length >= 1 && [...name].length <= 60 && !hasControl ? name : null;
}
