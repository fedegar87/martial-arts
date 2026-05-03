"use client";

import { useActionState } from "react";
import { Download, FileText, Trash2 } from "lucide-react";
import { requestAccountDeletion } from "@/lib/actions/account";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LegalLinks } from "@/components/legal/LegalLinks";

type Props = {
  pendingDeletionRequestedAt?: string | null;
};

export function PrivacyDataSection({ pendingDeletionRequestedAt }: Props) {
  const [state, action, pending] = useActionState(
    requestAccountDeletion,
    null,
  );
  const hasPendingDeletion = Boolean(pendingDeletionRequestedAt);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Privacy e dati</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button asChild variant="outline" className="w-full justify-start">
            <a href="/profile/export">
              <Download className="mr-2 h-4 w-4" />
              Scarica i tuoi dati
            </a>
          </Button>
          <p className="text-muted-foreground text-xs">
            Include profilo, piano, diario pratica, calendario e riflessioni.
          </p>
        </div>

        <div className="rounded-md border p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4" aria-hidden />
            Documenti
          </div>
          <LegalLinks />
        </div>

        <form action={action} className="space-y-3 rounded-md border p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Trash2 className="h-4 w-4" aria-hidden />
            Cancellazione account
          </div>
          {hasPendingDeletion ? (
            <p className="text-muted-foreground text-sm">
              Richiesta in attesa dal{" "}
              {formatDate(pendingDeletionRequestedAt ?? "")}. Un amministratore
              dovra completarla.
            </p>
          ) : (
            <>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  name="confirmDeletionRequest"
                  className="mt-1 h-4 w-4"
                />
                <span>
                  Capisco che questa richiesta dovra essere verificata dalla
                  scuola prima della cancellazione definitiva.
                </span>
              </label>
              <Button
                type="submit"
                variant="destructive"
                disabled={pending}
                className="w-full"
              >
                {pending ? "Invio richiesta..." : "Richiedi cancellazione"}
              </Button>
            </>
          )}

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
        </form>
      </CardContent>
    </Card>
  );
}

function formatDate(value: string): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
