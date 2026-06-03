# Review fixes — implementation plan (2026-05-29)

> **Stato al 2026-06-03:** Track A ✅ implementato · Track B ✅ migration `0028` applicata (isolamento multi-tenant attivo) · Track C = backlog **non-bloccante**, in gran parte aperto (fatto: rimozione `next-pwa`; restano tipi `Database`, CSP, guard onboarding per-pagina, error-handling query, caching catalogo, ecc.). A8 parziale: `typecheck` ok, `.github/workflows/ci.yml` creato ma non ancora committato. Doc tenuto in `docs/plans/` (non in `completed/`) finché il Track C resta aperto.

**Goal:** Apply the reconciled review actions. Track A (pre-first-federation, single-tenant-safe) is implemented now; Track B (pre-second-federation, multi-tenant) is delivered as a migration + copy-paste SQL because the DB is cloud-only and the Supabase CLI is not in PATH (see `feedback_db_changes_workflow`); Track C is non-blocking.

**Architecture:** Next.js 16 App Router + Supabase. UI/config/CSS changes are code-only and safe in single-tenant. RLS/tenant changes are migration files the owner pastes into the Supabase SQL Editor.

**Verification per change:** `npm run lint`, `npm run typecheck` (added here), `npm test`, then `npm run build`.

---

## Phase 1 — Track A (implement now, no DB)

### A1. Global keyboard focus ring
- **File:** `src/app/globals.css` (@layer base)
- Add after the existing `* { ... outline-ring/50 }` rule:
  ```css
  *:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
  ```
- shadcn components set `outline-none` (utilities layer wins) so they keep their ring; hand-rolled links/BottomNav/EnterButton now get a visible gold outline.

### A2. iOS safe-area (`viewportFit`)
- **File:** `src/app/layout.tsx` — add `viewportFit: "cover"` to the `viewport` export. Without it `env(safe-area-inset-*)` resolves to 0 in the standalone PWA and the bottom nav sits under the home indicator.

### A3. Destructive error-text contrast (single token redirect)
- **File:** `src/app/globals.css` (`:root`)
- `text-destructive` is only ever text/border/wash on dark surfaces in this codebase (never white-on-solid-red), so redirect `--destructive` to a readable red while keeping the dark fill for charts:
  - add `--status-error-text: #df6a6a;` (≈5.8:1 on `#111`)
  - change `--destructive: var(--status-error)` → `--destructive: var(--status-error-text)`
  - leave `--status-error: #9c2424` and `--chart-5: var(--status-error)` unchanged.
- Fixes the Alert, the 4 inline error `<p>`s, and the 2 destructive outline buttons at once, with no edits to `components/ui/`.

### A4. `muted-foreground/70` AA failures (2 spots)
- `src/components/landing/LandingHero.tsx:35` and `src/components/sessions/PlanFormsSection.tsx:78`: `text-muted-foreground/70` → `text-muted-foreground` (full opacity passes AA; `/70` ≈ 3.5:1 fails).

### A5. App-level error boundary
- **Create:** `src/app/(app)/error.tsx` (client). In-theme card + "Riprova" calling `reset()`. Covers all `(app)` routes (incl. `/progress`, where every section query throws on Supabase error).

### A6. Onboarding: completion path for top-grade / no-exam users
- **File:** `src/lib/actions/onboarding.ts` — add `finishWithoutExam(formData)`: validate disciplines, set assigned levels, `plan_mode = "custom"`, null the preparing-exam ids, `redirect("/hub")`. `isProfileOnboarded` already treats `plan_mode === "custom"` as onboarded.
- **File:** `src/app/(app)/onboarding/OnboardingForm.tsx` — add a secondary `formAction={finishWithoutExam}` outline button ("Continua senza esame — allenamento libero"), disabled only while pending (NOT gated on `visibleExams.length`), so a top-grade user is never stuck.

### A7. Grade change: confirmation + honest copy
- **File:** `src/components/profile/GradeEditor.tsx` — controlled select; on Salva, if the grade changed show a confirmation Alert ("…il programma d'esame della disciplina verrà ricreato… Lo storico resta.") with Conferma/Annulla before calling `updateProfileGrade`; show a "Grado aggiornato" confirmation on success. Rewrite the misleading helper line.

### A8. CI quality gate + typecheck script
- **File:** `package.json` — add `"typecheck": "tsc --noEmit"`.
- **Create:** `.github/workflows/ci.yml` — on push to `main` + PRs: `npm ci`, `npm run lint`, `npm run typecheck`, `npm test` in `skill-practice` (build stays gated by Vercel).

---

## Phase 2 — Track B (deliver as migration + SQL; apply manually before federation #2)

One migration `supabase/migrations/0028_multitenant_isolation.sql` (latent/no-op in single-tenant):

1. **Static-content RLS school-scoping** — replace `USING (true)` on `skills`, `exam_programs`, `news_items`, `schools` with `school_id = (SELECT school_id FROM user_profiles WHERE id = (SELECT auth.uid()))`; gate `exam_skill_requirements` via `EXISTS` on its `exam_programs` row.
2. **Tenant coherence on dynamic tables** — add `WITH CHECK` on `user_plan_items` / `practice_logs` requiring the referenced skill's `school_id` to equal the caller's `profile.school_id` (closes P6 + P8 across `addSkillToPlan`, `markPracticeDone`, free-practice and siblings in one place).
3. **`handle_new_user`** — read `NEW.raw_user_meta_data->>'school_id'`; fall back to the single school only when exactly one exists, else RAISE.
4. **`account_deletion_requests` admin policies** — school-scope via the request owner's `school_id` (P7).
5. **`save_custom_selection`** — add `AND skill.school_id = profile.school_id`.

Paired code (safe single-tenant, do with the migration): thread `profile.school_id` into `src/lib/queries/skills.ts` and call sites; de-hardcode "Scuola Chang" (`BottomNav`, `HubGrid`, `library` H1) using `school_name`; per-school timezone; 2-school isolation smoke test.

---

## Phase 3 — Track C (non-blocking)
Generated `Database` type (or update the doc); unify query error-handling; static-catalog caching; CSP; migration applied-state tracking; remove `next-pwa`; split `session-progress` test into its own file + cover the `not_started` branch; per-page onboarding guard via `requireOnboardedProfile()` (P3, 11 routes); progress first-run CTA; reminder schedule note.

> **Note (legal):** filling the privacy/terms placeholders + the minors-consent field requires the federation's controller/DPO data and is owner/legal work, not implemented here.
