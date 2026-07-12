import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { DataSourceNote } from "@/components/data-source-note";
import { EmptyState } from "@/components/empty-state";
import { FieldList } from "@/components/field-list";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDisplayLabel } from "@/lib/display-labels";
import { getServiceProvider } from "@/lib/home-data";

export const metadata: Metadata = {
  title: "Service Provider Detail",
  description: "Review a HomeVault service provider and linked maintenance tasks.",
};

export const dynamic = "force-dynamic";

export default async function ServiceProviderPage({
  params,
}: {
  params: Promise<{ providerId: string }>;
}) {
  const { providerId } = await params;
  const provider = await getServiceProvider(providerId);

  if (!provider.data) {
    return (
      <AppShell activeSection="Maintenance">
        <section className="space-y-5">
          <PageHeader
            eyebrow="Maintenance"
            title="Service provider not found"
            description="This provider was not found in the current HomeVault data source."
          />
          <DataSourceNote source={provider.source} />
          <EmptyState
            title="No matching service provider"
            description="The provider may not exist in the configured database or built-in sample data."
            action={
              <BackLinkButton href="/maintenance/providers">Back to providers</BackLinkButton>
            }
          />
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell activeSection="Maintenance">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Service provider"
          title={provider.data.name}
          description={provider.data.trade || "Contact details and linked maintenance work."}
          action={<BackLinkButton href="/maintenance/providers">Back to providers</BackLinkButton>}
        />
        <DataSourceNote source={provider.source} />

        <Button asChild variant="secondary">
          <Link href={`/maintenance/providers/${provider.data.id}/edit`}>Edit provider</Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Contact details</CardTitle>
            <CardDescription>Provider information for the current home.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldList
              fields={[
                { label: "Trade", value: provider.data.trade },
                { label: "Phone", value: provider.data.phone },
                { label: "Email", value: provider.data.email },
                { label: "Website", value: provider.data.website },
                { label: "Notes", value: provider.data.notes },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Linked maintenance</CardTitle>
            <CardDescription>Tasks currently assigned to this provider.</CardDescription>
          </CardHeader>
          <CardContent>
            {provider.data.tasks.length ? (
              <div className="grid gap-3">
                {provider.data.tasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/maintenance/${task.id}`}
                    className="flex flex-col gap-2 rounded-md border bg-background p-3 transition-colors hover:bg-accent sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.nextDueDate ? `Next due ${task.nextDueDate}` : "No due date recorded"}
                      </p>
                    </div>
                    <Badge variant="secondary">{getDisplayLabel(task.status)}</Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No maintenance tasks are linked to this provider yet.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
