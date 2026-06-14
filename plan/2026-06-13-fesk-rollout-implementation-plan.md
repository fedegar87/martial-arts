# FESK Rollout Implementation Plan

**Date:** 2026-06-13  
**Status:** Draft for review, updated with confirmed FESK rollout decisions  
**Related strategy:** `plan/2026-06-13-white-label-multi-instance-strategy.md`  
**Primary app:** `skill-practice/`  

---

## 1. Purpose

This document turns the white-label / multi-instance strategy into an implementation plan for the first FESK rollout.

The goal is not to build a generic martial arts SaaS platform. The goal is to make the current FESK-centered app safe, credible, branded, and operationally ready for real FESK teachers, instructors, and students.

This plan assumes the product need has already been validated informally with FESK teachers/instructors. Therefore, this is not a discovery/interview plan. It is a production-readiness and controlled-rollout plan.

The plan follows the selected strategy:

> Option C: multi-instance direction, separate Supabase project per unrelated organization, schema baseline early, defer brand/config/curriculum abstractions until triggered.

---

## 2. Executive Summary

The next implementation step is not "build white-label." It is:

1. Confirm the concrete FESK rollout scope, owner, and operating requirements.
2. Verify the actual Supabase migration/security state.
3. Produce, OR deliberately defer, a consolidated schema baseline. Since the current Supabase project will be reused for FESK, the baseline is not on the rollout critical path.
4. Complete legal/content/privacy prerequisites for real users.
5. Apply FESK branding as a thin build-time layer.
6. Run a controlled initial rollout and monitor usage, support load, and product quality.

Only after FESK is operating cleanly, or a concrete second client appears, should the project invest in generic instance configuration, curriculum packs, or non-FESK domain refactors.

---

## 3. Principles

### 3.1 Product Readiness Before Platform Work

Do not build generalized infrastructure before the FESK rollout is usable, stable, and operationally manageable. The immediate proof needed is no longer "do FESK teachers want this?" but:

- a FESK owner can operate the rollout;
- teachers/instructors can invite and guide students;
- students can onboard and use the app without founder hand-holding;
- content, curriculum, and brand assets are authorized;
- support effort is manageable;
- the implementation path remains reusable for future unrelated schools.

### 3.2 Isolation Without SaaS Overhead

FESK should run as its own clean operational instance. Unrelated future clients, such as a Taekwondo school in Germany, should get separate Supabase projects and deployments from the same codebase.

### 3.3 Build-Time Branding First

For the FESK rollout, prefer direct build-time branding changes over runtime tenant branding. Runtime branding is unnecessary for a single FESK instance and adds complexity.

### 3.4 Schema Baseline Before Repeated Instances

The biggest operational bottleneck is manual Supabase migration application. A consolidated schema baseline is useful early because it helps with future instances and with any clean FESK project if one is ever needed.

### 3.5 No Fake Generic Domain

Do not rename Taekwondo concepts internally to `shaolin`, `taichi`, or FESK grade values. If a non-FESK client becomes real, do a targeted domain refactor at that point.

---

## 4. Scope

### In Scope

- FESK rollout gates and acceptance criteria.
- Supabase migration-state verification.
- Consolidated schema-baseline plan.
- FESK-specific branding and deployment checklist.
- Legal/privacy/content-readiness checklist.
- Rollout operations and metrics.
- Post-rollout decision gates.

### Out of Scope

- Full SaaS multi-tenancy.
- Runtime tenant branding.
- Admin panel for curriculum editing.
- Billing or payments.
- Taekwondo/Karate/Judo domain refactor.
- Generic `disciplines`, `grade_scales`, `skill_categories`, or `user_discipline_levels` migration.
- Per-tenant dynamic PWA manifest.
- App store distribution.

---

## 5. Required Inputs

Before implementation starts, collect these inputs.

### 5.1 FESK Rollout Inputs

| Input | Required Detail | Owner |
|---|---|---|
| Rollout scope | One group, one school, or federation-wide first release | Founder + FESK contact |
| Operational owner | Founder for now; role can be handed off to a FESK operator later | Founder |
| Decision path | Who can approve continuation, expansion, or payment | Founder + FESK contact |
| Initial users | FESK teachers/instructors plus a few advanced students | Operational owner |
| Usage trigger | Exam prep, weekly homework, recovery after absences, or routine maintenance | Operational owner |
| Content scope | Which skills/exams/videos are included | Founder + technical referent |
| Content rights | Confirmation that videos/curriculum can be used in rollout; Google Drive access expected as source/archive | FESK referent |
| Minor status | No minors in first rollout; if this changes, pause and define a minor-user workflow | FESK contact |

### 5.2 Technical Inputs

| Input | Required Detail | Source |
|---|---|---|
| Current production Supabase state | Which migrations are actually applied | Supabase dashboard |
| FESK deployment target | Current domain/deployment for now | Vercel |
| Environment variables | Supabase URL, anon key, service role, cron/reminder secrets if used | `.env.local.example` + dashboard |
| FESK assets | App name `FESK Practice`; logo at `C:\martial-arts\logo-fesk.png`; keep current colors; keep Scuola Chang | FESK |
| Legal placeholders | FESK data-responsible/controller wording, contact email `info@feskfongttai.it`, DPO if any, retention, subprocessors | Founder + legal/privacy advisor |

### 5.3 Confirmed FESK Rollout Decisions (2026-06-13)

| Area | Decision |
|---|---|
| First users | FESK teachers/instructors plus a small number of advanced students |
| App name | `FESK Practice` |
| Brand colors | Keep the current visual identity/colors for the first rollout |
| Logo | Use `C:\martial-arts\logo-fesk.png`; implementation will place derived web/PWA assets under `skill-practice/public/` |
| Scuola Chang | Keep Scuola Chang as the curriculum/library lineage label |
| Supabase | Reuse the current production Supabase project for FESK |
| Future provisionability | Keep the codebase ready to provision a new Supabase project from scratch via schema baseline plus seed |
| Minors | No minors in the first rollout |
| Video playback | YouTube unlisted links are acceptable |
| Google Drive | FESK Drive access is expected as source/archive for videos; do not build Drive playback/upload workflow unless explicitly scoped |
| Contact email | `info@feskfongttai.it` |
| Metrics | Lightweight operational metrics only; direct feedback with teachers/instructors is primary |
| Data roles | Working decision: FESK is the data-responsible party/controller candidate for rollout; confirm exact GDPR wording in legal pages |
| User provisioning | Use invite/preassignment containers so users receive the correct role, discipline levels, exam target, and access scope on first login |
| Exam promotion | After each exam session, users who passed are moved to the next container so new content unlocks without manual profile edits |
| Operational owner | Founder is the operational owner for now, with the design leaving room to hand off to a FESK operator later |
| All-access group | Founder/admin, selected masters, and selected instructors belong to an all-access group |
| Extra content | `Altro` / extra material is visible only to all-access users for now |
| Promotion granularity | Promotion is per discipline: Shaolin and T'ai Chi can advance independently |
| Domain/deployment | Keep the current domain/deployment for now |
| App routes | Keep current URL routes for now; update visible labels/brand, not route structure |
| Landing page | Redesign public landing for FESK using the FESK logo and FESK-aligned copy; preserve current horse/Confucius landing as a legacy personal variant |

---

## 6. Implementation Workstreams

### Resolved Infrastructure Decision

**The FESK rollout uses the existing production Supabase project.**

This confirms that the schema baseline (Workstream C) is not on the rollout critical path. It remains important for disaster recovery and for future unrelated instances, but it should not block FESK branding or deployment readiness.

Facts:

- The current app is already a FESK instance in production (single-user MVP). The existing project already has migrations applied, the FESK seed loaded (`0004_seed_fesk.sql` plus the content migrations `0013/0014/0020/0027/0029/0030/0031/0032`), and the founder's real practice data.
- FESK is the *current* organization, not an unrelated future one. The strategy's "separate project per organization" rule targets unrelated clients (e.g. Taekwondo Germany), not FESK.

Decision:

> **Reuse the existing production project for the FESK rollout.** Creating a fresh project now means re-running a baseline, re-applying all content/video migrations, and discarding the founder's data, for little rollout benefit.

Consequence: if the existing project is reused, **the schema baseline is NOT a rollout blocker.** It becomes disaster-recovery / second-instance insurance and moves off the critical path (run it in parallel or defer it). Only if a clean FESK project is deliberately chosen does Workstream C gate the rollout.

This decision should be revisited only if a concrete reason to start clean appears, such as unrecoverable production history, a hard legal separation requirement, or a specific FESK request to separate the founder's data from rollout users.

### Workstream A - FESK Rollout Requirements Gate

#### Goal

Confirm the concrete rollout requirements before spending effort on branding, deployment, or future-proofing work.

#### Tasks

1. Identify the exact first rollout group:
   - FESK teachers/instructors;
   - a small number of advanced students.
2. Identify the FESK operational owner.
3. Confirm the owner/instructors will:
   - invite the selected advanced students;
   - remind them to use the app;
   - provide corrections and feedback;
   - treat the app as an active teaching support.
4. Map the decision path:
   - who approves the rollout;
   - who can approve continuation;
   - who can discuss budget later.
5. Confirm content readiness:
   - at least one level/exam or training set;
   - 5-10 usable contents;
   - video links already available or easily curated from YouTube unlisted links or FESK Google Drive source material.
6. Confirm setup effort:
   - target: <= 2-3 hours from the teacher/FESK side for the first content set.
7. Confirm usage trigger:
   - exam within 4-8 weeks;
   - weekly assignment;
   - recovery after absence;
   - maintenance routine.
8. Decide the first release format:
   - internal instructor-only smoke run;
   - controlled advanced-student rollout with a small cohort;
   - broader FESK rollout only after the controlled release is stable.

#### Acceptance Criteria

