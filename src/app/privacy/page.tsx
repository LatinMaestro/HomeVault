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
      "Verified account and household authorisation boundaries are implemented and fail closed until production services are configured. Public previews use sample or controlled synthetic data only.",
    icon: LockKeyhole,
  },
  {
    title: "No hidden tracking",
    description:
      "The current product does not include analytics, advertising, AI, OCR, email ingestion, payment processing or third-party product integrations.",
    icon: ShieldCheck,
  },
  {
    title: "Private attachments stay guarded",
    description:
      "Approved PDF, JPEG and PNG attachments use private storage only after verified household access. Files are not public, analysed by AI or processed with OCR.",
    icon: Database,
  },
];

export default function PrivacyPage() {
  return (
    <AppShell activeSection="" publicAccess>
      <section className="space-y-5">
        <PageHeader
          eyebrow="Privacy"
          title="Your home records deserve careful handling"
          description="This page describes HomeVault's current engineering privacy posture. The accountable entity, final retention periods and public contact details will be published before release."
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
              Engineering controls are implemented; live service enablement and legal publication remain.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
            <p>
              Public release requires production migrations, verified auth email, private
              storage provisioning, end-to-end account and attachment testing, confirmed
              retention rules, and published privacy and support contacts.
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
