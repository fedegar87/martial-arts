# Today page restructure plan

**Status:** Implemented
**Date:** 2026-05-01
**Scope:** `/today` daily practice page only. No hub routes, hub components, auth redirects, global app layout, or BottomNav changes.

## Goal

Make `/today` the execution page for the daily practice generated from:

1. `Programma`: defines the active study scope (`exam_program` or `manual`)
2. `sessions/setup`: defines schedule rules (`training_schedule`)
3. `session-scheduler.ts`: computes the exercises for the current date

The hub remains the orientation page. `/today` answers: "what do I practice today?"

## Current data contract

- Active plan source: `profile.plan_mode === "custom" ? "manual" : "exam_program"`
- Active items: `getUserPlanItems(profile.id, undefined, sourceFilter)`
- Schedule: `getTrainingSchedule(profile.id)`
- Today key: `localDateKey()`
- Daily session: `getScheduledSession(todayStr, schedule, items)`
- Practice progress: `getThisWeekLogs(profile.id)`, filtered to today for card progress

No scheduler or database logic changes are required.

## Implemented structure

### Session header

New component: `src/components/today/TodaySessionHeader.tsx`

- Sticky page-level header remains inside `/today`
- Shows active plan mode: exam program or personalized plan
- Shows date label and grade summary
- Offers icon actions for session calendar and session setup

### Session summary

New component: `src/components/today/TodaySessionSummary.tsx`

- Exercises today
- Completed exercises today
- Repetitions per form
- Estimated minutes
- Secondary line for review cadence and weekly practice days

Estimated minutes now multiplies skill duration by `schedule.reps_per_form`, matching the session setup model.

### Practice sections

New component: `src/components/today/TodayPracticeSections.tsx`

- Focus
- Ripasso
- Mantenimento

This keeps `TodaySkillCard`, `RepsCounter`, and practice actions unchanged.

### Empty session state

Updated component: `src/components/today/TodayEmptyState.tsx`

Adds `reason="empty_session"` for the edge case where a training day has no scheduled exercises after bucketing/status filtering.

## Non-goals

- No changes to `/hub`
- No changes to `AppHeader`
- No changes to `BottomNav`
- No changes to `session-scheduler.ts`
- No changes to `Programma` plan activation
- No changes to Supabase schema or RLS

## Verification

- `npm run test`
- `npm run lint`
- `npm run build`

Manual smoke:

1. `/today` with active plan and schedule shows header, summary, and daily sections.
2. `/today` no plan shows the plan empty state under the same page header.
3. `/today` no schedule shows the session setup empty state.
4. `/today` rest day shows next training date.
5. `/today` training day with no bucketed exercises shows the new empty-session state.
