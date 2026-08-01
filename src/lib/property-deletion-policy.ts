export type PropertyDeletionRole = "OWNER" | "ADULT" | "CHILD" | "GUEST";

export type PropertyDeletionMembership = {
  id: string;
  userId: string;
  homeId: string;
  role: PropertyDeletionRole;
  active: boolean;
  version: number;
};

export type PropertyDeletionCredentialConfirmation = {
  id: string;
  userId: string;
  homeId: string;
  operation: "delete-property";
  confirmedAt: Date;
  expiresAt: Date;
};

export const PROPERTY_DELETION_CLEANUP_SCOPES = Object.freeze([
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
] as const);

export type PropertyDeletionCleanupScope =
  (typeof PROPERTY_DELETION_CLEANUP_SCOPES)[number];

export type PropertyDeletionDecision =
  | Readonly<{
      status: "deletion-allowed";
      homeId: string;
      ownerMembershipId: string;
      expectedOwnerMembershipVersion: number;
      credentialConfirmationId: string;
      cleanupScopes: readonly PropertyDeletionCleanupScope[];
    }>
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

const HOUSEHOLD_ACCESS_ROLES = new Set<PropertyDeletionRole>([
  "OWNER",
  "ADULT",
  "CHILD",
  "GUEST",
]);

const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/;
const FORMAT_CHARACTERS = /\p{Cf}/u;
const IDENTIFIER_WHITESPACE = /\s/u;
const MAX_CONFIRMATION_LIFETIME_MS = 10 * 60 * 1000;

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  try {
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  } catch {
    return false;
  }
}

function isCanonicalIdentifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 191 &&
    value.trim() === value &&
    !IDENTIFIER_WHITESPACE.test(value) &&
    !CONTROL_CHARACTERS.test(value) &&
    !FORMAT_CHARACTERS.test(value)
  );
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function isValidMembership(
  value: unknown,
  selectedHomeId: string,
): value is PropertyDeletionMembership {
  if (!isPlainRecord(value)) {
    return false;
  }

  try {
    return (
      isCanonicalIdentifier(value.id) &&
      isCanonicalIdentifier(value.userId) &&
      isCanonicalIdentifier(value.homeId) &&
      value.homeId === selectedHomeId &&
      typeof value.role === "string" &&
      HOUSEHOLD_ACCESS_ROLES.has(value.role as PropertyDeletionRole) &&
      value.active === true &&
      Number.isSafeInteger(value.version) &&
      (value.version as number) >= 1
    );
  } catch {
    return false;
  }
}

function validateCredentialConfirmation(
  value: unknown,
  currentUserId: string,
  selectedHomeId: string,
  now: Date,
):
  | { status: "valid"; confirmation: PropertyDeletionCredentialConfirmation }
  | { status: "required" }
  | { status: "unavailable" } {
  if (value === undefined || value === null) {
    return { status: "required" };
  }

  if (!isPlainRecord(value)) {
    return { status: "unavailable" };
  }

  let confirmation: PropertyDeletionCredentialConfirmation;

  try {
    if (
      !isCanonicalIdentifier(value.id) ||
      !isCanonicalIdentifier(value.userId) ||
      !isCanonicalIdentifier(value.homeId) ||
      value.operation !== "delete-property" ||
      !isValidDate(value.confirmedAt) ||
      !isValidDate(value.expiresAt)
    ) {
      return { status: "unavailable" };
    }

    confirmation = {
      id: value.id,
      userId: value.userId,
      homeId: value.homeId,
      operation: value.operation,
      confirmedAt: value.confirmedAt,
      expiresAt: value.expiresAt,
    };
  } catch {
    return { status: "unavailable" };
  }

  if (
    confirmation.userId !== currentUserId ||
    confirmation.homeId !== selectedHomeId
  ) {
    return { status: "unavailable" };
  }

  const confirmedAt = confirmation.confirmedAt.getTime();
  const expiresAt = confirmation.expiresAt.getTime();
  const nowTime = now.getTime();

  if (
    confirmedAt > nowTime ||
    expiresAt <= nowTime ||
    expiresAt <= confirmedAt ||
    expiresAt - confirmedAt > MAX_CONFIRMATION_LIFETIME_MS
  ) {
    return { status: "required" };
  }

  return { status: "valid", confirmation };
}

export function decidePropertyDeletion(
  input: unknown,
): PropertyDeletionDecision {
  if (!isPlainRecord(input)) {
    return { status: "unavailable" };
  }

  let currentUserId: unknown;
  let selectedHomeId: unknown;
  let now: unknown;
  let memberships: unknown;
  let credentialConfirmation: unknown;

  try {
    currentUserId = input.currentUserId;
    selectedHomeId = input.selectedHomeId;
    now = input.now;
    memberships = input.memberships;
    credentialConfirmation = input.credentialConfirmation;
  } catch {
    return { status: "unavailable" };
  }

  if (
    !isCanonicalIdentifier(currentUserId) ||
    !isCanonicalIdentifier(selectedHomeId) ||
    !isValidDate(now) ||
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

  const confirmation = validateCredentialConfirmation(
    credentialConfirmation,
    currentUserId,
    selectedHomeId,
    now,
  );

  if (confirmation.status === "unavailable") {
    return { status: "unavailable" };
  }

  if (confirmation.status === "required") {
    return { status: "credential-confirmation-required" };
  }

  if (memberships.length > 1) {
    return { status: "members-remain" };
  }

  return Object.freeze({
    status: "deletion-allowed",
    homeId: selectedHomeId,
    ownerMembershipId: currentMembership.id,
    expectedOwnerMembershipVersion: currentMembership.version,
    credentialConfirmationId: confirmation.confirmation.id,
    cleanupScopes: PROPERTY_DELETION_CLEANUP_SCOPES,
  });
}
