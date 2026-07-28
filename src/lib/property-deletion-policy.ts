import type { HouseholdAccessRole } from "@/lib/household-access";

export type PropertyDeletionMembership = {
  id: string;
  userId: string;
  homeId: string;
  role: HouseholdAccessRole;
};

export const PROPERTY_DELETION_CLEANUP_SCOPES = [
  "database-graph",
  "server-property-selection",
  "private-files",
  "device-and-offline-data",
  "notification-tokens-and-schedules",
  "calendar-connections-and-events",
  "email-ingestion-routes-and-quarantine",
  "sharing-grants",
  "ocr-and-ai-processor-copies",
  "provider-integrations",
] as const;

export type PropertyDeletionCleanupScope =
  (typeof PROPERTY_DELETION_CLEANUP_SCOPES)[number];

export type PropertyDeletionDecision =
  | {
      status: "deletion-allowed";
      homeId: string;
      ownerMembershipId: string;
      cleanupScopes: readonly PropertyDeletionCleanupScope[];
    }
  | {
      status: "unavailable";
    }
  | {
      status: "owner-required";
    }
  | {
      status: "credential-confirmation-required";
    }
  | {
      status: "members-remain";
    };

type PropertyDeletionInput = {
  currentUserId: string;
  selectedHomeId: string;
  credentialConfirmed: boolean;
  memberships: readonly PropertyDeletionMembership[];
};

const HOUSEHOLD_ACCESS_ROLES = new Set<HouseholdAccessRole>([
  "OWNER",
  "ADULT",
  "CHILD",
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

function isValidMembership(
  value: unknown,
  selectedHomeId: string,
): value is PropertyDeletionMembership {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isCanonicalIdentifier(value.id) &&
    isCanonicalIdentifier(value.userId) &&
    isCanonicalIdentifier(value.homeId) &&
    value.homeId === selectedHomeId &&
    typeof value.role === "string" &&
    HOUSEHOLD_ACCESS_ROLES.has(value.role as HouseholdAccessRole)
  );
}

export function decidePropertyDeletion(
  input: PropertyDeletionInput,
): PropertyDeletionDecision {
  if (!isRecord(input)) {
    return { status: "unavailable" };
  }

  const {
    currentUserId,
    selectedHomeId,
    credentialConfirmed,
    memberships,
  } = input;

  if (
    !isCanonicalIdentifier(currentUserId) ||
    !isCanonicalIdentifier(selectedHomeId) ||
    (credentialConfirmed !== true && credentialConfirmed !== false) ||
    !Array.isArray(memberships) ||
    memberships.length === 0 ||
    memberships.length > 100 ||
    !memberships.every((membership) =>
      isValidMembership(membership, selectedHomeId),
    )
  ) {
    return { status: "unavailable" };
  }

  const membershipIds = new Set<string>();
  const memberUserIds = new Set<string>();

  for (const membership of memberships) {
    if (
      membershipIds.has(membership.id) ||
      memberUserIds.has(membership.userId)
    ) {
      return { status: "unavailable" };
    }

    membershipIds.add(membership.id);
    memberUserIds.add(membership.userId);
  }

  const currentMemberships = memberships.filter(
    (membership) => membership.userId === currentUserId,
  );

  if (currentMemberships.length !== 1) {
    return { status: "unavailable" };
  }

  const currentMembership = currentMemberships[0];

  if (currentMembership.role !== "OWNER") {
    return { status: "owner-required" };
  }

  const ownerCount = memberships.filter(
    (membership) => membership.role === "OWNER",
  ).length;

  if (ownerCount !== 1) {
    return { status: "unavailable" };
  }

  if (!credentialConfirmed) {
    return { status: "credential-confirmation-required" };
  }

  if (memberships.length > 1) {
    return { status: "members-remain" };
  }

  return {
    status: "deletion-allowed",
    homeId: selectedHomeId,
    ownerMembershipId: currentMembership.id,
    cleanupScopes: PROPERTY_DELETION_CLEANUP_SCOPES,
  };
}
