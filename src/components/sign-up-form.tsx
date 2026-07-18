"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function SignUpForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const result = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/account",
    });

    if (result.error) {
      setMessage("HomeVault could not create this account. Check the details or use the sign-in page.");
      setPending(false);
      return;
    }

    setSuccess(true);
    setPending(false);
  }

  if (success) {
    return (
      <p className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm leading-6 text-foreground" role="status">
        Check your email to verify the account before signing in.
      </p>
    );
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="name">
          Name
        </label>
        <Input id="name" name="name" autoComplete="name" maxLength={120} required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="email">
          Email
        </label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="password">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          required
        />
        <p className="text-xs leading-5 text-muted-foreground">Use at least 12 characters.</p>
      </div>
      {message ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
          {message}
        </p>
      ) : null}
      <Button className="w-full" type="submit" disabled={pending}>
        <UserPlus className="h-4 w-4" aria-hidden="true" />
        {pending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
