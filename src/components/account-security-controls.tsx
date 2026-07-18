"use client";

import { useState, type FormEvent } from "react";
import { KeyRound, MonitorOff, Save, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { validateDisplayName, validatePasswordChange } from "@/lib/account-input";
import { authClient } from "@/lib/auth-client";

type Feedback = { tone: "success" | "error"; message: string } | null;

function FeedbackMessage({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return (
    <p
      className={
        feedback.tone === "error"
          ? "rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
          : "rounded-md border border-primary/30 bg-primary/5 p-3 text-sm text-foreground"
      }
      role={feedback.tone === "error" ? "alert" : "status"}
    >
      {feedback.message}
    </p>
  );
}

export function AccountSecurityControls({ currentName }: { currentName: string }) {
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [profilePending, setProfilePending] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null);
  const [passwordPending, setPasswordPending] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);
  const [sessionPending, setSessionPending] = useState(false);
  const [sessionFeedback, setSessionFeedback] = useState<Feedback>(null);

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalid = validateDisplayName(name);
    if (invalid) return setProfileFeedback({ tone: "error", message: invalid });

    setProfilePending(true);
    setProfileFeedback(null);
    const result = await authClient.updateUser({ name: name.trim() });
    setProfilePending(false);
    if (result.error) {
      setProfileFeedback({ tone: "error", message: "HomeVault could not update your name." });
      return;
    }
    setName(name.trim());
    setProfileFeedback({ tone: "success", message: "Your account name was updated." });
    router.refresh();
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    const invalid = validatePasswordChange({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (invalid) return setPasswordFeedback({ tone: "error", message: invalid });

    setPasswordPending(true);
    setPasswordFeedback(null);
    const result = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setPasswordPending(false);
    if (result.error) {
      setPasswordFeedback({
        tone: "error",
        message: "The current password was not accepted. Nothing was changed.",
      });
      return;
    }
    event.currentTarget.reset();
    setPasswordFeedback({
      tone: "success",
      message: "Your password was changed and other devices were signed out.",
    });
  }

  async function revokeOtherSessions() {
    setSessionPending(true);
    setSessionFeedback(null);
    const result = await authClient.revokeOtherSessions();
    setSessionPending(false);
    setSessionFeedback(
      result.error
        ? { tone: "error", message: "HomeVault could not sign out other devices." }
        : { tone: "success", message: "All other HomeVault sessions were signed out." },
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <CardDescription>Profile</CardDescription>
              <CardTitle>Your display name</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={updateProfile}>
            <div className="space-y-2">
              <label htmlFor="account-name" className="text-sm font-medium text-foreground">
                Name
              </label>
              <Input
                id="account-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                maxLength={80}
                autoComplete="name"
                required
              />
            </div>
            <FeedbackMessage feedback={profileFeedback} />
            <Button type="submit" disabled={profilePending}>
              <Save className="h-4 w-4" aria-hidden="true" />
              {profilePending ? "Saving..." : "Save name"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
              <KeyRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <CardDescription>Security</CardDescription>
              <CardTitle>Change password</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={changePassword}>
            <div className="space-y-2">
              <label htmlFor="current-password" className="text-sm font-medium text-foreground">
                Current password
              </label>
              <Input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-medium text-foreground">
                  New password
                </label>
                <Input id="new-password" name="newPassword" type="password" minLength={12} maxLength={128} autoComplete="new-password" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                  Confirm new password
                </label>
                <Input id="confirm-password" name="confirmPassword" type="password" minLength={12} maxLength={128} autoComplete="new-password" required />
              </div>
            </div>
            <FeedbackMessage feedback={passwordFeedback} />
            <Button type="submit" disabled={passwordPending}>
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              {passwordPending ? "Changing..." : "Change password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Signed-in devices</CardTitle>
          <CardDescription>
            Keep this device signed in and end every other active HomeVault session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FeedbackMessage feedback={sessionFeedback} />
          <Button type="button" variant="outline" onClick={revokeOtherSessions} disabled={sessionPending}>
            <MonitorOff className="h-4 w-4" aria-hidden="true" />
            {sessionPending ? "Signing out..." : "Sign out other devices"}
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
