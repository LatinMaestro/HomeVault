import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardList, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMaintenanceFrequencyLabel } from "@/lib/display-labels";
import { maintenanceTemplates } from "@/lib/maintenance-templates";

export const metadata: Metadata = {
  title: "Maintenance Templates",
  description: "Start common Australian household maintenance tasks with practical editable details.",
};

export default function MaintenanceTemplatesPage() {
  return (
    <AppShell activeSection="Maintenance">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Maintenance templates"
          title="Start with a practical household task."
          description="Choose a starting point, then review the details and timing for your home before saving."
          action={<BackLinkButton href="/maintenance">Back to maintenance</BackLinkButton>}
        />

        <div className="rounded-md border bg-secondary p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-medium">Guidance, not a universal schedule</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Homes, equipment and local conditions differ. Check manuals, local safety guidance and qualified advice before doing unfamiliar or hazardous work.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {maintenanceTemplates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{template.category}</Badge>
                  <Badge variant="outline">
                    {getMaintenanceFrequencyLabel(template.frequency)}
                  </Badge>
                </div>
                <CardTitle className="pt-2">{template.title}</CardTitle>
                <CardDescription className="leading-6">{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                  <ClipboardList className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                  <p>{template.guidance}</p>
                </div>
                <Button asChild className="w-full sm:w-auto">
                  <Link href={`/maintenance/new?template=${template.id}`}>
                    Use template
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