- First rollout group is named.
- Operational owner is named and has agreed to active involvement.
- Decision path is written down.
- Content and videos are available or clearly obtainable.
- No blocking uncertainty on minors, privacy, or content rights.
- First release format is selected.

#### Stop Conditions

Pause implementation and resolve the blocker if:

- there is no operational owner;
- content/video rights are unclear;
- no recurring usage trigger exists;
- FESK interest is generic but no first rollout group is available;
- setup depends on producing large amounts of new content.

---

### Workstream B - Supabase State Verification

#### Goal

Verify that the real Supabase project matches the migration/security assumptions in the repository.

#### Why This Matters

The repo contains migration files up to `0036`, but the architecture docs state that the real Supabase project may not have all later migrations applied. A rollout with real users must not rely on policies or functions that only exist in the repo.

#### Tasks

1. In Supabase dashboard, inspect applied migration history if available.
2. Verify that migration `0028_multitenant_isolation.sql` is applied:
   - `skills_read` policy is school-scoped;
   - `exam_programs_read` policy is school-scoped;
   - `news_items_read` policy is school-scoped;
   - `exam_skill_requirements` read policy scopes through `exam_programs`;
   - `user_plan_items_owner` has cross-school `WITH CHECK`;
   - `practice_logs_owner` has cross-school `WITH CHECK`.
3. Verify whether security migrations `0033`-`0036` are applied.
4. Verify whether content migrations are applied, because their absence silently degrades rollout UX (missing videos, missing sections), not security:
   - `0029`/`0031` (additional skill video URLs);
   - `0030` (secondary video per skill);
   - `0032` (extra weapon fundamentals + "Altro" section, grade sentinel 99).
   A rollout whose whole value is "watch the correct video" fails quietly if these are missing. Spot-check in the app that representative skills actually show videos.
5. Specifically inspect `handle_new_user`:
   - if exactly one school exists, metadata should be ignored;
   - if multiple schools exist, metadata path remains unsafe until invite allowlist exists.
6. Verify migration `0035` if relevant:
   - mutating SECURITY DEFINER RPCs (`activate_exam_mode`, `switch_to_exam_mode`, `switch_to_custom_mode`, `save_custom_selection`, `update_plan_item_status`, `hide_plan_item`) should not be executable by `anon` or `PUBLIC`.
7. If reusing the existing project, also check for stale demo content (e.g. seeded demo news from `0006`) that real rollout users should not see.
8. Record findings in a short audit note.

#### Acceptance Criteria

- Applied migration state is documented.
- Required RLS policies are verified in dashboard.
- `handle_new_user` body is verified.
- Any missing migrations are listed before rollout users are invited.

#### Stop Conditions

Stop before real users if:

- `0028` is missing;
- `handle_new_user` trusts client metadata in a single-school setup;
- static content is readable cross-school in a project that contains multiple schools;
- mutating RPC permissions are not understood.

---

### Workstream B2 - Access Groups, Invite Preassignment, and Exam Promotion

#### Goal

Make user access predictable and scalable without manually editing each profile after signup or after every exam session.

The operating model is:

> Email -> invite/preassignment -> access group -> locked profile -> permitted content.

#### Why This Matters

The current app lets users set or change their own levels during onboarding/profile editing. That is acceptable for a personal MVP, but not for a federation rollout where students should only see material up to the exam level they are preparing.

For FESK, access should be managed by the founder/admin for now. The model should allow this responsibility to be handed off later to an authorized FESK operator without redesigning the database.

#### Verified Current State (2026-06-13 codebase audit)

A direct read of the migrations, queries, and actions (not just the docs) shows the access-control subsystem this workstream describes is almost entirely net-new, and that level/scope enforcement is effectively OFF today, not merely bypassable:

- No `access_groups`, no `user_invites`, no invite/allowlist mechanism exists in any migration `0001`-`0036`.
- `handle_new_user` (latest body in `0036_harden_new_user_tenant.sql:40-48`) provisions every new profile with hardcoded `assigned_level_shaolin = 8` / `assigned_level_taichi = 0`, never sets `role` (defaults to `student`), and never reads an invite. It must stop hardcoding levels or it will silently override invite values.
- The only profile lock today is `prevent_user_profile_privilege_changes` (`0016_profile_account_privacy.sql:7-26`), a `BEFORE UPDATE` trigger that blocks owner self-edits of `role` and `school_id` ONLY. Levels, exam targets, and `plan_mode` are NOT guarded.
- All per-discipline / per-level / `Altro` gating is purely app-side. RLS gates skills only by `school_id` (`0028_multitenant_isolation.sql:36-41`); there is no grade predicate anywhere in the database.
- `Altro` / extra content is not a DB concept. It is the app-side sentinel `minimum_grade_value = 99` (`src/lib/grades.ts`, `EXTRA_GRADE_VALUE`), seeded by `0032`.

Confirmed access bypasses (each verified against the code; close every one before inviting students):

| ID | Severity | Where | What a student can do today |
|---|---|---|---|
| BP-1 (master) | High | `src/lib/actions/profile.ts:10-101` (`updateProfileGrade`); also `src/lib/actions/onboarding.ts` | Set their own `assigned_level_shaolin/taichi` (and `preparing_exam_*`) to any valid grade. Only a known-grade check, no role/lock check. RLS `user_profiles_owner_update` (`0001:162-163`) permits it; the `0016` trigger does not cover these columns. This neutralizes every grade-bounded exam RPC, since those bounds read the same self-editable column. |
| BP-2 | High | `src/app/(app)/library/page.tsx:23,63-64` | See the full discipline catalog. `ENABLE_LEVEL_LOCK = false` makes the lock cosmetic; the page calls `listSkillsForDiscipline` (school-only, no grade filter), not the grade-aware `listAccessibleSkills`. |
| BP-3 | High | `src/app/(app)/skill/[skillId]/page.tsx:42-53` via `getSkillById` (`skills.ts:55-65`) | Open any in-school skill (advanced form or `Altro`) by direct URL, including both videos and teacher notes. The page only does `if (!skill) notFound()`; the query is school-scoped only. |
| BP-4 | High | `src/lib/actions/plan.ts:236-261` -> `save_custom_selection` (`0028:156-202`) | Persist any skill ids as a custom plan. The RPC filters only by `discipline + school_id`; the action forwards raw form input. `SECURITY DEFINER` bypasses the RLS `WITH CHECK`. |
| BP-5 | High | `src/lib/actions/plan.ts:12-26` (`addSkillToPlan`) | Add any in-school skill to the personal plan. `user_plan_items` `WITH CHECK` (`0028:81-90`) validates only `school_id`. |
| BP-6 | Medium | `src/app/(app)/library/page.tsx:179-185` | See and open the `Altro` section. It renders unconditionally with `locked={false}` and there is no DB scope flag. Contradicts the all-access-only rule. |
| BP-7 | Medium (needs BP-1) | `activate_exam_mode` / `switch_to_exam_mode` (`0018`) | Escalate grade via BP-1, then activate the now-permitted advanced exam, pulling its full skill set into the plan. Fixed transitively by locking the level. |

Scope correction: because enforcement is OFF rather than partially present, the access work in this workstream is a core rollout-blocking subsystem, not a "minimal" patch. It touches `src/lib/grades.ts`, `src/lib/queries/skills.ts`, `src/lib/queries/exam-programs.ts`, `src/app/(app)/library/page.tsx`, `src/app/(app)/skill/[skillId]/page.tsx`, `src/lib/actions/plan.ts`, `src/lib/actions/profile.ts`, `src/lib/actions/onboarding.ts`, the `save_custom_selection` RPC, and new migrations. Treat it as the gate for inviting students.

#### Proposed Data Model (refined)

Design principle: per-discipline LEVEL stays on `user_profiles` (the two integer ladders `assigned_level_shaolin` / `assigned_level_taichi` already exist, `0003:90-95`) and remains the per-user source of truth. `access_groups` is a thin TEMPLATE copied into the profile on invite acceptance, plus the promotion target. Do NOT model combined discipline state as one row (shaolin x taichi x role explodes combinatorially and breaks single-discipline `taichi = 0` users) and do NOT build a per-discipline junction table (over-engineered for the small fixed FESK set).

1. `access_groups` (thin template, one row per `school + role + scope`):
   - `id`, `school_id`, `code` (e.g. `shaolin_student_8`, `taichi_student_5`, `all_access_instructor`), unique `(school_id, code)`;
   - `role` (`user_role`, default `student`);
   - `default_level_shaolin`, `default_level_taichi` (copied into the profile on accept);
   - `default_preparing_exam_id`, `default_preparing_exam_taichi_id`;
   - `content_access_mode` enum (`exam_scope`, `up_to_assigned_level`, `all_school_content`);
   - `can_view_extra_content` boolean (default `false`);
   - `can_edit_own_profile` boolean (default `false`);
   - `next_shaolin_access_group_id`, `next_taichi_access_group_id` (nullable self-FK; per-discipline promotion targets).

2. `user_invites` (email-keyed):
   - `id`, `school_id`, `email` (store `lower(trim(email))`, unique `(school_id, email)`);
   - `access_group_id`;
   - `display_name`;
   - `status` (`pending` | `accepted` | `revoked`);
   - `accepted_user_id` (nullable FK `auth.users`), `created_at`, `accepted_at`.

3. `user_profiles` additions:
   - `profile_locked` boolean NOT NULL DEFAULT `true`;
   - `access_group_id` (nullable FK `access_groups`, for reporting + promotion chaining);
   - `content_access_mode` enum NOT NULL DEFAULT `up_to_assigned_level`;
   - `can_view_extra_content` boolean NOT NULL DEFAULT `false`.

Template-vs-materialized contract (write this down to avoid drift):

