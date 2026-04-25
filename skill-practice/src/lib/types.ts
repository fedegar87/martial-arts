// Mirror del DB Postgres in snake_case.
// Sprint 1: un solo livello di tipi. Domain types camelCase aggiungibili in futuro.

export type SkillCategory =
  | "forme"
  | "tecniche_base"
  | "combinazioni"
  | "preparatori"
  | "condizionamento"
  | "altro";

export type PlanStatus = "focus" | "review" | "maintenance";

export type PlanItemSource = "exam_program" | "manual";

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
  name: string;
  category: SkillCategory;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  teacher_notes: string | null;
  estimated_duration_seconds: number | null;
  minimum_level: number;
  display_order: number;
  created_at: string;
};

export type ExamProgram = {
  id: string;
  school_id: string;
  level_number: number;
  level_name: string;
  description: string | null;
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
  assigned_level: number;
  preparing_exam_id: string | null;
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

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  forme: "Forme",
  tecniche_base: "Tecniche base",
  combinazioni: "Combinazioni",
  preparatori: "Preparatori",
  condizionamento: "Condizionamento",
  altro: "Altro",
};
