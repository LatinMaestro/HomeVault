import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <AppShell activeSection="Home">
      <section className="space-y-5" aria-busy="true" aria-live="polite">
        <div className="space-y-3">
          <Badge variant="secondary">Loading</Badge>
          <div className="max-w-3xl space-y-3">
            <div className="h-9 w-4/5 animate-pulse rounded-md bg-muted sm:w-2/3" />
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {["summary", "records", "details"].map((item) => (
            <Card key={item}>
              <CardHeader className="space-y-3">
                <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
                <div className="h-6 w-36 animate-pulse rounded-md bg-muted" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
