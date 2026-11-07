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
import { login } from "@/lib/actions/auth";
import { brand } from "@/lib/brand";
import Link from "next/link";
import { useActionState } from "react";

export function LoginForm({
  initialError,
  next,
}: {
  initialError?: string | null;
  next?: string;
}) {
  const tr = useTranslations("ui");
  const [state, action, pending] = useActionState(login, null);
  const error =
    (state && "error" in state ? state.error : null) ?? initialError ?? null;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{brand.appName}</CardTitle>
        <CardDescription>{tr("loginDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {next && <input type="hidden" name="next" value={next} />}
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
          <div className="space-y-2">
            <Label htmlFor="password">{tr("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? tr("signingIn") : tr("signIn")}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col items-start gap-3">
        <Link
          href="/forgot-password"
          className="text-muted-foreground text-sm hover:underline"
        >
          {tr("forgotPasswordLink")}
        </Link>
        <LegalLinks />
      </CardFooter>
    </Card>
  );
}
