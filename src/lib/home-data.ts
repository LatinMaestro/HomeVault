import { getCurrentHomeId as resolveCurrentHomeId } from "@/lib/current-home";
import { getDb, isPreviewDatabaseEnabled } from "@/lib/db";
import {
  sampleAssetCategories,
  sampleAssets,
  sampleHome,
  sampleMaintenanceTasks,
  sampleRecords,
  sampleReminders,
  sampleRooms,
  sampleServiceProviders,
  sampleWarranties,
  type AssetCategoryDetail,
  type AssetCategorySummary,
  type AssetDetail,
  type DataSource,
  type HomeProfile,
  type MaintenanceTaskDetail,
  type RecordDetail,
  type ReminderDetail,
  type RoomDetail,
  type RoomSummary,
  type ServiceProviderDetail,
  type WarrantyDetail,
} from "@/lib/sample-data";

type Result<T> = {
  data: T;
  source: DataSource;
};

export type HomeAttentionItem = {
  id: string;
  title: string;
  detail: string;
  dateInput?: string | null;
  context: "maintenance" | "warranty" | "reminder";
  href: string;
};

export type HomeDashboard = {
  attentionItems: HomeAttentionItem[];
  roomCount: number;
  assetCount: number;
  assetNames: string[];
  nextTask: {
    id: string;
    title: string;
    nextDueDate?: string | null;
    nextDueDateInput?: string | null;
  } | null;
  nextWarranty: {
    id: string;
    assetName: string;
    expiresAt?: string | null;
    expiresAtInput?: string | null;
  } | null;
  nextReminder: {
    id: string;
    title: string;
    dueAt: string;
    dueAtInput: string;
  } | null;
  receiptCount: number;
  documentCount: number;
};

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
});

function formatDate(value?: Date | string | null) {
  if (!value) return null;
  return dateFormatter.format(new Date(value));
}

function formatDateInput(value?: Date | string | null) {
  if (!value) return null;
  return new Date(value).toISOString().slice(0, 10);
}

function formatCurrency(cents?: number | null) {
  if (typeof cents !== "number") return null;
  return currencyFormatter.format(cents / 100);
}

async function withDatabase<T>(query: () => Promise<T>, fallback: T): Promise<Result<T>> {
  if (!isPreviewDatabaseEnabled()) {
    return { data: fallback, source: "sample" };
  }

  try {
    return { data: await query(), source: "database" };
  } catch {
    return { data: fallback, source: "sample" };
  }
}

async function getCurrentHomeId() {
  const homeId = await resolveCurrentHomeId();
  if (!homeId) {
    throw new Error("Current HomeVault home was not found");
  }

  return homeId;
}

export async function getHomeProfile(): Promise<Result<HomeProfile>> {
  return withDatabase(async () => {
    const homeId = await getCurrentHomeId();
    const home = await getDb().home.findUnique({
      where: { id: homeId },
      select: {
        id: true,
        name: true,
        addressLine: true,
        suburb: true,
        state: true,
        postcode: true,
        country: true,
      },
    });
    if (!home) throw new Error("Current HomeVault home was not found");
    return home;
  }, sampleHome);
}

export async function getRooms(): Promise<Result<RoomSummary[]>> {
  return withDatabase(async () => {
    const homeId = await getCurrentHomeId();
    if (!homeId) return sampleRooms;

    const rooms = await getDb().room.findMany({
      where: { homeId },
      orderBy: { name: "asc" },
      include: { _count: { select: { assets: true } } },
    });

    return rooms.map((room) => ({
      id: room.id,
      name: room.name,
      floor: room.floor,
      notes: room.notes,
      assetCount: room._count.assets,
    }));
  }, sampleRooms);
}

export async function getRoom(id: string): Promise<Result<RoomDetail | null>> {
  const [rooms, assets, tasks] = await Promise.all([
    getRooms(),
    getAssets(),
    getMaintenanceTasks(),
  ]);
  const room = rooms.data.find((item) => item.id === id);

  if (!room) {
    return { data: null, source: rooms.source };
  }

  const roomAssets = assets.data.filter((asset) => asset.roomId === room.id);
  const assetIds = new Set(roomAssets.map((asset) => asset.id));

  return {
    data: {
      ...room,
      assets: roomAssets.map((asset) => ({
        id: asset.id,
        name: asset.name,
        brand: asset.brand,
        status: asset.status,
      })),
      maintenanceTasks: tasks.data
        .filter((task) => task.assetId && assetIds.has(task.assetId))
        .map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          nextDueDate: task.nextDueDate,
        })),
    },
    source:
      rooms.source === "database" &&
      assets.source === "database" &&
      tasks.source === "database"
        ? "database"
        : "sample",
  };
}

