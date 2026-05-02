---
title: Auth Password Management
status: implementation-ready
date: 2026-05-02
supersedes: none
---

# Auth Password Management - Design

## 0. Context

Current auth is intentionally small:

- `/login` signs in with Supabase email/password.
- `/auth/callback` exchanges Supabase email-link/OAuth codes for a session.
- `on_auth_user_created` creates a `user_profiles` row automatically.
- There is no forgot-password, invite password setup, or authenticated password change.

The gap: Supabase recovery/invite links can create a session, but the app does not route users through a password form. For a school testing rollout, users need to be invited by an admin, set their own password, recover it, and change it later.

## 1. Decisions

| # | Decision | Resolution |
|---|---|---|
| AP1 | User provisioning | Admin-only. No public self-signup in this phase. |
| AP2 | New-user onboarding | Supabase Dashboard invitation email. |
| AP3 | Password policy | Minimum 8 characters, maximum 72 characters. No complexity regex. |
| AP4 | Authenticated password change | Require current password via Supabase `updateUser({ password, current_password })` with the locally installed SDK type. |
| AP5 | Public forgot-password route | `/forgot-password`, because `(auth)` is only a Next route group and does not add `/auth` to the URL. |
| AP6 | Password update route | `/auth/update-password`, session-required and guarded by a short-lived callback cookie. |
| AP7 | Reset URL origin | Prefer `NEXT_PUBLIC_SITE_URL`/`APP_ORIGIN`; fallback to request headers for local/dev. |
| AP8 | CSP, 2FA, OAuth, admin UI | Future hardening/features, not part of this implementation. |

## 2. Routes And Flows

| Path | Access | Purpose |
|---|---|---|
| `/forgot-password` | Public, `(auth)` layout | User enters email. Server action calls `resetPasswordForEmail`. Response is always neutral. |
| `/auth/callback` | Public route handler | Exchanges code for Supabase session. Allows only known explicit `next` paths. If `next` is missing, treats the link as invite/password setup and routes to `/auth/update-password`. Sets a short-lived password-update cookie for `/auth/update-password`. |
| `/auth/update-password` | Authenticated plus callback cookie | User sets password after recovery/invite link. |
| `/profile` | Authenticated app route | Adds "Sicurezza" section for changing password. |
| `/login` | Public | Adds forgot-password link and shows expired/invalid link errors. |

### Forgot Password

```text
/login -> /forgot-password -> submit email
Supabase email link -> /auth/callback?code=...&next=/auth/update-password
/auth/callback exchanges code, creates session, sets auth_password_update cookie
/auth/update-password -> user enters new password -> updateUser({ password })
redirect -> /hub or /onboarding
```

### Invite

Admin sends invitation from Supabase Dashboard. If the dashboard invite link reaches `/auth/callback` without a `next` parameter, the callback defaults to `/auth/update-password` so the invited user still sets a password before entering the app. The final redirect uses `resolveLandingDestination(profile)`.

### Change Password While Logged In

```text
/profile -> Sicurezza form
current password + new password + confirm
server action validates fields
supabase.auth.updateUser({ password: newPassword, current_password: currentPassword })
success message, user remains logged in
```

## 3. File Structure

```text
src/
  app/
    (auth)/
      forgot-password/
        page.tsx
        ForgotPasswordForm.tsx
      login/
        LoginForm.tsx
        page.tsx
    auth/
      callback/
        route.ts
      update-password/
        layout.tsx
        page.tsx
        UpdatePasswordForm.tsx
    (app)/
      profile/
        page.tsx
  components/
    profile/
      ChangePasswordSection.tsx
  lib/
    actions/
      auth.ts
    auth-validation.ts
    auth-validation.test.ts
    supabase/
      middleware.ts
```

No database migration is required.

## 4. Server Actions

### `requestPasswordReset`

1. Validate email format.
2. Build `redirectTo` from configured site origin:
   - `NEXT_PUBLIC_SITE_URL`
   - fallback `APP_ORIGIN`
   - fallback request headers for local/dev
3. Call `supabase.auth.resetPasswordForEmail(email, { redirectTo })`.
4. Always return the same success message for valid email syntax, even if Supabase reports an unknown email or rate limit. This avoids account enumeration.

### `updatePassword`

1. Require the short-lived `auth_password_update` cookie.
2. Validate new password strength and confirmation.
3. Call `supabase.auth.updateUser({ password })`.
4. Clear the cookie.
5. Redirect with `resolveLandingDestination(profile)`.

### `changePassword`

1. Validate current password exists, new password strength, match, and `newPassword !== currentPassword`.
2. Call `supabase.auth.updateUser({ password: newPassword, current_password: currentPassword })`.
3. Return success or a user-safe error.

## 5. Security Properties

| Concern | Handling |
|---|---|
| Account enumeration | Forgot-password action returns a neutral message for valid email syntax. |
| Open redirect | Callback accepts only `/hub`, `/onboarding`, `/auth/update-password` when `next` is explicit. Missing `next` defaults to `/auth/update-password`. |
| Direct update-password visit | Middleware requires session; page/action also require the short-lived callback cookie. |
| Authenticated password change | Native Supabase current-password verification. |
| Password policy | 8-72 characters; Supabase enforces its configured minimum too. |
| Token expiry and one-use links | Supabase handles recovery/invite code lifecycle. |
| Sessions after password/security changes | Supabase Auth session behavior applies. |
| Security headers | Existing `next.config.ts` headers remain. CSP is future hardening. |
| Cookies | Supabase SSR cookies are used as configured by `@supabase/ssr`; do not claim they are universally HttpOnly. The app-owned `auth_password_update` cookie is HttpOnly. |
| Rate limiting | Rely on Supabase Auth defaults for the pilot. Built-in email sending is limited; configure custom SMTP if the school test needs more email volume. |

## 6. Supabase Configuration

Before production testing:

1. Auth password minimum length: `8`.
2. Public user signup: `OFF`.
3. Email confirmation: `ON`.
4. Site URL: production Vercel URL.
5. Redirect URLs: include production URL wildcard and any preview/local URL used for manual testing.
6. Consider custom SMTP if invite/recovery email volume exceeds Supabase built-in limits.

## 7. Testing

Automated:

- Unit tests for `validatePasswordStrength`, `validatePasswordMatch`, `validateEmail`, and `isAllowedNextPath`.
- Existing `npm run lint`, `npm run test`, `npm run build`.

Manual production checklist:

- `/login` shows "Password dimenticata?"
- `/forgot-password` returns the same neutral message for registered and unregistered emails.
- Recovery link lands on `/auth/update-password`.
- Direct `/auth/update-password` without callback/session does not allow password update.
- Invite link lands on `/auth/update-password` and then redirects new user to `/onboarding`.
- `/profile` password change rejects wrong current password and accepts the correct one.
- Old password no longer works after a successful change.
- `/auth/callback?next=https://evil.example&code=...` never redirects off-site.

## 8. Out Of Scope

- Public self-signup.
- In-app admin user management.
- 2FA/TOTP.
- OAuth/social login.
- Custom branded email templates.
- Custom rate limiting/CAPTCHA.
- CSP hardening.
- E2E automation.
