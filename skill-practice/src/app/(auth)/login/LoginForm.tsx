"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginForm({ initialError }: { initialError?: string | null }) {
  const [state, action, pending] = useActionState(login, null);
  const error =
    (state && "error" in state ? state.error : null) ?? initialError ?? null;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Kung Fu Practice FESK</CardTitle>
        <CardDescription>
          Accedi al tuo quaderno tecnico digitale.
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
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
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
            {pending ? "Accesso in corso..." : "Accedi"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Link
          href="/forgot-password"
          className="text-muted-foreground text-sm hover:underline"
        >
          Password dimenticata?
        </Link>
      </CardFooter>
    </Card>
  );
}
