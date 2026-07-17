import {
  getAssetCategories,
  getAssets,
  getHomeProfile,
  getMaintenanceTasks,
  getRecords,
  getReminders,
  getRooms,
  getServiceProviders,
  getWarranties,
} from "@/lib/home-data";

export async function getHouseholdExport() {
  const [
    home,
    rooms,
    categories,
    assets,
    maintenanceTasks,
    warranties,
    records,
    reminders,
    serviceProviders,
  ] = await Promise.all([
    getHomeProfile(),
    getRooms(),
    getAssetCategories(),
    getAssets(),
    getMaintenanceTasks(),
    getWarranties(),
    getRecords(),
    getReminders(),
    getServiceProviders(),
  ]);

  const results = [
    home,
    rooms,
    categories,
    assets,
    maintenanceTasks,
    warranties,
    records,
    reminders,
    serviceProviders,
  ];

  return {
    format: "homevault-household-export",
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    dataSource: results.every((result) => result.source === "database")
      ? "database"
      : "sample",
    household: home.data,
    rooms: rooms.data,
    assetCategories: categories.data,
    assets: assets.data,
    maintenanceTasks: maintenanceTasks.data,
    warranties: warranties.data,
    records: records.data,
    reminders: reminders.data,
    serviceProviders: serviceProviders.data,
  };
}
