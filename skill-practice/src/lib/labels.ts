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
