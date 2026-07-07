export type DataSource = "database" | "sample";

export type RoomSummary = {
  id: string;
  name: string;
  floor?: string | null;
  notes?: string | null;
  assetCount: number;
};

export type AssetSummary = {
  id: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  status: string;
  roomName?: string | null;
  categoryName?: string | null;
  purchaseDate?: string | null;
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
};

export type MaintenanceTaskSummary = {
  id: string;
  title: string;
  description?: string | null;
  frequency: string;
  nextDueDate?: string | null;
  status: string;
  assetName?: string | null;
};

export type MaintenanceTaskDetail = MaintenanceTaskSummary & {
  serviceProviderName?: string | null;
  completions: Array<{
    id: string;
    completedAt: string;
    completedBy?: string | null;
    notes?: string | null;
  }>;
};

export type WarrantySummary = {
  id: string;
  assetName: string;
  provider?: string | null;
  policyNumber?: string | null;
  expiresAt?: string | null;
};

export type WarrantyDetail = WarrantySummary & {
  startsAt?: string | null;
  notes?: string | null;
  documents: Array<{
    id: string;
    title: string;
    type: string;
  }>;
};

export type RecordSummary = {
  id: string;
  title: string;
  type: "Receipt" | "Document";
  secondary: string;
  date?: string | null;
  linkedAsset?: string | null;
};

export type RecordDetail = RecordSummary & {
  notes?: string | null;
  fileName?: string | null;
  amount?: string | null;
};

export const sampleHome = {
  id: "sample-home",
  name: "Taylor Family Home",
  location: "Carindale, QLD",
};

export const sampleRooms: RoomSummary[] = [
  { id: "room-kitchen", name: "Kitchen", floor: "Ground", assetCount: 1 },
  { id: "room-laundry", name: "Laundry", floor: "Ground", assetCount: 0 },
  { id: "room-garage", name: "Garage", floor: "Ground", assetCount: 1 },
  { id: "room-backyard", name: "Backyard", floor: "Ground", assetCount: 0 },
];

export const sampleAssets: AssetDetail[] = [
  {
    id: "asset-fridge",
    name: "French door fridge",
    brand: "Fisher & Paykel",
    model: "RF605QDUVX1",
    serialNumber: "Sample only",
    status: "ACTIVE",
    roomName: "Kitchen",
    categoryName: "Appliances",
    purchaseDate: "14 Mar 2024",
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
  },
  {
    id: "asset-mower",
    name: "Battery lawn mower",
    brand: "Ryobi",
    model: null,
    status: "ACTIVE",
    roomName: "Garage",
    categoryName: "Outdoor Equipment",
    purchaseDate: "2 Sep 2023",
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
  },
];

export const sampleMaintenanceTasks: MaintenanceTaskDetail[] = [
  {
    id: "task-aircon-filters",
    title: "Clean air conditioner filters",
    description: "Rinse and dry split-system filters before reinstalling.",
    frequency: "QUARTERLY",
    nextDueDate: "1 Sep 2026",
    status: "ACTIVE",
    serviceProviderName: "Brisbane Home Electrical",
    completions: [],
  },
  {
    id: "task-mower-service",
    title: "Service lawn mower",
    description: "Check blades, battery contacts and mower deck.",
    frequency: "SIX_MONTHLY",
    nextDueDate: "15 Oct 2026",
    status: "ACTIVE",
    assetName: "Battery lawn mower",
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
    provider: "Fisher & Paykel",
    startsAt: "14 Mar 2024",
    expiresAt: "14 Mar 2026",
    notes: "Sample manufacturer warranty.",
    documents: [],
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
    amount: "$2,899.00",
    notes: "Receipt metadata only. No file upload is connected.",
  },
  {
    id: "receipt-mower",
    title: "Bunnings Cannon Hill",
    type: "Receipt",
    secondary: "Lawn mower purchase receipt",
    date: "2 Sep 2023",
    linkedAsset: "Battery lawn mower",
    amount: "$649.00",
    notes: "Receipt metadata only. No file upload is connected.",
  },
  {
    id: "document-fridge-manual",
    title: "Fridge manual",
    type: "Document",
    secondary: "MANUAL",
    linkedAsset: "French door fridge",
    fileName: "fisher-paykel-fridge-manual.pdf",
    notes: "Document metadata only. Storage will be approved in a later phase.",
  },
  {
    id: "document-aircon-service",
    title: "Air conditioner service note",
    type: "Document",
    secondary: "SERVICE_RECORD",
    date: "1 Mar 2026",
    notes: "Sample service record metadata.",
  },
];
