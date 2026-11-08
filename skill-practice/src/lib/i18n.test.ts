import { createTranslator } from "next-intl";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { validatePasswordStrength } from "./auth-validation.ts";
import { formatFederationEventTime } from "./federation-event-logic.ts";
import { gradeLabel, gradesForDiscipline } from "./grades.ts";
import type { UiTranslator } from "./i18n/config.ts";
import { localizeSkill, localizeContent } from "./content-localization.ts";
import { DEFAULT_LOCALE, resolveLocale } from "./i18n/config.ts";
import { buildTrainingReminderPayload } from "./push-notifications.ts";

const lib = path.dirname(fileURLToPath(import.meta.url));
const catalogs = Object.fromEntries(
  ["it", "fr"].map((locale) => [
    locale,
    JSON.parse(readFileSync(path.join(lib, `i18n/${locale}.json`), "utf8")) as {
      ui: Record<string, string>;
    },
  ]),
);
const translator = (locale: string) =>
  createTranslator({
    locale,
    messages: catalogs[locale],
    namespace: "ui",
    onError(error) {
      throw error;
    },
  });

test("locale selection validates cookies and respects browser weights and regional tags", () => {
  assert.equal(resolveLocale("it", "fr-BE,fr;q=0.9"), "it");
  assert.equal(resolveLocale("fr", "it-IT"), "fr");
  assert.equal(resolveLocale("invalid", "fr-BE,fr;q=0.9,it;q=0.5"), "fr");
  assert.equal(resolveLocale(null, "en-US,fr;q=0.4,it;q=0.8"), "it");
  assert.equal(resolveLocale(null, "fr;q=0,it;q=0.5"), "it");
  assert.equal(resolveLocale(null, "fr;q=bogus,en;q=1"), DEFAULT_LOCALE);
  assert.equal(resolveLocale("../../fr", null), DEFAULT_LOCALE);
  assert.equal(resolveLocale("it", "it-IT", "fr"), "fr");
  assert.equal(resolveLocale("fr", "fr-BE", "it"), "it");
  assert.equal(resolveLocale("it", "fr", "de"), "it");
  assert.equal(resolveLocale(null, "fr-BE", null), "fr");
});

test("catalogs have matching keys and every ICU message formats without errors", () => {
  assert.deepEqual(
    Object.keys(catalogs.it.ui).sort(),
    Object.keys(catalogs.fr.ui).sort(),
  );
  for (const locale of ["it", "fr"]) {
    const tr = translator(locale);
    for (const key of Object.keys(catalogs[locale].ui)) {
      const text = tr(key, {
        p0: 2,
        p1: "test",
        p2: "test",
        p3: "test",
        count: 2,
        days: 2,
      });
      assert.ok(text.trim(), `${locale}.${key}`);
    }
  }
});

test("every literal UI key used in components and actions exists in both catalogs", () => {
  const src = path.dirname(lib);
  for (const relative of readdirSync(src, { recursive: true }) as string[]) {
    if (!/\.(tsx|ts)$/.test(relative) || relative.endsWith(".test.ts"))
      continue;
    const source = readFileSync(path.join(src, relative), "utf8");
    const notificationKeys = new Set([
      "trainingWithNames",
      "trainingCount",
      "moreExercises",
      "allDay",
      "eventTomorrow",
    ]);
    for (const match of source.matchAll(/\btr\("([\w]+)"/g)) {
      if (
        relative.endsWith("push-notifications.ts") &&
        notificationKeys.has(match[1])
      )
        continue;
      assert.ok(match[1] in catalogs.it.ui, `${relative}: missing ${match[1]}`);
      assert.ok(
        match[1] in catalogs.fr.ui,
        `${relative}: missing French ${match[1]}`,
      );
    }
  }
});

test("French grades, validation and background reminders preserve domain values", () => {
  const tr = translator("fr") as UiTranslator;
  assert.equal(gradeLabel(1, tr), "1er Chi");
  assert.equal(gradeLabel(-2, tr), "2e Chieh");
  assert.equal(gradeLabel(99, tr), "Autres");
  assert.equal(tr("exerciseCount", { p0: 1 }), "1 exercice");
  assert.equal(tr("exerciseCount", { p0: 2 }), "2 exercices");
  assert.equal(tr("practiceThisWeek", { count: 1 }), "1 jour cette semaine");
  assert.deepEqual(
    gradesForDiscipline("taichi", tr).map((g) => g.value),
    gradesForDiscipline("taichi").map((g) => g.value),
  );
  assert.match(
    validatePasswordStrength("short", tr).error ?? "",
    /au moins 8 caractères/,
  );
  const payload = buildTrainingReminderPayload({
    date: "2026-11-07",
    exerciseNames: ["Lien Pu Ch’uan"],
    includeExerciseNames: false,
    locale: "fr",
  });
  assert.equal(payload.body, "À pratiquer aujourd’hui : 1 exercice");
  assert.equal(payload.url, "/today");
  assert.equal(
    formatFederationEventTime(
      {
        all_day: true,
        starts_at: "2026-11-07T00:00:00Z",
        ends_at: "2026-11-07T23:00:00Z",
      },
      "fr",
    ),
    "Toute la journée",
  );
});

test("authored content translations preserve Chinese names, source text, permissions and identifiers", () => {
  const skill = {
    id: "original",
    name: "Lien Pu Ch’uan",
    name_italian: "Forma fondamentale",
    teacher_notes: "Nota originale",
    video_url: "/original",
    minimum_grade_value: 7,
    translations: {
      fr: {
        subtitle: "Forme fondamentale",
        teacher_notes: "Note française",
        id: "tampered",
        video_url: "/tampered",
        minimum_grade_value: -7,
      },
    },
  };
  const french = localizeSkill(skill, "fr");
  assert.equal(french.subtitle, "Forme fondamentale");
  assert.equal(french.teacher_notes, "Note française");
  assert.equal(french.name, skill.name);
  assert.equal(french.name_italian, skill.name_italian);
  assert.equal(french.id, "original");
  assert.equal(french.video_url, "/original");
  assert.equal(french.minimum_grade_value, 7);
  assert.equal(french.translations, undefined);
  assert.equal(skill.translations.fr.subtitle, "Forme fondamentale");
  assert.equal(localizeSkill(skill, "it").subtitle, "Forma fondamentale");
  assert.equal(
    localizeSkill(
      { ...skill, translations: { fr: { subtitle: 42, teacher_notes: " " } } },
      "fr",
    ).teacher_notes,
    "Nota originale",
  );
  const news = {
    title: "Titolo",
    body: "Testo",
    school_id: "school",
    translations: { fr: { title: "Titre", school_id: "other" } },
  };
  assert.deepEqual(localizeContent(news, "fr", ["title", "body"]), {
    title: "Titre",
    body: "Testo",
    school_id: "school",
  });
});
