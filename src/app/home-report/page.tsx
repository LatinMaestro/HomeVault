import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, Contact, FileText, Home, Package, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { DataSourceNote } from "@/components/data-source-note";
import { PageHeader } from "@/components/page-header";
import { PrintReportButton } from "@/components/print-report-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDisplayLabel, getMaintenanceFrequencyLabel } from "@/lib/display-labels";
import { getHomeReport } from "@/lib/home-report";

export const metadata: Metadata = {
  title: "Household Summary",
  description: "Review and print a practical summary of household assets, upkeep, warranties and providers.",
};

export const dynamic = "force-dynamic";

const generatedFormatter = new Intl.DateTimeFormat("en-AU", {
  dateStyle: "long",
  timeZone: "Australia/Brisbane",
});

export default async function HomeReportPage() {
  const report = await getHomeReport();
  const address = [
    report.home.addressLine,
    report.home.suburb,
    report.home.state,
    report.home.postcode,
    report.home.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <AppShell activeSection="Home">
      <section className="space-y-5 print:space-y-4">
        <div className="print:hidden">
          <PageHeader
            eyebrow="Household summary"
            title="A practical handover view of your home."
            description="Review core records together, then print or save a personal copy when you need one."
            action={
              <div className="flex flex-col gap-2 sm:flex-row">
                <BackLinkButton href="/">Back to home</BackLinkButton>
                <PrintReportButton />
              </div>
            }
          />
        </div>

        <header className="border-b pb-5">
          <div className="flex items-start gap-3">
            <Home className="mt-1 h-6 w-6 text-primary" aria-hidden="true" />
            <div>
              <h1 className="text-2xl font-semibold">{report.home.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {address || "No household address recorded"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Summary generated {generatedFormatter.format(report.generatedAt)}
              </p>
            </div>
          </div>
        </header>

        <div className="print:hidden">
          <DataSourceNote source={report.source} />
        </div>

        <aside className="rounded-md border bg-secondary p-4 text-sm leading-6 print:bg-transparent">
          This summary may contain serial numbers and contact details. Keep printed or saved copies private and share them only with people you trust.
        </aside>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
          {[
            ["Rooms", report.rooms.length],
            ["Assets", report.assets.length],
            ["Active tasks", report.tasks.length],
            ["Records", report.records.length],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border p-3">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <ReportSection
          icon={Package}
          title="Home inventory"
          description="Identity and location details for household assets."
        >
          <div className="grid gap-3 lg:grid-cols-2">
            {report.assets.map((asset) => (
              <Link key={asset.id} href={`/vault/assets/${asset.id}`} className="print:pointer-events-none">
                <div className="h-full rounded-md border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium">{asset.name}</p>
                    <Badge variant="secondary">{getDisplayLabel(asset.status)}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[asset.brand, asset.model].filter(Boolean).join(" ") || "Brand and model not recorded"}
                  </p>
                  <dl className="mt-3 grid gap-1 text-sm">
                    <ReportField label="Room" value={asset.roomName} />
                    <ReportField label="Category" value={asset.categoryName} />
                    <ReportField label="Serial" value={asset.serialNumber} />
                  </dl>
                </div>
              </Link>
            ))}
          </div>
        </ReportSection>

        <ReportSection
          icon={CalendarClock}
          title="Active maintenance"
          description="Current schedules and the next recorded due dates."
        >
          <div className="grid gap-3 lg:grid-cols-2">
            {report.tasks.map((task) => (
              <div key={task.id} className="rounded-md border p-3">
                <p className="font-medium">{task.title}</p>
                <dl className="mt-2 grid gap-1 text-sm">
                  <ReportField
                    label="Schedule"
                    value={getMaintenanceFrequencyLabel(task.frequency, task.customIntervalDays)}
                  />
                  <ReportField label="Next due" value={task.nextDueDate} />
                  <ReportField label="Asset" value={task.assetName} />
                  <ReportField label="Provider" value={task.serviceProviderName} />
                </dl>
              </div>
            ))}
          </div>
        </ReportSection>

        <ReportSection
          icon={ShieldCheck}
          title="Warranty register"
          description="Recorded providers and coverage dates."
        >
          <div className="grid gap-3 lg:grid-cols-2">
            {report.warranties.map((warranty) => (
              <div key={warranty.id} className="rounded-md border p-3">
                <p className="font-medium">{warranty.assetName}</p>
                <dl className="mt-2 grid gap-1 text-sm">
                  <ReportField label="Provider" value={warranty.provider} />
                  <ReportField label="Reference" value={warranty.policyNumber} />
                  <ReportField label="Expires" value={warranty.expiresAt} />
                </dl>
              </div>
            ))}
          </div>
        </ReportSection>

        <div className="grid gap-4 lg:grid-cols-2 print:grid-cols-2">
          <ReportSection
            icon={Contact}
            title="Service contacts"
            description="Providers recorded for household work."
          >
            <div className="space-y-3">
              {report.providers.map((provider) => (
                <div key={provider.id} className="rounded-md border p-3">
                  <p className="font-medium">{provider.name}</p>
                  <p className="text-sm text-muted-foreground">{provider.trade || "Service provider"}</p>
                  <p className="mt-2 text-sm">{[provider.phone, provider.email].filter(Boolean).join(" | ") || "No contact details recorded"}</p>
                </div>
              ))}
            </div>
          </ReportSection>

          <ReportSection
            icon={FileText}
            title="Record index"
            description="Receipt and document metadata; file attachments are not included."
          >
            <div className="space-y-3">
              {report.records.map((record) => (
                <div key={record.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className="font-medium">{record.title}</p>
                    <Badge variant="outline">{record.type}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[record.secondary, record.date, record.linkedAsset].filter(Boolean).join(" | ")}
                  </p>
                </div>
              ))}
            </div>
          </ReportSection>
        </div>
      </section>
    </AppShell>
  );
}

function ReportSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Package;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="break-inside-avoid">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ReportField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-[5rem_1fr] gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value || "Not recorded"}</dd>
    </div>
  );
}
