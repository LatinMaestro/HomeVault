import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  Circle,
  FileText,
  Home,
  Package,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { DataSourceNote } from "@/components/data-source-note";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSetupGuide, type SetupStep } from "@/lib/setup-guide";

export const metadata: Metadata = {
  title: "Getting Started",
  description: "Set up HomeVault with a calm, practical household checklist.",
};

export const dynamic = "force-dynamic";

const icons = {
  home: Home,
  rooms: Home,
  assets: Package,
  maintenance: Wrench,
  warranties: ShieldCheck,
  records: FileText,
} satisfies Record<SetupStep["id"], typeof Home>;

export default async function GettingStartedPage() {
  const guide = await getSetupGuide();
  const percent = Math.round((guide.completedCount / guide.steps.length) * 100);

  return (
    <AppShell activeSection="Home">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Getting started"
          title="Build your home vault one useful step at a time."
          description="There is no perfect order. Start with the records that would be hardest to find when you need them."
          action={<BackLinkButton href="/">Back to home</BackLinkButton>}
        />
        <DataSourceNote source={guide.source} />

        <div className="rounded-md border bg-secondary p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">Household setup</p>
                <Badge variant={percent === 100 ? "default" : "secondary"}>
                  {guide.completedCount} of {guide.steps.length} ready
                </Badge>
              </div>
              <div
                className="mt-3 h-2 overflow-hidden rounded-sm bg-background"
                role="progressbar"
                aria-label="Household setup progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
              >
                <div className="h-full bg-primary transition-[width]" style={{ width: `${percent}%` }} />
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Progress is calculated from your current records. HomeVault does not store a separate onboarding profile.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {guide.steps.map((step, index) => {
            const Icon = icons[step.id];
            return (
              <Card key={step.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <Badge variant={step.complete ? "default" : "outline"}>
                      {step.complete ? (
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Circle className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {step.complete ? "Ready" : `Step ${index + 1}`}
                    </Badge>
                  </div>
                  <CardTitle className="pt-2">{step.title}</CardTitle>
                  <CardDescription className="leading-6">{step.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant={step.complete ? "outline" : "default"}>
                    <Link href={step.href}>{step.complete ? "Review" : "Start this step"}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
