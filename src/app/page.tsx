import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const dashboardCards = [
  {
    title: "Upcoming maintenance",
    value: "3 tasks",
    detail: "Air conditioner filters, gutters and lawn mower service are due soon.",
  },
  {
    title: "Expiring warranties",
    value: "2 warranties",
    detail: "Fridge and washing machine cover need review within 60 days.",
  },
  {
    title: "Recently added assets",
    value: "6 items",
    detail: "Kitchen and garage records were updated this week.",
  },
  {
    title: "Receipts/documents",
    value: "14 records",
    detail: "Receipts, manuals and service notes are ready for later storage approval.",
  },
  {
    title: "Home inventory summary",
    value: "28 assets",
    detail: "Grouped by room, category, warranty status and maintenance needs.",
  },
];

export default function HomePage() {
  return (
    <AppShell activeSection="Home">
      <section className="space-y-5">
        <div className="space-y-3">
          <Badge variant="secondary">Phase 1A visual shell</Badge>
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

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {dashboardCards.map((card) => (
            <Card key={card.title}>
              <CardHeader>
                <CardDescription>{card.title}</CardDescription>
                <CardTitle className="text-2xl">{card.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{card.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

