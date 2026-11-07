import type { UiMessageKey, UiTranslator } from "./i18n/config";
import type { Discipline, SkillCategory } from "./types";

export const DISCIPLINE_LABELS: Record<Discipline, string> = {
  shaolin: "Shaolin",
  taichi: "T'ai Chi",
};

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  forme: "Forme",
  tui_fa: "Tui Fa",
  po_chi: "Po Chi",
  chin_na: "Chin Na",
  armi_forma: "Armi — forme",
  armi_combattimento: "Armi — combattimento",
  tue_shou: "Tue Shou",
  ta_lu: "Ta Lu",
  chi_kung: "Chi Kung",
  preparatori: "Altro",
};

const CATEGORY_KEYS: Record<SkillCategory, UiMessageKey> = {
  forme: "forms",
  tui_fa: "tuiFa",
  po_chi: "poChi",
  chin_na: "chinNa",
  armi_forma: "weaponForms",
  armi_combattimento: "weaponCombat",
  tue_shou: "tueShou",
  ta_lu: "taLu",
  chi_kung: "chiKung",
  preparatori: "other",
};

export function disciplineLabel(
  discipline: Discipline,
  tr: UiTranslator,
): string {
  return tr(discipline);
}

export function categoryLabel(
  category: SkillCategory,
  tr: UiTranslator,
): string {
  return tr(CATEGORY_KEYS[category]);
}
