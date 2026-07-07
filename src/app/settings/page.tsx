import { SectionPlaceholder } from "@/components/section-placeholder";

export default function SettingsPage() {
  return (
    <SectionPlaceholder
      section="Settings"
      title="Simple household settings for the preview app."
      description="Settings remain lightweight while authentication, storage and account structure are still decisions."
      items={["Household profile", "Privacy preferences", "Data export placeholder", "Phase decisions"]}
    />
  );
}

