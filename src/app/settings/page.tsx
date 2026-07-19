import { isCurrentHouseholdWritable } from "@/lib/household-access";

import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveRestore, Database, FileJson, History, LockKeyhole, Printer, Sheet, ShieldCheck, Users } from "lucide-react";

import { updateHouseholdProfileAction } from "@/app/settings/actions";
import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { HouseholdProfileForm } from "@/components/household-profile-form";
import { PageHeader } from "@/components/page-header";
import { getDisplayLabel } from "@/lib/display-labels";
import { getHomeProfile, getHouseholdMembers } from "@/lib/home-data";
import { getHouseholdProfileFields } from "@/lib/household-profile-fields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage the current household profile and review HomeVault privacy guardrails.",
};

export const dynamic = "force-dynamic";

const readinessCards = [
  {
    title: "Privacy posture",
    description: "HomeVault keeps the current MVP practical and private. No analytics, AI, OCR, email ingestion or external product integrations are connected.",
    badge: "Privacy-first",
    icon: ShieldCheck,
  },
  {
    title: "Account mode",
    description: "Verified email/password entry, recovery and account controls activate only with the complete production runtime. Advanced household sharing remains unavailable.",
    badge: "Fail-closed",
    icon: LockKeyhole,
  },
  {
    title: "Data mode",
    description: "Authenticated reads and saves require verified household membership. Sample and controlled-preview modes remain isolated while production accounts are disabled.",
    badge: "Fail-closed",
    icon: Database,
  },
];

const unavailableItems = [
  "Advanced household invitations or role management",
  "OCR or AI extraction",
  "Notifications or email ingestion",
  "Payments, subscriptions or analytics",
  "Camera capture",
  "Public record or attachment links",
];

export default async function SettingsPage() {
  const [home, householdMembers] = await Promise.all([
    getHomeProfile(),
    getHouseholdMembers(),
  ]);
  const dataSource =
    home.source === "database" && householdMembers.source === "database"
      ? "database"
      : "sample";

  return (
    <AppShell activeSection="Settings">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Settings"
          title="Household settings and privacy"
          description="Manage the household profile, portable exports, record recovery and privacy boundaries."
        />
        <DataSourceNote source={dataSource} />
        <HouseholdProfileForm
          fields={getHouseholdProfileFields(home.data)}
          action={updateHouseholdProfileAction}
          databaseConfigured={await isCurrentHouseholdWritable()}
        />

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <Users className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <CardDescription>Current access</CardDescription>
                <CardTitle>Household members</CardTitle>
              </div>
            </div>
            <CardDescription className="leading-6">
              Review the people already connected to this household. Invitations and role changes stay unavailable until production authentication and authorisation are approved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {householdMembers.data.length > 0 ? (
              <ul className="space-y-3">
                {householdMembers.data.map((member) => (
                  <li
                    key={member.id}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-md border bg-background p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {member.name}
                      </p>
                      {member.nickname && member.nickname !== member.name ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Known as {member.nickname}
                        </p>
                      ) : null}
                    </div>
                    <Badge variant="secondary">
                      {getDisplayLabel(member.role)}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                No household member records are available yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Portable copies</CardDescription>
            <CardTitle>Export household records</CardTitle>
            <CardDescription className="leading-6">
              Keep a structured backup of visible metadata, open inventory in a spreadsheet or retain completed maintenance history. File attachments are not included.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild>
              <a href="/api/export/household.json" download>
                <FileJson className="h-4 w-4" aria-hidden="true" />
                Household records
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/api/export/inventory.csv" download>
                <Sheet className="h-4 w-4" aria-hidden="true" />
                Asset inventory
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/api/export/maintenance.csv" download>
                <History className="h-4 w-4" aria-hidden="true" />
                Maintenance history
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/home-report">
                <Printer className="h-4 w-4" aria-hidden="true" />
                Household summary
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Record lifecycle</CardDescription>
            <CardTitle>Archive and recovery</CardTitle>
            <CardDescription className="leading-6">
              Find inactive assets, closed maintenance tasks and finished reminders without permanently deleting their history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/archive">
                <ArchiveRestore className="h-4 w-4" aria-hidden="true" />
                Review archive
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          {readinessCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <Badge variant="secondary">{card.badge}</Badge>
                  </div>
                  <div>
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription className="mt-2 leading-6">{card.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardDescription>Deliberately not included</CardDescription>
            <CardTitle>Product boundaries</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
              {unavailableItems.map((item) => (
                <li key={item} className="rounded-md border bg-background p-3">
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
