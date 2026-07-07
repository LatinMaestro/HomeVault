import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-3xl space-y-3">
        <Badge variant="outline">{eyebrow}</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-base leading-7 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
