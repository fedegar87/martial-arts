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

export type PlanStatus = "focus" | "maintenance";

export type PlanItemSource = "exam_program" | "manual";

export type PlanMode = "exam" | "custom";

export type UserRole = "student" | "instructor" | "admin";

export type ContentAccessMode =
  | "exam_scope"
  | "up_to_assigned_level"
  | "all_school_content";

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
  video_label: string | null;
  secondary_video_url: string | null;
  secondary_video_label: string | null;
  thumbnail_url: string | null;
  teacher_notes: string | null;
  estimated_duration_seconds: number | null;
  minimum_grade_value: number;
  is_extra: boolean;
  display_order: number;
  created_at: string;
};

// DTO snello per le UI di sola selezione (nome + grado + categoria): evita di
// serializzare le colonne pesanti (note, URL video, thumbnail) nel payload client.
export type SkillOption = Pick<
  Skill,
  "id" | "name" | "name_italian" | "minimum_grade_value" | "category"
>;

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
  profile_locked: boolean;
  access_group_id: string | null;
  content_access_mode: ContentAccessMode;
  can_view_extra_content: boolean;
  last_news_seen_at: string | null;
  created_at: string;
};

// Coarse access preset/reporting row. Per-person levels live on user_invites
// before signup and on user_profiles after signup.
export type AccessGroup = {
  id: string;
  school_id: string;
  code: string;
  role: UserRole;
  default_level_shaolin: number;
  default_level_taichi: number;
  default_preparing_exam_id: string | null;
  default_preparing_exam_taichi_id: string | null;
  content_access_mode: ContentAccessMode;
  can_view_extra_content: boolean;
  can_edit_own_profile: boolean;
  next_shaolin_access_group_id: string | null;
  next_taichi_access_group_id: string | null;
  created_at: string;
};

export type UserInvite = {
  id: string;
  school_id: string;
  email: string;
  access_group_id: string | null;
  display_name: string | null;
  assigned_level_shaolin: number;
  assigned_level_taichi: number;
  role: UserRole;
  content_access_mode: ContentAccessMode;
  can_view_extra_content: boolean;
  profile_locked: boolean;
  status: "pending" | "accepted" | "revoked";
  accepted_user_id: string | null;
  created_at: string;
  accepted_at: string | null;
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
  reps_target: number | null;
  reps_done: number;
  created_at: string;
};

export type TrainingSchedule = {
  user_id: string;
  weekdays: number[];
  cadence_weeks: 1 | 2 | 4;
  reps_per_form: number;
  exam_disciplines: Discipline[];
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
};

export type NotificationPreference = {
  user_id: string;
  training_reminders_enabled: boolean;
  reminder_time: string;
  time_zone: string;
  include_exercise_names: boolean;
  created_at: string;
  updated_at: string;
};

export type PushSubscriptionRecord = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string;
  last_seen_at: string;
  revoked_at: string | null;
};

export type NotificationDelivery = {
  id: string;
  user_id: string;
  subscription_id: string | null;
  kind: "training_reminder";
  date: string;
  status: "pending" | "sent" | "failed" | "skipped";
  error: string | null;
  sent_at: string | null;
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

export type WeeklyReflection = {
  id: string;
  user_id: string;
  week_start: string;
  prompt_1_text: string;
  prompt_2_text: string;
  created_at: string;
};

export type CalendarDaySessionKind =
  | "training"
  | "rest_day"
  | "expired"
  | "no_schedule";

export type CalendarSkill = Pick<
  Skill,
  | "id"
  | "name"
  | "name_italian"
  | "discipline"
  | "category"
  | "practice_mode"
  | "minimum_grade_value"
  | "display_order"
>;

export type ScheduledPracticeItem = {
  planItemId: string;
  skill: CalendarSkill;
  status: PlanStatus;
  log: PracticeLog | null;
  done: boolean;
  repsDone: number;
  repsTarget: number;
  canToggle: boolean;
};

export type FreePracticeItem = {
  skill: CalendarSkill;
  log: PracticeLog;
  done: boolean;
  hasNote: boolean;
  canToggle: boolean;
};

export type CalendarDayView = {
  date: string;
  isFuture: boolean;
  hasSchedule: boolean;
  isInScheduleRange: boolean;
  canToggle: boolean;
  sessionKind: CalendarDaySessionKind;
  sessionIndex: number | null;
  nextTrainingDate: string | null;
  scheduleEndDate: string | null;
  repsPerForm: number;
  scheduled: ScheduledPracticeItem[];
  freePractice: FreePracticeItem[];
  events: [];
};
