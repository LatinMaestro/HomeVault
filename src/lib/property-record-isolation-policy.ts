import type { HouseholdAccessRole } from "@/lib/household-access";

export type PropertyScopedRecord = {
  id: string;
  homeId: string;
};

export type PropertyCollectionScopeDecision<T extends PropertyScopedRecord> =
  | {
      status: "scoped";
      records: readonly T[];
    }
  | {
      status: "unavailable";
    };

export type PropertyRecordOperation =
  | "read"
  | "write"
  | "file-read"
  | "file-write";

export type PropertyRecordOperationDecision<T extends PropertyScopedRecord> =
  | {
      status: "operation-allowed";
      record: T;
    }
  | {
      status: "unavailable";
    }
  | {
      status: "write-access-required";
    };

export function decidePropertyCollectionScope<T extends PropertyScopedRecord>({
  selectedHomeId,
  records,
}: {
  selectedHomeId: string;
  records: readonly T[];
}): PropertyCollectionScopeDecision<T> {
  if (!selectedHomeId) {
    return { status: "unavailable" };
  }

  const malformedOrForeignRecord = records.some(
    (record) =>
      !record.id || !record.homeId || record.homeId !== selectedHomeId,
  );

  const duplicateRecord = records.some(
    (record, index) =>
      records.findIndex((candidate) => candidate.id === record.id) !== index,
  );

  if (malformedOrForeignRecord || duplicateRecord) {
    return { status: "unavailable" };
  }

  return { status: "scoped", records };
}

export function decidePropertyRecordOperation<T extends PropertyScopedRecord>({
  selectedHomeId,
  role,
  operation,
  requestedRecordId,
  records,
}: {
  selectedHomeId: string;
  role: HouseholdAccessRole;
  operation: PropertyRecordOperation;
  requestedRecordId: string;
  records: readonly T[];
}): PropertyRecordOperationDecision<T> {
  if (!requestedRecordId) {
    return { status: "unavailable" };
  }

  const scope = decidePropertyCollectionScope({ selectedHomeId, records });

  if (scope.status !== "scoped") {
    return { status: "unavailable" };
  }

  const matches = scope.records.filter(
    (record) => record.id === requestedRecordId,
  );

  if (matches.length !== 1) {
    return { status: "unavailable" };
  }

  const requiresWriteAccess =
    operation === "write" || operation === "file-write";

  if (requiresWriteAccess && role !== "OWNER" && role !== "ADULT") {
    return { status: "write-access-required" };
  }

  return { status: "operation-allowed", record: matches[0] };
}
