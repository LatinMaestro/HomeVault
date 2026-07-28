import type { HouseholdAccessRole } from "@/lib/household-access";

export type PropertyExportMembership = {
  id: string;
  userId: string;
  homeId: string;
  role: HouseholdAccessRole;
};

export const PROPERTY_EXPORT_KINDS = [
  "household-json",
  "inventory-csv",
  "maintenance-history-csv",
  "calendar-ics",
  "home-report",
] as const;

export type PropertyExportKind = (typeof PROPERTY_EXPORT_KINDS)[number];

export type PropertyExportDecision =
  | {
      status: "export-allowed";
      userId: string;
      homeId: string;
      membershipId: string;
      role: HouseholdAccessRole;
      exportKind: PropertyExportKind;
    }
  | {
      status: "unavailable";
    };

type PropertyExportInput = {
  currentUserId: string;
  identityVerified: boolean;
  selectedHomeId: string;
  requestedExportKind: PropertyExportKind;
  memberships: readonly PropertyExportMembership[];
};

const HOUSEHOLD_ACCESS_ROLES = new Set<HouseholdAccessRole>([
  "OWNER",
  "ADULT",
  "CHILD",
  "GUEST",
]);

const EXPORT_KINDS = new Set<PropertyExportKind>(PROPERTY_EXPORT_KINDS);

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

function isValidMembership(
  value: unknown,
  currentUserId: string,
): value is PropertyExportMembership {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isCanonicalIdentifier(value.id) &&
    isCanonicalIdentifier(value.userId) &&
    isCanonicalIdentifier(value.homeId) &&
    value.userId === currentUserId &&
    typeof value.role === "string" &&
    HOUSEHOLD_ACCESS_ROLES.has(value.role as HouseholdAccessRole)
  );
}

export function decidePropertyExportAccess(
  input: PropertyExportInput,
): PropertyExportDecision {
  if (!isRecord(input)) {
    return { status: "unavailable" };
  }

  const {
    currentUserId,
    identityVerified,
    selectedHomeId,
    requestedExportKind,
    memberships,
  } = input;

  if (
    !isCanonicalIdentifier(currentUserId) ||
    identityVerified !== true ||
    !isCanonicalIdentifier(selectedHomeId) ||
    typeof requestedExportKind !== "string" ||
    !EXPORT_KINDS.has(requestedExportKind as PropertyExportKind) ||
    !Array.isArray(memberships) ||
    memberships.length === 0 ||
    memberships.length > 100 ||
    !memberships.every((membership) =>
      isValidMembership(membership, currentUserId),
    )
  ) {
    return { status: "unavailable" };
  }

  const membershipIds = new Set<string>();
  const propertyIds = new Set<string>();

  for (const membership of memberships) {
    if (
      membershipIds.has(membership.id) ||
      propertyIds.has(membership.homeId)
    ) {
      return { status: "unavailable" };
    }

    membershipIds.add(membership.id);
    propertyIds.add(membership.homeId);
  }

  const selectedMemberships = memberships.filter(
    (membership) => membership.homeId === selectedHomeId,
  );

  if (selectedMemberships.length !== 1) {
    return { status: "unavailable" };
  }

  const membership = selectedMemberships[0];

  return {
    status: "export-allowed",
    userId: currentUserId,
    homeId: membership.homeId,
    membershipId: membership.id,
    role: membership.role,
    exportKind: requestedExportKind,
  };
}
