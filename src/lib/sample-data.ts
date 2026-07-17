export type DataSource = "database" | "sample";

export type HomeProfile = {
  id: string;
  name: string;
  addressLine: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  country: string;
};

export type RoomSummary = {
  id: string;
  name: string;
  floor?: string | null;
  notes?: string | null;
  assetCount: number;
};

export type RoomDetail = RoomSummary & {
  assets: Array<{
    id: string;
    name: string;
    brand?: string | null;
    status: string;
  }>;
  maintenanceTasks: Array<{
    id: string;
    title: string;
    status: string;
    nextDueDate?: string | null;
  }>;
};

export type AssetCategorySummary = {
  id: string;
  name: string;
  description?: string | null;
};

export type AssetCategoryDetail = AssetCategorySummary & {
  assets: Array<{
    id: string;
    name: string;
    brand?: string | null;
    status: string;
    roomName?: string | null;
  }>;
};

export type AssetSummary = {
  id: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  status: string;
  roomId?: string | null;
  roomName?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  purchaseDate?: string | null;
  purchaseDateInput?: string | null;
};

export type AssetDetail = AssetSummary & {
  serialNumber?: string | null;
  purchasePlace?: string | null;
  notes?: string | null;
  warranties: Array<{
    id: string;
    provider?: string | null;
    expiresAt?: string | null;
  }>;
  receipts: Array<{
    id: string;
    merchant: string;
    purchaseDate?: string | null;
    totalAmount?: string | null;
  }>;
  documents: Array<{
    id: string;
    title: string;
    type: string;
  }>;
  maintenanceTasks: Array<{
    id: string;
    title: string;
    status: string;
    nextDueDate?: string | null;
  }>;
  reminders: Array<{
    id: string;
    title: string;
    status: string;
    dueAt: string;
  }>;
};

export type ServiceProviderSummary = {
  id: string;
  name: string;
  trade?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  notes?: string | null;
};

export type ServiceProviderDetail = ServiceProviderSummary & {
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    nextDueDate?: string | null;
  }>;
};

export type MaintenanceTaskSummary = {
  id: string;
  title: string;
  description?: string | null;
  frequency: string;
  customIntervalDays?: number | null;
  nextDueDate?: string | null;
  nextDueDateInput?: string | null;
  status: string;
  assetName?: string | null;
  assetId?: string | null;
};

export type MaintenanceTaskDetail = MaintenanceTaskSummary & {
  serviceProviderName?: string | null;
  serviceProviderId?: string | null;
  completions: Array<{
    id: string;
    completedAt: string;
    completedBy?: string | null;
    notes?: string | null;
  }>;
};

export type ReminderDetail = {
  id: string;
  title: string;
  dueAt: string;
  dueAtInput: string;
  status: string;
  notes?: string | null;
  assetName?: string | null;
  assetId?: string | null;
  warrantyName?: string | null;
  warrantyId?: string | null;
  taskTitle?: string | null;
  taskId?: string | null;
};

export type WarrantySummary = {
  id: string;
  assetName: string;
  assetId: string;
  provider?: string | null;
  policyNumber?: string | null;
  expiresAt?: string | null;
};

export type WarrantyDetail = WarrantySummary & {
  startsAt?: string | null;
  startsAtInput?: string | null;
  expiresAtInput?: string | null;
  notes?: string | null;
  documents: Array<{
    id: string;
    title: string;
    type: string;
  }>;
  reminders: Array<{
    id: string;
    title: string;
    status: string;
    dueAt: string;
  }>;
};

export type RecordSummary = {
  id: string;
  title: string;
  type: "Receipt" | "Document";
  secondary: string;
  date?: string | null;
  linkedAsset?: string | null;
  linkedAssetId?: string | null;
};

export type RecordDetail = RecordSummary & {
  notes?: string | null;
  fileName?: string | null;
  amount?: string | null;
  merchant?: string | null;
  receiptNumber?: string | null;
  purchaseDateInput?: string | null;
  totalAmountCents?: number | null;
  currency?: string | null;
  documentType?: string | null;
  issuedAtInput?: string | null;
  linkedWarranty?: string | null;
  linkedWarrantyId?: string | null;
  linkedReceipt?: string | null;
  linkedReceiptId?: string | null;
  linkedMaintenanceTask?: string | null;
  linkedMaintenanceTaskId?: string | null;
  relatedDocuments?: Array<{
    id: string;
    title: string;
    type: string;
  }>;
};

