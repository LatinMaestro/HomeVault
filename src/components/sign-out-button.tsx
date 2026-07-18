"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    window.location.assign("/sign-in");
  }

  return (
    <Button type="button" variant="outline" onClick={signOut} disabled={pending}>
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {pending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
