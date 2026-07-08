import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export function BackLinkButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button asChild variant="outline">
      <Link href={href} className="gap-2">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>{children}</span>
      </Link>
    </Button>
  );
}
