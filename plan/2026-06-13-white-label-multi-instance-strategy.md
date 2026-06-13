# White-Label and Multi-Instance Strategy

**Date:** 2026-06-13  
**Status:** Draft for strategic and technical review  
**Scope:** Product architecture, tenant strategy, curriculum configurability, branding, data isolation  
**Primary app:** `skill-practice/`  

---

## 1. Purpose of This Document

This document captures the structural problem behind the FESK white-label request and proposes a scalable strategy.

It is written to be reviewed by another LLM or technical advisor without requiring access to the original conversation. It summarizes:

- what the user is actually trying to solve;
- why "just add the FESK logo" is not the real problem;
- why a full SaaS multi-tenant platform is premature;
- why manual forks are risky;
- what architecture should be used now;
- what should be deferred until there is more market evidence.

The recommended direction is:

> Use one shared codebase, separate client instances, isolated Supabase projects, and progressively extracted configuration packs for brand, language, terminology, and curriculum.

In short:

> Multi-instance first. Full multi-tenant SaaS later, only if demand proves repeatable.

---

## 2. Background

The current app, `skill-practice`, is a PWA for guided martial arts practice. It is currently centered on the FESK / Scuola Chang Kung Fu curriculum:

- Shaolin and T'ai Chi as the two supported disciplines;
- FESK-specific grade semantics;
- FESK-specific skill categories;
- Italian UI copy;
- "Kung Fu Practice" / "Scuola Chang" branding;
- YouTube unlisted videos, with FESK Google Drive expected as a source/archive for school videos;
- Supabase Auth and Postgres;
- Vercel hosting.

Recent architecture work added partial multi-school readiness:

- `school_id` exists on content and profiles;
- RLS has been hardened in later migrations;
- queries increasingly scope content by school;
- user data is already owner-bound.

However, the app is still FESK-first at the domain level. The data model and UI still assume that "martial arts curriculum" means FESK-style Shaolin/T'ai Chi, FESK categories, FESK grades, and Italian terminology.

Relevant existing documents:

- `docs/architecture.md`
- `docs/architecture-multitenancy-readiness.md`
- `plan/reference/business/validation-lab/2026-06-10-session-2-where-to-play.md`
- `plan/reference/business/business-model-canvas-draft.md`
- `plan/reference/business/business-model-canvas-assumption-map.md`

---

## 3. Problem Statement

The immediate business event is:

> FESK teachers/instructors are ready to use the app, with a few advanced students in the first rollout, but the app needs UI/UX, branding, legal, and operational readiness work so that it feels like the federation's app.

The deeper structural question is:

> How can the product support FESK now, while leaving a path to support other martial arts schools or federations later, without creating maintenance chaos or prematurely building a SaaS platform?

This is not one problem. It is three different problems that must be separated.

| Layer | Question | Current State | Real Requirement |
|---|---|---|---|
| Brand and product identity | What does the app look like and call itself? | FESK/Kung Fu hardcoded | Per-instance app name, logo, theme, manifest, copy |
| Martial arts domain | What are disciplines, grades, categories, exams, and practice units? | FESK Shaolin/T'ai Chi hardcoded | Per-curriculum model, eventually data-driven |
| Data and operational isolation | Where do students, logs, profiles, and school data live? | One Supabase model with `school_id` readiness | Isolated client instances for unrelated organizations |

The key issue is that the current app looks like it is "almost multi-tenant" because `school_id` exists, but that only covers part of the problem. It does not make the domain generic.

---

## 4. The User's Core Concern

The user is not only asking:

> "How do I create a FESK-branded version?"

The user is really asking:

> "If FESK uses this app, and later a Taekwondo school in Germany wants a similar app with different students, curriculum, language, identity, categories, grades, and URLs, how do I manage that efficiently, cleanly, and scalably?"

This concern is valid.

A Taekwondo school in Germany is not just another row in the same `schools` table:

- it has unrelated students;
- it may have unrelated legal responsibilities;
- it has a different curriculum;
- it has different terminology;
- it likely needs German UI copy;
- it may use kup/dan grades instead of FESK Chi/Chieh values;
- it does not need FESK Shaolin/T'ai Chi split;
- it should not share a database with FESK unless there is a strong operational reason.

Therefore, the main design question is not "single database or not" in the abstract. The real question is:

> Which organizations belong inside the same operational instance, and which require separate instances?

---

## 5. Current Technical Constraints

The current codebase has good foundations, but it is not a generic martial arts platform yet.

