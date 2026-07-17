"use server";

import { revalidatePath } from "next/cache";

import { isAfterBrisbaneToday } from "@/lib/date-status";
import { getCurrentHomeId } from "@/lib/current-home";
import { getDb, isPreviewDatabaseEnabled } from "@/lib/db";
import { getOptionalDateValue } from "@/lib/form-values";
import { getMaintenanceScheduleAfterCompletion } from "@/lib/maintenance-schedule";

const frequencyValues = [
  "ONCE",
  "WEEKLY",
  "FORTNIGHTLY",
  "MONTHLY",
  "QUARTERLY",
  "SIX_MONTHLY",
  "YEARLY",
  "CUSTOM",
] as const;

type MaintenanceFrequencyValue = (typeof frequencyValues)[number];

const maintenanceStatusValues = ["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"] as const;
type MaintenanceStatusValue = (typeof maintenanceStatusValues)[number];

export type MaintenanceActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function getFieldValue(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalPositiveInteger(value: string) {
  if (!value) return null;

  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue >= 1 && parsedValue <= 3650
    ? parsedValue
    : undefined;
}

function getFrequencyValue(value: string): MaintenanceFrequencyValue | null {
  const normalisedValue = value.trim().toUpperCase().replace(/\s+/g, "_");
  return frequencyValues.find((frequency) => frequency === normalisedValue) ?? null;
}

function getStatusValue(value: string): MaintenanceStatusValue | null {
  return maintenanceStatusValues.find((status) => status === value.trim().toUpperCase()) ?? null;
}

async function getAssetId(homeId: string, assetName: string) {
  if (!assetName) return null;

  const asset = await getDb().asset.findFirst({
    where: {
      homeId,
      name: { equals: assetName, mode: "insensitive" },
    },
    select: { id: true },
  });

  return asset?.id ?? null;
}

async function getServiceProviderId(homeId: string, providerName: string) {
  if (!providerName) return null;

  const provider = await getDb().serviceProvider.findFirst({
    where: {
      homeId,
      name: { equals: providerName, mode: "insensitive" },
    },
    select: { id: true },
  });

  return provider?.id ?? null;
}

function getLinkWarning(
  assetName: string,
  assetId: string | null,
  providerName: string,
  serviceProviderId: string | null,
) {
  const missingLinks = [
    assetName && !assetId ? "asset" : null,
    providerName && !serviceProviderId ? "service provider" : null,
  ].filter((value): value is string => Boolean(value));

  if (missingLinks.length === 0) return null;

  return `The selected ${missingLinks.join(" and ")} could not be matched, so ${
    missingLinks.length === 1 ? "it was" : "they were"
  } left unlinked.`;
}

function unavailableState(): MaintenanceActionState {
  return {
    status: "error",
    message: "Saving is not enabled for this preview. The page is still safe to review, but no maintenance task was changed.",
  };
}

function unknownFailureState(): MaintenanceActionState {
  return {
    status: "error",
    message: "HomeVault could not save this maintenance change. Nothing was changed. Please try again after the database is available.",
  };
}

function getTaskValues(formData: FormData) {
  return {
    title: getFieldValue(formData, "title"),
    description: getFieldValue(formData, "description"),
    frequency: getFrequencyValue(getFieldValue(formData, "frequency")),
    customIntervalDays: getOptionalPositiveInteger(getFieldValue(formData, "customIntervalDays")),
    nextDueDate: getOptionalDateValue(getFieldValue(formData, "nextDueDate")),
    status: getStatusValue(getFieldValue(formData, "status")),
    assetName: getFieldValue(formData, "assetName"),
    serviceProviderName: getFieldValue(formData, "serviceProviderName"),
  };
}

function invalidTaskState(values: ReturnType<typeof getTaskValues>): MaintenanceActionState | null {
  if (!values.title) {
    return { status: "error", message: "Add a task title before saving." };
  }

  if (!values.frequency) {
    return {
      status: "error",
      message: "Choose a recognised frequency such as MONTHLY, QUARTERLY, SIX_MONTHLY or YEARLY.",
    };
  }

  if (values.frequency === "CUSTOM") {
    if (values.customIntervalDays === undefined) {
      return {
        status: "error",
        message: "Use a whole custom interval from 1 to 3650 days. Nothing was changed.",
      };
    }

    if (values.customIntervalDays === null) {
      return {
        status: "error",
        message: "Add a custom interval in days when frequency is Custom.",
      };
    }
  }

  if (!values.status) {
    return {
      status: "error",
      message: "Choose a recognised task status before saving.",
    };
  }

  if (values.nextDueDate === undefined) {
    return {
      status: "error",
      message: "Use a readable next due date, such as 2026-09-01. Nothing was changed.",
    };
  }

  return null;
}

export async function createMaintenanceTaskAction(
  _previousState: MaintenanceActionState,
  formData: FormData,
): Promise<MaintenanceActionState> {
  const values = getTaskValues(formData);
  const invalidState = invalidTaskState(values);
  if (invalidState) return invalidState;

  const frequency = values.frequency;
  const status = values.status;
  if (!frequency || !status) return invalidTaskState(values) ?? unknownFailureState();

  if (!isPreviewDatabaseEnabled()) {
    return unavailableState();
  }

  try {
    const db = getDb();
    const homeId = await getCurrentHomeId();

    if (!homeId) {
      return {
        status: "error",
        message: "The sample home could not be found in the database. Seed the database before saving maintenance tasks.",
      };
    }

    const [assetId, serviceProviderId] = await Promise.all([
      getAssetId(homeId, values.assetName),
      getServiceProviderId(homeId, values.serviceProviderName),
    ]);
    const linkWarning = getLinkWarning(
      values.assetName,
      assetId,
      values.serviceProviderName,
      serviceProviderId,
    );

    await db.maintenanceTask.create({
      data: {
        homeId,
        assetId,
        serviceProviderId,
        title: values.title,
        description: values.description || null,
        frequency,
        customIntervalDays: frequency === "CUSTOM" ? values.customIntervalDays : null,
        nextDueDate: values.nextDueDate,
        status,
      },
    });

    revalidatePath("/");
    revalidatePath("/maintenance");
    if (assetId) revalidatePath(`/vault/assets/${assetId}`);

    return {
      status: "success",
      message: linkWarning
        ? `Maintenance task saved. ${linkWarning}`
        : "Maintenance task saved. You can now find it in the maintenance list.",
    };
  } catch {
    return unknownFailureState();
  }
}

export async function updateMaintenanceTaskAction(
  taskId: string,
  _previousState: MaintenanceActionState,
  formData: FormData,
): Promise<MaintenanceActionState> {
  const values = getTaskValues(formData);
  const invalidState = invalidTaskState(values);
  if (invalidState) return invalidState;

  const frequency = values.frequency;
  const status = values.status;
  if (!frequency || !status) return invalidTaskState(values) ?? unknownFailureState();

  if (!isPreviewDatabaseEnabled()) {
    return unavailableState();
  }

  try {
    const db = getDb();
    const homeId = await getCurrentHomeId();

    if (!homeId) {
      return {
        status: "error",
        message: "The sample home could not be found in the database. Seed the database before saving maintenance tasks.",
      };
    }

    const task = await db.maintenanceTask.findFirst({
      where: { id: taskId, homeId },
      select: { id: true, assetId: true },
    });

    if (!task) {
      return {
        status: "error",
        message: "This maintenance task was not found in the configured database. Nothing was changed.",
      };
    }

    const [assetId, serviceProviderId] = await Promise.all([
      getAssetId(homeId, values.assetName),
      getServiceProviderId(homeId, values.serviceProviderName),
    ]);
    const linkWarning = getLinkWarning(
      values.assetName,
      assetId,
      values.serviceProviderName,
      serviceProviderId,
    );

    await db.maintenanceTask.update({
      where: { id: taskId },
      data: {
        assetId,
        serviceProviderId,
        title: values.title,
        description: values.description || null,
        frequency,
        customIntervalDays: frequency === "CUSTOM" ? values.customIntervalDays : null,
        nextDueDate: values.nextDueDate,
        status,
      },
    });

    revalidatePath("/");
    revalidatePath("/maintenance");
    revalidatePath(`/maintenance/${taskId}`);
    revalidatePath(`/maintenance/${taskId}/edit`);
    if (task.assetId) revalidatePath(`/vault/assets/${task.assetId}`);
    if (assetId) revalidatePath(`/vault/assets/${assetId}`);

    return {
      status: "success",
      message: linkWarning
        ? `Maintenance task updated. ${linkWarning}`
        : "Maintenance task updated. The maintenance list now reflects this change.",
    };
  } catch {
    return unknownFailureState();
  }
}

export async function completeMaintenanceTaskAction(
  taskId: string,
  _previousState: MaintenanceActionState,
  formData: FormData,
): Promise<MaintenanceActionState> {
  const completedAt = getOptionalDateValue(getFieldValue(formData, "completedAt"));
  const completedBy = getFieldValue(formData, "completedBy");
  const notes = getFieldValue(formData, "notes");

  if (completedAt === undefined) {
    return {
      status: "error",
      message: "Use a readable completion date, such as 2026-09-01. Nothing was changed.",
    };
  }

  if (completedAt && isAfterBrisbaneToday(completedAt)) {
    return {
      status: "error",
      message: "A completion date cannot be in the future. Nothing was changed.",
    };
  }

  if (!isPreviewDatabaseEnabled()) {
    return {
      status: "error",
      message: "Completion saving is not enabled for this preview. Nothing was changed.",
    };
  }

  try {
    const db = getDb();
    const homeId = await getCurrentHomeId();

    if (!homeId) {
      return {
        status: "error",
        message: "The sample home could not be found in the database. Seed the database before completing tasks.",
      };
    }

    const task = await db.maintenanceTask.findFirst({
      where: { id: taskId, homeId },
      select: {
        id: true,
        assetId: true,
        frequency: true,
        customIntervalDays: true,
        nextDueDate: true,
        status: true,
      },
    });

    if (!task) {
      return {
        status: "error",
        message: "This maintenance task was not found in the configured database. Nothing was changed.",
      };
    }

    if (task.status === "ARCHIVED" || task.status === "COMPLETED") {
      return {
        status: "error",
        message: "Reactivate this task before recording another completion. Nothing was changed.",
      };
    }

    const recordedAt = completedAt ?? new Date();
    const schedule = getMaintenanceScheduleAfterCompletion({
      frequency: task.frequency,
      customIntervalDays: task.customIntervalDays,
      completedAt: recordedAt,
      nextDueDate: task.nextDueDate,
    });

    await db.$transaction(async (transaction) => {
      await transaction.maintenanceCompletion.create({
        data: {
          taskId: task.id,
          assetId: task.assetId,
          completedAt: recordedAt,
          completedBy: completedBy || null,
          notes: notes || null,
        },
      });

      if (schedule.kind !== "unchanged") {
        await transaction.maintenanceTask.update({
          where: { id: task.id },
          data: {
            nextDueDate: schedule.nextDueDate,
            ...(schedule.status ? { status: schedule.status } : {}),
          },
        });
      }
    });

    revalidatePath("/");
    revalidatePath("/maintenance");
    revalidatePath(`/maintenance/${taskId}`);
    if (task.assetId) revalidatePath(`/vault/assets/${task.assetId}`);

    if (schedule.kind === "completed") {
      return {
        status: "success",
        message: "Completion recorded. This one-off task is now complete.",
      };
    }

    if (schedule.kind === "advanced") {
      return {
        status: "success",
        message: "Completion recorded. The next due date was advanced automatically.",
      };
    }

    return {
      status: "success",
      message: "Completion recorded. Add a valid custom interval to advance the next due date automatically.",
    };
  } catch {
    return unknownFailureState();
  }
}
