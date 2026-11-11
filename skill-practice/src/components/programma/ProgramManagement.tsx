"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  createCustomProgramFromForm, deleteCustomProgramFromForm, renameCustomProgramFromForm,
} from "@/lib/actions/custom-programs";
import type { CustomProgram } from "@/lib/types";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState } from "react";

type Props = { program?: CustomProgram; isActive?: boolean };

export function ProgramManagement({ program, isActive = false }: Props) {
  const tr = useTranslations("ui");
  const [state, action, pending] = useActionState(
    program ? renameCustomProgramFromForm : createCustomProgramFromForm,
    null,
  );
  const [deleteState, deleteAction, deleting] = useActionState(deleteCustomProgramFromForm, null);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          {program ? <Pencil className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {program ? tr("manageNamedProgram") : tr("newCustomProgram")}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="material-sheet max-h-[90dvh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
        <SheetHeader>
          <SheetTitle>{program ? tr("manageNamedProgram") : tr("newCustomProgram")}</SheetTitle>
        </SheetHeader>
        <div className="space-y-5 px-4 pb-6">
          <form action={action} className="space-y-4">
            {program && <input type="hidden" name="program_id" value={program.id} />}
            <label className="block space-y-2 text-sm">
              <span>{tr("customProgramName")}</span>
              <Input name="name" required maxLength={60} defaultValue={program?.name ?? ""} autoComplete="off" />
            </label>
            {state && "error" in state && (
              <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>
            )}
            <Button type="submit" disabled={pending || deleting}>
              {pending ? tr("saving") : program ? tr("renameCustomProgram") : tr("createCustomProgram")}
            </Button>
          </form>
          {program && (
            <div className="space-y-3 border-t border-border pt-5">
              {isActive && <p className="text-sm text-muted-foreground">{tr("customProgramActiveDelete")}</p>}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" disabled={isActive || pending || deleting}>
                    <Trash2 className="mr-2 h-4 w-4" />{tr("deleteNamedProgram")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{tr("deleteNamedProgramConfirm")}</AlertDialogTitle>
                    <AlertDialogDescription>{tr("deleteNamedProgramWarning", { p0: program.name })}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <form action={deleteAction} className="space-y-4">
                    <input type="hidden" name="program_id" value={program.id} />
                    {deleteState && "error" in deleteState && (
                      <Alert variant="destructive"><AlertDescription>{deleteState.error}</AlertDescription></Alert>
                    )}
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={deleting}>{tr("cancel")}</AlertDialogCancel>
                      <Button type="submit" variant="destructive" disabled={deleting}>
                        {deleting ? tr("deleting") : tr("delete")}
                      </Button>
                    </AlertDialogFooter>
                  </form>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
