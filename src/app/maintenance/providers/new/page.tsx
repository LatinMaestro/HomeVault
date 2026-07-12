import type { Metadata } from "next";

import { createServiceProviderAction } from "@/app/maintenance/providers/actions";
import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { PageHeader } from "@/components/page-header";
import { ServiceProviderForm } from "@/components/service-provider-form";
import { serviceProviderFields } from "@/lib/service-provider-fields";

export const metadata: Metadata = {
  title: "New Service Provider",
  description: "Add a service provider to the current HomeVault home.",
};

export default function NewServiceProviderPage() {
  return (
    <AppShell activeSection="Maintenance">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Service providers"
          title="Add service provider"
          description="Save trusted contact details for maintenance work when database persistence is available."
          action={<BackLinkButton href="/maintenance/providers">Back to providers</BackLinkButton>}
        />
        <ServiceProviderForm
          title="Provider details"
          description="Add practical contact metadata that can be linked to maintenance tasks."
          fields={serviceProviderFields}
          action={createServiceProviderAction}
          databaseConfigured={Boolean(process.env.DATABASE_URL)}
        />
      </section>
    </AppShell>
  );
}
