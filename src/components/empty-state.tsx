import type { ReactNode } from "react";
import { Info } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="border-dashed bg-card/70">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
            <Info className="h-4 w-4" aria-hidden="true" />
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pl-5 sm:pl-[4.25rem]">
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        {action ? <div>{action}</div> : null}
      </CardContent>
    </Card>
  );
}
