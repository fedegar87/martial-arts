// Convenzione gradi FESK (lineare decrescente):
//   Chi positivi (8 → 1) → studente
//   Chieh negativi (-1 → -5) → cinture nere
//   Mezza Luna (-6 → -7) → cinture oro
//   Shaolin parte da 8 (più alto = più principiante)
//   T'ai Chi parte da 5; valore 0 = "non praticato"
//
// Regola: skill visibile ⇔ skill.minimum_grade_value >= user.assigned_level_<disciplina>

import type { ContentAccessMode, Discipline } from "./types";

export type Grade = { value: number; label: string };

// Mirror del predicato DB is_skill_in_scope per la sola parte "scope di libreria"
// (grado corrente o piu basso, Altro solo per all-access). I contenuti dell'esame in
// preparazione vivono nel piano: vanno consentiti a parte (es. skill gia nel piano).
export function isSkillWithinLevelScope(
  scope: {
    content_access_mode: ContentAccessMode;
    can_view_extra_content: boolean;
    assigned_level_shaolin: number;
    assigned_level_taichi: number;
  },
  skill: { discipline: Discipline; minimum_grade_value: number; is_extra: boolean },
): boolean {
  if (scope.content_access_mode === "all_school_content") return true;
  if (skill.is_extra && !scope.can_view_extra_content) return false;
  if (skill.discipline === "taichi") {
    if (scope.assigned_level_taichi === 0) return false;
    return skill.minimum_grade_value >= scope.assigned_level_taichi;
  }
  return skill.minimum_grade_value >= scope.assigned_level_shaolin;
}

// Grado-sentinella per skill fuori dal programma cinture (sezione "Altro").
// Fuori dalla scala -7..8, quindi non entra nella selezione esami.
export const EXTRA_GRADE_VALUE = 99;
export const EXTRA_GRADE_LABEL = "Altro";

export const SHAOLIN_GRADES: Grade[] = [
  { value: 8, label: "8° Chi" },
  { value: 7, label: "7° Chi" },
  { value: 6, label: "6° Chi" },
  { value: 5, label: "5° Chi" },
  { value: 4, label: "4° Chi" },
  { value: 3, label: "3° Chi" },
  { value: 2, label: "2° Chi" },
  { value: 1, label: "1° Chi" },
  { value: -1, label: "1° Chieh" },
  { value: -2, label: "2° Chieh" },
  { value: -3, label: "3° Chieh" },
  { value: -4, label: "4° Chieh" },
  { value: -5, label: "5° Chieh" },
  { value: -6, label: "1° Mezza Luna" },
  { value: -7, label: "2° Mezza Luna" },
];

export const TAICHI_GRADES: Grade[] = [
  { value: 0, label: "Non praticato" },
  ...SHAOLIN_GRADES.filter((g) => g.value <= 5),
];

export function gradeLabel(value: number): string {
  if (value === EXTRA_GRADE_VALUE) return EXTRA_GRADE_LABEL;
  return SHAOLIN_GRADES.find((g) => g.value === value)?.label ?? `${value}`;
}

export function gradesForDiscipline(discipline: Discipline): Grade[] {
  return discipline === "shaolin" ? SHAOLIN_GRADES : TAICHI_GRADES;
}

export function gradeLabelForDiscipline(
  discipline: Discipline,
  value: number,
): string {
  if (value === EXTRA_GRADE_VALUE) return EXTRA_GRADE_LABEL;
  return (
    gradesForDiscipline(discipline).find((g) => g.value === value)?.label ??
    `${value}`
  );
}

export function nextGradeValue(current: number): number | null {
  // Il prossimo grado è quello con value = current - 1, se esiste
  // (numero più basso = grado tecnicamente superiore)
  const idx = SHAOLIN_GRADES.findIndex((g) => g.value === current);
  if (idx < 0 || idx === SHAOLIN_GRADES.length - 1) return null;
  return SHAOLIN_GRADES[idx + 1].value;
}

export function minimumSelectableExamGradeValue(current: number): number | null {
  if (current === 0) return null;

  const idx = SHAOLIN_GRADES.findIndex((g) => g.value === current);
  if (idx < 0) return null;

  return nextGradeValue(current) ?? current;
}

export function isSelectableExamGrade(
  currentGrade: number,
  examGrade: number,
): boolean {
  const minimum = minimumSelectableExamGradeValue(currentGrade);
  return minimum !== null && examGrade >= minimum;
}

export function gradesAtOrBelow(value: number): Grade[] {
  // Ritorna i gradi accessibili (per scegliere quale esame preparare)
  return SHAOLIN_GRADES.filter((g) => g.value < value);
}
