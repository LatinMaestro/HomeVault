import type { Metadata } from "next";
import Link from "next/link";
import { CloudOff, Database, LifeBuoy, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Support",
  description: "HomeVault help, troubleshooting and account support information.",
};

const helpItems = [
  {
    title: "A sample record is missing",
    description:
      "Return to the relevant list and choose one of the Taylor Family Home sample records. Unknown record links show a safe not-found state.",
    icon: LifeBuoy,
    href: "/vault",
    action: "Open the vault",
  },
  {
    title: "Saving is unavailable",
    description:
      "Saving requires verified writable household access, or the isolated controlled-preview mode while production accounts are disabled. Without either, HomeVault remains useful with sample data.",
    icon: Database,
    href: "/settings",
    action: "Check data mode",
  },
  {
    title: "The app is offline",
    description:
      "Reconnect and reload the page. HomeVault caches only a minimal offline shell and does not cache household records or pending changes.",
    icon: CloudOff,
    href: "/offline",
    action: "View offline help",
  },
  {
    title: "Privacy or account help",
    description:
      "Verified accounts include password recovery, session controls, export and deletion when production services are enabled. A public support contact remains required before store release.",
    icon: ShieldCheck,
    href: "/privacy",
    action: "Read privacy information",
  },
];

export default function SupportPage() {
  return (
    <AppShell activeSection="" publicAccess>
      <section className="space-y-5">
        <PageHeader
          eyebrow="Support"
          title="Help with HomeVault"
          description="Practical guidance for the current app and review builds. A public support contact and response process will be published before store submission."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {helpItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title}>
                <CardHeader className="space-y-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription className="mt-2 leading-6">
                      {item.description}
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline" className="w-fit">
                    <Link href={item.href}>{item.action}</Link>
                  </Button>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