### 5.0 Verified State (2026-06-13 codebase audit)

A direct read of the migrations and queries shows data isolation is further along than "school_id exists" suggests. This changes the risk calculus and should not be understated:

- **Static reads are tenant-scoped at the database level.** `0028_multitenant_isolation.sql:36-69` replaced the old `USING(true)` read policies on `skills`, `exam_programs`, `exam_skill_requirements`, and `news_items` with per-school `USING` policies. A user cannot read another school's catalog even if an application query forgets to pass `school_id`.
- **Cross-tenant writes are blocked.** `0028:77-105` adds `WITH CHECK` clauses so a user cannot attach another school's skill to their plan or logs.
- **New-user provisioning is hardened.** `0036_harden_new_user_tenant.sql:21-38`: when exactly one school exists, `handle_new_user` ignores client-supplied metadata entirely and assigns the single school.
- **Application-layer scoping is partial but backstopped.** Several read queries still rely purely on RLS rather than passing `school_id` (`src/lib/queries/skills.ts:17-53` `listAccessibleSkills`/`listSkillsByCategory`; `calendar.ts:92-114`; `plan.ts`/`progress.ts` joins). This is acceptable because the DB policies above are the real boundary, but defense-in-depth would pass `school_id` consistently.

**Caveat: this is verified in the repo, not confirmed in production.** The findings above describe migration files present in the codebase. `docs/architecture.md:405-411` notes that `0001`-`0028` are believed applied but `0033`-`0036` are present in the repo and must NOT be assumed applied to the real Supabase project. Before relying on `0036`'s single-tenant hardening or `0028`'s policies for real rollout users, confirm the applied migration state in the Supabase dashboard (e.g. inspect the policies on `skills` and the body of `handle_new_user`).

Two consequences for this strategy:

1. **The decisive argument for separate instances is operational, not "RLS isn't ready."** With one school per Supabase project, `handle_new_user` always takes the safe `school_count = 1` path, so the **unfinished** multi-tenant invite branch (`0036:26-37`, which still carries a `TODO: validate invite school_id against an email-keyed allowlist`) never executes. Multi-instance lets a second client ship *without* finishing the hardest piece of multi-tenancy.
2. **`0028` only earns its keep in one scenario:** a single Supabase project that legitimately holds **multiple schools** - i.e. the FESK-federation-with-affiliates case (section 7.1). For an unrelated single-school client it is inert (no-op by design, `0028:3-5`). It is *intra-federation* multi-school support, not *cross-discipline* tenancy.

### 5.1 Things Already in Place

- Supabase Auth.
- User profiles.
- User-owned practice logs.
- RLS on dynamic user data.
- `school_id` on key content tables.
- Multi-school isolation work in migration `0028_multitenant_isolation.sql`.
- Later hardening migrations up to `0036_harden_new_user_tenant.sql`.
- Server-side queries and actions, which make future config loading feasible.
- A focused app structure: practice plan, daily session, calendar, progress, library, news, profile.

### 5.2 Things Still FESK-Specific

The following are currently structural, not just labels:

- `Discipline = "shaolin" | "taichi"`;
- categories such as `forme`, `tui_fa`, `po_chi`, `chin_na`, `armi_forma`;
- `assigned_level_shaolin` and `assigned_level_taichi` on `user_profiles`;
- `preparing_exam_id` and `preparing_exam_taichi_id`;
- grade logic based on FESK numeric values;
- schedule language around "forms" and "reps per form";
- navigation and UI text such as "Scuola Chang", "programma", "forme";
- static PWA manifest;
- static icons and visual identity;
- no i18n or terminology layer.

These are acceptable for the FESK rollout. They are not acceptable as the final foundation for arbitrary martial arts domains.

---

## 6. Strategic Decision

The recommended strategy is:

> Do not build a full multi-tenant SaaS platform now. Do not create unmanaged forks either. Build a multi-instance product from one shared codebase.

This means:

- one Git repository;
- one core application;
- one deployable app package;
- separate runtime configuration per client instance;
- separate Supabase project per unrelated organization;
- shared implementation for common product logic;
- client-specific configuration and seed data for brand, language, terminology, and curriculum.

The model should be:

```txt
shared codebase
  |
  |-- instance: fesk
  |     |-- Vercel project/domain
  |     |-- Supabase project
  |     |-- FESK brand config
  |     |-- FESK curriculum seed
  |
  |-- instance: taekwondo-de
        |-- Vercel project/domain
        |-- Supabase project
        |-- Taekwondo brand config
        |-- Taekwondo curriculum seed
```

