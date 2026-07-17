import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveRestore, Bell, Package, Wrench } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { ArchiveFilters } from "@/components/archive-filters";
import { BackLinkButton } from "@/components/back-link-button";
import { DataSourceNote } from "@/components/data-source-note";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getArchiveData } from "@/lib/archive-data";
import { getDisplayLabel } from "@/lib/display-labels";
import { getQueryParam, matchesQuery } from "@/lib/list-filter";

export const metadata: Metadata = {
  title: "Archive",
  description: "Review inactive HomeVault records and reopen their edit screens when they need to return.",
};

export const dynamic = "force-dynamic";

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    type?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const query = getQueryParam(params.q);
  const recordType = getQueryParam(params.type);
  const archive = await getArchiveData();
  const total = archive.assets.length + archive.tasks.length + archive.reminders.length;
  const visibleAssets =
    !recordType || recordType === "assets"
      ? archive.assets.filter((asset) =>
          matchesQuery(query, [
            asset.name,
            asset.status,
            getDisplayLabel(asset.status),
            asset.roomName,
            asset.brand,
            asset.model,
          ]),
        )
      : [];
  const visibleTasks =
    !recordType || recordType === "tasks"
      ? archive.tasks.filter((task) =>
          matchesQuery(query, [
            task.title,
            task.status,
            getDisplayLabel(task.status),
            task.nextDueDate,
            task.assetName,
          ]),
        )
      : [];
  const visibleReminders =
    !recordType || recordType === "reminders"
      ? archive.reminders.filter((reminder) =>
          matchesQuery(query, [
            reminder.title,
            reminder.status,
            getDisplayLabel(reminder.status),
            reminder.dueAt,
          ]),
        )
      : [];
  const visibleTotal = visibleAssets.length + visibleTasks.length + visibleReminders.length;
  const hasFilters = Boolean(query || recordType);

  return (
    <AppShell activeSection="Settings">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Archive"
          title="Keep old records without losing their history."
          description="Review inactive household records and reopen an edit screen when something needs to return."
          action={<BackLinkButton href="/settings">Back to settings</BackLinkButton>}
        />
        <DataSourceNote source={archive.source} />

        <div className="rounded-md border bg-secondary p-4">
          <div className="flex items-start gap-3">
            <ArchiveRestore className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="font-medium">Recovery before deletion</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                HomeVault keeps historical records intact. Use the record edit screen to change its status; permanent deletion is not enabled.
              </p>
            </div>
          </div>
        </div>

        {total > 0 ? (
          <ArchiveFilters
            query={query}
            recordType={recordType}
            resultCount={visibleTotal}
          />
        ) : null}

        {total === 0 ? (
          <EmptyState
            title="Nothing is archived"
            description="Retired assets, closed tasks and cancelled reminders will appear here."
            action={
              <Button asChild>
                <Link href="/">Return home</Link>
              </Button>
            }
          />
        ) : visibleTotal === 0 ? (
          <EmptyState
            title="No archived records match"
            description="Try another search or record type, or clear the current filters."
            action={<BackLinkButton href="/archive">Clear filters</BackLinkButton>}
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {(!recordType || recordType === "assets") ? (
            <ArchiveGroup
              icon={Package}
              title="Assets"
              description="Retired or disposed inventory records."
              empty="No archived assets."
              items={visibleAssets.map((asset) => ({
                id: asset.id,
                title: asset.name,
                detail: [asset.roomName, asset.brand, asset.model].filter(Boolean).join(" | "),
                status: asset.status,
                href: `/vault/assets/${asset.id}/edit`,
              }))}
            />
            ) : null}
            {(!recordType || recordType === "tasks") ? (
            <ArchiveGroup
              icon={Wrench}
              title="Maintenance"
              description="Completed or archived upkeep schedules."
              empty="No closed maintenance tasks."
              items={visibleTasks.map((task) => ({
                id: task.id,
                title: task.title,
                detail: task.nextDueDate || task.assetName || "No current due date",
                status: task.status,
                href: `/maintenance/${task.id}/edit`,
              }))}
            />
            ) : null}
            {(!recordType || recordType === "reminders") ? (
            <ArchiveGroup
              icon={Bell}
              title="Reminders"
              description="Done or cancelled reminder records."
              empty="No closed reminders."
              items={visibleReminders.map((reminder) => ({
                id: reminder.id,
                title: reminder.title,
                detail: reminder.dueAt,
                status: reminder.status,
                href: `/maintenance/reminders/${reminder.id}/edit`,
              }))}
            />
            ) : null}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function ArchiveGroup({
  icon: Icon,
  title,
  description,
  empty,
  items,
}: {
  icon: typeof Package;
  title: string;
  description: string;
  empty: string;
  items: Array<{ id: string; title: string; detail: string; status: string; href: string }>;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <div className="space-y-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="block rounded-md border p-3 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-medium">{item.title}</p>
                  <Badge variant="secondary">{getDisplayLabel(item.status)}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.detail || "No extra details recorded"}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{empty}</p>
        )}
      </CardContent>
    </Card>
  );
}
