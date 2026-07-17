"use server";

import { revalidatePath } from "next/cache";

import { getCurrentHomeId } from "@/lib/current-home";
import { getDb, isPreviewDatabaseEnabled } from "@/lib/db";

export type ServiceProviderActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function getFieldValue(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function getProviderValues(formData: FormData) {
  return {
    name: getFieldValue(formData, "name"),
    trade: getFieldValue(formData, "trade"),
    phone: getFieldValue(formData, "phone"),
    email: getFieldValue(formData, "email"),
    website: getFieldValue(formData, "website"),
    notes: getFieldValue(formData, "notes"),
  };
}

function invalidProviderState(
  values: ReturnType<typeof getProviderValues>,
): ServiceProviderActionState | null {
  if (!values.name) {
    return { status: "error", message: "Add a provider name before saving." };
  }

  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    return {
      status: "error",
      message: "Use a valid email address or leave it blank. Nothing was changed.",
    };
  }

  if (values.website) {
    try {
      const website = new URL(values.website);
      if (!["http:", "https:"].includes(website.protocol)) throw new Error("Unsupported protocol");
    } catch {
      return {
        status: "error",
        message: "Use a complete website address beginning with http:// or https://, or leave it blank. Nothing was changed.",
      };
    }
  }

  return null;
}

function unavailableState(): ServiceProviderActionState {
  return {
    status: "error",
    message: "Saving is not enabled for this preview. The page is still safe to review, but no provider was changed.",
  };
}

function unknownFailureState(): ServiceProviderActionState {
  return {
    status: "error",
    message: "HomeVault could not save this provider. Nothing was changed. Please try again after the database is available.",
  };
}

function revalidateProviderPaths(providerId?: string) {
  revalidatePath("/maintenance");
  revalidatePath("/maintenance/providers");
  if (providerId) {
    revalidatePath(`/maintenance/providers/${providerId}`);
    revalidatePath(`/maintenance/providers/${providerId}/edit`);
  }
}

export async function createServiceProviderAction(
  _previousState: ServiceProviderActionState,
  formData: FormData,
): Promise<ServiceProviderActionState> {
  const values = getProviderValues(formData);
  const invalidState = invalidProviderState(values);
  if (invalidState) return invalidState;
  if (!isPreviewDatabaseEnabled()) return unavailableState();

  try {
    const db = getDb();
    const homeId = await getCurrentHomeId();
    if (!homeId) {
      return {
        status: "error",
        message: "The sample home could not be found in the database. Seed the database before saving providers.",
      };
    }

    const duplicate = await db.serviceProvider.findFirst({
      where: {
        homeId,
        name: { equals: values.name, mode: "insensitive" },
      },
      select: { id: true },
    });
    if (duplicate) {
      return { status: "error", message: "A service provider with this name already exists." };
    }

    const provider = await db.serviceProvider.create({
      data: {
        homeId,
        name: values.name,
        trade: values.trade || null,
        phone: values.phone || null,
        email: values.email || null,
        website: values.website || null,
        notes: values.notes || null,
      },
      select: { id: true },
    });

    revalidateProviderPaths(provider.id);
    return { status: "success", message: "Service provider saved. You can now link it to maintenance tasks." };
  } catch {
    return unknownFailureState();
  }
}

export async function updateServiceProviderAction(
  providerId: string,
  _previousState: ServiceProviderActionState,
  formData: FormData,
): Promise<ServiceProviderActionState> {
  const values = getProviderValues(formData);
  const invalidState = invalidProviderState(values);
  if (invalidState) return invalidState;
  if (!isPreviewDatabaseEnabled()) return unavailableState();

  try {
    const db = getDb();
    const homeId = await getCurrentHomeId();
    if (!homeId) {
      return {
        status: "error",
        message: "The sample home could not be found in the database. Seed the database before saving providers.",
      };
    }

    const provider = await db.serviceProvider.findFirst({
      where: { id: providerId, homeId },
      select: { id: true },
    });
    if (!provider) {
      return {
        status: "error",
        message: "This provider was not found in the configured database. Nothing was changed.",
      };
    }

    const duplicate = await db.serviceProvider.findFirst({
      where: {
        homeId,
        name: { equals: values.name, mode: "insensitive" },
        id: { not: providerId },
      },
      select: { id: true },
    });
    if (duplicate) {
      return { status: "error", message: "Another service provider already uses this name." };
    }

    await db.serviceProvider.update({
      where: { id: providerId },
      data: {
        name: values.name,
        trade: values.trade || null,
        phone: values.phone || null,
        email: values.email || null,
        website: values.website || null,
        notes: values.notes || null,
      },
    });

    revalidateProviderPaths(providerId);
    return { status: "success", message: "Service provider updated. Linked maintenance tasks now reflect this change." };
  } catch {
    return unknownFailureState();
  }
}