This avoids two bad extremes:

1. One shared database for unrelated organizations.
2. Copy-pasted forks that drift and multiply maintenance work.

---

## 6A. Strategy Options Considered

The choice is not multi-instance versus "build a SaaS." Several realistic middle options exist; this table makes the trade-offs explicit so the decision is reviewable. (Effort figures for the domain refactor come from `docs/architecture-multitenancy-readiness.md` Levels A/B/C.)

| Dimension | A. Multi-instance (this doc) | B. FESK-only, fork on demand | C. Multi-instance + schema baseline, deferred config | D. Shared-DB runtime tenancy |
|---|---|---|---|---|
| DB | Project per unrelated org | One; clone only if forced | Project per unrelated org | One project, all tenants |
| Branding | Build-time per instance | Hardcoded; edit on fork | Build-time per instance | Runtime from DB |
| Domain refactor | When 2nd client real | Never until fork | When 2nd client real | Now (4-7 weeks) |
| New-instance cost | Manual 36-migration paste | ~0 until fork | One baseline SQL + seed | One migration run for all |
| Optimizes for | Clean isolation | Validation speed | Speed + reproducible ops | Simplicity at scale |
| Main risk | Per-instance ops drift; manual migrations | Fork drift at 3+ forks | Minor upfront tooling | RLS blast radius = all tenants; GDPR mixed custody |
| Best when | 2-3 bounded federations | 2nd client truly hypothetical | Now (FESK-first rollout, future-instance readiness) | 10+ small schools, proven demand |

**Recommended: C.** It is strategy A with two adjustments: (a) drop speculative `appConfig`/curriculum-pack work (Phases 2-3) until a real second client exists; (b) spend the one unit of platform effort that pays off even at N=1 - a consolidated schema baseline (see section 16 Gate B and section 15) so any future instance is reproducible from one reviewed file. D is rejected because the domain refactor costs weeks without a committed second client. B is viable for exactly one fork but its maintenance tax is superlinear.

---

## 7. Instance Boundary Rules

The product needs explicit rules for deciding when two organizations share an instance.

### 7.1 Same Instance Is Acceptable When

Two groups can share an instance if they share governance, curriculum, and operational responsibility.

Example:

- FESK federation;
- FESK-affiliated schools;
- common curriculum;
- common legal/data governance;
- common brand or federation umbrella;
- students belong to the same federation ecosystem.

In this case, one FESK Supabase project can contain:

- federation-level content;
- affiliate schools;
- students of FESK-affiliated schools;
- shared curriculum and news;
- `school_id` or similar fields for affiliate-level scoping.

**Precondition for this case specifically.** The moment one project holds more than one `schools` row, the multi-tenant invite path in `handle_new_user` becomes live, and it currently trusts client-supplied metadata (`0036_harden_new_user_tenant.sql:26-37` carries an explicit `TODO` to validate the invited `school_id` against an email-keyed invite allowlist). This is the only scenario where `0028`'s isolation does real work, and it must not be entered until that allowlist gate is built. A single-school instance never triggers this and is therefore the safe default.

### 7.2 Separate Instance Is Required When

Separate instances are recommended when organizations are unrelated.

Example:

- FESK Italy Kung Fu;
- a Taekwondo school in Germany;
- a Karate association with unrelated students;
- a Judo school with different curriculum logic.

Reasons:

- cleaner privacy boundaries;
- easier GDPR/data processing explanation;
- simpler support and backup;
- no accidental cross-tenant data exposure;
- no need to model unrelated domains in one DB before necessary;
- easier per-client branding, URLs, and legal pages.

### 7.3 Decision Rule

Use this rule:

> If two organizations do not share curriculum governance and data responsibility, they should not share a Supabase project.

---

## 7A. Confirmed FESK Rollout Decisions (2026-06-13)

These decisions override earlier discovery-oriented language in the business validation notes for this execution cycle.

