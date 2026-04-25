import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Discipline, PlanStatus, PracticeLog, Skill, UserProfile } from "@/lib/types";

export type CurriculumCell = {
  skill: Skill;
  status: PlanStatus | "available" | "locked";
};

export type PracticeDay = {
  date: string;
  count: number;
};

export type ProgressData = {
  skills: Skill[];
  planBySkillId: Map<string, PlanStatus>;
  logs: PracticeLog[];
  calendar: PracticeDay[];
  currentStreak: number;
  bestStreak: number;
  examProgress: {
    title: string;
    percent: number;
    missing: Skill[];
  } | null;
};

export async function getProgressData(
  userId: string,
  profile: UserProfile,
): Promise<ProgressData> {
  const supabase = await createClient();

  const [{ data: skillsData }, { data: planData }, { data: logsData }] =
    await Promise.all([
      supabase.from("skills").select("*").order("display_order"),
      supabase
        .from("user_plan_items")
        .select("*")
        .eq("user_id", userId)
        .eq("is_hidden", false),
      supabase
        .from("practice_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("date", dateDaysAgo(89))
        .order("date", { ascending: true }),
    ]);

  const skills = (skillsData as Skill[] | null) ?? [];
  const logs = (logsData as PracticeLog[] | null) ?? [];
  const planRows =
    (planData as Array<{ skill_id: string; status: PlanStatus }> | null) ?? [];
  const planBySkillId = new Map(planRows.map((row) => [row.skill_id, row.status]));
  const calendar = buildCalendar(logs);

  return {
    skills,
    planBySkillId,
    logs,
    calendar,
    currentStreak: computeCurrentStreak(calendar),
    bestStreak: computeBestStreak(calendar),
    examProgress: await getExamProgress(profile, skills, planBySkillId),
  };
}

export function buildCurriculumCells(
  skills: Skill[],
  planBySkillId: Map<string, PlanStatus>,
  discipline: Discipline,
  userLevel: number,
): CurriculumCell[] {
  return skills
    .filter((skill) => skill.discipline === discipline)
    .map((skill) => ({
      skill,
      status:
        userLevel !== 0 && skill.minimum_grade_value < userLevel
          ? "locked"
          : planBySkillId.get(skill.id) ?? "available",
    }));
}

export function computeCategoryProgress(cells: CurriculumCell[]) {
  const grouped = new Map<string, { total: number; active: number }>();

  for (const cell of cells.filter((item) => item.status !== "locked")) {
    const key = radarCategory(cell.skill);
    const prev = grouped.get(key) ?? { total: 0, active: 0 };
    prev.total += 1;
    if (
      cell.status === "focus" ||
      cell.status === "review" ||
      cell.status === "maintenance"
    ) {
      prev.active += 1;
    }
    grouped.set(key, prev);
  }

  return [...grouped.entries()].map(([label, value]) => ({
    label,
    percent: value.total === 0 ? 0 : Math.round((value.active / value.total) * 100),
  }));
}

function buildCalendar(logs: PracticeLog[]): PracticeDay[] {
  const counts = new Map<string, number>();
  for (const log of logs) {
    if (!log.completed) continue;
    counts.set(log.date, (counts.get(log.date) ?? 0) + 1);
  }

  return Array.from({ length: 90 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (89 - index));
    const key = toDateString(date);
    return { date: key, count: counts.get(key) ?? 0 };
  });
}

function computeCurrentStreak(days: PracticeDay[]): number {
  let index = days.length - 1;
  if (days[index]?.count === 0) index -= 1;

  let streak = 0;
  for (let i = index; i >= 0; i -= 1) {
    if (days[i].count === 0) break;
    streak += 1;
  }
  return streak;
}

function computeBestStreak(days: PracticeDay[]): number {
  let best = 0;
  let current = 0;
  for (const day of days) {
    if (day.count > 0) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}

async function getExamProgress(
  profile: UserProfile,
  skills: Skill[],
  planBySkillId: Map<string, PlanStatus>,
): Promise<ProgressData["examProgress"]> {
  const examId = profile.preparing_exam_id ?? profile.preparing_exam_taichi_id;
  if (!examId) return null;

  const supabase = await createClient();
  const [{ data: examData }, { data: reqData }] = await Promise.all([
    supabase.from("exam_programs").select("*").eq("id", examId).maybeSingle(),
    supabase
      .from("exam_skill_requirements")
      .select("skill_id")
      .eq("exam_id", examId),
  ]);

  const reqIds = new Set(
    ((reqData ?? []) as Array<{ skill_id: string }>).map((row) => row.skill_id),
  );
  const requiredSkills = skills.filter((skill) => reqIds.has(skill.id));
  const covered = requiredSkills.filter((skill) => planBySkillId.has(skill.id));
  const missing = requiredSkills.filter((skill) => !planBySkillId.has(skill.id));
  const title =
    (examData as { level_name?: string } | null)?.level_name ?? "Esame";

  return {
    title,
    percent:
      requiredSkills.length === 0
        ? 0
        : Math.round((covered.length / requiredSkills.length) * 100),
    missing,
  };
}

function radarCategory(skill: Skill): string {
  if (skill.category === "armi_forma" || skill.category === "armi_combattimento") {
    return "Armi";
  }
  if (skill.category === "chi_kung") return "Forme";
  if (skill.category === "tui_fa") return "Tui Fa";
  if (skill.category === "po_chi") return "Po Chi";
  if (skill.category === "chin_na") return "Chin Na";
  if (skill.category === "tue_shou") return "Tue Shou";
  if (skill.category === "ta_lu") return "Ta Lu";
  return "Forme";
}

function dateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toDateString(date);
}

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}
