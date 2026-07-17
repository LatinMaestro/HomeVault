import type { Metadata } from "next";
import Link from "next/link";
import { CloudOff, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Offline",
  description: "HomeVault is waiting for an internet connection.",
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-background px-4 pt-[calc(2rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))] text-foreground sm:px-6">
      <section className="mx-auto flex min-h-[75vh] max-w-xl flex-col justify-center space-y-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
          <CloudOff className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-primary">HomeVault</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">You are offline</h1>
          <p className="text-base leading-7 text-muted-foreground">
            Reconnect to review or change household records. HomeVault does not cache household
            details on this device in the current privacy-first release.
          </p>
        </div>
        <Button asChild className="w-fit">
          <Link href="/">
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </Link>
        </Button>
      </section>
    </main>
  );
}
