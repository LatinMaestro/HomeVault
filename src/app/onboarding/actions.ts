"use server";

import { revalidatePath } from "next/cache";

import { createFirstHousehold } from "@/lib/first-household";
import { getCurrentVerifiedSessionUser } from "@/lib/household-access";

const australianStates = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"] as const;

export type OnboardingActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function getFieldValue(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export async function createFirstHouseholdAction(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const user = await getCurrentVerifiedSessionUser();
  if (!user) {
    return {
      status: "error",
      message: "Your verified session is no longer available. Sign in again before creating a home.",
    };
  }

  const name = getFieldValue(formData, "name");
  const addressLine = getFieldValue(formData, "addressLine");
  const suburb = getFieldValue(formData, "suburb");
  const state = getFieldValue(formData, "state").toUpperCase();
  const postcode = getFieldValue(formData, "postcode");

  if (!name) {
    return { status: "error", message: "Add a household name before continuing." };
  }
  if (name.length > 120) {
    return { status: "error", message: "Keep the household name to 120 characters or fewer." };
  }
  if (state && !australianStates.some((value) => value === state)) {
    return { status: "error", message: "Choose a recognised Australian state or territory." };
  }
  if (postcode && !/^\d{4}$/.test(postcode)) {
    return { status: "error", message: "Use a four-digit Australian postcode or leave it blank." };
  }

  try {
    const result = await createFirstHousehold({
      userId: user.id,
      userName: user.name,
      name,
      addressLine,
      suburb,
      state,
      postcode,
    });

    revalidatePath("/");
    revalidatePath("/account");
    revalidatePath("/settings");

    return {
      status: "success",
      message: result.created
        ? "Your HomeVault household is ready."
        : "Your existing HomeVault household is ready.",
    };
  } catch {
    return {
      status: "error",
      message: "HomeVault could not create the household. Nothing partial was saved. Please try again.",
    };
  }
}
