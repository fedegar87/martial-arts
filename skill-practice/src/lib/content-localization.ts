export type ContentTranslations = Record<string, Record<string, unknown>>;

type Translatable = { translations?: ContentTranslations };

function text(
  translations: Record<string, unknown>,
  key: string,
  fallback: string | null,
): string | null {
  const value = translations[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function translation(
  row: Translatable,
  locale: string,
): Record<string, unknown> {
  const value = row.translations?.[locale];
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

export function localizeSkill<
  T extends Translatable & { name_italian: string | null },
>(row: T, locale: string): T & { subtitle: string | null } {
  const selected = translation(row, locale);
  const original = { ...row };
  delete original.translations;
  const result = {
    ...original,
    subtitle: text(selected, "subtitle", row.name_italian),
  } as T & { subtitle: string | null };
  for (const key of [
    "description",
    "teacher_notes",
    "video_label",
    "secondary_video_label",
  ] as const) {
    if (key in row) {
      Object.assign(result, {
        [key]: text(
          selected,
          key,
          (row as Record<string, unknown>)[key] as string | null,
        ),
      });
    }
  }
  return result;
}

export function localizeSkills<
  T extends Translatable & { name_italian: string | null },
>(rows: T[], locale: string): Array<T & { subtitle: string | null }> {
  return rows.map((row) => localizeSkill(row, locale));
}

export function localizeContent<T extends Translatable>(
  row: T,
  locale: string,
  fields: string[],
): T {
  const selected = translation(row, locale);
  const original = { ...row };
  delete original.translations;
  const result = { ...original } as T;
  for (const key of fields) {
    const fallback = (row as Record<string, unknown>)[key];
    if (typeof fallback === "string" || fallback === null) {
      Object.assign(result, { [key]: text(selected, key, fallback) });
    }
  }
  return result;
}