- On invite acceptance, `handle_new_user` COPIES the group's `default_*` / `role` / scope flags into the new `user_profiles` row. After that, the profile is the source of truth; the group is only a preset + promotion pointer.
- On promotion, overwrite ONLY the passed discipline's level + its `preparing_exam_*` and repoint `access_group_id` to `next_<discipline>_access_group_id`. Leave the other discipline and all practice history untouched.
- RLS: `access_groups` and `user_invites` are admin-only (school-scoped) for SELECT/INSERT/UPDATE; non-admins must not read or forge them. `user_profiles` keeps trigger-only INSERT (no user INSERT policy).
- Optional cleanup: add `skills.is_extra` boolean instead of relying on the magic `99` sentinel, and reference it from a single predicate.

For the first rollout, manage these tables via SQL insert scripts / Supabase table editor. No admin UI yet.

#### Signup / Invite Flow

1. FESK communicates users to add:
   - email;
   - name if available;
   - role;
   - discipline and exam target.
2. Founder/admin inserts each email into `user_invites` with the correct `access_group_id`.
3. Founder/admin sends Supabase invitation email.
4. On first login, `handle_new_user` looks up `user_invites` by normalized email.
5. The created `user_profiles` row inherits:
   - `school_id`;
   - `display_name`;
   - `role`;
   - `assigned_level_shaolin`;
   - `assigned_level_taichi`;
   - `preparing_exam_id`;
   - `preparing_exam_taichi_id`;
   - `plan_mode = 'exam'`;
   - `profile_locked = true` for students.
6. The invite is marked `accepted` and linked to the auth user ID.

If no matching invite exists, BLOCK provisioning for the first rollout: `handle_new_user` should `RAISE EXCEPTION`, which cleanly aborts the `auth.users` INSERT (there is no user-side INSERT policy on `user_profiles`, so the trigger is the only creation path). Quarantine (a no-access profile) is a FALSE safety until content-scope enforcement and the profile lock both exist, because today a no-access profile still inherits whole-school read via RLS `skills_read` and keeps a self-editable grade. Revisit quarantine only after BP-1..BP-6 are closed.

Critical implementation notes for the trigger rewrite (replaces `0036`):

- Normalize the email on both sides: look up `lower(trim(NEW.email))` against `user_invites.email` (stored normalized), or invites silently no-match. `0036` currently uses `NEW.email` raw.
- Remove the hardcoded `8` / `0` levels; take levels/role/exam targets/scope from the matched `access_group`.
- Founder/admin bootstrap: a blocking trigger will hard-fail the first all-access user who has no invite. Seed an admin `user_invites` row (or add a one-time, env-guarded exception) so the founder can sign in before invite infrastructure is populated.
- Operational ordering is mandatory: insert the `user_invites` row BEFORE sending the Supabase invitation email, or the legitimate invitee's first login is blocked.
- Synergy with the strategy: this rewrite also closes the multi-school `TODO` in `0036:26-37` (validate the invited `school_id` against an email-keyed allowlist). Per the white-label strategy (sections 7.1, 15, Gate B), that allowlist is the precondition for ever holding more than one `schools` row, so implementing `user_invites` now satisfies a future-instance gate for free.

#### Student Locking Rules

For rollout students:

- students cannot change their own role;
- students cannot change their own school;
- students cannot change their assigned levels;
- students cannot choose arbitrary exam targets;
- students cannot switch to content outside their assigned access scope.

Enforcement point (load-bearing). The lock must live in the database, not only in the UI: BP-1 is reachable by a raw PostgREST POST, so hiding `GradeEditor` is insufficient. Extend the existing `prevent_user_profile_privilege_changes` trigger (`0016:7-26`) so that, when `auth.uid() = OLD.id` and `OLD.profile_locked` is true, any change to `assigned_level_shaolin`, `assigned_level_taichi`, `preparing_exam_id`, `preparing_exam_taichi_id`, or `plan_mode` also raises. The trigger already exempts non-owner / service-role callers (it keys on `auth.uid() = OLD.id`), so the promotion script and admin edits keep working unchanged. Then make `updateProfileGrade` (`profile.ts`) and `selectExam`/`finishWithoutExam` (`onboarding.ts`) refuse when the profile is locked, and render `GradeEditor` read-only for locked students. The trigger is the boundary; the action and UI changes are defense-in-depth and UX.

Instructors/admins can have broader access, but that should be explicit through `access_groups`, not accidental.

#### Content Access Rules

The app should enforce access consistently across:

- library listing;
- skill detail URL;
- custom plan selection;
- exam plan selection;
- RPCs that create or update plan items.

For a student assigned to prepare a given exam:

- they can see the material for their current/preparing scope;
- they should not see advanced forms beyond the level they are preparing;
- `Altro` / extra material is not visible by default;
- `Altro` / extra material is visible only to all-access users for now.

For instructors:

- use `content_access_mode = all_school_content`;
- include founder/admin, selected masters, and selected instructors in this all-access group;
- do not create instructor sub-scopes unless FESK explicitly needs them later.

Note: `master` is not a value of the `user_role` enum today (`student` | `instructor` | `admin`). Decide the all-access source of truth (see Open Decisions): either derive it from `role IN ('admin','instructor')` plus a curated set, or drive it purely from `content_access_mode = 'all_school_content'`. Use ONE definition everywhere.

#### Content Enforcement Mechanism

Add one `SECURITY DEFINER` predicate, e.g. `is_skill_visible(uid uuid, skill_id uuid)`, that returns true when the skill is same-school AND (`content_access_mode = all_school_content` OR `skill.minimum_grade_value >= the caller's assigned level for skill.discipline`) AND (`can_view_extra_content` OR the skill is not `Altro`). Reuse it so the rule lives in one place:

- Wire it into the `skills_read` RLS `USING` clause (defense-in-depth; backstops BP-2/BP-3 even if a query forgets the filter).
- Wire it into the `user_plan_items` `WITH CHECK` (closes BP-5) and into the `save_custom_selection` INSERT `WHERE` (closes BP-4; the RPC is `SECURITY DEFINER`, so this server-side check is load-bearing).
- Switch the library to a grade/scope-aware query (use/extend `listAccessibleSkills`, delete the dead `ENABLE_LEVEL_LOCK` path) and gate the `Altro` section by `can_view_extra_content`.
- Add a guard in `skill/[skillId]/page.tsx` (or in `getSkillById`) that returns `notFound()` for out-of-scope skills; do not rely on hiding the catalog link.
- Apply the same predicate to the plan-selection queries `listSkillsForDiscipline` / `listSkillOptionsForDiscipline` and to `addSkillToPlan`.

Remember `assigned_level_taichi = 0` means "not practiced": such users must see and add zero T'ai Chi content. All-access users short-circuit the predicate to true. Decide the canonical `Altro` marker once (`skills.is_extra` boolean vs the `minimum_grade_value = 99` sentinel) and reference only that.

#### Exam Promotion Flow

After each FESK exam session:

1. FESK/instructor sends the list of students who passed:
   - email or user ID;
   - Shaolin exam passed, if any;
   - T'ai Chi exam passed, if any.
2. Founder/admin runs a promotion operation:
   - promote Shaolin only for users who passed a Shaolin exam;
   - promote T'ai Chi only for users who passed a T'ai Chi exam;
   - update only the assigned level(s) for the discipline(s) passed;
   - set the next `preparing_exam_id` and/or `preparing_exam_taichi_id`;
   - regenerate exam plan items;
   - keep practice history intact.
3. Students who did not pass remain in the same access group/scope for that discipline.
4. The promotion action is logged for audit/debugging.

Single-discipline users remain single-discipline unless explicitly changed. A student who only practices T'ai Chi should see only T'ai Chi content. A student who only practices Shaolin should see only Shaolin content.

Implementation can start as SQL/scripted batch update. A UI can be added later if FESK needs frequent self-service.

#### First-Rollout Minimal Implementation

Do not build a full admin panel yet. Build only:

1. `access_groups` and `user_invites` (+ the `user_profiles` columns from the refined data model).
2. Rewrite `handle_new_user` to read from invite/preassignment (normalized email), copy from the matched group, block on no-match, and stop hardcoding `8`/`0`.
3. Add `profile_locked` (+ `access_group_id`, `content_access_mode`, `can_view_extra_content`) to `user_profiles`.
4. Extend the `0016` privilege trigger to block self-edit of levels/exam/`plan_mode` while locked (the DB boundary), and render student grade/onboarding editing read-only when a locked preassigned profile exists (the UX).
5. Enforce access through one `is_skill_visible()` predicate reused by `skills_read` RLS, `user_plan_items` `WITH CHECK`, the `save_custom_selection` RPC, the library, skill detail, and the plan-selection queries/actions. This is the load-bearing fix, not a UI tweak.
6. Provide SQL snippets or a small server-only script for:
   - adding invited users to groups;
   - promoting passed users to next groups after exam sessions.

#### Acceptance Criteria

- A student email can be preassigned to an access group before invitation.
- First login creates the correct locked profile without student self-selection.
- Student cannot self-promote by changing profile fields or URLs.
- Student sees only the content allowed by the assigned access group.
- Instructor/admin access remains broader and explicit.
- Post-exam promotion can move a batch of passed users to the next access group/scope for the passed discipline while preserving history.

#### Stop Conditions

Stop before rollout users if:

- students can still change their own assigned levels;
- skill detail pages show advanced content by direct URL;
- custom plan selection can add out-of-scope skills;
- post-exam promotion requires manual edits across several unrelated tables.

---

### Workstream C - Schema Baseline

#### Goal

Create a consolidated SQL baseline that can provision a clean Supabase project without manually applying every historical migration.

#### Priority Note (conditional)

This workstream is not on the FESK rollout critical path because the current production project will be reused. The baseline is disaster-recovery / second-instance insurance and should run in parallel or be deferred. Do not let it block branding, legal, or deploy.

