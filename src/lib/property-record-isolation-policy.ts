import type { HouseholdAccessRole } from "@/lib/household-access";

export type PropertyScopedRecord = {
  id: string;
  homeId: string;
};

export type PropertyCollectionScopeDecision<T extends PropertyScopedRecord> =
  | {
      status: "scoped";
      homeId: string;
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

export type PropertyAccessEvidence = {
  currentUserId: string;
  identityVerified: boolean;
  selectedHomeId: string;
  membershipId: string;
  membershipUserId: string;
  membershipHomeId: string;
  role: HouseholdAccessRole;
};

export type PropertyRecordOperationDecision<T extends PropertyScopedRecord> =
  | {
      status: "operation-allowed";
      userId: string;
      homeId: string;
      membershipId: string;
      role: HouseholdAccessRole;
      operation: PropertyRecordOperation;
      record: T;
    }
  | {
      status: "unavailable";
    }
  | {
      status: "write-access-required";
    };

const HOUSEHOLD_ACCESS_ROLES = new Set<HouseholdAccessRole>([
  "OWNER",
  "ADULT",
  "CHILD",
  "GUEST",
]);

const RECORD_OPERATIONS = new Set<PropertyRecordOperation>([
  "read",
  "write",
  "file-read",
  "file-write",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCanonicalIdentifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 128 &&
    value.trim() === value
  );
}

function isValidScopedRecord<T extends PropertyScopedRecord>(
  value: unknown,
  selectedHomeId: string,
): value is T {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isCanonicalIdentifier(value.id) &&
    isCanonicalIdentifier(value.homeId) &&
    value.homeId === selectedHomeId
  );
}

function isValidAccessEvidence(
  value: unknown,
): value is PropertyAccessEvidence {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isCanonicalIdentifier(value.currentUserId) &&
    value.identityVerified === true &&
    isCanonicalIdentifier(value.selectedHomeId) &&
    isCanonicalIdentifier(value.membershipId) &&
    isCanonicalIdentifier(value.membershipUserId) &&
    isCanonicalIdentifier(value.membershipHomeId) &&
    value.membershipUserId === value.currentUserId &&
    value.membershipHomeId === value.selectedHomeId &&
    typeof value.role === "string" &&
    HOUSEHOLD_ACCESS_ROLES.has(value.role as HouseholdAccessRole)
  );
}

export function decidePropertyCollectionScope<T extends PropertyScopedRecord>(
  input: {
    selectedHomeId: string;
    records: readonly T[];
  },
): PropertyCollectionScopeDecision<T> {
  try {
    if (!isRecord(input)) {
    return { status: "unavailable" };
  }

  const { selectedHomeId, records } = input;

  if (
    !isCanonicalIdentifier(selectedHomeId) ||
    !Array.isArray(records) ||
    records.length > 10_000 ||
    !Array.from(records).every((record) =>
      isValidScopedRecord<T>(record, selectedHomeId),
    )
  ) {
    return { status: "unavailable" };
  }

  const recordIds = new Set<string>();

  for (const record of records) {
    if (recordIds.has(record.id)) {
      return { status: "unavailable" };
    }
    recordIds.add(record.id);
  }

    return { status: "scoped", homeId: selectedHomeId, records };
  } catch {
    return { status: "unavailable" };
  }
}

export function decidePropertyRecordOperation<T extends PropertyScopedRecord>(
  input: {
    access: PropertyAccessEvidence;
    operation: PropertyRecordOperation;
    requestedRecordId: string;
    records: readonly T[];
  },
): PropertyRecordOperationDecision<T> {
  try {
    if (!isRecord(input)) {
    return { status: "unavailable" };
  }

  const { access, operation, requestedRecordId, records } = input;

  if (
    !isValidAccessEvidence(access) ||
    typeof operation !== "string" ||
    !RECORD_OPERATIONS.has(operation as PropertyRecordOperation) ||
    !isCanonicalIdentifier(requestedRecordId)
  ) {
    return { status: "unavailable" };
  }

  const scope = decidePropertyCollectionScope({
    selectedHomeId: access.selectedHomeId,
    records,
  });

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

  if (
    requiresWriteAccess &&
    access.role !== "OWNER" &&
    access.role !== "ADULT"
  ) {
    return { status: "write-access-required" };
  }

    return {
      status: "operation-allowed",
      userId: access.currentUserId,
      homeId: access.selectedHomeId,
      membershipId: access.membershipId,
      role: access.role,
      operation,
      record: matches[0],
    };
  } catch {
    return { status: "unavailable" };
  }
}
