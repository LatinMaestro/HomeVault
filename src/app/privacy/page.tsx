import type { Metadata } from "next";
import Link from "next/link";
import { Database, FileText, LockKeyhole, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Understand HomeVault's current privacy posture and release safeguards.",
};

const principles = [
  {
    title: "Collect only useful home records",
    description:
      "HomeVault is designed for household asset, room, maintenance, warranty, receipt, document, reminder and service-provider metadata. It does not include budgeting or financial analysis.",
    icon: FileText,
  },
  {
    title: "Keep preview data non-sensitive",
    description:
      "The current preview has no production sign-in or household authorisation. Use the built-in sample household only, or controlled non-sensitive review data.",
    icon: LockKeyhole,
  },
  {
    title: "No hidden tracking",
    description:
      "The current product does not include analytics, advertising, AI, OCR, email ingestion, payment processing or third-party product integrations.",
    icon: ShieldCheck,
  },
  {
    title: "Files remain out of the system",
    description:
      "Receipt and document records are metadata only. HomeVault does not currently accept, store or process uploaded files.",
    icon: Database,
  },
];

export default function PrivacyPage() {
  return (
    <AppShell activeSection="">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Privacy"
          title="Your home records deserve careful handling"
          description="This page describes the current HomeVault preview. A final legal privacy policy, accountable entity and contact details will be published before public release."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {principles.map((principle) => {
            const Icon = principle.icon;
            return (
              <Card key={principle.title}>
                <CardHeader className="space-y-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle>{principle.title}</CardTitle>
                    <CardDescription className="mt-2 leading-6">
                      {principle.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle>Before public release</CardTitle>
              <Badge variant="secondary">Required release gate</Badge>
            </div>
            <CardDescription>
              Production privacy controls are planned but are not represented as complete.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
            <p>
              Public release requires production authentication, server-side household
              authorisation, account and data deletion, approved storage, retention rules,
              and published privacy and support contacts.
            </p>
            <Button asChild variant="outline">
              <Link href="/support">View support information</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