This is consistent with the white-label strategy section 6A, which keeps the schema baseline as the one platform investment worth doing early. The two framings do not conflict: it is off the FESK rollout critical path (project reused) yet required before provisioning any future fresh instance from scratch (Gate B). The access-control migrations from Workstream B2 (`0037`+) must be folded into the baseline before it is used for a new instance, or a fresh project would ship without the lock/enforcement.

#### Why It Is Still Worth Doing

The current operational workflow assumes Supabase SQL Editor and no local CLI. Replaying 36+ migrations by hand is fragile. A baseline helps with:

- future disaster recovery;
- future non-FESK instances;
- a clean FESK instance if one is ever needed;
- reducing setup time and human error.

#### How to Generate It (do not hand-squash)

Hand-consolidating 36 migrations is itself the manual-SQL risk this baseline is meant to remove, and it will drift from the real schema (note: `src/lib/types.ts` is already a hand-maintained mirror, not generated). Prefer generating the baseline mechanically from the live, true schema:

- Schema: `pg_dump --schema-only` against the production Supabase connection string. This captures tables, enums, indexes, triggers, functions, RLS enablement, policies, and grants exactly as they exist, with no drift.
- Seed: `pg_dump --data-only` restricted to the content tables (`schools`, `skills`, `exam_programs`, `exam_skill_requirements`, and optionally curated `news_items`). This automatically includes all content/video migrations, not just `0004`.

`pg_dump` only needs the Postgres connection string; it does not require the Supabase CLI to be in PATH.

Safety rules for the dump:

- Verify `pg_dump` is actually installed locally first (`pg_dump --version`); it ships with the Postgres client, not with the app.
- Never dump user data. The data dump is restricted to content tables only (`schools`, `skills`, `exam_programs`, `exam_skill_requirements`, optionally curated `news_items`). Do not include `user_profiles`, `practice_logs`, `user_plan_items`, or any other per-user table.
- Do not commit secrets or production personal data. The connection string and any service credentials stay out of the repo; the committed artifacts are schema + content seed only.
- Review the generated seed before committing to confirm no personal rows leaked in.

#### Important Rule

The baseline is for **new Supabase projects only**. Do not apply it to an existing database that already has migrations applied.

#### Proposed Artifact Paths

Recommended paths:

```txt
skill-practice/supabase/baseline/
  2026-06-13_schema_baseline.sql
  2026-06-13_fesk_seed.sql
  README.md
```

The exact date can change if implementation happens later.

#### Tasks

1. Review migrations `0001` through latest.
2. Produce a clean schema baseline containing:
   - extensions;
   - enum types;
   - tables;
   - indexes;
   - triggers;
   - functions;
   - RLS enablement;
   - policies;
   - grants/revokes;
   - SECURITY DEFINER functions with hardened `search_path`.
3. Separate schema from seed data.
4. Produce a FESK seed file containing the full current content, not just `0004`:
   - initial school row;
   - FESK skills (137 in `0004`);
   - all skill video URLs and secondary videos (added incrementally in `0013/0014/0020/0027/0029/0030/0031`);
   - extra weapon fundamentals and the "Altro" section (`0032`);
   - exam programs (15 Shaolin, 12 Tai Chi);
   - exam skill requirements;
   - curated `news_items` only if intentionally kept (exclude seeded demo news).
   Note: the existing `scripts/generate-fesk-seed.mjs` only regenerates `0004` from `curriculum-mapping-fesk.md`; it does NOT include the later content migrations. A `pg_dump --data-only` of the content tables is the reliable way to capture everything at once.
5. Add a baseline README explaining:
   - when to use it;
   - when not to use it;
   - expected manual Supabase steps;
   - post-run verification queries.
6. Keep historical migrations as source history.
7. Continue future schema changes as numbered migrations after the latest current migration.

#### Verification

On a clean Supabase project or disposable database:

1. Run schema baseline.
2. Run FESK seed.
3. Confirm key tables exist.
4. Confirm RLS is enabled on all relevant tables.
5. Confirm exactly one school exists for single-tenant hardening.
6. Confirm `handle_new_user` body matches hardened version.
7. Create or invite a test user.
8. Confirm `user_profiles.school_id` is assigned correctly.
9. Confirm authenticated user can read only own school content.
10. Run local app against the clean DB if possible.

#### Acceptance Criteria

- Clean DB can be provisioned from one schema file plus one seed file.
- No historical migration paste sequence is needed for a new instance.
- FESK app can connect to the provisioned DB.
- Baseline is documented as new-project-only.

---

### Workstream D - Legal, Privacy, and Content Readiness

#### Goal

Remove avoidable legal/content blockers before inviting real FESK users.

#### Tasks

1. Review public legal pages:
   - `/privacy`;
   - `/terms`;
   - `/cookies`;
   - `/disclaimer`.
2. Replace or document all placeholders:
   - data controller / processor role;
   - contact email: `info@feskfongttai.it`;
   - data retention;
   - subprocessors;
   - hosting region;
   - deletion workflow;
   - minor-user handling.
3. Verify the hosting region stated in the legal pages matches reality. The existing Supabase project is on London/UK (`current-plan.md` section 15.5), not Frankfurt. If reusing it, the privacy page must state the actual region (UK has GDPR adequacy, so this is acceptable, but it must be stated correctly). A future German client on a separate project may warrant a Frankfurt/EU region instead.
4. Confirm the GDPR data-role model before publishing legal pages:
   - working rollout decision: FESK is the data-responsible party/controller candidate;
   - do not assume the founder is the controller only because the Supabase account is under the founder;
   - confirm exact GDPR wording in the legal pages with FESK and, if needed, a privacy/legal advisor.
5. Keep minors out of the first rollout. If FESK later wants minors:
   - pause and get appropriate privacy/legal guidance;
   - define parental consent workflow;
   - define age/guardian data handling.
6. Confirm content authorization:
   - curriculum;
   - videos;
   - logos;
   - federation name;
   - school/federation marks.
7. Document the rollout content scope:
   - what is included;
   - what is excluded;
   - whether videos are unlisted YouTube links;
   - how FESK Google Drive source material is handled;
   - who can access videos and source files.
8. Treat Google Drive as a source/archive unless explicitly scoped otherwise:
   - use YouTube unlisted links for playback if acceptable;
   - do not expose Drive folders or implement Drive upload/playback workflows by default;
   - do not ingest Drive content without clear permissions and access boundaries.

#### Acceptance Criteria

- Legal pages are acceptable for the first rollout scope or explicitly flagged for review.
- Content/video authorization is confirmed.
- Minor-user policy is clear: no minors in first rollout.
- FESK brand asset usage is authorized.

---

### Workstream E - FESK Branding and Instance Setup

#### Goal

Make the app recognizable as the FESK app while avoiding premature runtime white-label infrastructure.

#### Strategy

Use direct build-time FESK branding. Do not build generic `appConfig` unless branding churn or a second instance triggers it.

#### Files to Inspect

Likely relevant files:

```txt
skill-practice/src/app/layout.tsx                  # title/description "Kung Fu Practice"
skill-practice/src/app/globals.css                 # --gold-500 #c8a84b, --tint, theme vars
skill-practice/public/manifest.json                # static; name/short_name/description
skill-practice/public/offline.html                 # "Kung Fu Practice - offline"
skill-practice/public/icon.svg
skill-practice/public/icons/                        # apple-touch-icon, icon-192, icon-512, maskable-512
skill-practice/public/og-image.png                  # social share card - still says Kung Fu
skill-practice/public/sw.js                         # cache name "kung-fu-practice-v3"
skill-practice/src/components/shared/AppHeader.tsx
skill-practice/src/components/shared/TempleHomeIcon.tsx
skill-practice/src/components/nav/BottomNav.tsx     # "Scuola Chang" label
skill-practice/src/components/hub/HubGrid.tsx       # "Scuola Chang" tile
skill-practice/src/components/landing/              # LandingHero, HorseEmblem, EnterButton
skill-practice/public/landing/cavallo-fuoco.svg     # preserve as legacy personal landing asset
skill-practice/src/app/(auth)/login/LoginForm.tsx  # already says "Kung Fu Practice FESK"
skill-practice/src/app/(app)/library/page.tsx      # ScuolaChangPage, heading "Scuola Chang"
skill-practice/src/app/(legal)/
```

Audit-verified surfaces and gaps (the list above was incomplete; do not miss these):

- `public/icon.svg` IS the horse artwork, not a generic mark, and `src/app/favicon.ico` is a separate asset omitted above. Both must be regenerated from the FESK logo.
- `public/og-image.png` still reads "Kung Fu"; regenerate it.
- `src/app/(auth)/login/LoginForm.tsx` already shows "Kung Fu Practice FESK" and `src/app/(app)/profile/export/route.ts` derives the export filename from the old name; both need the `FESK Practice` string.
- `src/components/hub/HubBackground.tsx` uses `cavallo-fuoco.svg` as a watermark; decide keep / swap to FESK mark / remove. This is a second reason the legacy SVG must stay on disk.
- `theme_color` differs between `manifest.json` and the viewport metadata in `layout.tsx`; verify and reconcile to one value.
- `logo-fesk.png` is roughly 221x228 on a white background, too small/off-palette for a clean 512 maskable icon. Either supply a higher-res/vector source or composite onto a dark background with maskable safe-zone padding (see Open Decisions).

Confirmed branding decisions:

- official app name: `FESK Practice`;
- FESK logo source: `C:\martial-arts\logo-fesk.png`;
- keep the current visual identity/colors for the first rollout;
- keep `Scuola Chang` as the curriculum/library lineage label.
- redesign the public landing for FESK and preserve the current horse/Confucius landing as legacy.

Official FESK site signals to use for landing direction:

