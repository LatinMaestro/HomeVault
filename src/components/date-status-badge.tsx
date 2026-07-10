import { Badge } from "@/components/ui/badge";
import type { DateStatus } from "@/lib/date-status";

const badgeStyles = {
  critical: {
    variant: "outline",
    className: "border-red-200 bg-red-50 text-red-800",
  },
  attention: {
    variant: "default",
    className: "",
  },
  normal: {
    variant: "secondary",
    className: "",
  },
  missing: {
    variant: "outline",
    className: "",
  },
} as const;

export function DateStatusBadge({ status }: { status: DateStatus }) {
  const style = badgeStyles[status.tone];

  return (
    <Badge variant={style.variant} className={style.className}>
      {status.label}
    </Badge>
  );
}