export const sampleHome: HomeProfile & { location: string } = {
  id: "sample-home",
  name: "Taylor Family Home",
  addressLine: null,
  suburb: "Carindale",
  state: "QLD",
  postcode: "4152",
  country: "Australia",
  location: "Carindale, QLD",
};

export const sampleRooms: RoomSummary[] = [
  { id: "room-kitchen", name: "Kitchen", floor: "Ground", assetCount: 1 },
  { id: "room-laundry", name: "Laundry", floor: "Ground", assetCount: 0 },
  { id: "room-garage", name: "Garage", floor: "Ground", assetCount: 1 },
  { id: "room-backyard", name: "Backyard", floor: "Ground", assetCount: 0 },
];

export const sampleAssetCategories: AssetCategorySummary[] = [
  {
    id: "category-appliances",
    name: "Appliances",
    description: "Kitchen and laundry appliances",
  },
  {
    id: "category-outdoor-equipment",
    name: "Outdoor Equipment",
    description: "Garden and backyard equipment",
  },
];

export const sampleAssets: AssetDetail[] = [
  {
    id: "asset-fridge",
    name: "French door fridge",
    brand: "Fisher & Paykel",
    model: "RF605QDUVX1",
    serialNumber: "Sample only",
    status: "ACTIVE",
    roomId: "room-kitchen",
    roomName: "Kitchen",
    categoryId: "category-appliances",
    categoryName: "Appliances",
    purchaseDate: "14 Mar 2024",
    purchaseDateInput: "2024-03-14",
    purchasePlace: "The Good Guys Mount Gravatt",
    notes: "Seed/sample asset used for Phase 1C screen review.",
    warranties: [{ id: "warranty-fridge", provider: "Fisher & Paykel", expiresAt: "14 Mar 2026" }],
    receipts: [
      {
        id: "receipt-fridge",
        merchant: "The Good Guys Mount Gravatt",
        purchaseDate: "14 Mar 2024",
        totalAmount: "$2,899.00",
      },
    ],
    documents: [{ id: "document-fridge-manual", title: "Fridge manual", type: "MANUAL" }],
    maintenanceTasks: [],
    reminders: [
      {
        id: "reminder-fridge-warranty",
        title: "Review fridge warranty",
        status: "PENDING",
        dueAt: "14 Feb 2026",
      },
    ],
  },
  {
    id: "asset-mower",
    name: "Battery lawn mower",
    brand: "Ryobi",
    model: null,
    status: "ACTIVE",
    roomId: "room-garage",
    roomName: "Garage",
    categoryId: "category-outdoor-equipment",
    categoryName: "Outdoor Equipment",
    purchaseDate: "2 Sep 2023",
    purchaseDateInput: "2023-09-02",
    purchasePlace: "Bunnings Cannon Hill",
    notes: "Sample outdoor equipment record.",
    warranties: [],
    receipts: [
      {
        id: "receipt-mower",
        merchant: "Bunnings Cannon Hill",
        purchaseDate: "2 Sep 2023",
        totalAmount: "$649.00",
      },
    ],
    documents: [],
    maintenanceTasks: [
      {
        id: "task-mower-service",
        title: "Service lawn mower",
        status: "ACTIVE",
        nextDueDate: "15 Oct 2026",
      },
    ],
    reminders: [],
  },
];

export const sampleServiceProviders: ServiceProviderDetail[] = [
  {
    id: "provider-brisbane-home-electrical",
    name: "Brisbane Home Electrical",
    trade: "Electrician",
    phone: "07 3000 0000",
    notes: "Sample local service provider for seed data.",
    tasks: [
      {
        id: "task-aircon-filters",
        title: "Clean air conditioner filters",
        status: "ACTIVE",
        nextDueDate: "1 Sep 2026",
      },
    ],
  },
  {
    id: "provider-southside-appliance-care",
    name: "Southside Appliance Care",
    trade: "Appliance repair",
    phone: "07 3000 1111",
    tasks: [],
  },
];

