import { SectionPlaceholder } from "@/components/section-placeholder";

export default function MaintenancePage() {
  return (
    <SectionPlaceholder
      section="Maintenance"
      title="Track recurring home upkeep before it becomes stressful."
      description="Maintenance will focus on plain-language tasks, simple due dates and household routines."
      items={["Upcoming tasks", "Recurring routines", "Completed service records", "Seasonal checks"]}
    />
  );
}

