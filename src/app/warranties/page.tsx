import { SectionPlaceholder } from "@/components/section-placeholder";

export default function WarrantiesPage() {
  return (
    <SectionPlaceholder
      section="Warranties"
      title="Keep warranty details easy to find when something breaks."
      description="Warranty records will connect assets to coverage dates, purchase details and supporting documents once storage is approved."
      items={["Active warranties", "Expiring soon", "Coverage notes", "Linked assets"]}
    />
  );
}

