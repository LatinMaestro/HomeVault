import type { ShellField } from "@/components/shell-form";
import type { AssetCategorySummary } from "@/lib/sample-data";

export function getAssetCategoryFields(
  category?: AssetCategorySummary | null,
): ShellField[] {
  return [
    {
      label: "Category name",
      name: "name",
      placeholder: "Appliances",
      defaultValue: category?.name ?? "",
      helperText: "Choose a broad household label that will stay useful over time.",
      recommended: true,
    },
    {
      label: "Description",
      name: "description",
      placeholder: "Kitchen and laundry appliances",
      defaultValue: category?.description ?? "",
      helperText: "Optional context for what belongs in this category.",
      multiline: true,
    },
  ];
}
