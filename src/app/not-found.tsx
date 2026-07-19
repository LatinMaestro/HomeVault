import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <AppShell activeSection="Home" publicAccess>
      <section className="space-y-5">
        <PageHeader
          eyebrow="Not found"
          title="This HomeVault page is not available"
          description="The link may be out of date, or the record may not exist in the current preview data."
        />
        <EmptyState
          title="Head back to a known area"
          description="Use the dashboard or primary navigation to continue reviewing the current HomeVault preview."
          action={
            <Button asChild variant="outline">
              <Link href="/">Back to dashboard</Link>
            </Button>
          }
        />
      </section>
    </AppShell>
  );
}
