"use client";
import { useTranslations } from "next-intl";

import { Disclosure } from "@/components/primitives/Disclosure";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/lib/actions/auth";
import { wrappingButtonClassName } from "@/lib/ui-classes";
import { useActionState } from "react";

export function ChangePasswordSection() {
  const tr = useTranslations("ui");
  const [state, action, pending] = useActionState(changePassword, null);

  return (
    <Disclosure
      title={tr("security")}
      summary={tr("changePassword")}
      revealKey={state}
    >
      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">{tr("currentPassword")}</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">{tr("newPassword")}</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{tr("confirmNewPassword")}</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
          />
        </div>

        {state && "error" in state && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {state && "success" in state && (
          <Alert>
            <AlertDescription>{state.success}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          disabled={pending}
          className={`${wrappingButtonClassName} w-full`}
        >
          {pending ? tr("updating") : tr("updatePassword")}
        </Button>
      </form>
    </Disclosure>
  );
}
