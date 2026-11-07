"use client";
import type { UiTranslator } from "@/lib/i18n/config";

import { useTranslations } from "next-intl";

import { LegalLinks } from "@/components/legal/LegalLinks";
import { Disclosure } from "@/components/primitives/Disclosure";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { requestAccountDeletion } from "@/lib/actions/account";
import { Download, FileText, Trash2 } from "lucide-react";
import { useActionState } from "react";

type Props = {
  pendingDeletionRequestedAt?: string | null;
};

export function PrivacyDataSection({ pendingDeletionRequestedAt }: Props) {
  const tr = useTranslations("ui");
  const [state, action, pending] = useActionState(requestAccountDeletion, null);
  const hasPendingDeletion = Boolean(pendingDeletionRequestedAt);

  return (
    <Disclosure
      title={tr("privacyAndData")}
      summary={
        hasPendingDeletion ? tr("deletionPending") : tr("documentsAndData")
      }
      revealKey={state}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Button asChild variant="outline" className="w-full justify-start">
            <a href="/profile/export">
              <Download className="mr-2 h-4 w-4" />
              {tr("downloadData")}
            </a>
          </Button>
          <p className="text-muted-foreground text-xs">
            {tr("dataExportDescription")}
          </p>
        </div>

        <div className="rounded-md border p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4" aria-hidden />
            {tr("documents")}
          </div>
          <LegalLinks />
        </div>

        <form action={action} className="space-y-3 rounded-md border p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Trash2 className="h-4 w-4" aria-hidden />
            {tr("deleteAccount")}
          </div>
          {hasPendingDeletion ? (
            <p className="text-muted-foreground text-sm">
              {tr("requestPendingSince")}{" "}
              {formatDate(tr, pendingDeletionRequestedAt ?? "")}
              {tr("adminCompletesDeletion")}
            </p>
          ) : (
            <>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  name="confirmDeletionRequest"
                  className="mt-1 h-4 w-4"
                />
                <span>{tr("deletionAcknowledgement")}</span>
              </label>
              <Button
                type="submit"
                variant="destructive"
                disabled={pending}
                className="w-full"
              >
                {pending ? tr("sendingRequest") : tr("requestDeletion")}
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
      </div>
    </Disclosure>
  );
}

function formatDate(tr: UiTranslator, value: string): string {
  if (!value) return "";
  return new Intl.DateTimeFormat(tr("locale"), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
