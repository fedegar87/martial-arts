# Profile, Account, Privacy And Settings Implementation Plan

Goal: evolve the current `/profile` page into the app's account and trust center without turning it into a catch-all settings dump.

## Scope

- Harden profile authorization so user-controlled profile updates cannot change `role` or `school_id`.
- Show account identity and training context in `/profile`: name, email, school, role, member date, grades, plan and sessions.
- Add a privacy/data section with export and account deletion request paths.
- Add public legal/support pages: privacy, terms, cookie policy and physical-practice disclaimer.
- Keep settings conservative: only global, infrequently changed account/app settings belong in profile.
- Improve logout/cache behavior for the PWA so private cached navigations are not retained after sign-out.

## Implementation Tasks

### 1. Database hardening

- Add a Supabase migration that protects `user_profiles.role` and `user_profiles.school_id` from self-service updates.
- Use a trigger because row-level security policies cannot reliably compare old and new values for column-level immutability.
- Allow server/service-role/admin maintenance outside the normal authenticated owner update path.

### 2. Profile query model

- Extend the current profile query to return:
  - Supabase auth email.
  - School name.
  - Current exam names for Shaolin and T'ai Chi.
  - Training schedule summary where available.
- Keep `role` display-only for ordinary users.

### 3. Profile UI

- Add an "Account" card above training settings.
- Keep "I tuoi gradi" for curriculum calibration.
- Restore/add plan mode summary using the existing `PlanModeSection`.
- Keep "Allenamento" for session setup and calendar.
- Rename/security card copy only where needed.
- Add "Privacy e dati" card with:
  - Export data action.
  - Account deletion request action.
  - Links to legal pages.
- Keep logout at the bottom.

### 4. Data rights actions

- Add a JSON export route/action for the authenticated user's app data.
- Include profile, plan items, practice logs, training schedule and weekly reflections.
- Add a deletion request action that creates a record instead of immediately deleting the account.
- Add a migration/table for deletion requests to preserve an auditable, reversible admin workflow.

### 5. Legal and disclosure pages

- Add public routes:
  - `/privacy`
  - `/terms`
  - `/cookies`
  - `/disclaimer`
- Link them from login/onboarding/profile where appropriate.
- Keep content practical and app-specific; mark as a product draft requiring legal review before public launch.

### 6. PWA/logout cache hygiene

- Update logout to clear app caches/storage on the client after server sign-out where possible.
- Avoid caching authenticated navigations in the service worker.

### 7. Verification

Run from `skill-practice`:

```powershell
npm run lint
npm run test
npm run build
```

Manual checks:

- `/profile` renders for an authenticated user and remains blocked for anonymous users.
- Role and school appear read-only.
- Export downloads a JSON file for the current user only.
- Deletion request can be submitted once and gives clear feedback.
- Public legal pages are reachable from unauthenticated pages.
- Logout clears client cache/storage and redirects correctly.

## Implementation Completed

Completed in this pass:

- Added Supabase migration `skill-practice/supabase/migrations/0016_profile_account_privacy.sql`.
  - Prevents authenticated users from changing their own `role` or `school_id`.
  - Adds `account_deletion_requests` with owner insert/select and admin select/update policies.
- Extended profile data access in `src/lib/queries/user-profile.ts`.
  - Returns auth email and school name for the current user.
  - Keeps role display-only in the UI.
- Added deletion request query/action.
  - `src/lib/queries/account.ts`
  - `src/lib/actions/account.ts`
- Added authenticated user data export route.
  - `src/app/(app)/profile/export/route.ts`
  - Exports account id/email, profile, plan items, practice logs, training schedule, weekly reflections and deletion requests.
- Expanded `/profile`.
  - Account card: email, school, role, member date.
  - Existing grade editor retained.
  - Program card via `PlanModeSection`.
  - Training summary and session links.
  - Security/password card retained.
  - Privacy/data card with export, legal links and deletion request.
- Added public legal/disclosure pages.
  - `/privacy`
  - `/terms`
  - `/cookies`
  - `/disclaimer`
- Added shared legal components.
  - `src/components/legal/LegalLinks.tsx`
  - `src/components/legal/LegalPage.tsx`
- Added legal links from login, forgot-password, onboarding and profile.
- Updated hub profile subtitle to "account, livelli, privacy".
- Updated logout client behavior to clear local/session storage and caches best-effort.
- Updated service worker cache strategy so authenticated navigations are not intentionally cached.

