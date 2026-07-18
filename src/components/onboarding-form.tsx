"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";

import {
  createFirstHouseholdAction,
  type OnboardingActionState,
} from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: OnboardingActionState = { status: "idle", message: "" };

export function OnboardingForm({ suggestedName }: { suggestedName: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createFirstHouseholdAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      router.replace("/");
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="name">
          Household name
        </label>
        <Input id="name" name="name" defaultValue={suggestedName} maxLength={120} required />
        <p className="text-xs leading-5 text-muted-foreground">
          A friendly label such as Taylor Family Home.
        </p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="addressLine">
          Street address <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <Input id="addressLine" name="addressLine" autoComplete="street-address" maxLength={180} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="suburb">
            Suburb <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Input id="suburb" name="suburb" autoComplete="address-level2" maxLength={100} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="state">
            State or territory <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <select
            id="state"
            name="state"
            autoComplete="address-level1"
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Choose later</option>
            {["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"].map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="postcode">
          Postcode <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <Input
          className="sm:max-w-40"
          id="postcode"
          name="postcode"
          inputMode="numeric"
          autoComplete="postal-code"
          pattern="[0-9]{4}"
          maxLength={4}
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
      <Button className="w-full" type="submit" disabled={pending}>
        <Home className="h-4 w-4" aria-hidden="true" />
        {pending ? "Creating your home..." : "Create my home"}
      </Button>
    </form>
  );
}
