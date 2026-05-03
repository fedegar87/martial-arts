import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const seedPath = resolve(
  here,
  "../../supabase/migrations/0004_seed_fesk.sql",
);
const seed = readFileSync(seedPath, "utf8");

type Discipline = "shaolin" | "taichi";

type SkillRow = { discipline: Discipline; grade: number; name: string };
type ExamRow = { discipline: Discipline; grade: number; levelName: string };

function extractSection(start: string, end: string): string {
  const startIdx = seed.indexOf(start);
  const endIdx = seed.indexOf(end, startIdx);
  if (startIdx < 0 || endIdx < 0) {
    throw new Error(`Sezione "${start}" → "${end}" non trovata nel seed`);
  }
  return seed.slice(startIdx, endIdx);
}

function parseRows<T>(
  section: string,
  rowRegex: RegExp,
  build: (m: RegExpMatchArray) => T,
): T[] {
  const rows: T[] = [];
  for (const m of section.matchAll(rowRegex)) {
    rows.push(build(m));
  }
  return rows;
}

const skillSection = extractSection("skill_seed (", "inserted_skills AS");
const examSection = extractSection("exam_seed (", "exam_with_prev AS");

const skillRows: SkillRow[] = parseRows(
  skillSection,
  /\(\s*\d+\s*,\s*'(shaolin|taichi)'::discipline\s*,\s*(-?\d+)\s*,\s*'((?:''|[^'])*)'/g,
  (m) => ({
    discipline: m[1] as Discipline,
    grade: Number(m[2]),
    name: m[3].replace(/''/g, "'"),
  }),
);

const examRows: ExamRow[] = parseRows(
  examSection,
  /\(\s*\d+\s*,\s*'(shaolin|taichi)'::discipline\s*,\s*(-?\d+)\s*,\s*'((?:''|[^'])*)'/g,
  (m) => ({
    discipline: m[1] as Discipline,
    grade: Number(m[2]),
    levelName: m[3].replace(/''/g, "'"),
  }),
);

function findSkill(discipline: Discipline, name: string): SkillRow | undefined {
  return skillRows.find((s) => s.discipline === discipline && s.name === name);
}

function skillsForExam(exam: ExamRow): SkillRow[] {
  // Stessa regola usata da `activate_exam_mode`:
  // skill.discipline = exam.discipline AND skill.minimum_grade_value = exam.grade_value
  return skillRows.filter(
    (s) => s.discipline === exam.discipline && s.grade === exam.grade,
  );
}

test("parser del seed estrae skill ed esami", () => {
  assert.ok(skillRows.length > 0, "atteso almeno uno skill nel seed");
  assert.ok(examRows.length > 0, "atteso almeno un esame nel seed");
});

test("regressione: Pang Fa 2 Lu è a grade -1 (1° Chieh), non -2", () => {
  const pangFa = findSkill("shaolin", "Pang Fa 2 Lu");
  assert.ok(pangFa, "Pang Fa 2 Lu deve esistere nel seed Shaolin");
  assert.equal(pangFa.grade, -1);
});

test("regressione: Lien Pu Ch'uan 1 Lu è a grade 7 (7° Chi), non -2", () => {
  const lienPu = findSkill("shaolin", "Lien Pu Ch'uan 1 Lu");
  assert.ok(lienPu, "Lien Pu Ch'uan 1 Lu deve esistere nel seed Shaolin");
  assert.equal(lienPu.grade, 7);
});

test("regressione: l'esame Shaolin 2° Chieh non include Pang Fa 2 Lu né Lien Pu Ch'uan 1 Lu", () => {
  const exam = examRows.find(
    (e) => e.discipline === "shaolin" && e.grade === -2,
  );
  assert.ok(exam, "esame Shaolin 2° Chieh deve esistere nel seed");
  const names = new Set(skillsForExam(exam).map((s) => s.name));
  assert.equal(names.has("Pang Fa 2 Lu"), false);
  assert.equal(names.has("Lien Pu Ch'uan 1 Lu"), false);
});

test("invariante: ogni esame oltre lo starter di disciplina ha almeno una skill associata", () => {
  // Lo starter (grado massimo) è il primo esame: per design può non avere skill
  // perché non c'è ancora nulla di formale da preparare.
  const starterByDiscipline = new Map<Discipline, number>();
  for (const exam of examRows) {
    const current = starterByDiscipline.get(exam.discipline);
    if (current === undefined || exam.grade > current) {
      starterByDiscipline.set(exam.discipline, exam.grade);
    }
  }

  for (const exam of examRows) {
    if (starterByDiscipline.get(exam.discipline) === exam.grade) continue;
    const associated = skillsForExam(exam);
    assert.ok(
      associated.length > 0,
      `esame ${exam.discipline} grade ${exam.grade} (${exam.levelName}) non ha skill: il piano d'esame sarebbe vuoto`,
    );
  }
});

test("invariante: nessuna skill associata a un esame ha minimum_grade_value diverso da quello dell'esame", () => {
  for (const exam of examRows) {
    for (const skill of skillsForExam(exam)) {
      assert.equal(
        skill.grade,
        exam.grade,
        `skill ${skill.name} (${skill.discipline} grade ${skill.grade}) non dovrebbe far parte dell'esame ${exam.levelName}`,
      );
    }
  }
});
