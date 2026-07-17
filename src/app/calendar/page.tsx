import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Download } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { DataSourceNote } from "@/components/data-source-note";
import { DateStatusBadge } from "@/components/date-status-badge";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHouseholdCalendar } from "@/lib/calendar-data";
import { getDateStatus } from "@/lib/date-status";

export const metadata: Metadata = {
  title: "Household Calendar",
  description: "Review household maintenance, reminder and warranty dates in one place.",
};

export const dynamic = "force-dynamic";

const kindLabels = {
  maintenance: "Maintenance",
  reminder: "Reminder",
  warranty: "Warranty",
} as const;

export default async function CalendarPage() {
  const calendar = await getHouseholdCalendar();

  return (
    <AppShell activeSection="Maintenance">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Calendar"
          title="Household dates in one calm timeline"
          description="See active maintenance, pending reminders and warranty expiries together."
          action={<BackLinkButton href="/maintenance">Back to maintenance</BackLinkButton>}
        />
        <DataSourceNote source={calendar.source} />

        <div className="flex flex-col gap-3 rounded-md border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
              <CalendarDays className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-medium">Use these dates in your calendar app</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Download a standard calendar file. HomeVault does not connect to or update an external calendar.
              </p>
            </div>
          </div>
          <Button asChild>
            <a href="/api/calendar.ics" download>
              <Download className="h-4 w-4" aria-hidden="true" />
              Download calendar
            </a>
          </Button>
        </div>

        {calendar.data.length > 0 ? (
          <div className="grid gap-3">
            {calendar.data.map((item) => (
              <Link key={item.id} href={item.href}>
                <Card className="transition-colors hover:bg-accent">
                  <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <Badge variant="secondary">{kindLabels[item.kind]}</Badge>
                        <DateStatusBadge
                          status={getDateStatus(item.dateInput, item.kind)}
                        />
                      </div>
                      <CardTitle>{item.title}</CardTitle>
                    </div>
                    <p className="text-sm font-medium text-foreground">{item.date}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.detail}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No scheduled household dates"
            description="Add a due date to an active task, pending reminder or warranty to include it here."
          />
        )}
      </section>
    </AppShell>
  );
}
