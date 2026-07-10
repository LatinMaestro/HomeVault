import Link from "next/link";
import { ArrowRight, ClipboardCheck, Home, ReceiptText, ShieldCheck, Wrench } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { DateStatusBadge } from "@/components/date-status-badge";
import { Badge } from "@/components/ui/badge";
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
    assetCount,
    assetNames,
    documentCount,
    nextTask,
    nextWarranty,
    receiptCount,
    roomCount,
  } = dashboard.data;
  const nextTaskStatus = getDateStatus(nextTask?.nextDueDateInput, "maintenance");
  const nextWarrantyStatus = getDateStatus(nextWarranty?.expiresAtInput, "warranty");

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
          </div>
        </div>

        <DataSourceNote source={dashboard.source} />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