export async function getAssetCategories(): Promise<Result<AssetCategorySummary[]>> {
  return withDatabase(async () => {
    const homeId = await getCurrentHomeId();

    const categories = await getDb().assetCategory.findMany({
      where: { homeId },
      orderBy: { name: "asc" },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
    }));
  }, sampleAssetCategories);
}

export async function getAssetCategory(
  id: string,
): Promise<Result<AssetCategoryDetail | null>> {
  const [categories, assets] = await Promise.all([getAssetCategories(), getAssets()]);
  const category = categories.data.find((item) => item.id === id);

  if (!category) {
    return { data: null, source: categories.source };
  }

  return {
    data: {
      ...category,
      assets: assets.data
        .filter((asset) => asset.categoryId === category.id)
        .map((asset) => ({
          id: asset.id,
          name: asset.name,
          brand: asset.brand,
          status: asset.status,
          roomName: asset.roomName,
        })),
    },
    source:
      categories.source === "database" && assets.source === "database"
        ? "database"
        : "sample",
  };
}

export async function getAssets(): Promise<Result<AssetDetail[]>> {
  return withDatabase(async () => {
    const homeId = await getCurrentHomeId();
    if (!homeId) return sampleAssets;

    const assets = await getDb().asset.findMany({
      where: { homeId },
      orderBy: { name: "asc" },
      include: {
        room: true,
        category: true,
        warranties: true,
        receipts: true,
        documents: true,
        maintenanceTasks: { orderBy: [{ nextDueDate: "asc" }, { title: "asc" }] },
        reminders: { orderBy: [{ dueAt: "asc" }, { title: "asc" }] },
      },
    });

    return assets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      brand: asset.brand,
      model: asset.model,
      serialNumber: asset.serialNumber,
      purchaseDate: formatDate(asset.purchaseDate),
      purchaseDateInput: formatDateInput(asset.purchaseDate),
      purchasePlace: asset.purchasePlace,
      notes: asset.notes,
      status: asset.status,
      roomId: asset.room?.id,
      roomName: asset.room?.name,
      categoryId: asset.category?.id,
      categoryName: asset.category?.name,
      warranties: asset.warranties.map((warranty) => ({
        id: warranty.id,
        provider: warranty.provider,
        expiresAt: formatDate(warranty.expiresAt),
      })),
      receipts: asset.receipts.map((receipt) => ({
        id: receipt.id,
        merchant: receipt.merchant,
        purchaseDate: formatDate(receipt.purchaseDate),
        totalAmount: formatCurrency(receipt.totalAmountCents),
      })),
      documents: asset.documents.map((document) => ({
        id: document.id,
        title: document.title,
        type: document.type,
      })),
      maintenanceTasks: asset.maintenanceTasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        nextDueDate: formatDate(task.nextDueDate),
      })),
      reminders: asset.reminders.map((reminder) => ({
        id: reminder.id,
        title: reminder.title,
        status: reminder.status,
        dueAt: formatDate(reminder.dueAt) ?? "Unknown date",
      })),
    }));
  }, sampleAssets);
}

export async function getAsset(id: string): Promise<Result<AssetDetail | null>> {
  const assets = await getAssets();
  return {
    data: assets.data.find((asset) => asset.id === id) ?? null,
    source: assets.source,
  };
}

export async function getServiceProviders(): Promise<Result<ServiceProviderDetail[]>> {
  return withDatabase(async () => {
    const homeId = await getCurrentHomeId();

    const providers = await getDb().serviceProvider.findMany({
      where: { homeId },
      orderBy: { name: "asc" },
      include: {
        maintenanceTasks: {
          orderBy: [{ nextDueDate: "asc" }, { title: "asc" }],
          select: { id: true, title: true, status: true, nextDueDate: true },
        },
      },
    });

    return providers.map((provider) => ({
      id: provider.id,
      name: provider.name,
      trade: provider.trade,
      phone: provider.phone,
      email: provider.email,
      website: provider.website,
      notes: provider.notes,
      tasks: provider.maintenanceTasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        nextDueDate: formatDate(task.nextDueDate),
      })),
    }));
  }, sampleServiceProviders);
}

export async function getServiceProvider(id: string): Promise<Result<ServiceProviderDetail | null>> {
  const providers = await getServiceProviders();
  return {
    data: providers.data.find((provider) => provider.id === id) ?? null,
    source: providers.source,
  };
}

