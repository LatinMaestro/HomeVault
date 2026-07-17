import Link from "next/link";
import { ArrowRight, CalendarClock, CircleAlert, ClipboardCheck, Home, ReceiptText, ShieldCheck, Sparkles, Wrench } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { DateStatusBadge } from "@/components/date-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDateStatus } from "@/lib/date-status";
import { getHomeDashboard } from "@/lib/home-data";

const reviewNotes = [
  "The household overview uses configured records and falls back to sample data when database access is unavailable.",
  "Guarded create and edit saving is available for rooms, assets, maintenance, warranties, receipts and document metadata when the database is configured.",
  "Deletes, uploads, OCR, AI, notifications, payments and analytics remain out of scope.",
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const dashboard = await getHomeDashboard();
  const {
    attentionItems,
    assetCount,
    assetNames,
    documentCount,
    nextTask,
    nextWarranty,
    nextReminder,
    receiptCount,
    roomCount,
  } = dashboard.data;
  const nextTaskStatus = getDateStatus(nextTask?.nextDueDateInput, "maintenance");
  const nextWarrantyStatus = getDateStatus(nextWarranty?.expiresAtInput, "warranty");
  const nextReminderStatus = getDateStatus(nextReminder?.dueAtInput, "reminder");

  const urgentItems = attentionItems
    .map((item) => ({
      ...item,
      status: getDateStatus(item.dateInput, item.context),
    }))
    .filter((item) => item.status.tone === "critical" || item.status.tone === "attention");

  const dashboardCards = [
    {
      title: "Next maintenance",
      value: nextTask?.title ?? "No tasks yet",
      detail: nextTask?.nextDueDate ?? "Add a due date when the next maintenance task is ready.",
      dateStatus: nextTask ? nextTaskStatus : null,
      href: nextTask ? `/maintenance/${nextTask.id}` : "/maintenance",
      icon: Wrench,
    },
    {
      title: "Next reminder",
      value: nextReminder?.title ?? "No reminders yet",
      detail:
        nextReminder?.dueAt ??
        "Add reminder metadata when the household has an important date to remember.",
      dateStatus: nextReminder ? nextReminderStatus : null,
      href: nextReminder
        ? `/maintenance/reminders/${nextReminder.id}`
        : "/maintenance/reminders",
      icon: CalendarClock,
    },
    {
      title: "Warranty coverage",
      value: nextWarranty?.assetName ?? "No warranties yet",
      detail: nextWarranty?.expiresAt ?? "Keep warranty metadata linked to the relevant household asset.",
      dateStatus: nextWarranty ? nextWarrantyStatus : null,
      href: nextWarranty ? `/warranties/${nextWarranty.id}` : "/warranties",
      icon: ShieldCheck,
    },
    {
      title: "Home inventory",
      value: `${assetCount} ${assetCount === 1 ? "asset" : "assets"}`,
      dateStatus: null,
      detail:
        assetNames.length > 0
          ? `${roomCount} ${roomCount === 1 ? "room" : "rooms"} · ${assetNames.join(", ")}`
          : `${roomCount} ${roomCount === 1 ? "room" : "rooms"} ready for household records.`,
      href: "/vault/assets",
      icon: Home,
    },
    {
      title: "Receipts and documents",
      value: `${receiptCount + documentCount} ${receiptCount + documentCount === 1 ? "record" : "records"}`,
      detail: `${receiptCount} ${receiptCount === 1 ? "receipt" : "receipts"} · ${documentCount} ${documentCount === 1 ? "document" : "documents"}`,
      dateStatus: null,
      href: "/receipts",
      icon: ReceiptText,
    },
  ];

  return (
    <AppShell activeSection="Home">
      <section className="space-y-6">
        <div className="space-y-3">
          <Badge variant="secondary">Home overview</Badge>
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Keep the important home details close at hand.
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              HomeVault gives families a calm place to organise household assets,
              maintenance, warranties, receipts and practical home documents.
            </p>
            <Button asChild variant="outline">
              <Link href="/getting-started">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Getting started
              </Link>
            </Button>
          </div>
        </div>

        <DataSourceNote source={dashboard.source} />

        {urgentItems.length ? (
          <Card className="border-primary/30">
            <CardHeader>
              <CardDescription>Due and expiry watch</CardDescription>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CircleAlert className="h-5 w-5 text-primary" aria-hidden="true" />
                Needs attention
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {urgentItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex flex-col gap-3 rounded-md border bg-background p-3 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                  <DateStatusBadge status={item.status} />
                </Link>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} href={card.href}>
                <Card className="h-full transition-colors hover:bg-accent">
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <div>
                      <CardDescription>{card.title}</CardDescription>
                      <CardTitle className="mt-1 text-xl">{card.value}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {card.dateStatus ? <DateStatusBadge status={card.dateStatus} /> : null}
                    <p className="text-sm leading-6 text-muted-foreground">{card.detail}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardDescription>Current boundaries</CardDescription>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ClipboardCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              Household records, kept practical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 text-sm leading-6 text-muted-foreground md:grid-cols-3">
              {reviewNotes.map((note) => (
                <li key={note} className="rounded-md border bg-background p-3">
                  {note}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
