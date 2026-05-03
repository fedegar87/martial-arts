// Convenzione gradi FESK (lineare decrescente):
//   Chi positivi (8 → 1) → studente
//   Chieh negativi (-1 → -5) → cinture nere
//   Mezza Luna (-6 → -7) → cinture oro
//   Shaolin parte da 8 (più alto = più principiante)
//   T'ai Chi parte da 5; valore 0 = "non praticato"
//
// Regola: skill visibile ⇔ skill.minimum_grade_value >= user.assigned_level_<disciplina>

import type { Discipline } from "./types";

export type Grade = { value: number; label: string };

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
  return SHAOLIN_GRADES.find((g) => g.value === value)?.label ?? `${value}`;
}

export function gradesForDiscipline(discipline: Discipline): Grade[] {
  return discipline === "shaolin" ? SHAOLIN_GRADES : TAICHI_GRADES;
}

export function gradeLabelForDiscipline(
  discipline: Discipline,
  value: number,
): string {
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