export const sampleMaintenanceTasks: MaintenanceTaskDetail[] = [
  {
    id: "task-aircon-filters",
    title: "Clean air conditioner filters",
    description: "Rinse and dry split-system filters before reinstalling.",
    frequency: "QUARTERLY",
    nextDueDate: "1 Sep 2026",
    nextDueDateInput: "2026-09-01",
    status: "ACTIVE",
    serviceProviderName: "Brisbane Home Electrical",
    serviceProviderId: "provider-brisbane-home-electrical",
    completions: [],
  },
  {
    id: "task-mower-service",
    title: "Service lawn mower",
    description: "Check blades, battery contacts and mower deck.",
    frequency: "SIX_MONTHLY",
    nextDueDate: "15 Oct 2026",
    nextDueDateInput: "2026-10-15",
    status: "ACTIVE",
    assetName: "Battery lawn mower",
    assetId: "asset-mower",
    completions: [
      {
        id: "completion-mower-april",
        completedAt: "15 Apr 2026",
        completedBy: "Sam",
        notes: "Cleaned deck and checked blade condition.",
      },
    ],
  },
];

export const sampleWarranties: WarrantyDetail[] = [
  {
    id: "warranty-fridge",
    assetName: "French door fridge",
    assetId: "asset-fridge",
    provider: "Fisher & Paykel",
    startsAt: "14 Mar 2024",
    startsAtInput: "2024-03-14",
    expiresAt: "14 Mar 2026",
    expiresAtInput: "2026-03-14",
    notes: "Sample manufacturer warranty.",
    documents: [],
    reminders: [
      {
        id: "reminder-fridge-warranty",
        title: "Review fridge warranty",
        status: "PENDING",
        dueAt: "14 Feb 2026",
      },
    ],
  },
];

export const sampleRecords: RecordDetail[] = [
  {
    id: "receipt-fridge",
    title: "The Good Guys Mount Gravatt",
    type: "Receipt",
    secondary: "Fridge purchase receipt",
    date: "14 Mar 2024",
    linkedAsset: "French door fridge",
    linkedAssetId: "asset-fridge",
    amount: "$2,899.00",
    merchant: "The Good Guys Mount Gravatt",
    purchaseDateInput: "2024-03-14",
    totalAmountCents: 289900,
    currency: "AUD",
    notes: "Receipt metadata only. No file upload is connected.",
  },
  {
    id: "receipt-mower",
    title: "Bunnings Cannon Hill",
    type: "Receipt",
    secondary: "Lawn mower purchase receipt",
    date: "2 Sep 2023",
    linkedAsset: "Battery lawn mower",
    linkedAssetId: "asset-mower",
    amount: "$649.00",
    merchant: "Bunnings Cannon Hill",
    purchaseDateInput: "2023-09-02",
    totalAmountCents: 64900,
    currency: "AUD",
    notes: "Receipt metadata only. No file upload is connected.",
  },
  {
    id: "document-fridge-manual",
    title: "Fridge manual",
    type: "Document",
    secondary: "MANUAL",
    linkedAsset: "French door fridge",
    linkedAssetId: "asset-fridge",
    fileName: "fisher-paykel-fridge-manual.pdf",
    documentType: "MANUAL",
    notes: "Document metadata only. Storage will be approved in a later phase.",
  },
  {
    id: "document-aircon-service",
    title: "Air conditioner service note",
    type: "Document",
    secondary: "SERVICE_RECORD",
    date: "1 Mar 2026",
    documentType: "SERVICE_RECORD",
    issuedAtInput: "2026-03-01",
    linkedMaintenanceTask: "Clean air conditioner filters",
    linkedMaintenanceTaskId: "task-aircon-filters",
    notes: "Sample service record metadata.",
  },
];


export const sampleReminders: ReminderDetail[] = [
  {
    id: "reminder-fridge-warranty",
    title: "Review fridge warranty",
    dueAt: "14 Feb 2026",
    dueAtInput: "2026-02-14",
    status: "PENDING",
    notes: "Check warranty coverage before expiry.",
    assetName: "French door fridge",
    assetId: "asset-fridge",
    warrantyName: "French door fridge warranty",
    warrantyId: "warranty-fridge",
  },
  {
    id: "reminder-aircon-filters",
    title: "Air conditioner filter clean due",
    dueAt: "1 Sep 2026",
    dueAtInput: "2026-09-01",
    status: "PENDING",
    taskTitle: "Clean air conditioner filters",
    taskId: "task-aircon-filters",
  },
];
