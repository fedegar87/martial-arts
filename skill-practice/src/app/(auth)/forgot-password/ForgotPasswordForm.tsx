"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "@/lib/actions/auth";
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
import { LegalLinks } from "@/components/legal/LegalLinks";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, null);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Password dimenticata</CardTitle>
        <CardDescription>
          Inserisci la tua email per ricevere un link di reset.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
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
            {pending ? "Invio in corso..." : "Invia link di reset"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col items-start gap-3">
        <Link
          href="/login"
          className="text-muted-foreground text-sm hover:underline"
        >
          Torna al login
        </Link>
        <LegalLinks />
      </CardFooter>
    </Card>
  );
}