## Legal And Compliance Context Checked

The product direction and placeholder content were checked against these current EU/Italy areas:

- GDPR transparency, rights, security and accountability:
  - https://eur-lex.europa.eu/eli/reg/2016/679/art_13/oj/eng
- Italian minor consent threshold and child-facing transparency:
  - https://www.garanteprivacy.it/temi/minori
- Italian cookie/tracking guidance:
  - https://www.garanteprivacy.it/web/guest/home/docweb/-/docweb-display/docweb/9677876
- EU AI Act risk area for education/vocational training if future AI evaluates access, level or learning outcomes:
  - https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- EU Medical Device Regulation boundary if future claims become diagnosis, treatment, rehabilitation or clinical monitoring:
  - https://eur-lex.europa.eu/legal-content/ENG/TXT/?uri=CELEX%3A32017R0745
- European Accessibility Act / Italian D.Lgs. 82/2022:
  - https://www.normattiva.it/atto/caricaDettaglioAtto?atto.codiceRedazionale=22G00089&atto.dataPubblicazioneGazzetta=2022-07-01
  - https://www.agid.gov.it/it/notizie/european-accessibility-act-eaa-pubblicate-le-linee-guida-agid-sullaccessibilita-dei-servizi
- EU digital content and digital services consumer contract rules:
  - https://commission.europa.eu/topics/business-and-industry/doing-business-eu/contract-rules/digital-contracts/digital-contract-rules_en
- EU/US data transfer framework and transfer safeguards:
  - https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/eu-us-data-transfers_de

## Explicit Missing Items To Complete

These cannot be filled safely from the codebase and are intentionally left as `[PLACEHOLDER]` in the legal pages:

- Legal identity of the data controller:
  - Name/legal denomination.
  - Registered address.
  - Tax/VAT identifiers if applicable.
  - Privacy email and PEC.
- DPO/RPD or privacy contact:
  - Whether a DPO/RPD exists.
  - Contact details and escalation channel.
- Legal basis matrix:
  - Account/authentication.
  - Training plan and practice logs.
  - Notes and reflections.
  - School bulletin/news.
  - Security logs.
  - Any future analytics/marketing.
- Minors policy:
  - Whether minors can use the app.
  - Minimum age.
  - Parent/tutor authorization flow for users below 14 in Italy if consent is the chosen basis.
  - Child-readable privacy language.
- Data retention policy:
  - Account data.
  - Practice logs.
  - Personal notes and weekly reflections.
  - Training schedule.
  - Deletion requests.
  - Technical logs.
  - Backups.
- Processor/sub-processor register:
  - Supabase project region and DPA.
  - Vercel or hosting provider if used.
  - YouTube/Google embed implications.
  - Email provider/SMTP if configured.
  - Any future analytics, crash reporting or support tool.
- International transfer safeguards:
  - EU hosting confirmation where applicable.
  - EU-US Data Privacy Framework status for US providers where applicable.
  - SCCs or other mechanism where DPF/adequacy does not apply.
- Cookie table:
  - Real cookie/storage names after deploy.
  - Provider/domain.
  - Duration.
  - Purpose.
  - Technical vs non-technical classification.
- Consent management:
  - Only needed if non-technical cookies/tracking/analytics/marketing are introduced.
  - Must include accept/reject, granular choices and revocation.
- Consumer/commerce terms:
  - Whether app is free, included in school membership, B2B, subscription or direct consumer sale.
  - Price, renewal, withdrawal, refund and legal conformity rules if sold to consumers.
- Accessibility compliance:
  - Confirm whether European Accessibility Act applies to this specific distribution model.
  - Run WCAG/accessibility audit before public or commercial launch.
- Medical/safety boundary:
  - Keep claims limited to training diary and educational support.
  - Do not add diagnosis, rehabilitation, injury monitoring or treatment advice without MDR review.
- AI Act boundary:
  - If future AI assesses readiness, learning outcomes, exam access or level placement, perform an AI Act classification before release.

## Verification Results

Completed from `skill-practice`:

```powershell
npm run test
npm run lint
npm run build
```

All passed after implementation.

Dev server:

- Existing Next dev server detected on `http://localhost:3000`.
- A second launch attempt reported port 3000 in use and pointed to the existing server.
