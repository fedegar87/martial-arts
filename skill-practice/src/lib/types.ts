// Mirror del DB Postgres in snake_case.
// Sprint 1.5: due discipline (Shaolin + T'ai Chi), gradi negativi (Chieh, Mezza Luna),
// modalità pratica (solo / paired / both), nome cinese + traduzione italiana.

export type Discipline = "shaolin" | "taichi";

export type PracticeMode = "solo" | "paired" | "both";

export type SkillCategory =
  | "forme"
  | "tui_fa"
  | "po_chi"
  | "chin_na"
  | "armi_forma"
  | "armi_combattimento"
  | "tue_shou"
  | "ta_lu"
  | "chi_kung"
  | "preparatori";

export type PlanStatus = "focus" | "review" | "maintenance";

export type PlanItemSource = "exam_program" | "manual";

export type PlanMode = "exam" | "custom";

export type UserRole = "student" | "instructor" | "admin";

export type NewsType = "event" | "announcement";

export type School = {
  id: string;
  name: string;
  description: string | null;
};

export type Skill = {
  id: string;
  school_id: string;
  name: string; // nome cinese traslitterato
  name_italian: string | null;
  category: SkillCategory;
  discipline: Discipline;
  practice_mode: PracticeMode;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  teacher_notes: string | null;
  estimated_duration_seconds: number | null;
  minimum_grade_value: number;
  display_order: number;
  created_at: string;
};

export type ExamProgram = {
  id: string;
  school_id: string;
  discipline: Discipline;
  grade_value: number;
  level_name: string;
  description: string | null;
  grade_from: string | null;
  grade_to: string | null;
};

export type ExamSkillRequirement = {
  exam_id: string;
  skill_id: string;
  default_status: PlanStatus;
};

export type UserProfile = {
  id: string;
  school_id: string;
  display_name: string;
  assigned_level_shaolin: number;
  assigned_level_taichi: number; // 0 = non praticato
  preparing_exam_id: string | null;
  preparing_exam_taichi_id: string | null;
  plan_mode: PlanMode;
  role: UserRole;
  created_at: string;
};

export type UserPlanItem = {
  id: string;
  user_id: string;
  skill_id: string;
  status: PlanStatus;
  source: PlanItemSource;
  is_hidden: boolean;
  last_practiced_at: string | null;
  added_at: string;
};

export type PracticeLog = {
  id: string;
  user_id: string;
  skill_id: string;
  date: string;
  completed: boolean;
  personal_note: string | null;
  created_at: string;
};

export type NewsItem = {
  id: string;
  school_id: string;
  title: string;
  body: string;
  type: NewsType;
  published_at: string;
  event_date: string | null;
  event_location: string | null;
  pinned: boolean;
};
