"use client";

import { useActionState, useEffect } from "react";
import { Trash2 } from "lucide-react";

import {
  deleteAccountAction,
  type DeleteAccountActionState,
} from "@/app/account/delete/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: DeleteAccountActionState = { status: "idle", message: "" };

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteAccountAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      window.location.assign("/sign-in?deleted=true");
    }
  }, [state.status]);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="confirmation">
          Type DELETE to confirm
        </label>
        <Input
          id="confirmation"
          name="confirmation"
          autoComplete="off"
          spellCheck={false}
          pattern="DELETE"
          required
        />
      </div>
      {state.message ? (
        <p
          className={state.status === "error"
            ? "rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
            : "rounded-md border border-primary/30 bg-primary/5 p-3 text-sm text-foreground"}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}
      <Button className="w-full" type="submit" variant="destructive" disabled={pending}>
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        {pending ? "Deleting account..." : "Permanently delete account"}
      </Button>
    </form>
  );
}
