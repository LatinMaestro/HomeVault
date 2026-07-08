import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const vaultSections = [
  {
    title: "Rooms",
    description: "Review home zones and prepare room records for later editing.",
    href: "/vault/rooms",
  },
  {
    title: "Assets",
    description: "Browse appliances, tools and outdoor equipment linked to rooms and records.",
    href: "/vault/assets",
  },
  {
    title: "Receipts and documents",
    description: "Review metadata-only records without uploads or storage.",
    href: "/receipts",
  },
  {
    title: "Maintenance history",
    description: "Jump to maintenance tasks and completed service notes.",
    href: "/maintenance",
  },
];

export default function VaultPage() {
  return (
    <AppShell activeSection="Vault">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Vault"
          title="A simple record of the things that make up your home."
          description="Review rooms, assets and important home records in read-only screens."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {vaultSections.map((section) => (
            <Link key={section.href} href={section.href}>
              <Card className="h-full transition-colors hover:bg-accent">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-3">
                    {section.title}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Open {section.title.toLowerCase()}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

