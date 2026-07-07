import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SectionPlaceholder({
  section,
  title,
  description,
  items,
}: {
  section: string;
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <AppShell activeSection={section}>
      <section className="space-y-5">
        <div className="max-w-3xl space-y-3">
          <Badge variant="outline">{section}</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-base leading-7 text-muted-foreground">{description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item}>
              <CardHeader>
                <CardTitle>{item}</CardTitle>
                <CardDescription>Placeholder for Phase 1 visual review.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  This area will become a practical workflow in later approved phases.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

