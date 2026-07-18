"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (result.error) {
      setMessage("HomeVault could not request a reset email right now. Please try again later.");
      setPending(false);
      return;
    }

    setComplete(true);
    setPending(false);
  }

  if (complete) {
    return (
      <p className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm leading-6 text-foreground" role="status">
        If a verified HomeVault account uses that email, a password reset link is on its way.
      </p>
    );
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="email">
          Account email
        </label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {message ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
          {message}
        </p>
      ) : null}
      <Button className="w-full" type="submit" disabled={pending}>
        <Mail className="h-4 w-4" aria-hidden="true" />
        {pending ? "Requesting reset..." : "Email reset link"}
      </Button>
    </form>
  );
}