- the site identifies the federation as `Federazione Europea Scuola Kung Fu Fong Ttai`;
- the homepage states that `Fong Ttai` means `Abbondanza di pace`;
- the site frames FESK around traditional Kung Fu, Maestro Chang Dsu Yao, and the lineage through Maestro Gianluigi Bestetti.

Use these as source material for short FESK-aligned landing copy. Do not paste long text from the site. Final wording should be approved by FESK if it is presented as an official motto.

#### Tasks

1. Set official app name to `FESK Practice`.
2. Update metadata:
   - `app/layout.tsx`;
   - title;
   - description;
   - OpenGraph text if present.
3. Update PWA manifest:
   - `name`;
   - `short_name`;
   - `description`;
   - `theme_color`;
   - icons if supplied.
4. Update static offline page.
5. Update app icons:
   - favicon;
   - 192 icon;
   - 512 icon;
   - maskable icon;
   - apple touch icon.
6. Update visible brand labels:
   - header;
   - landing;
   - hub;
   - library title should keep `Scuola Chang` unless FESK later requests a change;
   - legal pages;
   - nav labels should preserve `Scuola Chang` where it refers to the curriculum/lineage.
7. Redesign the public landing:
   - use the FESK logo instead of the horse emblem;
   - replace the Confucius citation with short FESK-aligned copy;
   - candidate direction: `Fong Ttai` / `Abbondanza di pace`;
   - keep the landing calm, official, and practice-oriented;
   - avoid copying long text from the FESK site;
   - preserve the current horse/Confucius composition as a legacy personal variant.
8. Preserve current personal landing assets:
   - do not delete `public/landing/cavallo-fuoco.svg` (it is also used by `HubBackground`, so it must stay on disk regardless);
   - rename the current `LandingHero` / `HorseEmblem` to `LegacyLandingHero` / `LegacyHorseEmblem`; do NOT edit them in place, or the legacy variant required by the fixed decisions is lost;
   - expose the legacy landing at a stable route, e.g. `/landing-legacy`, and point `src/app/page.tsx` at the new `FeskLandingHero`.
9. Update CSS theme only as much as required:
   - keep current colors for the first rollout;
   - avoid full redesign unless FESK requires it.
10. Bump the `sw.js` cache name (e.g. to `fesk-practice-v4`) AFTER all icon/manifest/asset swaps. This is mandatory, not optional: without it, installed PWAs keep serving the stale precached horse icons. Bumping BEFORE the asset swap caches the old assets under the new name, so the order matters.
11. Keep curriculum/domain logic unchanged:
   - no Taekwondo support;
   - no dynamic disciplines;
   - no generic grade model.

#### Acceptance Criteria

- FESK can recognize the rollout as its own app.
- `FESK Practice` name and FESK logo are reflected in app/PWA surfaces.
- Public landing uses the FESK logo and FESK-aligned copy instead of the horse/Confucius composition.
- Current horse/Confucius landing is preserved as a legacy personal variant.
- `Scuola Chang` remains where it labels the curriculum/library lineage.
- PWA install metadata is FESK-appropriate.
- Installed PWAs receive the new icon/name after the SW cache bump (no stale horse icons); favicon, apple-touch, and maskable all show FESK.
- No broad domain refactor was introduced.
- Build/type/test checks still pass.

#### Recommended Checks

Run from `skill-practice/`:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

If UI changes are substantial, manually inspect:

- mobile viewport;
- installed PWA icon/name;
- landing page;
- login;
- hub;
- library;
- today;
- profile/legal pages.

---

### Workstream F - Deployment

#### Goal

Deploy the FESK rollout as a clean operational instance.

#### Tasks

1. Decide deployment structure:
   - keep the current deployment/domain for now;
   - do not create a new domain only for branding.
2. Decide domain:
   - current domain for first rollout;
   - FESK subdomain or custom domain later only if requested.
3. Verify the current Supabase project:
   - actual hosting region documented in legal pages;
   - current project reused for FESK rollout;
   - baseline applied only if a future clean project is created;
   - FESK seed applied;
   - RLS verified.
