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

export const PRACTICE_MODE_ICONS: Record<PracticeMode, string> = {
  solo: "🧍",
  paired: "👥",
  both: "🧍👥",
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
  preparatori: "Preparatori",
};

const CATEGORY_EMOJI: Record<SkillCategory, string> = {
  forme: "🥋",
  tui_fa: "🦵",
  po_chi: "⚔️",
  chin_na: "🤝",
  armi_forma: "🗡️",
  armi_combattimento: "⚔️",
  tue_shou: "🤲",
  ta_lu: "◎",
  chi_kung: "●",
  preparatori: "◆",
};

export function categoryEmoji(category?: SkillCategory | string): string {
  if (!category) return "🥋";
  return CATEGORY_EMOJI[category as SkillCategory] ?? "🥋";
}
