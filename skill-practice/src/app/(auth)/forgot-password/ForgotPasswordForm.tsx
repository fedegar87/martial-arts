"use client";
import { useTranslations } from "next-intl";

import { LegalLinks } from "@/components/legal/LegalLinks";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/actions/auth";
import Link from "next/link";
import { useActionState } from "react";

export function ForgotPasswordForm() {
  const tr = useTranslations("ui");
  const [state, action, pending] = useActionState(requestPasswordReset, null);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{tr("forgotPassword")}</CardTitle>
        <CardDescription>{tr("resetDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{tr("email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
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

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? tr("sending") : tr("sendResetLink")}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col items-start gap-3">
        <Link
          href="/login"
          className="text-muted-foreground text-sm hover:underline"
        >
          {tr("backLogin")}
        </Link>
        <LegalLinks />
      </CardFooter>
    </Card>
  );
}