4. Configure env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`;
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`;
   - `SUPABASE_SERVICE_ROLE_KEY`;
   - `CRON_SECRET` if reminders are enabled;
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` only if push reminders are intentionally enabled;
   - VAPID private key if needed.
5. Keep push reminders disabled unless VAPID/cron are fully configured.
6. Deploy.
7. Run smoke tests.

#### URL / Route Decision

Keep current app routes for the FESK rollout. Do not rename routes only for branding.

Current routes such as `/hub`, `/today`, `/programma`, `/library`, `/profile`, `/progress`, `/plan/exam`, `/plan/custom`, and `/skill/[skillId]` are acceptable for the first rollout. Most route names are not the primary user-facing surface in a PWA; visible labels, page titles, manifest metadata, and navigation copy matter more.

Do not introduce route aliases or localized route sets now. Add aliases later only if there is a concrete reason, such as:

- FESK requests a public-facing branded URL structure;
- a non-Italian/non-FESK instance needs localized paths;
- analytics or support shows users directly sharing/typing route URLs.

For now, update visible labels/brand and preserve route stability.

#### Smoke Test Checklist

- Public landing loads.
- Login page loads.
- Invite/recovery flow is not broken.
- Test user can log in.
- Test user gets a profile with correct `school_id`.
- Onboarding works.
- Hub loads.
- Today page loads.
- Program page loads.
- Library shows only FESK content.
- Skill detail page loads video.
- Practice log can be created.
- Calendar reflects practice.
- Profile export works if already implemented.
- Logout clears session.

#### Acceptance Criteria

- FESK rollout URL is live.
- Test user can complete golden path.
- No console/runtime errors on main app routes.
- Supabase RLS assumptions verified in the actual project.

---

### Workstream G - Rollout Operations

#### Goal

Run the first FESK release in a controlled way so the product is useful, stable, and operationally manageable.

#### Recommended Rollout Structure

Use a staged rollout:

1. **Internal instructor smoke run:** 1-3 trusted instructors verify content, language, onboarding, and obvious UX issues.
2. **Controlled student rollout:** 5-15 users for the first 2-4 weeks.
3. **Expanded FESK rollout:** more students/schools only after the first group is stable.

#### Cohort Hygiene (required when reusing the existing project)

If the rollout runs on the existing production project, the founder's account, old test accounts, and pre-existing practice logs/news will pollute rollout metrics unless separated. Before counting anything:

- Identify and exclude founder and test user IDs from all metrics, or
- Tag the rollout cohort explicitly (e.g. a known list of invited user IDs, or invite timestamp after a cutoff) and compute every metric over that cohort only.
- Treat pre-rollout practice logs and seeded/demo content as out of scope for activation/retention numbers.

Without this, "activated users" and "week-2 active" are distorted by the founder's own usage.

#### Lightweight Rollout Signals

Metrics are useful for hygiene, not for heavy analysis in the first rollout. Direct feedback with teachers/instructors is the primary signal.

Track only what helps operate the rollout:

| Metric | Why It Matters |
|---|---|
| Invited users | Know who is in the rollout cohort |
| Activated users | Confirm onboarding works |
| Recent active users | Notice if usage silently stops |
| Sessions completed | Confirm the core behavior works |
| Skills practiced | Confirm curriculum usage |
| Support requests | Operational burden |
| Content corrections requested | Curation burden |
| User qualitative feedback | Product fit |
| Teacher/instructor qualitative feedback | Operational and teaching value |

#### Suggested Health Signals

For the controlled rollout:

- teachers/instructors can use the app without founder hand-holding;
- advanced students can onboard without repeated support;
- videos and curriculum are easy to find;
- practice logging works without confusion;
- support issues are few and specific;
- teachers/instructors can name where the app helps training.

For expanded rollout:

- support load is manageable;
- content maintenance does not overwhelm founder;
- FESK can name a reason to continue.

These are operating signals, not final business KPIs.

#### Rollout Rituals

- Day 0: teacher introduces app and why students should use it.
- Day 2-3: check onboarding problems.
- Week 1: collect early bugs and confusion.
- Week 2: assess retention and qualitative feedback.
- Week 4: decide whether to extend.
- Week 6 or 8: evaluate recurring use.
- End: prepare short rollout report for FESK.

#### Rollout Report

The report should include:

- rollout scope;
- number invited;
- activation/onboarding notes;
- usage observations;
- main use cases;
- top friction points;
- support effort;
- content effort;
- teacher feedback;
- student feedback;
- recommendation:
  - stop;
  - iterate and extend;
  - discuss paid continuation;
  - expand to another FESK group.

---

### Workstream H - Post-Rollout Decisions

#### Decision 1 - Continue FESK?

Continue if:

- operational owner / instructor lead remains active;
- users show recurring use;
- support effort is acceptable;
- content scope is maintainable;
- FESK sees value.

Stop or pause if:

- teacher does not promote it;
- users do not return;
- content authorization remains unclear;
- support burden is too high;
- FESK cannot identify decision path or owner.

#### Decision 2 - Expand Inside FESK?

Before adding FESK affiliate schools in the same project:

- build the email-keyed invite allowlist if more than one `schools` row will exist;
- define affiliate-school admin responsibilities;
- confirm whether curriculum is fully shared;
- confirm whether data governance is federation-level or school-level.

#### Decision 3 - Prepare for Non-FESK Client?

Only start non-FESK planning if:

- a real school exists;
- curriculum is ready;
- operational owner / instructor lead exists;
- decision path exists;
- content rights are clear;
- setup is bounded;
- the school does not require full SaaS/admin tooling as a condition.

If yes:

- create separate Supabase project;
- use baseline SQL;
- create client-specific seed;
- then decide whether domain refactor is needed.

---

## 7. Sequenced Implementation Checklist

Use this as the execution order.

### Stage 1 - Rollout Requirements Gate

Do this before branding and deploy. In this updated plan, FESK need is treated as already validated through direct relationship with teachers/instructors. The gate is therefore not "do interviews"; it is "confirm operational requirements and blockers."

- [ ] Name the exact first rollout group/participants.
- [x] Identify operational owner / instructor lead: founder for now, handoff possible later.
- [ ] Confirm decision path.
- [ ] Confirm usage trigger.
- [ ] Confirm content scope.
- [ ] Confirm content/video authorization.
- [x] Confirm first rollout has no minors.
- [x] Confirm first users are teachers/instructors plus a few advanced students.
- [x] Confirm current Supabase project will be reused for FESK.
- [x] Confirm operational owner will invite, remind, collect corrections, and route feedback for now.
- [ ] Go/No-Go: proceed to branding/deploy only if owner, content authorization, legal path, and first cohort are clear.
- [ ] Decide first format: instructor smoke run, controlled advanced-student rollout, or broader rollout.

### Stage 2 - Security and DB Readiness

- [ ] Verify real Supabase migration state.
- [ ] Verify `0028` policies.
- [ ] Verify `0035` RPC permissions if applied.
- [ ] Verify `0036` `handle_new_user` if applied.
- [ ] Document missing migrations.
- [ ] Decide whether to apply missing hardening before users.

### Stage 3 - Access Groups and Invite Preassignment

- [ ] Define first FESK access groups, e.g. instructor all-access, Shaolin exam-prep groups, T'ai Chi exam-prep groups.
- [x] Confirm all-access group model for founder/admin, selected masters, and selected instructors.
- [x] Confirm `Altro` / extra content is visible only to all-access users for now.
- [x] Confirm promotion is per discipline: Shaolin and T'ai Chi can advance independently.
- [ ] Add `access_groups`.
- [ ] Add `user_invites`.
- [ ] Harden `handle_new_user` to create profiles from `user_invites`.
- [ ] Add locked-profile behavior for students.
- [ ] Disable or hide student self-editing of assigned levels/exams.
- [ ] Enforce level/access scope in library listing.
- [ ] Enforce level/access scope in skill detail pages.
- [ ] Enforce level/access scope in custom plan selection.
- [ ] Enforce level/access scope in plan RPCs.
- [ ] Add SQL/scripted operation to insert invite rows from a simple email/group list.
- [ ] Add SQL/scripted operation to promote passed users to the next access group/scope after exam sessions, per discipline.
- [ ] Test with one Shaolin student, one T'ai Chi student, and one instructor.

### Stage 4 - Schema Baseline (conditional / parallel)

This does not block the FESK rollout because the current Supabase project will be reused. Run this in parallel or defer it; it becomes required before creating a future unrelated instance from scratch.

- [ ] Create baseline folder.
- [ ] Generate schema baseline via `pg_dump --schema-only` (do not hand-squash).
- [ ] Generate FESK seed via `pg_dump --data-only` on content tables (captures all video/extra-weapon migrations, not just `0004`).
- [ ] Write baseline README (new-project-only warning, verification queries).
- [ ] Test baseline on clean/disposable DB.
- [ ] Verify test user golden path.

### Stage 5 - Legal and Content

- [ ] Review legal pages.
- [ ] Resolve or document placeholders.
- [x] Confirm working data-role decision: FESK is data-responsible/controller candidate; exact legal wording still needs legal-page review.
- [x] Set contact email to `info@feskfongttai.it`.
- [ ] Confirm subprocessors.
- [ ] Confirm hosting region in legal pages matches the actual Supabase region (London/UK if reusing).
- [x] Confirm YouTube unlisted playback is acceptable.
- [ ] Document Google Drive as source/archive and confirm access boundaries.
- [x] Confirm minor-user handling for first rollout: no minors.
- [x] Confirm app name: `FESK Practice`.
- [x] Confirm logo source: `C:\martial-arts\logo-fesk.png`.
- [x] Confirm current colors stay for first rollout.
- [x] Confirm `Scuola Chang` stays.

### Stage 6 - FESK Branding

- [x] Set official app name to `FESK Practice`.
- [ ] Update metadata.
- [ ] Update manifest.
- [ ] Generate/update icons from `C:\martial-arts\logo-fesk.png`.
- [ ] Update offline page.
- [ ] Update main visible labels.
- [ ] Redesign public landing with FESK logo and FESK-aligned copy.
- [ ] Preserve current horse/Confucius landing as legacy personal variant.
- [ ] Keep current theme colors unless FESK later requests changes.
- [ ] Run checks.
- [ ] Manual mobile/PWA review.

### Stage 7 - Deploy

- [ ] Create/choose Vercel project.
- [x] Keep current domain/deployment for first rollout.
- [x] Use current Supabase project for FESK rollout.
- [ ] Verify existing DB state.
- [ ] Configure env vars.
- [ ] Deploy.
- [ ] Run smoke tests.
- [ ] Invite internal test user.

### Stage 8 - Rollout

- [ ] Tag the rollout cohort and exclude founder/test users from metrics (if reusing the existing project).
- [ ] Insert invite/preassignment rows for initial rollout users.
- [ ] Invite initial rollout users.
- [ ] Teacher introduces app.
- [ ] Monitor onboarding.
- [ ] Track lightweight operational signals.
- [ ] Log support requests.
- [ ] Collect teacher feedback.
- [ ] Collect student feedback.
- [ ] Prepare rollout report.

### Stage 9 - Post-Exam Promotion and Decision

- [ ] After each exam session, collect list of users who passed.
- [ ] Promote passed users to the next access group/scope for the discipline passed.
- [ ] Verify promoted users see the newly unlocked content.
- [ ] Verify non-promoted users remain in their current access group/scope.
- [ ] Continue, stop, extend, or expand.
- [ ] Decide whether FESK affiliate multi-school support is needed.
- [ ] Decide whether appConfig/terminology extraction is triggered.
- [ ] Decide whether second-client/domain-refactor work is justified.

---

## 8. Implementation Dependencies

| Task | Depends On |
|---|---|
| FESK branding | Rollout requirements gate, brand assets |
| Real rollout users | Legal/privacy, content authorization, migration verification |
| Invite/preassignment | Access groups, email list, school/exam mapping |
| Student level lock | Access groups, invite/preassignment, profile hardening |
| Post-exam promotion | Access groups with per-discipline next group/scope, promotion script/SQL |
| Clean FESK DB | Schema baseline or verified migration sequence |
| Push reminders | VAPID + cron env, explicit rollout need |
| FESK affiliates in same DB | Invite allowlist, governance model |
| Non-FESK client | Gate B from strategy doc |
| Curriculum pack | Real second curriculum |
| Domain refactor | Real non-FESK curriculum that cannot be modeled cleanly |

---

## 9. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Branding starts before rollout requirements are clear | Wasted effort | Complete Workstream A first |
| Migration state differs from repo | Security assumptions fail | Dashboard verification before users |
| Baseline is applied to existing DB | Data/schema damage | Mark baseline new-project-only |
| FESK later includes minors without process | Legal/privacy risk | First rollout excludes minors; stop and define consent workflow before that changes |
| FESK wants all affiliates immediately | Operational jump | Start with controlled rollout |
| Multiple `schools` rows before invite allowlist | Tenant self-assignment risk | Build allowlist first |
| Students self-select or self-edit levels | Users can unlock content without FESK approval | Use invite/preassignment groups and locked profiles |
| Direct skill URL bypasses library filters | Advanced content can be viewed despite UI filtering | Enforce access in skill detail query/RLS/server checks |
| Custom plan bypasses level scope | Student can add out-of-scope skills manually | Filter custom selection and harden `save_custom_selection` |
| Post-exam promotion is manual per table | Error-prone operations after every exam session | Use `next_access_group_id` plus one scripted promotion operation |
| Support requests go directly to founder | Poor scalability | Use operational owner/instructor lead as first-line support |
| Videos/content not authorized | Rollout blocked | Confirm rights before deploy |
| Google Drive scope expands silently | Privacy/content/access risk | Treat Drive as source/archive only unless playback/upload workflow is explicitly scoped |
| Data controller/processor role is assumed incorrectly | Legal/privacy pages may be wrong | Confirm role model with FESK and, if needed, privacy/legal advisor |
| AppConfig work starts too early | Unnecessary abstraction | Trigger only on second instance or branding churn |
| Non-FESK lead arrives with different grades | Current domain model breaks | Separate instance + targeted domain refactor |
| Seed baseline captures only `0004` | New instance ships with missing videos and missing "Altro" section | Generate seed via `pg_dump --data-only` of content tables, not from `generate-fesk-seed.mjs` alone |
| Fresh FESK project decision is reopened unnecessarily | Loses founder data, forces full re-seed of all content migrations | Reuse existing production project unless there is a concrete reason not to |
| Branding/deploy done before rollout requirements | Build effort wasted if ownership/content/legal path is unclear | Stage 1 rollout requirements gate is a hard Go/No-Go before Stage 6-7 |
| Push reminders on Vercel Hobby | Cron >1/day fails silently on Hobby tier | Keep reminders off for first rollout, or verify cron schedule respects Hobby limits before enabling |

---

## 10. Definition of Done

The FESK rollout implementation is done when:

- FESK rollout requirements gate is passed.
- Real Supabase migration state is documented.
- Required hardening is applied or risk-accepted explicitly.
- Current Supabase project is verified and used for FESK rollout.
- Access groups and invite/preassignment flow exist for rollout users.
- Students receive locked profiles with correct level/exam access on first login.
- Student access scope is enforced in library, skill detail, custom plan, and plan RPCs.
- `Altro` / extra content is visible only to all-access users.
- Founder/admin, selected masters, and selected instructors have all-access profiles.
- Post-exam promotion can move passed users to the next access group/scope per passed discipline in one controlled operation.
- Schema baseline exists or a deliberate decision to postpone it is documented.
- Legal/content/privacy checklist is complete for rollout scope.
- Data controller/processor model is confirmed before inviting real users.
- FESK is reflected as the data-responsible/controller candidate in legal wording, pending exact legal-page review.
- FESK-branded app is deployed.
- App name is `FESK Practice`.
- FESK logo assets are generated from `C:\martial-arts\logo-fesk.png`.
- Current colors are preserved unless FESK later requests a change.
- `Scuola Chang` remains as curriculum/library lineage label.
- Public landing uses FESK logo and FESK-aligned copy.
- Current horse/Confucius landing is preserved as a legacy personal variant.
- Test user golden path passes.
- Initial FESK teachers/instructors and advanced students are invited through a controlled process.
- Lightweight rollout signals are tracked.
- Rollout report template is ready.
- Current routes are preserved unless a concrete route-change need appears.

---

## 11. Explicit Non-Decisions

This plan does not decide:

- final pricing;
- FESK contract structure;
- whether students pay individually;
- whether FESK becomes a federation-wide product;
- whether future schools share one SaaS database;
- whether Taekwondo Germany becomes a real client;
- whether app store distribution is needed.

Those decisions require rollout evidence.

---

## 12. Immediate Next Action

The next action is:

> Run Workstream B (verify real Supabase migration state), design the first `access_groups` / `user_invites` set, confirm the data controller/processor model, then apply FESK branding (`FESK Practice`, current colors, logo asset) and run the smoke-test path.

The Supabase project decision is already resolved: reuse the current project. Branding and deploy should still wait for migration-state verification, legal/privacy wording for real users, and the access-group/preassignment model if students are included in the first rollout. The schema baseline remains parallel/deferrable for FESK, but it is required before creating a future unrelated instance from scratch.

---

## Errata and Decision Defaults

Resolved defaults that override or refine earlier prose. Read before the commit plan.

1. Existing founder profile backfill. Because the current Supabase project is reused, the founder/admin already exists in `user_profiles`. The access-group migration must include a backfill that assigns the existing founder/admin profile to the all-access group (set `content_access_mode = 'all_school_content'`, `can_view_extra_content = true`, `profile_locked = false`). Do not rely on invite bootstrap for already-existing users.
2. Supabase invite timing. Insert the `user_invites` row BEFORE sending the Supabase invitation. The auth user may be created during the invite flow, so `handle_new_user` must find the invite row first. Planned mechanism: `inviteUserByEmail` (Supabase admin API) or the dashboard "Invite user" equivalent.
3. Unmatched signup default. Default is BLOCK, not quarantine, for the first rollout. If no matching pending invite exists, `handle_new_user` fails provisioning (raises). Revisit quarantine only after access enforcement is fully deployed.
4. All-access source of truth. Enforcement uses `content_access_mode = 'all_school_content'` plus `can_view_extra_content = true`, NOT `role`. `role` stays for UI/admin semantics, but access checks read the content-scope fields. This avoids the missing `master` role value problem.
5. `Altro` representation. Add `skills.is_extra boolean NOT NULL DEFAULT false` and backfill `is_extra = true` for current `Altro` entries (`minimum_grade_value = 99`). Access logic keys off `is_extra`, not the magic `99` sentinel.
6. Locked student grade UI. `GradeEditor` is read-only for locked students (shows the assigned grade/exam), it does not disappear.
7. Hub background. Remove or replace the horse watermark in the FESK public app where it conflicts with FESK branding; keep `public/landing/cavallo-fuoco.svg` on disk for the legacy landing.
8. Migration numbering. The numbers in section 13 (`0037`+) are illustrative; use the next available ascending migration number at implementation time.

---

## 13. Implementation Commit Plan

Recommended commit order for a later coding agent. Each commit is small, independently reviewable, and leaves the app building. Migration numbers are shown as `0037`+ for ordering; use the next free number at implementation time. Run migrations via the Supabase SQL Editor (the CLI is not in PATH) and never edit the baseline files in `supabase/baseline/`. Commits 1-5 are the access-control subsystem and gate inviting students; commits 6-9 are branding/landing/legal/verification and can overlap once the schema is in place. Verify `npm run lint && npm run build` from `skill-practice/` after every commit that touches app code.

### Commit 1 - Supabase access-group / invite schema

- Files: `skill-practice/supabase/migrations/0037_access_groups_invites.sql`, `skill-practice/src/lib/types.ts` (hand-maintained mirror).
- Behavior: add `access_groups` (thin template) and `user_invites` (email-keyed) tables; add `profile_locked` (default `true`), `access_group_id`, `content_access_mode`, `can_view_extra_content` to `user_profiles`; add the `content_access_mode` enum; enable admin-only school-scoped RLS on the two new tables; keep `user_profiles` INSERT trigger-only. Purely additive, no existing flow changes yet.
- Tests/checks: `npm run lint && npm run build`; SQL: tables exist and RLS enabled; a non-admin cannot `SELECT user_invites`; `types.ts` mirrors the new columns.
- Rollback/risk: Low. Additive only; `profile_locked = true` enforces nothing until Commit 2 reads it. Roll back by dropping the tables/columns.

### Commit 2 - handle_new_user invite preassignment

- Files: `skill-practice/supabase/migrations/0039_invite_provisioning.sql` (replaces the `0036` body).
- Behavior: normalize `lower(trim(NEW.email))`, look up a `pending` invite, copy `school_id` / `display_name` / `role` / levels / exam targets / `plan_mode = 'exam'` / scope flags from the matched `access_group`, mark the invite `accepted` with `accepted_user_id`, and `RAISE EXCEPTION` on no match. Remove the hardcoded `8`/`0`. Include a founder/admin bootstrap path. Also closes the `0036:26-37` multi-school allowlist TODO.
- Tests/checks: SQL: signup with a matching invite provisions correct levels/role/scope and flips the invite to `accepted`; signup with no invite aborts the `auth.users` insert cleanly; founder bootstrap signs in; confirm the single-school path no longer defaults to `8`/`0`.
- Rollback/risk: HIGH. A `SECURITY DEFINER` trigger inside the `auth.users` INSERT; a bug hard-fails all signups including admin. Test the bootstrap first, keep the `0036` body ready to restore, and enforce the operational rule "insert the invite row BEFORE sending the Supabase invite email."

### Commit 3 - Profile lock and onboarding bypass

- Files: `skill-practice/supabase/migrations/0038_lock_profile_levels.sql`, `skill-practice/src/lib/actions/profile.ts`, `skill-practice/src/lib/actions/onboarding.ts`, `skill-practice/src/components/profile/GradeEditor.tsx`, `skill-practice/src/app/(app)/onboarding/*`.
- Behavior: extend `prevent_user_profile_privilege_changes` so an owner self-edit (`auth.uid() = OLD.id`) of `assigned_level_shaolin/taichi`, `preparing_exam_id`, `preparing_exam_taichi_id`, or `plan_mode` raises while `profile_locked` is true (closes BP-1 and, transitively, BP-7); make `updateProfileGrade` / `selectExam` / `finishWithoutExam` refuse for locked profiles; render `GradeEditor` read-only / hide onboarding self-selection for locked students.
- Tests/checks: SQL: a locked student UPDATE of `assigned_level_*` raises, an unlocked/all-access profile succeeds; a raw PostgREST POST as a locked student is rejected; the admin/service promotion path still succeeds; `npm run lint && npm run build`.
- Rollback/risk: Medium. Too broad a guard could block legitimate service/admin updates; key it strictly on `profile_locked AND auth.uid() = OLD.id`. Roll back by restoring the `0016` body. Land in order 1 -> 2/3; the trigger is the boundary, the app changes are defense-in-depth.

### Commit 4 - Content access enforcement

- Files: `skill-practice/supabase/migrations/0040_content_scope.sql`, `skill-practice/src/lib/queries/skills.ts`, `skill-practice/src/app/(app)/library/page.tsx`, `skill-practice/src/app/(app)/skill/[skillId]/page.tsx`, `skill-practice/src/lib/actions/plan.ts`, `skill-practice/src/app/(app)/plan/custom/page.tsx`.
- Behavior: add `is_skill_visible(uid, skill_id)` `SECURITY DEFINER`; wire it into `skills_read` RLS `USING` and `user_plan_items` `WITH CHECK`; harden the `save_custom_selection` INSERT `WHERE` with the same predicate (closes BP-4); switch the library to a grade/scope-aware query and delete the dead `ENABLE_LEVEL_LOCK` path (closes BP-2); gate the `Altro` section by `can_view_extra_content` (closes BP-6); guard `getSkillById` / the detail page to `notFound()` out-of-scope skills (closes BP-3); scope `listSkillsForDiscipline` / `listSkillOptionsForDiscipline` and `addSkillToPlan` (closes BP-5).
- Tests/checks: `npm run lint && npm run build`; the seven-scenario smoke matrix in section 14; direct-URL to an advanced skill 404s for a student and opens for all-access; `save_custom_selection` and `addSkillToPlan` reject out-of-scope/`Altro` for students at the DB layer; instructor still sees all + `Altro`.
- Rollback/risk: Medium-High. A too-strict RLS predicate hides legitimate content or breaks instructor all-access; the single predicate must handle the `taichi = 0` and all-access branches. Roll back RLS to the `0028` school-only policy and revert the app queries. Depends on Commit 1 columns and is only fully effective once Commit 3 locks the level.

### Commit 5 - Post-exam promotion script / RPC

- Files: `skill-practice/scripts/promote-after-exam.mjs`, `skill-practice/supabase/migrations/0041_promotion_audit.sql`, reuses `skill-practice/src/lib/supabase/admin.ts`.
- Behavior: a service-role script that, per passed discipline, updates only that discipline's `assigned_level_*` + `preparing_exam_*`, repoints `access_group_id` to `next_<discipline>_access_group_id`, then re-runs `activate_exam_mode` / `switch_to_exam_mode` to regenerate `exam_program` plan items (preserving manual items + history) and writes an audit row. The other discipline and all practice history are untouched.
- Tests/checks: pass Shaolin only -> Shaolin level advances, T'ai Chi unchanged, plan regenerated via the RPC, history preserved, audit row written; pass both independently -> correct dual result; the script runs through the service-role client (bypasses the lock/RLS correctly).
- Rollback/risk: Medium. A naive level UPDATE that skips the RPC leaves stale plan items; the script must call the existing RPC path, not hand-write `user_plan_items`. Add a dry-run mode and idempotency. Depends on Commit 1 (the `next_*` pointers) and Commit 3 (so the service path is the only way levels change).

### Commit 6 - FESK branding / PWA assets

- Files: `skill-practice/src/app/layout.tsx`, `skill-practice/public/manifest.json`, `skill-practice/public/offline.html`, `skill-practice/src/app/(auth)/login/LoginForm.tsx`, `skill-practice/src/app/(app)/profile/export/route.ts`, `skill-practice/public/icon.svg`, `skill-practice/src/app/favicon.ico`, `skill-practice/public/icons/*`, `skill-practice/public/og-image.png`, `skill-practice/public/sw.js`, `skill-practice/src/components/hub/HubBackground.tsx`.
- Behavior: set the app name to `FESK Practice` and fix the non-templated strings (manifest, offline title, `LoginForm`, export filename); regenerate all icons from the FESK logo including `icon.svg` (currently horse) and `favicon.ico`; regenerate `og-image.png`; resolve the `HubBackground` watermark decision; reconcile `theme_color` to one value; bump `sw.js` cache name (e.g. `fesk-practice-v4`) AFTER the asset swap.
- Tests/checks: `npm run lint && npm run build`; an installed PWA receives the new icon/manifest after SW activation (cache bump verified); tab favicon + apple-touch + maskable all show FESK, none show the horse; `theme_color` consistent across manifest and viewport.
- Rollback/risk: Medium. Forgetting the cache bump ships stale horse icons to installed users; bumping before the asset swap caches the old assets under the new name. The logo is small/white-bg, so the maskable may look broken without a higher-res/vector source or dark-bg compositing. Roll back by restoring assets + the previous cache name.

### Commit 7 - FESK landing + legacy landing preservation

- Files: `skill-practice/src/app/page.tsx`, `skill-practice/src/components/landing/FeskLandingHero.tsx`, `skill-practice/src/components/landing/LegacyLandingHero.tsx`, `skill-practice/src/components/landing/LegacyHorseEmblem.tsx`, `skill-practice/src/app/landing-legacy/page.tsx`.
- Behavior: rename the current `LandingHero` / `HorseEmblem` to `Legacy*` and expose them at `/landing-legacy` (keep `cavallo-fuoco.svg` on disk; it is still used by `HubBackground`); build a sibling `FeskLandingHero` (FESK logo + "Fong Ttai" / "Abbondanza di pace" copy); point `/` at it. The legacy horse/Confucius variant is preserved, not deleted.
- Tests/checks: `npm run lint && npm run build`; `/` renders the FESK landing; `/landing-legacy` renders the horse + Confucius citation; `cavallo-fuoco.svg` still present (HubBackground unbroken).
- Rollback/risk: Low. Additive component + route. The only risk is editing `LandingHero` in place (destroys the legacy) or deleting the SVG (breaks both HubBackground and the legacy landing). Roll back by pointing `page.tsx` back to `LegacyLandingHero`.

### Commit 8 - Legal page placeholders

- Files: `skill-practice/src/app/(legal)/privacy/page.tsx`, `.../terms/page.tsx`, `.../cookies/page.tsx`, `.../disclaimer/page.tsx`, `skill-practice/src/components/legal/LegalPage.tsx`.
- Behavior: replace the `[PLACEHOLDER]` strings (controller = FESK, contact = `info@feskfongttai.it`, hosting region = UK/London per `current-plan` 15.5, retention, subprocessors, minors excluded, invite-only account model) and the residual "Kung Fu Practice" name. This is content/legal work, cleanly separable from coding; no logic change.
- Tests/checks: `npm run build`; grep shows no remaining `[PLACEHOLDER]` and no "Kung Fu Practice" in the legal pages; the contact email is present and correct.
- Rollback/risk: Low for code, but legal exposure if shipped with placeholders to real users. The wording must be reviewed by FESK / a privacy advisor before the public invite. Can run in parallel with commits 1-7 but must complete before any real-user invite.

### Commit 9 - Tests / smoke verification

- Files: `skill-practice/scripts/verify-rollout.sql`, `skill-practice/docs/plans/fesk-rollout-smoke-checklist.md`.
- Behavior: add the copy-paste verification SQL (section 14) and the seven-scenario smoke checklist, executable manually post-deploy.
- Tests/checks: the verification SQL returns the expected policies/grants/function body; all seven smoke scenarios pass against staging/prod; raw-POST bypass attempts are rejected at the DB layer.
- Rollback/risk: None. Verification artifacts only, no runtime change.

---

## 14. Access-Control Smoke Test Matrix

Run after Commit 4 (and re-run after Commit 5) against a test cohort, not the founder's account. "Pass" means the row's "must NOT" never happens through the UI OR a raw request. Test the raw path too: a logged-in student's bearer token + a direct PostgREST POST is the real adversary, not just the UI.

| # | Scenario | Setup | Must SEE / DO | Must NOT see / do |
|---|---|---|---|---|
| 1 | Shaolin-only student | invite -> `shaolin_student_8`, `assigned_level_taichi = 0`, `can_view_extra_content = false`, locked | Shaolin catalog at/above their grade; exam plan for their target | any T'ai Chi content; Shaolin forms below their grade; `Altro`; the T'ai Chi toggle |
| 2 | T'ai Chi-only student | invite -> `taichi_student_*`, `assigned_level_shaolin` set to "not practiced" scope, locked | T'ai Chi catalog at/above their grade | any out-of-scope Shaolin content; `Altro` |
| 3 | Dual-discipline student | invite -> a group with both levels set, locked | both disciplines at/above their respective grades | content above either grade; `Altro` |
| 4 | Instructor / all-access | invite -> `all_access_instructor`, `content_access_mode = all_school_content`, `can_view_extra_content = true` | the full catalog of both disciplines AND `Altro`; can add any skill | (no restriction expected) |
| 5 | Direct-URL to advanced skill | as scenario 1, copy a known advanced/`Altro` `skillId`, open `/skill/<id>` directly | `notFound()` / 404 | the video, secondary video, or teacher notes of the out-of-scope skill |
| 6 | Custom-plan / add-to-plan bypass | as scenario 1, POST out-of-scope and `Altro` `skillId`s to `save_custom_selection` and `addSkillToPlan` | a rejection / no rows inserted | any out-of-scope `user_plan_items` row created (verify in DB) |
| 7 | Self-promotion bypass | as scenario 1, POST a higher grade to `updateProfileGrade` and via raw PostgREST UPDATE | both rejected (trigger raises) | `assigned_level_*` / `preparing_exam_*` / `plan_mode` changed |
| 8 | Post-exam promotion | run the promotion script for a Shaolin-only pass | promoted user now sees the newly unlocked Shaolin grade; T'ai Chi unchanged; history preserved | non-promoted users moving scope; the other discipline changing |
| 9 | Legacy landing preserved | open `/` and `/landing-legacy` | `/` = FESK landing; `/landing-legacy` = horse/Confucius variant | the horse landing being the public default; `cavallo-fuoco.svg` missing |

Verification SQL (paste into the Supabase SQL Editor; confirms the real project matches the repo before inviting users):

```sql
-- handle_new_user body actually applied
SELECT pg_get_functiondef('public.handle_new_user'::regproc);

-- read/visibility policies present and grade-aware after Commit 4
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('skills','exam_programs','exam_skill_requirements',
                    'news_items','user_plan_items','user_profiles',
                    'access_groups','user_invites')
ORDER BY tablename, policyname;

-- mutating RPCs not executable by anon/PUBLIC (0035) and the new predicate present
SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args, p.proacl
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('activate_exam_mode','switch_to_exam_mode','switch_to_custom_mode',
                    'save_custom_selection','update_plan_item_status','hide_plan_item',
                    'is_skill_visible');

-- exactly one school (single-tenant hardening assumption)
SELECT count(*) AS school_count FROM public.schools;
```

---

## 15. Open Decisions for Founder

These are product/ownership calls a coding agent should not invent. None blocks starting commits 1-4, but they shape the details.

1. Unmatched signup: confirm BLOCK (not quarantine) for the first rollout, accepting that anyone invited via Supabase before their invite row exists will fail signup (operational ordering: insert the invite row first).
2. Founder/admin bootstrap: a seeded admin `user_invites` row, or a one-time env-guarded exception in `handle_new_user`, so the first all-access user can sign in.
3. All-access source of truth: derive from `role IN ('admin','instructor')` plus a curated set, or drive purely from `content_access_mode = 'all_school_content'`. Note `master` is not a `user_role` value today.
4. `Altro` representation: add `skills.is_extra` boolean (cleaner) vs keep `minimum_grade_value = 99` as the single documented marker.
5. `HubBackground` watermark after the rebrand: keep the horse, swap to a FESK mark, or remove.
6. FESK logo asset: provide a higher-resolution or vector source (current `logo-fesk.png` is ~221x228 on white, weak for a 512 maskable), or accept dark-bg compositing with safe-zone padding.
7. `GradeEditor` for locked students: fully hidden vs read-only display of the assigned grade.
8. Privacy-page hosting region: state UK/London for the Supabase DB (per `current-plan` 15.5), distinct from Vercel `fra1` (Frankfurt).
9. Canonical decision table: the confirmed-decisions table is duplicated in this plan (section 5.3) and the white-label strategy (section 7A). Section 5.3 is canonical; if they diverge, 5.3 wins.
