import { SectionPlaceholder } from "@/components/section-placeholder";

export default function VaultPage() {
  return (
    <SectionPlaceholder
      section="Vault"
      title="A simple record of the things that make up your home."
      description="The vault will organise rooms, appliances, tools, outdoor equipment and key household documents without adding unnecessary complexity."
      items={["Rooms and zones", "Assets", "Manuals and records", "Service history"]}
    />
  );
}

