import type { Metadata } from "next";

import { updateServiceProviderAction } from "@/app/maintenance/providers/actions";
import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { PageHeader } from "@/components/page-header";
import { ServiceProviderForm } from "@/components/service-provider-form";
import { getServiceProvider } from "@/lib/home-data";
import { getServiceProviderEditFields } from "@/lib/service-provider-fields";

export const metadata: Metadata = {
  title: "Edit Service Provider",
  description: "Edit a service provider in the current HomeVault home.",
};

export const dynamic = "force-dynamic";

export default async function EditServiceProviderPage({
  params,
}: {
  params: Promise<{ providerId: string }>;
}) {
  const { providerId } = await params;
  const provider = await getServiceProvider(providerId);
  const updateAction = updateServiceProviderAction.bind(null, providerId);

  return (
    <AppShell activeSection="Maintenance">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Service providers"
          title={`Edit ${provider.data?.name ?? "provider"}`}
          description="Update contact metadata when this provider exists in the configured database."
          action={
            <BackLinkButton href={`/maintenance/providers/${providerId}`}>
              Back to provider
            </BackLinkButton>
          }
        />
        <ServiceProviderForm
          title="Provider details"
          description="Sample and unavailable database states remain safe and non-destructive."
          fields={getServiceProviderEditFields(provider.data)}
          action={updateAction}
          databaseConfigured={Boolean(process.env.DATABASE_URL)}
        />
      </section>
    </AppShell>
  );
}