| Area | Decision |
|---|---|
| First users | FESK teachers/instructors plus a small number of advanced students |
| Product name | `FESK Practice` |
| Brand colors | Keep the current visual identity/colors for the first rollout |
| Logo | Use `C:\martial-arts\logo-fesk.png`; implementation should derive web/PWA assets from it |
| Scuola Chang | Keep Scuola Chang as the curriculum/library lineage label |
| Supabase | Reuse the current production Supabase project for the FESK rollout |
| Future instances | Code must remain able to provision a new Supabase project from scratch via schema baseline plus seed |
| Minors | No minors in the first rollout |
| Video playback | YouTube unlisted links are acceptable |
| Google Drive | FESK Drive access is expected as source/archive for school videos; do not build Drive playback/upload workflow unless explicitly scoped |
| Contact email | `info@feskfongttai.it` |
| Metrics | Lightweight operational signals only; direct feedback with teachers/instructors is primary |
| Data roles | Working decision: FESK is the data-responsible party/controller candidate for rollout; confirm exact GDPR wording in legal pages |
| User access | Use invite/preassignment access groups so users receive correct role, level, exam target, and content scope on first login |
| Exam promotion | After each exam session, users who passed move to the next access group; users who did not pass remain in the current group |
| Operational owner | Founder operates rollout now; design should allow handoff to a FESK operator later |
| All-access group | Founder/admin, selected masters, and selected instructors see all FESK content |
| Extra content | `Altro` / extra content is visible only to all-access users for now |
| Promotion granularity | Shaolin and T'ai Chi promotion happen independently |
| Domain/deployment | Keep the current domain/deployment for first rollout |
| App routes | Keep current route structure; update visible labels/brand instead of URLs |
| Landing page | Replace the public horse/Confucius landing with a FESK-logo landing and FESK-aligned copy; preserve the current landing as a legacy personal variant |

---

## 8. Why Not a Full SaaS Multi-Tenant Platform Now

A true SaaS multi-tenant platform would require:

- dynamic disciplines;
- dynamic grade scales;
- dynamic skill categories;
- per-tenant terminology;
- per-tenant themes;
- per-tenant PWA manifest;
- tenant-aware admin panel;
- invite flows and tenant provisioning;
- tenant-aware RLS on all static and dynamic entities;
- tenant backup/export/delete operations;
- curriculum import tooling;
- billing;
- support tooling;
- audit logs;
- more extensive RLS and E2E tests.

This is a large product, not a small refactor.

White label, premium models, revenue sharing, and SaaS multi-school work remain future hypotheses, not immediate implementation targets. For the current execution cycle, the FESK need is treated as already validated informally. The practical target is narrower:

- make the FESK app usable by real teachers/instructors and a few advanced students;
- keep the rollout legally and operationally clean;
- avoid mixing unrelated future clients into the same Supabase project;
- keep the codebase provisionable for a future clean instance.

Therefore, building a full platform now would create complexity before there is a committed second client that needs it.

---

## 9. Why Not Manual Forks

A one-time fork can validate a single urgent case, but it is not a scalable strategy.

Manual forks create:

- duplicate bug fixes;
- divergent migrations;
- inconsistent security patches;
- duplicated UI changes;
- deployment confusion;
- unclear source of truth;
- more mental overhead for every improvement.

Manual forks also hide the real architectural problem. A Taekwondo version created by renaming "shaolin" internally would work temporarily, but the code would become semantically misleading.

The preferred compromise is:

> Use the same repository and same core code, but make each deployed instance load a specific configuration and curriculum pack.

---

## 10. Proposed Architecture

### 10.1 Core App

The shared core app contains:

- auth;
- practice planning;
- daily session logic;
- calendar;
- progress;
- reminders;
- profile;
- content library;
- video embedding;
- common UI components;
- common database migrations;
- common RLS hardening.

The core app should not contain client-specific copy if that copy can reasonably live in instance configuration.

### 10.2 Instance Configuration

Each instance should eventually have a configuration file, selected by environment variable.

Example:

```ts
export const appConfig = {
  instanceId: "fesk",
  locale: "it-IT",
  appName: "FESK Practice",
  shortName: "FESK",
  supportEmail: "info@feskfongttai.it",
  brand: {
    logoPath: "/instances/fesk/logo.svg",
    primaryColor: "#8f1d1d",
    accentColor: "#d99a2b",
    themeColor: "#111111"
  },
  terminology: {
    schoolLabel: "Scuola",
    examLabel: "Esame",
    skillSingular: "Tecnica",
    skillPlural: "Tecniche",
    dailyPracticeLabel: "Allenamento",
    gradeLabel: "Grado"
  },
  routes: {
    program: "/programma",
    library: "/library",
    today: "/today",
    progress: "/progress"
  }
};
```

This should begin as build-time configuration, not DB-driven configuration. Build-time config is easier to test, safer for PWA metadata, and more appropriate for separate instances.

### 10.3 Curriculum Pack

Each instance should eventually have a curriculum pack.

Example:

