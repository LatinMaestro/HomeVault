export type InventoryExportAsset = {
  name: string;
  categoryName?: string | null;
  roomName?: string | null;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  status?: string | null;
  purchaseDate?: string | null;
  purchasePlace?: string | null;
  warranties: unknown[];
  receipts: unknown[];
  documents: unknown[];
};

function spreadsheetSafe(value: string) {
  return /^\s*[=+\-@]/.test(value) ? `'${value}` : value;
}

function cell(value: string | number | null | undefined) {
  const safeValue = spreadsheetSafe(value === null || value === undefined ? "" : String(value));
  return `"${safeValue.replaceAll('"', '""')}"`;
}

export function buildInventoryCsv(assets: InventoryExportAsset[]) {
  const rows = [
    [
      "Asset",
      "Category",
      "Room",
      "Brand",
      "Model",
      "Serial number",
      "Status",
      "Purchase date",
      "Purchase place",
      "Warranties",
      "Receipts",
      "Documents",
    ],
    ...assets.map((asset) => [
      asset.name,
      asset.categoryName,
      asset.roomName,
      asset.brand,
      asset.model,
      asset.serialNumber,
      asset.status,
      asset.purchaseDate,
      asset.purchasePlace,
      asset.warranties.length,
      asset.receipts.length,
      asset.documents.length,
    ]),
  ];

  return `${rows.map((row) => row.map((value) => cell(value)).join(",")).join("\r\n")}\r\n`;
}
