import type { Metadata } from "next";

import { createWarrantyAction } from "@/app/warranties/actions";
import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { PageHeader } from "@/components/page-header";
import { WarrantyForm } from "@/components/warranty-form";
import { warrantyShellFields } from "@/lib/shell-form-fields";

export const metadata: Metadata = {
  title: "New Warranty",
  description: "Create a HomeVault warranty record when database persistence is configured.",
};

export default function NewWarrantyPage() {
  return (
    <AppShell activeSection="Warranties">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Warranties"
          title="Create warranty"
          description="Save warranty metadata for an existing asset when database persistence is available. Document uploads and reminders are not enabled yet."
          action={<BackLinkButton href="/warranties">Back to warranties</BackLinkButton>}
        />
        <WarrantyForm
          title="Warranty details"
          description="Warranty saving is enabled when the database is configured and the asset name matches an existing asset."
          fields={warrantyShellFields}
          action={createWarrantyAction}
          databaseConfigured={Boolean(process.env.DATABASE_URL)}
        />
      </section>
    </AppShell>
  );
}
