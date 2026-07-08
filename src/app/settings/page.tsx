import { Database, LockKeyhole, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const readinessCards = [
  {
    title: "Privacy posture",
    description: "HomeVault keeps Phase 1 practical and private. No analytics, AI, OCR, email ingestion or external product integrations are connected.",
    badge: "Privacy-first",
    icon: ShieldCheck,
  },
  {
    title: "Account mode",
    description: "The app is still in single-user preview mode. Production authentication and household sharing need separate approval before implementation.",
    badge: "Preview only",
    icon: LockKeyhole,
  },
  {
    title: "Data mode",
    description: "Runtime pages can read from a configured database, but they remain useful with built-in sample data when DATABASE_URL is unavailable.",
    badge: "Fallback-safe",
    icon: Database,
  },
];

const unavailableItems = [
  "Production authentication",
  "File uploads or storage",
  "OCR or AI extraction",
  "Notifications or email ingestion",
  "Payments, subscriptions or analytics",
  "Persistent create, edit or delete actions",
];

export default function SettingsPage() {
  return (
    <AppShell activeSection="Settings">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Settings"
          title="Preview settings and project readiness"
          description="Settings are intentionally read-only while HomeVault hardens the core screens and keeps larger product decisions separate."
        />

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
            <CardDescription>Not enabled yet</CardDescription>
            <CardTitle>Guardrails for the current preview</CardTitle>
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