```txt
instances/
  fesk/
    app.config.ts
    curriculum.json
    theme.css
    legal/
      privacy.md
      terms.md
  taekwondo-de/
    app.config.ts
    curriculum.json
    theme.css
    legal/
      privacy.md
      terms.md
```

The curriculum pack should describe:

- disciplines;
- categories;
- grade scale;
- exams;
- skills;
- skill-to-exam requirements;
- videos;
- display order;
- practice unit labels;
- default practice behavior where needed.

At first, this pack can generate SQL seed data. Later, it can feed an admin import workflow.

### 10.4 Isolated Infrastructure

Each unrelated client instance should have:

- its own Vercel project or environment;
- its own domain or subdomain;
- its own Supabase project;
- its own environment variables;
- its own database backups;
- its own legal configuration;
- its own content seed.

This creates clean isolation without forcing the app to become a full SaaS platform.

**Side benefit: build-time branding "just works."** The PWA manifest is currently a static file (`public/manifest.json`, hardcoded "Kung Fu Practice") and the Vercel region is pinned (`vercel.json` -> `fra1`). Under a shared-DB model these would need a dynamic per-tenant `src/app/manifest.ts` and per-request theming. Under separate deploys, each instance ships its own static manifest, icons, theme, and region - no dynamic manifest machinery required. This is a concrete reason build-time instance config (section 10.2) is preferable to DB-driven config at this stage.

---

## 11. URL and Language Strategy

The current app has Italian routes and copy. This matters for German or international clients.

However, route localization should not be the first priority. The user-visible copy and terminology matter more inside an authenticated PWA.

Recommended approach:

### 11.1 Short Term

Keep canonical internal routes stable.

Examples:

- `/today`
- `/programma`
- `/library`
- `/progress`
- `/profile`

Extract visible labels first:

- nav labels;
- page titles;
- empty states;
- action labels;
- terminology such as "exam", "grade", "forms", "reps".

### 11.2 Medium Term

Add route aliases per instance if needed.

Example:

| Logical Route | FESK | German Taekwondo |
|---|---|---|
| Today | `/today` | `/heute` |
| Program | `/programma` | `/programm` |
| Library | `/library` | `/bibliothek` |
| Progress | `/progress` | `/fortschritt` |

These aliases should rewrite or redirect to canonical pages. Do not duplicate page implementations.

### 11.3 Long Term

If the product becomes SEO-relevant or public-facing for multiple languages, introduce a proper i18n route system.

This is not needed for the immediate FESK rollout.

---

## 12. Implementation Roadmap

### Phase 0 - Confirm FESK Rollout Readiness

Goal:

> Make sure the FESK rollout is treated as a focused operational launch, not as a trigger to build a generic SaaS platform.

Tasks:

- confirm the operational owner / instructor lead;
- define whether FESK includes all affiliate schools or only one group first;
- confirm the first users: teachers/instructors plus a few advanced students;
- keep minors out of the first rollout;
- confirm video/curriculum authorization;
- document Google Drive as source/archive and YouTube unlisted as accepted playback;
- confirm legal placeholders before real users;
- confirm the data controller/processor model;
- verify which DB migrations are applied in the real Supabase project;
- define lightweight operational signals.

Acceptance criteria:

- exact first rollout group/participants identified;
- operational owner identified;
- content authorization path clear;
- privacy/legal blockers listed;
- current Supabase project verified for rollout;
- no unrelated martial arts support promised.

### Phase 1 - FESK-Branded Rollout Instance

Goal:

> Make the existing app feel like the FESK app without generalizing the whole domain.

**Sequencing note.** Branding is a thin layer, not the objective. The need is treated as known; the remaining gate is operational readiness: owner, content rights, legal/privacy wording, migration state, and first cohort.

Tasks:

- set app name to `FESK Practice`;
- derive app/PWA icons from `C:\martial-arts\logo-fesk.png`;
- keep the current colors for the first rollout;
- keep `Scuola Chang` as the curriculum/library lineage label;
- update metadata, manifest, offline page, icons, and visible brand labels;
- reuse and verify the current Supabase project;
- complete privacy/terms/disclaimer placeholders;
- set contact email to `info@feskfongttai.it`;
- run normal build/type/test checks;
- deploy to a FESK-specific URL.

Acceptance criteria:

- FESK can open the app and recognize it as its own rollout app;
- no Taekwondo/Karate/Judo abstraction work is required;
- no separate code fork is created;
- the deployment is operationally ready for real FESK users.

### Phase 2 - Centralize Brand and Terminology

