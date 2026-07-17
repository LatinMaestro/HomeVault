import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Boxes,
  Contact,
  FileText,
  FolderTree,
  PackagePlus,
  ReceiptText,
  ShieldPlus,
  Wrench,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { PageHeader } from "@/components/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Quick Add",
  description: "Open HomeVault creation workflows from one mobile-friendly place.",
};

const groups = [
  {
    title: "Home inventory",
    description: "Structure the home and record what belongs in it.",
    actions: [
      {
        title: "Room",
        description: "Add a room or household area.",
        href: "/vault/rooms/new",
        icon: Boxes,
      },
      {
        title: "Asset category",
        description: "Create a practical inventory grouping.",
        href: "/vault/categories/new",
        icon: FolderTree,
      },
      {
        title: "Asset",
        description: "Record an appliance, tool or outdoor item.",
        href: "/vault/assets/new",
        icon: PackagePlus,
      },
    ],
  },
  {
    title: "Maintenance",
    description: "Plan work and keep useful service contacts together.",
    actions: [
      {
        title: "Maintenance task",
        description: "Create a one-off or recurring upkeep task.",
        href: "/maintenance/new",
        icon: Wrench,
      },
      {
        title: "Reminder",
        description: "Record an important household due date.",
        href: "/maintenance/reminders/new",
        icon: Bell,
      },
      {
        title: "Service provider",
        description: "Add a trusted household trade or provider.",
        href: "/maintenance/providers/new",
        icon: Contact,
      },
    ],
  },
  {
    title: "Receipts and cover",
    description: "Keep practical purchase, warranty and document metadata.",
    actions: [
      {
        title: "Warranty",
        description: "Link coverage details to an existing asset.",
        href: "/warranties/new",
        icon: ShieldPlus,
      },
      {
        title: "Receipt",
        description: "Record purchase and retailer details.",
        href: "/receipts/new/receipt",
        icon: ReceiptText,
      },
      {
        title: "Document",
        description: "Index a manual, certificate or service record.",
        href: "/receipts/new/document",
        icon: FileText,
      },
    ],
  },
];

export default function QuickAddPage() {
  return (
    <AppShell activeSection="Home">
      <section className="space-y-7">
        <PageHeader
          eyebrow="Quick add"
          title="What would you like to record?"
          description="Jump straight to an existing HomeVault form. Saving remains protected by the current database access rules."
          action={<BackLinkButton href="/">Back to home</BackLinkButton>}
        />

        {groups.map((group) => (
          <section key={group.title} className="space-y-3" aria-labelledby={`quick-add-${group.title.toLowerCase().replaceAll(" ", "-")}`}>
            <div>
              <h2 id={`quick-add-${group.title.toLowerCase().replaceAll(" ", "-")}`} className="text-xl font-semibold">
                {group.title}
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{group.description}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {group.actions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href}>
                    <Card className="h-full transition-colors hover:bg-accent">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                            <Icon className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        </div>
                        <CardTitle className="pt-2">{action.title}</CardTitle>
                        <CardDescription className="leading-6">{action.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </section>
    </AppShell>
  );
}
