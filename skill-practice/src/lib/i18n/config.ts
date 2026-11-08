import type messages from "./it.json";

export const LOCALES = ["it", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_COOKIE = "practice_locale";
export const DEFAULT_LOCALE: Locale =
  process.env.NEXT_PUBLIC_DEFAULT_LOCALE === "fr" ? "fr" : "it";
export type UiMessageKey = keyof typeof messages.ui;
export type UiTranslator = (
  key: UiMessageKey,
  values?: Record<string, string | number>,
) => string;

export function isLocale(value: unknown): value is Locale {
  return value === "it" || value === "fr";
}

export function resolveLocale(
  cookie: unknown,
  acceptLanguage: string | null,
  accountLocale?: unknown,
): Locale {
  if (isLocale(accountLocale)) return accountLocale;
  if (isLocale(cookie)) return cookie;
  const languages = (acceptLanguage ?? "")
    .split(",")
    .map((entry, index) => {
      const [tag, ...parameters] = entry.trim().split(";");
      const quality = parameters.find((part) => part.trim().startsWith("q="));
      const weight = quality ? Number(quality.trim().slice(2)) : 1;
      return { language: tag.toLowerCase().split("-")[0], weight, index };
    })
    .filter(
      ({ weight }) => Number.isFinite(weight) && weight > 0 && weight <= 1,
    )
    .sort((a, b) => b.weight - a.weight || a.index - b.index);
  return (
    (languages.find(({ language }) => isLocale(language))?.language as
      Locale | undefined) ?? DEFAULT_LOCALE
  );
}
