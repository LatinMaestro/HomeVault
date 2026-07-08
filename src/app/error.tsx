"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[80vh] max-w-3xl flex-col justify-center space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase text-muted-foreground">HomeVault</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Something did not load correctly
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            This preview is still safe to review. Try loading the page again, or return to the dashboard and continue from a known area.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to dashboard</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