> **Conditional phase - deferred unless triggered.** Under the recommended Option C (section 6A), Phase 2 is NOT an automatic step after the FESK rollout. Trigger it only when (a) a concrete second client is in discussion, or (b) FESK branding churn is actively costing time via scattered search-and-replace. Otherwise operate FESK with direct build-time branding.

Goal:

> Reduce scattered hardcoded identity strings and prepare for the next instance.

Tasks:

- create an `appConfig` or `instanceConfig` module;
- move app name, short name, description, support contact, and key UI labels there;
- move navigation labels there;
- move basic terminology there;
- move brand colors/assets there where practical;
- convert static metadata/manifest generation if needed;
- document how to add a new instance config.

Acceptance criteria:

- a reviewer can find brand and terminology in one place;
- changing app name or primary labels does not require search-and-replace across the app;
- FESK behavior remains unchanged.

### Phase 3 - Curriculum Pack and Seed Generator

> **Conditional phase - deferred unless triggered.** The curriculum-pack abstraction only pays off when a second, differently-shaped curriculum needs seeding. Trigger it when a real non-FESK client (Gate B) exists. Note the distinction from the schema baseline in Phase 5 / section 15: the **schema baseline** (squash of migrations into one reviewed file) is worth doing early because it makes new projects reproducible; the **curriculum pack** (structured discipline/grade/exam data feeding a seed generator) waits for the second curriculum.

Goal:

> Make curriculum setup repeatable without manually editing SQL for every client.

Tasks:

- define a JSON or TypeScript curriculum pack schema;
- represent FESK curriculum in that pack format;
- generate seed SQL from the pack;
- validate generated seed output with tests;
- keep the generated output compatible with the current DB schema.

Acceptance criteria:

- FESK curriculum can be regenerated from structured data;
- future clients can start from a data pack instead of editing migrations by hand;
- no production migration is generated without review.

### Phase 4 - Domain Refactor for the First Non-FESK Client

Trigger:

> A concrete non-FESK client exists, with curriculum, operational owner, decision path, and willingness to use or pay.

Likely changes:

- replace hardcoded discipline union with `disciplines`;
- replace fixed categories with `skill_categories`;
- replace FESK grade logic with `grade_scales` and `grade_levels`;
- replace profile columns `assigned_level_shaolin` and `assigned_level_taichi` with user discipline levels;
- make exam selection dynamic over N disciplines;
- make practice unit terminology configurable;
- remove FESK assumptions from scheduler UI copy;
- review RPCs that encode grade progression.

Acceptance criteria:

- the second client can be modeled without naming fake internal concepts as `shaolin`;
- FESK continues to work;
- tests cover grade scale behavior and session scheduling.

### Phase 5 - Instance Operations

Goal:

> Make multi-instance operations repeatable.

Tasks:

- document how to create a new instance;
- create a consolidated schema baseline and seed flow for new Supabase projects;
- document env vars;
- document Supabase project creation;
- document migration application;
- document seed import;
- document Vercel project setup;
- document legal/privacy checklist;
- add smoke test checklist;
- add rollback notes for migrations.

Acceptance criteria:

- a technical operator can create a new instance from the shared repo;
- a new Supabase project can be provisioned from one reviewed baseline plus seed;
- the process is documented enough for an LLM/agent to follow safely;
- no manual undocumented dashboard-only steps are required except where explicitly accepted.

### Phase 6 - Full SaaS Multi-Tenant Platform

Trigger:

> At least 2-3 real client instances exist, the setup process is repetitive, and demand supports investment in platform tooling.

Only then consider:

- central tenant provisioning;
- admin curriculum UI;
- import CSV/JSON tools;
- billing;
- per-tenant dashboards;
- role management;
- audit logs;
- support tooling;
- tenant-level backup/export/delete;
- shared Supabase project with strong tenant isolation, if still desired.

This phase should not be started during the FESK rollout.

---

## 13. Rollout Alignment

This architecture must support the current FESK rollout, not replace it with a platform project.

The earlier validation documents remain useful as context, but the current working assumption is different: FESK need is already known through direct relationship with teachers/instructors. The next step is not a new interview campaign. The next step is operational readiness:

- founder as current operational owner, with future handoff possible;
- authorized curriculum, videos, logo, and federation name;
- no minors in the first rollout;
- verified Supabase migration/security state;
- invite/preassignment groups for user access;
- post-exam promotion workflow for users who pass;
- legal/privacy wording that reflects FESK as the data-responsible/controller candidate;
- a small first cohort of teachers/instructors and advanced students;
- a FESK-specific public landing that uses the FESK logo and preserves the current personal landing as legacy;
- lightweight feedback loops through direct conversation.

