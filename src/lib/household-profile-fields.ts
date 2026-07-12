import type { ShellField } from "@/components/shell-form";
import type { HomeProfile } from "@/lib/sample-data";

const stateOptions = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"].map(
  (state) => ({ label: state, value: state }),
);

export function getHouseholdProfileFields(home: HomeProfile): ShellField[] {
  return [
    {
      label: "Household name",
      name: "name",
      defaultValue: home.name,
      placeholder: "Taylor Family Home",
      helperText: "Use a familiar name everyone in the household will recognise.",
      recommended: true,
    },
    {
      label: "Street address",
      name: "addressLine",
      defaultValue: home.addressLine ?? "",
      placeholder: "12 Example Street",
      helperText: "Optional. Keep this limited to the home address.",
    },
    {
      label: "Suburb",
      name: "suburb",
      defaultValue: home.suburb ?? "",
      placeholder: "Carindale",
    },
    {
      label: "State or territory",
      name: "state",
      defaultValue: home.state ?? "",
      options: stateOptions,
      emptyOptionLabel: "Choose a state or territory",
    },
    {
      label: "Postcode",
      name: "postcode",
      defaultValue: home.postcode ?? "",
      placeholder: "4152",
      helperText: "Use the four-digit Australian postcode.",
    },
  ];
}
