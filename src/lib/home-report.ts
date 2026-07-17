import {
  getAssets,
  getHomeProfile,
  getMaintenanceTasks,
  getRecords,
  getRooms,
  getServiceProviders,
  getWarranties,
} from "@/lib/home-data";

export async function getHomeReport() {
  const [home, rooms, assets, tasks, warranties, records, providers] = await Promise.all([
    getHomeProfile(),
    getRooms(),
    getAssets(),
    getMaintenanceTasks(),
    getWarranties(),
    getRecords(),
    getServiceProviders(),
  ]);

  return {
    source: [home, rooms, assets, tasks, warranties, records, providers].every(
      (result) => result.source === "database",
    )
      ? ("database" as const)
      : ("sample" as const),
    generatedAt: new Date(),
    home: home.data,
    rooms: rooms.data,
    assets: assets.data,
    tasks: tasks.data.filter((task) => task.status === "ACTIVE"),
    warranties: warranties.data,
    records: records.data,
    providers: providers.data,
  };
}
