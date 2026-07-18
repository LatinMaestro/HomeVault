"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm({ token }: { token: string }) {
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const newPassword = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("confirmation") ?? "");

    if (newPassword !== confirmation) {
      setMessage("The two passwords do not match.");
      setPending(false);
      return;
    }

    const result = await authClient.resetPassword({ newPassword, token });
    if (result.error) {
      setMessage("This reset link is invalid or expired. Request a new link and try again.");
      setPending(false);
      return;
    }

    setComplete(true);
    setPending(false);
  }

  if (complete) {
    return (
      <div className="space-y-4">
        <p className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm leading-6 text-foreground" role="status">
          Your password has been updated and existing sessions have been revoked.
        </p>
        <Button asChild className="w-full">
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="password">
          New password
        </label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required />
        <p className="text-xs leading-5 text-muted-foreground">Use at least 12 characters.</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="confirmation">
          Confirm new password
        </label>
        <Input id="confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={12} maxLength={128} required />
      </div>
      {message ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
          {message}
        </p>
      ) : null}
      <Button className="w-full" type="submit" disabled={pending}>
        <KeyRound className="h-4 w-4" aria-hidden="true" />
        {pending ? "Updating password..." : "Update password"}
      </Button>
    </form>
  );
}
