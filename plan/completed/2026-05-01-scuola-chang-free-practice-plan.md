# Scuola Chang free practice plan

**Status:** Implemented
**Date:** 2026-05-01
**Scope:** Skill detail reached from Scuola Chang. No changes to hub, BottomNav, Programma, `/today`, scheduler, or schema.

## Goal

Support the use case: "I want to practice one specific exercise, not necessarily today's scheduled session and not necessarily something already in my active program."

The intended flow is:

```text
Hub -> Scuola Chang -> filters/browse -> skill detail -> watch video -> practice freely
```

If the user wants the exercise to become recurring study material, they can add it to the plan from the same skill detail.

## Role Separation

- `/today`: guided daily session computed from active program + calendar.
- `Programma`: defines what belongs to the structured study plan.
- `Scuola Chang`: browse/search the curriculum and open any unlocked exercise.
- `/skill/[skillId]`: practice/view one specific video, capture notes, optionally add to plan.

## Implemented changes

### Skill detail free-practice action

New component: `src/components/skill/SkillPracticeActions.tsx`

Actions:

- `Pratica libera fatta`: writes/updates today's `practice_logs` row for this skill.
- `Nota`: opens the same personal note sheet used in daily practice.
- `Aggiungi/Rimuovi dal piano`: keeps the existing plan affordance.

The explanatory copy makes the distinction explicit:

- free practice updates history only
- adding to plan makes it recur through Programma/calendar/Today

### Today log lookup

New query: `getTodayLogForSkill(userId, skillId)`

Used by `/skill/[skillId]` to show `Praticato oggi` when the exercise was already completed today.

### Skill detail wiring

Updated `/skill/[skillId]`:

- Fetches plan item, personal notes, and today's log in parallel.
- Replaces the previous single sticky `AddToPlanButton` with `SkillPracticeActions`.

## Non-goals

- No search box yet in Scuola Chang.
- No free-practice repetitions counter.
- No custom one-off workout builder.
- No change to plan-mode semantics.
- No change to daily scheduler.

## Verification

- `npm run test`
- `npm run lint`
- `npm run build`

Manual smoke:

1. Open Scuola Chang and select a skill.
2. Watch or open the video.
3. Tap `Pratica libera fatta`; the action marks the skill as practiced today and opens the note sheet.
4. Tap `Nota` without completing; it saves an observation without marking completion.
5. Tap `Aggiungi al mio piano`; the skill becomes part of the manual plan for recurring study.
