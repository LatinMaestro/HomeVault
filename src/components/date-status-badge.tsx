import { Badge } from "@/components/ui/badge";
import type { DateStatus } from "@/lib/date-status";

const badgeVariants = {
  critical: "destructive",
  attention: "default",
  normal: "secondary",
  missing: "outline",
} as const;

export function DateStatusBadge({ status }: { status: DateStatus }) {
  return <Badge variant={badgeVariants[status.tone]}>{status.label}</Badge>;
}
