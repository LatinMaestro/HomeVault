"use server";

import { revalidatePath } from "next/cache";

import { getDb } from "@/lib/db";
import { sampleHome } from "@/lib/sample-data";

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

export type MaintenanceActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function getFieldValue(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function getDateValue(value: string) {
  if (!value) return null;

  const normalisedValue = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00`
    : value;
  const date = new Date(normalisedValue);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function getFrequencyValue(value: string): MaintenanceFrequencyValue | null {
  const normalisedValue = value.trim().toUpperCase().replace(/\s+/g, "_");
  return frequencyValues.find((frequency) => frequency === normalisedValue) ?? null;
}

async function getCurrentHomeId() {
  const db = getDb();
  const home = await db.home.findFirst({
    where: { name: sampleHome.name },
    select: { id: true },
  });

  return home?.id ?? null;
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

function unavailableState(): MaintenanceActionState {
  return {
    status: "error",
    message: "Saving needs a configured database. The page is still safe to review, but no maintenance task was changed.",
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
    nextDueDate: getDateValue(getFieldValue(formData, "nextDueDate")),
    assetName: getFieldValue(formData, "assetName"),
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
  if (!frequency) return invalidTaskState(values) ?? unknownFailureState();

  if (!process.env.DATABASE_URL) {
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

    const assetId = await getAssetId(homeId, values.assetName);

    await db.maintenanceTask.create({
      data: {
        homeId,
        assetId,
        title: values.title,
        description: values.description || null,
        frequency,
        nextDueDate: values.nextDueDate,
      },
    });

    revalidatePath("/");
    revalidatePath("/maintenance");
    if (assetId) revalidatePath(`/vault/assets/${assetId}`);

    return {
      status: "success",
      message: values.assetName && !assetId
        ? "Maintenance task saved. The asset name did not match an existing asset, so it was left unlinked."
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
  if (!frequency) return invalidTaskState(values) ?? unknownFailureState();

  if (!process.env.DATABASE_URL) {
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
      select: { id: true },
    });

    if (!task) {
      return {
        status: "error",
        message: "This maintenance task was not found in the configured database. Nothing was changed.",
      };
    }

    const assetId = await getAssetId(homeId, values.assetName);

    await db.maintenanceTask.update({
      where: { id: taskId },
      data: {
        assetId,
        title: values.title,
        description: values.description || null,
        frequency,
        nextDueDate: values.nextDueDate,
      },
    });

    revalidatePath("/");
    revalidatePath("/maintenance");
    revalidatePath(`/maintenance/${taskId}`);
    revalidatePath(`/maintenance/${taskId}/edit`);
    if (assetId) revalidatePath(`/vault/assets/${assetId}`);

    return {
      status: "success",
      message: values.assetName && !assetId
        ? "Maintenance task updated. The asset name did not match an existing asset, so it was left unlinked."
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
  const completedAt = getDateValue(getFieldValue(formData, "completedAt"));
  const completedBy = getFieldValue(formData, "completedBy");
  const notes = getFieldValue(formData, "notes");

  if (completedAt === undefined) {
    return {
      status: "error",
      message: "Use a readable completion date, such as 2026-09-01. Nothing was changed.",
    };
  }

  if (!process.env.DATABASE_URL) {
    return {
      status: "error",
      message: "Completion saving needs a configured database. Nothing was changed.",
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
      select: { id: true, assetId: true },
    });

    if (!task) {
      return {
        status: "error",
        message: "This maintenance task was not found in the configured database. Nothing was changed.",
      };
    }

    await db.maintenanceCompletion.create({
      data: {
        taskId: task.id,
        assetId: task.assetId,
        completedAt: completedAt ?? new Date(),
        completedBy: completedBy || null,
        notes: notes || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/maintenance");
    revalidatePath(`/maintenance/${taskId}`);
    if (task.assetId) revalidatePath(`/vault/assets/${task.assetId}`);

    return { status: "success", message: "Completion recorded. The task history now includes this service note." };
  } catch {
    return unknownFailureState();
  }
}