import type { Discipline, PracticeMode, SkillCategory } from "./types";

export const DISCIPLINE_LABELS: Record<Discipline, string> = {
  shaolin: "Shaolin",
  taichi: "T'ai Chi",
};

export const PRACTICE_MODE_LABELS: Record<PracticeMode, string> = {
  solo: "Da solo",
  paired: "Con partner",
  both: "Forma + applicazione",
};

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  forme: "Forme",
  tui_fa: "Tui Fa (calci)",
  po_chi: "Po Chi (combattimento)",
  chin_na: "Chin Na (leve)",
  armi_forma: "Armi — forme",
  armi_combattimento: "Armi — combattimento",
  tue_shou: "Tue Shou (mani spinte)",
  ta_lu: "Ta Lu",
  chi_kung: "Chi Kung",
  preparatori: "Altro",
};
