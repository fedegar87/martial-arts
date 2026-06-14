# Plan Folder Index

This file is the navigation map for `plan/`. It does not replace the plans; it tells agents and reviewers which documents are active and which are historical context.

## Active Reading Order

Use this order for any FESK rollout implementation work:

1. [2026-06-13-fesk-rollout-implementation-plan.md](2026-06-13-fesk-rollout-implementation-plan.md)
   - Current operational source of truth for the FESK rollout.
   - Covers branding, Supabase verification, access groups, user invites, level locks, post-exam promotion, legal/content readiness, deployment, and rollout operations.

2. [2026-06-13-white-label-multi-instance-strategy.md](2026-06-13-white-label-multi-instance-strategy.md)
   - Strategic architecture source.
   - Explains why the product should use one shared codebase, FESK-first rollout, and separate Supabase/deployment instances for unrelated future organizations.

3. [current-plan.md](current-plan.md)
   - Technical history and current app architecture.
   - Use as a reference for schema, migrations, sprint history, and implementation context.

## Current FESK Decisions

- Product name: `FESK Practice`.
- Current Supabase project is reused for FESK.
- Current domain/deployment is reused for the first rollout.
- Current route structure is kept; update visible labels and brand, not URLs.
- Public landing should be redesigned for FESK using the FESK logo and FESK-aligned copy.
- Current horse/Confucius landing should be preserved as a legacy personal variant.
- First rollout users: teachers/instructors plus a few advanced students.
- No minors in the first rollout.
- Founder is operational owner for now; design should allow future handoff to a FESK operator.
- Access is managed through invite/preassignment groups.
- Founder/admin, selected masters, and selected instructors belong to an all-access group.
- `Altro` / extra content is visible only to all-access users for now.
- Shaolin and T'ai Chi promotion happen independently after exam sessions.
- YouTube unlisted is acceptable for playback.
- FESK Google Drive is treated as source/archive unless explicitly scoped otherwise.
- Contact email: `info@feskfongttai.it`.
- FESK is treated as the data-responsible/controller candidate for rollout; exact GDPR legal wording still needs legal-page review.

The canonical, full decision table lives in the rollout plan section 5.3; the copy in the white-label strategy section 7A mirrors it. If they diverge, section 5.3 wins. The rollout plan also carries the executable detail: the verified access bypasses, the access-control commit plan (section 13), and the smoke-test matrix (section 14).

## Active But Not Rollout-Blocking

| File | Status | Notes |
|---|---|---|
| [2026-05-16-push-notifications-setup-pending.md](2026-05-16-push-notifications-setup-pending.md) | Pending | Push reminders are not required for the first FESK rollout. Keep disabled unless VAPID/cron are configured. |
| [2026-05-02-monetization-strategy.md](2026-05-02-monetization-strategy.md) | Parked | Monetization is not a first-rollout implementation dependency. Revisit after operational use. |

## Historical / Reference Material

Business validation and canvas documents live under [reference/business/](reference/business/). They are useful context, but they no longer override the FESK rollout decision set above.

Important reference files:

- [reference/business/validation-lab-workbook.md](reference/business/validation-lab-workbook.md)
- [reference/business/validation-lab/2026-06-10-session-2-where-to-play.md](reference/business/validation-lab/2026-06-10-session-2-where-to-play.md)
- [reference/business/business-model-canvas.md](reference/business/business-model-canvas.md)
- [reference/business/business-model-canvas-draft.md](reference/business/business-model-canvas-draft.md)
- [reference/business/business-model-canvas-assumption-map.md](reference/business/business-model-canvas-assumption-map.md)
- [reference/business/positioning-analysis.md](reference/business/positioning-analysis.md)

## Naming Note

The old `2026-06-13-fesk-pilot-implementation-plan.md` name has been replaced by `2026-06-13-fesk-rollout-implementation-plan.md`. The project framing is rollout, not pilot.

## Rule For Future Agents

Do not restart discovery/interview planning unless the user explicitly asks for it. For the current work, implement the FESK rollout plan, keep the architecture future-ready for separate instances, and avoid building a generic SaaS platform before a real second client exists.