export async function getMaintenanceTasks(): Promise<Result<MaintenanceTaskDetail[]>> {
  return withDatabase(async () => {
    const homeId = await getCurrentHomeId();
    if (!homeId) return sampleMaintenanceTasks;

    const tasks = await getDb().maintenanceTask.findMany({
      where: { homeId },
      orderBy: [{ nextDueDate: "asc" }, { title: "asc" }],
      include: {
        asset: true,
        serviceProvider: true,
        completions: { orderBy: { completedAt: "desc" } },
      },
    });

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      frequency: task.frequency,
      customIntervalDays: task.customIntervalDays,
      nextDueDate: formatDate(task.nextDueDate),
      nextDueDateInput: formatDateInput(task.nextDueDate),
      status: task.status,
      assetName: task.asset?.name,
      assetId: task.asset?.id,
      serviceProviderName: task.serviceProvider?.name,
      serviceProviderId: task.serviceProvider?.id,
      completions: task.completions.map((completion) => ({
        id: completion.id,
        completedAt: formatDate(completion.completedAt) ?? "Unknown date",
        completedBy: completion.completedBy,
        notes: completion.notes,
      })),
    }));
  }, sampleMaintenanceTasks);
}

export async function getMaintenanceTask(id: string): Promise<Result<MaintenanceTaskDetail | null>> {
  const tasks = await getMaintenanceTasks();
  return {
    data: tasks.data.find((task) => task.id === id) ?? null,
    source: tasks.source,
  };
}

export async function getWarranties(): Promise<Result<WarrantyDetail[]>> {
  return withDatabase(async () => {
    const homeId = await getCurrentHomeId();
    if (!homeId) return sampleWarranties;

    const warranties = await getDb().warranty.findMany({
      where: { homeId },
      orderBy: { expiresAt: "asc" },
      include: { asset: true, documents: true },
    });

    return warranties.map((warranty) => ({
      id: warranty.id,
      assetName: warranty.asset.name,
      assetId: warranty.asset.id,
      provider: warranty.provider,
      policyNumber: warranty.policyNumber,
      startsAt: formatDate(warranty.startsAt),
      startsAtInput: formatDateInput(warranty.startsAt),
      expiresAt: formatDate(warranty.expiresAt),
      expiresAtInput: formatDateInput(warranty.expiresAt),
      notes: warranty.notes,
      documents: warranty.documents.map((document) => ({
        id: document.id,
        title: document.title,
        type: document.type,
      })),
    }));
  }, sampleWarranties);
}

export async function getWarranty(id: string): Promise<Result<WarrantyDetail | null>> {
  const warranties = await getWarranties();
  return {
    data: warranties.data.find((warranty) => warranty.id === id) ?? null,
    source: warranties.source,
  };
}

export async function getRecords(): Promise<Result<RecordDetail[]>> {
  return withDatabase(async () => {
    const homeId = await getCurrentHomeId();
    if (!homeId) return sampleRecords;

    const db = getDb();
    const [receipts, documents] = await Promise.all([
      db.receipt.findMany({
        where: { homeId },
        orderBy: { purchaseDate: "desc" },
        include: { asset: true },
      }),
      db.document.findMany({
        where: { homeId },
        orderBy: { createdAt: "desc" },
        include: { asset: true },
      }),
    ]);

    return [
      ...receipts.map((receipt) => ({
        id: receipt.id,
        title: receipt.merchant,
        type: "Receipt" as const,
        secondary: receipt.receiptNumber ?? "Purchase receipt",
        date: formatDate(receipt.purchaseDate),
        linkedAsset: receipt.asset?.name,
        linkedAssetId: receipt.asset?.id,
        amount: formatCurrency(receipt.totalAmountCents),
        notes: receipt.notes,
        merchant: receipt.merchant,
        receiptNumber: receipt.receiptNumber,
        purchaseDateInput: formatDateInput(receipt.purchaseDate),
        totalAmountCents: receipt.totalAmountCents,
        currency: receipt.currency,
      })),
      ...documents.map((document) => ({
        id: document.id,
        title: document.title,
        type: "Document" as const,
        secondary: document.type,
        date: formatDate(document.issuedAt),
        linkedAsset: document.asset?.name,
        linkedAssetId: document.asset?.id,
        fileName: document.fileName,
        notes: document.notes,
        documentType: document.type,
        issuedAtInput: formatDateInput(document.issuedAt),
      })),
    ];
  }, sampleRecords);
}

