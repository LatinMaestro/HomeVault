import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReviewSummaryItem = {
  label: string;
  value: string;
  detail: string;
};

export function ReviewSummary({ items }: { items: ReviewSummaryItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">{item.label}</p>
            <CardTitle className="text-2xl">{item.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">{item.detail}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
