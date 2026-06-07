# Video notes role plan

**Status:** Implemented
**Date:** 2026-05-01
**Scope:** Notes around skill videos and daily practice. No hub, navigation, scheduler, or schema changes.

## Goal

Clarify the role of notes associated with each video:

1. **Teacher note**: stable guidance attached to the skill/video. It explains what to pay attention to while watching or practicing.
2. **Personal practice note**: the student's observation after or during practice. It is tied to the skill and stored in `practice_logs.personal_note`.
3. **Skill detail diary**: the long-term view of personal notes for the same video, useful before revisiting the skill.

## Current issue

The notes model existed, but it was uneven:

- `teacher_notes` was rendered separately in `/today` and `/skill/[skillId]`.
- Personal notes were available through `PracticeCheckButton`.
- Scheduled sessions use `RepsCounter`, which replaced `PracticeCheckButton`, so the note affordance disappeared from the primary daily-practice path.
- `savePracticeNote` inserted a completed practice log if no log existed yet, which made "write a note" behave like "completed".

## Implemented changes

### Shared teacher guidance

New component: `src/components/skill/TeacherNote.tsx`

- Used by `TodaySkillCard`
- Used by `/skill/[skillId]`
- Compact mode for daily cards, full mode for detail pages

### Personal note capture

New component: `src/components/today/PracticeNoteButton.tsx`

- Opens a bottom sheet for a practice note
- Used by `PracticeCheckButton`
- Used by `RepsCounter`

This restores notes for scheduled `/today` sessions.

### Skill detail diary

New component: `src/components/skill/PersonalNotesPanel.tsx`

- Shows recent personal notes with dates
- Keeps `/skill/[skillId]` as the review/history surface for a video

### Server action semantics

Updated `src/lib/actions/practice.ts`:

- `savePracticeNote()` no longer marks a skill as completed when no practice log exists.
- If no log exists and the note is non-empty, it creates an incomplete log with `personal_note`.
- `markPracticeDone()` updates an existing same-day log when present instead of always inserting a second log.
- Existing notes are preserved when marking done without a new note.

## Role by page

- `/today`: use notes as quick capture during the daily session.
- `/skill/[skillId]`: use notes as memory/history around a specific video.
- `Programma`: remains the scope/planning surface, not the note surface.
- `Progress`: remains aggregate reflection and history, not per-video note editing.

## Non-goals

- No note editing history UI beyond replacing today's latest note.
- No separate notes table.
- No timestamp-inside-video notes.
- No instructor/admin note authoring UI.
- No changes to video playback.

## Verification

- `npm run test`
- `npm run lint`
- `npm run build`

Manual smoke:

1. In `/today`, a reps-based card shows a `Nota` button next to repetition controls.
2. Saving a note before completing reps does not complete the exercise.
3. Completing an exercise after writing a note preserves the note.
4. `/skill/[skillId]` shows teacher guidance and personal-note diary consistently.
