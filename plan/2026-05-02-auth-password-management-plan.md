# Auth Password Management Implementation Plan

Design reference: `plan/2026-05-02-auth-password-management-design.md`

Goal: add a practical password lifecycle for school testers: admin invite, set password from invite/recovery link, forgot password, and authenticated password change.

## Key Corrections From Review

- Public forgot-password URL is `/forgot-password`, not `/auth/forgot-password`, because `(auth)` is a route group.
- Reset links use a configured origin (`NEXT_PUBLIC_SITE_URL` or `APP_ORIGIN`) before falling back to request headers.
- `/auth/update-password` requires both a Supabase session and a short-lived app cookie set by `/auth/callback`.
- `/auth/callback` defaults missing `next` to `/auth/update-password` so dashboard invite links still land in password setup.
- Authenticated password change uses Supabase `updateUser({ password, current_password })` instead of a separate `signInWithPassword`, matching the locally installed SDK type.
- Supabase built-in email/rate-limit assumptions are documented conservatively; custom SMTP is future work if testing volume needs it.

## Implementation Tasks

### 1. Validation Helpers

Create:

- `skill-practice/src/lib/auth-validation.ts`
- `skill-practice/src/lib/auth-validation.test.ts`

Functions:

- `validatePasswordStrength(password)` - min 8, max 72.
- `validatePasswordMatch(password, confirm)`.
- `validateEmail(email)` - pragmatic syntax check after trim.
- `isAllowedNextPath(next)` - allow only `/hub`, `/onboarding`, `/auth/update-password`.
- `PASSWORD_UPDATE_COOKIE` constant for the callback/update-password flow.

Update `npm run test` to include `src/lib/auth-validation.test.ts`.

### 2. Callback And Middleware

Modify:

- `src/app/auth/callback/route.ts`
- `src/lib/supabase/middleware.ts`

Callback behavior:

- Exchange Supabase code for session.
- Allowlist `next`.
- If `next` is missing, route to `/auth/update-password` for dashboard invite compatibility.
- If `next === "/auth/update-password"`, set `auth_password_update` HttpOnly cookie, path `/auth/update-password`, max-age 15 minutes.
- Redirect to allowed destination.
- On failure redirect to `/login?error=link_invalid`.

Middleware behavior:

- Keep existing app protected routes.
- Add `AUTHENTICATED_ONLY = ["/auth/update-password"]`.
- If missing user, redirect to `/login`.

### 3. Auth Server Actions

Modify:

- `src/lib/actions/auth.ts`

Add:

- `requestPasswordReset`
- `updatePassword`
- `changePassword`

Implementation details:

- `AuthFormState` supports `{ error }`, `{ success }`, or `null`.
- `requestPasswordReset` returns neutral success for any valid email syntax.
- `updatePassword` requires `PASSWORD_UPDATE_COOKIE`, then calls `updateUser({ password })` and clears the cookie on success.
- `changePassword` calls `updateUser({ password: newPassword, current_password: currentPassword })`.

### 4. Public Forgot-Password UI

Create:

- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/forgot-password/ForgotPasswordForm.tsx`

Update login form link to `/forgot-password`.

### 5. Update-Password UI

Create:

- `src/app/auth/update-password/layout.tsx`
- `src/app/auth/update-password/page.tsx`
- `src/app/auth/update-password/UpdatePasswordForm.tsx`

Page should redirect to `/login?error=link_invalid` if the callback cookie is missing.

### 6. Login Error Handling

Modify:

- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/login/LoginForm.tsx`

Add support for `?error=link_invalid` and show a clear expired/invalid-link message.

### 7. Profile Change Password

Create:

- `src/components/profile/ChangePasswordSection.tsx`

Modify:

- `src/app/(app)/profile/page.tsx`

Add the "Sicurezza" card before sign-out.

### 8. Environment Example

Modify:

- `.env.local.example`

Add:

- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

Production should set this to the canonical Vercel URL.

### 9. Verification

Run from `skill-practice`:

```powershell
npm run lint
npm run test
npm run build
```

Manual checks after deploy:

- `/login` -> `/forgot-password` flow.
- Recovery email -> `/auth/update-password` -> password set -> correct landing.
- Invite email -> `/auth/update-password` -> password set -> `/onboarding`.
- Direct `/auth/update-password` does not allow password update.
- `/profile` change password rejects wrong current password and accepts the correct one.
- Open redirect attempt in callback falls back safely.

No database migration is needed.
