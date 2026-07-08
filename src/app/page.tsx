import Link from "next/link";
import { ArrowRight, ClipboardCheck, Home, ReceiptText, ShieldCheck, Wrench } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const dashboardCards = [
  {
    title: "Maintenance",
    value: "Upcoming tasks",
    detail: "Review recurring upkeep and service history before reminders are introduced.",
    href: "/maintenance",
    icon: Wrench,
  },
  {
    title: "Warranties",
    value: "Coverage records",
    detail: "Keep provider, policy and expiry details close when something breaks.",
    href: "/warranties",
    icon: ShieldCheck,
  },
  {
    title: "Assets",
    value: "Home inventory",
    detail: "Browse appliances, tools and equipment grouped by room and category.",
    href: "/vault/assets",
    icon: Home,
  },
  {
    title: "Receipts/documents",
    value: "Metadata only",
    detail: "Review receipt, manual and service-note records without uploads or storage.",
    href: "/receipts",
    icon: ReceiptText,
  },
];

const reviewNotes = [
  "Read-only database screens fall back to sample data when DATABASE_URL is unavailable.",
  "Create and edit pages are preview shells only; saving is not enabled yet.",
  "Uploads, OCR, AI, notifications, payments and analytics remain out of scope.",
];

export default function HomePage() {
  return (
    <AppShell activeSection="Home">
      <section className="space-y-6">
        <div className="space-y-3">
          <Badge variant="secondary">Phase 1D hardening</Badge>
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
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">{card.detail}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardDescription>Review status</CardDescription>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ClipboardCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              Safe for visual review
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
