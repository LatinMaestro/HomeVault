import {
  getAssets,
  getHomeProfile,
  getMaintenanceTasks,
  getRecords,
  getRooms,
  getWarranties,
} from "@/lib/home-data";

export type SetupGuideInput = {
  homeName?: string | null;
  suburb?: string | null;
  postcode?: string | null;
  roomCount: number;
  assetCount: number;
  taskCount: number;
  warrantyCount: number;
  recordCount: number;
};

export type SetupStep = {
  id: "home" | "rooms" | "assets" | "maintenance" | "warranties" | "records";
  title: string;
  description: string;
  href: string;
  complete: boolean;
};

export function buildSetupSteps(input: SetupGuideInput): SetupStep[] {
  return [
    {
      id: "home",
      title: "Name your home",
      description: "Add a recognisable household name and basic location details.",
      href: "/settings",
      complete: Boolean(input.homeName?.trim() && (input.suburb?.trim() || input.postcode?.trim())),
    },
    {
      id: "rooms",
      title: "Add your rooms",
      description: "Create the everyday places where household assets live.",
      href: input.roomCount ? "/vault/rooms" : "/vault/rooms/new",
      complete: input.roomCount > 0,
    },
    {
      id: "assets",
      title: "Record a first asset",
      description: "Start with an appliance, tool or outdoor item you want to track.",
      href: input.assetCount ? "/vault/assets" : "/vault/assets/new",
      complete: input.assetCount > 0,
    },
    {
      id: "maintenance",
      title: "Plan one upkeep task",
      description: "Choose a starter template or create a schedule that suits your home.",
      href: input.taskCount ? "/maintenance" : "/maintenance/templates",
      complete: input.taskCount > 0,
    },
    {
      id: "warranties",
      title: "Capture warranty cover",
      description: "Link warranty dates and provider details to an existing asset.",
      href: input.warrantyCount ? "/warranties" : "/warranties/new",
      complete: input.warrantyCount > 0,
    },
    {
      id: "records",
      title: "Add a receipt or document",
      description: "Keep practical metadata for a purchase receipt, manual or service record.",
      href: input.recordCount ? "/receipts" : "/receipts/new",
      complete: input.recordCount > 0,
    },
  ];
}

export async function getSetupGuide() {
  const [home, rooms, assets, tasks, warranties, records] = await Promise.all([
    getHomeProfile(),
    getRooms(),
    getAssets(),
    getMaintenanceTasks(),
    getWarranties(),
    getRecords(),
  ]);
  const steps = buildSetupSteps({
    homeName: home.data.name,
    suburb: home.data.suburb,
    postcode: home.data.postcode,
    roomCount: rooms.data.length,
    assetCount: assets.data.length,
    taskCount: tasks.data.length,
    warrantyCount: warranties.data.length,
    recordCount: records.data.length,
  });

  return {
    steps,
    completedCount: steps.filter((step) => step.complete).length,
    source: [home, rooms, assets, tasks, warranties, records].every(
      (result) => result.source === "database",
    )
      ? ("database" as const)
      : ("sample" as const),
  };
}
