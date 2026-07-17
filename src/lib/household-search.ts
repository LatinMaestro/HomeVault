import {
  getAssetCategories,
  getAssets,
  getMaintenanceTasks,
  getRecords,
  getReminders,
  getRooms,
  getServiceProviders,
  getWarranties,
} from "@/lib/home-data";
import { matchesQuery } from "@/lib/list-filter";
import type { DataSource } from "@/lib/sample-data";

export type HouseholdSearchResult = {
  id: string;
  group: string;
  title: string;
  description: string;
  href: string;
  keywords: Array<string | number | null | undefined>;
};

export type HouseholdSearchResponse = {
  results: HouseholdSearchResult[];
  source: DataSource;
};

export async function searchHousehold(query: string): Promise<HouseholdSearchResponse> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return { results: [], source: "sample" };

  const [rooms, categories, assets, tasks, warranties, records, providers, reminders] =
    await Promise.all([
      getRooms(),
      getAssetCategories(),
      getAssets(),
      getMaintenanceTasks(),
      getWarranties(),
      getRecords(),
      getServiceProviders(),
      getReminders(),
    ]);

  const candidates: HouseholdSearchResult[] = [
    ...rooms.data.map((room) => ({
      id: `room-${room.id}`,
      group: "Rooms",
      title: room.name,
      description: [room.floor, `${room.assetCount} ${room.assetCount === 1 ? "asset" : "assets"}`]
        .filter(Boolean)
        .join(" · "),
      href: `/vault/rooms?q=${encodeURIComponent(room.name)}`,
      keywords: [room.name, room.floor, room.notes],
    })),
    ...categories.data.map((category) => ({
      id: `category-${category.id}`,
      group: "Categories",
      title: category.name,
      description: category.description || "Asset category",
      href: `/vault/categories?q=${encodeURIComponent(category.name)}`,
      keywords: [category.name, category.description],
    })),
    ...assets.data.map((asset) => ({
      id: `asset-${asset.id}`,
      group: "Assets",
      title: asset.name,
      description: [asset.brand, asset.model, asset.roomName].filter(Boolean).join(" · ") || "Household asset",
      href: `/vault/assets/${asset.id}`,
      keywords: [
        asset.name,
        asset.brand,
        asset.model,
        asset.serialNumber,
        asset.roomName,
        asset.categoryName,
        asset.purchasePlace,
        asset.status,
        asset.notes,
      ],
    })),
    ...tasks.data.map((task) => ({
      id: `task-${task.id}`,
      group: "Maintenance",
      title: task.title,
      description: [task.nextDueDate, task.assetName, task.serviceProviderName]
        .filter(Boolean)
        .join(" · ") || "Maintenance task",
      href: `/maintenance/${task.id}`,
      keywords: [
        task.title,
        task.description,
        task.frequency,
        task.status,
        task.assetName,
        task.serviceProviderName,
        task.nextDueDate,
      ],
    })),
    ...warranties.data.map((warranty) => ({
      id: `warranty-${warranty.id}`,
      group: "Warranties",
      title: `${warranty.assetName} warranty`,
      description: [warranty.provider, warranty.expiresAt].filter(Boolean).join(" · ") || "Warranty record",
      href: `/warranties/${warranty.id}`,
      keywords: [
        warranty.assetName,
        warranty.provider,
        warranty.policyNumber,
        warranty.startsAt,
        warranty.expiresAt,
        warranty.notes,
      ],
    })),
    ...records.data.map((record) => ({
      id: `record-${record.id}`,
      group: record.type === "Receipt" ? "Receipts" : "Documents",
      title: record.title,
      description: [record.secondary, record.date, record.linkedAsset].filter(Boolean).join(" · "),
      href: `/receipts/${record.id}`,
      keywords: [
        record.title,
        record.type,
        record.secondary,
        record.date,
        record.linkedAsset,
        record.notes,
        record.fileName,
        record.merchant,
        record.receiptNumber,
        record.documentType,
      ],
    })),
    ...providers.data.map((provider) => ({
      id: `provider-${provider.id}`,
      group: "Service providers",
      title: provider.name,
      description: [provider.trade, provider.phone, provider.email].filter(Boolean).join(" · ") || "Service provider",
      href: `/maintenance/providers/${provider.id}`,
      keywords: [
        provider.name,
        provider.trade,
        provider.phone,
        provider.email,
        provider.website,
        provider.notes,
        ...provider.tasks.map((task) => task.title),
      ],
    })),
    ...reminders.data.map((reminder) => ({
      id: `reminder-${reminder.id}`,
      group: "Reminders",
      title: reminder.title,
      description: [reminder.dueAt, reminder.assetName, reminder.warrantyName, reminder.taskTitle]
        .filter(Boolean)
        .join(" · "),
      href: `/maintenance/reminders/${reminder.id}`,
      keywords: [
        reminder.title,
        reminder.status,
        reminder.dueAt,
        reminder.assetName,
        reminder.warrantyName,
        reminder.taskTitle,
        reminder.notes,
      ],
    })),
  ];

  return {
    results: candidates.filter((result) =>
      matchesQuery(normalizedQuery, [result.title, result.description, ...result.keywords]),
    ),
    source: [rooms, categories, assets, tasks, warranties, records, providers, reminders].every(
      (result) => result.source === "database",
    )
      ? "database"
      : "sample",
  };
}