export async function getReminders(): Promise<Result<ReminderDetail[]>> {
  return withDatabase(async () => {
    const homeId = await getCurrentHomeId();
    const reminders = await getDb().reminder.findMany({
      where: { homeId },
      orderBy: [{ dueAt: "asc" }, { title: "asc" }],
      include: {
        asset: true,
        warranty: { include: { asset: true } },
        task: true,
      },
    });

    return reminders.map((reminder) => ({
      id: reminder.id,
      title: reminder.title,
      dueAt: formatDate(reminder.dueAt) ?? "Unknown date",
      dueAtInput: formatDateInput(reminder.dueAt) ?? "",
      status: reminder.status,
      notes: reminder.notes,
      assetName: reminder.asset?.name,
      assetId: reminder.asset?.id,
      warrantyName: reminder.warranty
        ? `${reminder.warranty.asset.name} warranty`
        : null,
      warrantyId: reminder.warranty?.id,
      taskTitle: reminder.task?.title,
      taskId: reminder.task?.id,
    }));
  }, sampleReminders);
}

export async function getReminder(id: string): Promise<Result<ReminderDetail | null>> {
  const reminders = await getReminders();
  return {
    data: reminders.data.find((reminder) => reminder.id === id) ?? null,
    source: reminders.source,
  };
}

export async function getRecord(id: string): Promise<Result<RecordDetail | null>> {
  const records = await getRecords();
  return {
    data: records.data.find((record) => record.id === id) ?? null,
    source: records.source,
  };
}

export async function getHomeDashboard(): Promise<Result<HomeDashboard>> {
  const [rooms, assets, tasks, warranties, records, reminders] = await Promise.all([
    getRooms(),
    getAssets(),
    getMaintenanceTasks(),
    getWarranties(),
    getRecords(),
    getReminders(),
  ]);

  const nextTask = tasks.data.find((task) => task.status === "ACTIVE") ?? tasks.data[0] ?? null;
  const nextWarranty = warranties.data[0] ?? null;
  const nextReminder =
    reminders.data.find((reminder) => reminder.status === "PENDING") ?? reminders.data[0] ?? null;
  const attentionItems: HomeAttentionItem[] = [
    ...tasks.data
      .filter((task) => task.status === "ACTIVE")
      .map((task) => ({
        id: `maintenance-${task.id}`,
        title: task.title,
        detail: task.nextDueDate ?? "No due date",
        dateInput: task.nextDueDateInput,
        context: "maintenance" as const,
        href: `/maintenance/${task.id}`,
      })),
    ...reminders.data
      .filter((reminder) => reminder.status === "PENDING")
      .map((reminder) => ({
        id: `reminder-${reminder.id}`,
        title: reminder.title,
        detail: reminder.dueAt,
        dateInput: reminder.dueAtInput,
        context: "reminder" as const,
        href: `/maintenance/reminders/${reminder.id}`,
      })),
    ...warranties.data.map((warranty) => ({
      id: `warranty-${warranty.id}`,
      title: `${warranty.assetName} warranty`,
      detail: warranty.expiresAt ?? "No expiry date",
      dateInput: warranty.expiresAtInput,
      context: "warranty" as const,
      href: `/warranties/${warranty.id}`,
    })),
  ]
    .sort((left, right) => (left.dateInput ?? "9999").localeCompare(right.dateInput ?? "9999"))
    .slice(0, 8);

  return {
    data: {
      attentionItems,
      roomCount: rooms.data.length,
      assetCount: assets.data.length,
      assetNames: assets.data.slice(0, 2).map((asset) => asset.name),
      nextTask: nextTask
        ? {
            id: nextTask.id,
            title: nextTask.title,
            nextDueDate: nextTask.nextDueDate,
            nextDueDateInput: nextTask.nextDueDateInput,
          }
        : null,
      nextWarranty: nextWarranty
        ? {
            id: nextWarranty.id,
            assetName: nextWarranty.assetName,
            expiresAt: nextWarranty.expiresAt,
            expiresAtInput: nextWarranty.expiresAtInput,
          }
        : null,
      nextReminder: nextReminder
        ? {
            id: nextReminder.id,
            title: nextReminder.title,
            dueAt: nextReminder.dueAt,
            dueAtInput: nextReminder.dueAtInput,
          }
        : null,
      receiptCount: records.data.filter((record) => record.type === "Receipt").length,
      documentCount: records.data.filter((record) => record.type === "Document").length,
    },
    source:
      [rooms, assets, tasks, warranties, records, reminders].every(
        (result) => result.source === "database",
      )
        ? "database"
        : "sample",
  };
}
