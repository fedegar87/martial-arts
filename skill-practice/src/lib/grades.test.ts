import assert from "node:assert/strict";
import test from "node:test";
import { SHAOLIN_GRADES, TAICHI_GRADES, nextGradeValue } from "./grades.ts";

// La RPC SQL `activate_exam_mode` calcola il grado d'esame atteso con:
//   CASE WHEN assigned_level = 1 THEN -1 ELSE assigned_level - 1 END
// Questa funzione replica la formula in TS per poter dichiarare l'invariante:
// TS e SQL devono produrre lo stesso risultato per i gradi non terminali.
function sqlNextGradeFormula(current: number): number {
  return current === 1 ? -1 : current - 1;
}

test("nextGradeValue allineato con formula SQL CASE per ogni grado Shaolin non terminale", () => {
  const lastIdx = SHAOLIN_GRADES.length - 1;
  for (let i = 0; i < lastIdx; i++) {
    const value = SHAOLIN_GRADES[i].value;
    assert.equal(
      nextGradeValue(value),
      sqlNextGradeFormula(value),
      `nextGradeValue(${value}) deve coincidere con la CASE SQL`,
    );
  }
});

test("nextGradeValue allineato con formula SQL CASE per ogni grado T'ai Chi praticato", () => {
  const taichiPracticed = TAICHI_GRADES.filter((g) => g.value !== 0);
  const lastIdx = taichiPracticed.length - 1;
  for (let i = 0; i < lastIdx; i++) {
    const value = taichiPracticed[i].value;
    assert.equal(
      nextGradeValue(value),
      sqlNextGradeFormula(value),
      `nextGradeValue(${value}) (taichi) deve coincidere con la CASE SQL`,
    );
  }
});

test("nextGradeValue ritorna null sull'ultimo grado: la JOIN SQL non trova esame e fallisce in modo controllato", () => {
  const last = SHAOLIN_GRADES[SHAOLIN_GRADES.length - 1].value;
  assert.equal(nextGradeValue(last), null);
  // La CASE SQL produrrebbe last - 1 (un grado inesistente), ma nessun
  // exam_program ha quel grade_value: la JOIN in activate_exam_mode non trova
  // match e la RPC ritorna 'Invalid Shaolin exam'. Comportamento equivalente.
});

test("nextGradeValue ritorna null su valori fuori scala", () => {
  assert.equal(nextGradeValue(99), null);
  assert.equal(nextGradeValue(0), null);
});