Therefore:

> Do not build platform infrastructure before the FESK rollout is stable, but do build the minimum repeatability needed to create a future clean project without chaos.

FESK may be both:

- the first real rollout instance;
- a future federation buyer.

Those roles should not be confused. The rollout should prove operational usefulness and support load before the business assumes a federation-wide paid rollout.

---

## 14. Data and Privacy Model

### 14.1 FESK

Recommended:

- one FESK Supabase project, using the current production project for the first rollout;
- FESK users and affiliated schools in that project;
- `school_id` can distinguish affiliate schools if needed;
- RLS still required;
- FESK-specific legal documents;
- FESK-specific backups and operational ownership.

Current privacy/legal working decision:

- reflect FESK as the data-responsible/controller candidate before inviting real users;
- confirm the exact GDPR wording in legal pages before rollout;
- do not infer the controller only from who owns the Supabase account;
- no minors are included in the first rollout; if this changes, define the minor-user workflow first.

### 14.2 Unrelated Clients

Recommended:

- separate Supabase project per unrelated client;
- no shared student tables;
- no shared logs;
- no shared profiles;
- no shared legal/data responsibility;
- same codebase and migrations applied separately.

### 14.3 Why This Matters

This reduces:

- accidental data leakage risk;
- RLS complexity before it is necessary;
- compliance explanation burden;
- support confusion;
- backup/restore complexity.

It also aligns with the user's intuition:

> Taekwondo students in Germany should not be operationally mixed with FESK Kung Fu students in Italy.

---

## 15. Risks and Mitigations

| Risk | Why It Matters | Mitigation |
|---|---|---|
| Overbuilding SaaS too early | Weeks of work before a committed second client | Keep FESK rollout focused |
| Manual fork drift | Bug fixes and migrations duplicate | Use one repo and instance config |
| False generic model | Internal concepts like `shaolin` used for Taekwondo | Defer non-FESK until proper domain refactor |
| Shared DB leakage | Unrelated clients could be exposed by RLS bugs | Separate Supabase projects for unrelated clients |
| Branding scattered across code | Every instance becomes search-and-replace | Centralize app config |
| Curriculum import remains manual | Each client requires custom developer work | Curriculum pack and seed generator |
| Legal/privacy not ready | Real users create compliance exposure | Complete placeholders before rollout users |
| Data controller/processor role guessed from account ownership | Legal/privacy pages may be wrong | Confirm the controller/processor model with FESK and, if needed, a privacy/legal advisor |
| Operational owner does not drive adoption | Students may not use the app | Confirm instructor lead behavior before broader rollout |
| FESK asks for federation-wide rollout too early | Operational complexity jumps | Start with bounded rollout signals |
| Minors added without process | Legal/privacy risk | First rollout excludes minors; pause before changing that |
| Google Drive scope grows silently | Privacy/content/access risk | Treat Drive as source/archive only unless explicitly scoped |
| Students self-promote or see advanced content | FESK loses control of curriculum access | Use invite/preassignment access groups, locked student profiles, and server-side content checks |
| Exam-session updates require manual profile edits | High error risk after every exam session | Use `next_access_group_id` and a batch promotion operation for passed users |
| Route refactor before rollout | Churn without user value | Keep current routes and update visible branding/copy only |
| Personal landing deleted during FESK rebrand | Loss of a useful prior experience the founder wants to keep | Preserve the horse/Confucius landing as a legacy component/variant before replacing the public landing |
| Manual per-instance migration application | Migrations run by hand in the Supabase SQL Editor (no CLI in PATH); a new instance means pasting 36+ files in order - error-prone and unscalable | Produce a consolidated schema-baseline SQL (squash of `0001`-latest) plus a seed file, so a new instance bootstraps from one reviewed file |
| Multi-school-in-one-project before invite allowlist | `handle_new_user` trusts client metadata when >1 school exists (`0036:26-37` TODO); a user could self-assign to an arbitrary school | Build the email-keyed invite allowlist before any project holds more than one `schools` row (FESK + affiliates included) |

---

## 16. Decision Gates

### Gate A - Before FESK Rollout Users

Required:

- FESK scope defined;
- first users limited to teachers/instructors plus a few advanced students;
- no minors in the first rollout;
- legal placeholders reviewed or explicitly accepted for rollout;
- controller/processor model confirmed;
- FESK data-responsible/controller wording reflected in legal-page draft;
- content/video authorization clarified;
- user invite/preassignment flow confirmed;
- student level/content access lock confirmed;
- post-exam promotion workflow confirmed;
- current domain/deployment accepted;
- current route structure accepted;
- Supabase migration state checked;
- FESK branding sufficient for rollout (`FESK Practice`, FESK logo, current colors, Scuola Chang retained);
- public landing redesigned for FESK and previous landing preserved as legacy;
- lightweight operational signals defined.

### Gate B - Before Supporting a Non-FESK Client

Required:

- real client identified;
- curriculum exists for at least one level/exam;
- 5-10 contents available;
- operational owner / instructor lead can act;
- decision path exists;
- setup effort is acceptable;
- client does not require full admin SaaS as a starting condition;
- data isolation plan selected;
- a consolidated schema-baseline SQL exists so the new instance's Supabase project can be provisioned from one reviewed file rather than re-pasting every migration;
- if the new instance will hold more than one school, the email-keyed invite allowlist (`0036` TODO) is built first.

### Gate C - Before Building Full Multi-Tenant SaaS

Required:

- at least 2-3 real instances or committed clients;
- repeated setup pain observed;
- willingness to pay or fund platformization;
- clear operational owner;
- clear support model;
- security/RLS test plan;
- admin tooling requirements validated.

---

## 17. Recommended Next Actions

1. Verify the applied migration state in the real Supabase project (`0028`/`0036`) before inviting rollout users.
2. Reflect FESK as data-responsible/controller candidate in legal/privacy wording and use `info@feskfongttai.it` as contact email.
3. Apply FESK branding as a thin build-time layer: `FESK Practice`, logo from `C:\martial-arts\logo-fesk.png`, current colors, Scuola Chang retained, FESK landing replacing the public horse/Confucius landing.
4. Implement invite/preassignment access groups before inviting students, including all-access group, `Altro` restriction, and per-discipline post-exam promotion.
5. Keep YouTube unlisted as the playback path and treat Google Drive as source/archive unless explicitly scoped otherwise.
6. Keep current domain/deployment and route structure for the first rollout.
7. Produce a consolidated schema-baseline SQL plus seed file before creating any future unrelated instance from scratch. For FESK, this is parallel/deferrable because the current Supabase project will be reused.
8. Do not build a generic martial arts SaaS platform yet, and do not create a permanent fork.
9. Create an instance strategy around one shared repo and isolated deployments (separate Supabase project per unrelated organization).
10. Treat Phases 2-3 (centralize brand/terminology, curriculum pack) as deferred-unless-triggered, not automatic steps after FESK.
11. Refactor disciplines, categories, grade scales, and user levels only when a real non-FESK client justifies it.
12. Keep FESK rollout stability ahead of platform work.

---

## 18. Proposed Review Questions for Another LLM

Ask the reviewing LLM to evaluate:

1. Is the distinction between brand, martial domain, and data isolation correct?
2. Is the multi-instance approach more appropriate than shared multi-tenancy at this stage?
3. Are separate Supabase projects justified for unrelated organizations?
4. Is build-time instance configuration preferable to DB-driven configuration for the next phase?
5. Is the roadmap sequenced correctly, or should domain refactor happen before a real non-FESK client exists?
6. Are there hidden risks in using per-instance Vercel/Supabase deployments?
7. Which parts of the current FESK-specific model should be abstracted first?
8. What is the minimum technical change needed before real FESK users can use the app safely?
9. What evidence should trigger investment in full SaaS multi-tenancy?
10. Are there legal/privacy concerns that should change the instance boundary rules?

---

## 19. Executive Summary

The structural problem is not white-label styling. The structural problem is that the current app mixes:

- product identity;
- FESK martial arts semantics;
- student data isolation;
- rollout operations.

The recommended strategy is to separate those concerns gradually.

For FESK:

> Build a FESK-branded rollout instance using the current FESK domain model, current Supabase project, `FESK Practice` name, FESK logo, current colors, and Scuola Chang lineage label.

For unrelated future clients:

> Use separate deployments and separate Supabase projects, from the same shared codebase.

For scalability:

> First make new Supabase projects reproducible with a schema baseline and seed. Extract brand, terminology, language, and curriculum into instance configuration and curriculum packs only when a real second client or repeated branding churn triggers it.

For the future:

> Only build full SaaS multi-tenancy after multiple real clients prove that platformization is worth the complexity.
