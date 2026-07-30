export type HouseholdAccessRole = "OWNER" | "ADULT" | "CHILD" | "GUEST";

export type PropertyExportMembership = {
  id: string;
  userId: string;
  homeId: string;
  role: HouseholdAccessRole;
  active: boolean;
  version: number;
};

export type VerifiedExportIdentity = {
  userId: string;
  sessionId: string;
  sessionVersion: number;
  active: boolean;
  emailVerified: boolean;
  resolvedAtMs: number;
  expiresAtMs: number;
};

export const PROPERTY_EXPORT_KINDS = Object.freeze(
  [
    "household-json",
    "inventory-csv",
    "maintenance-history-csv",
    "calendar-ics",
    "home-report",
  ] as const,
);

export type PropertyExportKind = (typeof PROPERTY_EXPORT_KINDS)[number];

export type PropertyExportDecision =
  | {
      status: "export-allowed";
      userId: string;
      sessionId: string;
      sessionVersion: number;
      homeId: string;
      membershipId: string;
      membershipVersion: number;
      role: HouseholdAccessRole;
      exportKind: PropertyExportKind;
    }
  | {
      status: "unavailable";
    };

export type PropertyExportInput = {
  identity: VerifiedExportIdentity;
  nowMs: number;
  selectedHomeId: string;
  requestedExportKind: PropertyExportKind;
  memberships: readonly PropertyExportMembership[];
};

const MAX_IDENTITY_EVIDENCE_AGE_MS = 5 * 60 * 1_000;
const MAX_MEMBERSHIPS = 100;
const UNAVAILABLE = Object.freeze({ status: "unavailable" } as const);

const HOUSEHOLD_ACCESS_ROLES = new Set<HouseholdAccessRole>([
  "OWNER",
  "ADULT",
  "CHILD",
  "GUEST",
]);

const EXPORT_KINDS = new Set<PropertyExportKind>(PROPERTY_EXPORT_KINDS);

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function readOwn(record: Record<string, unknown>, key: string): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(record, key);
  return descriptor && "value" in descriptor ? descriptor.value : undefined;
}

function isCanonicalIdentifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[^\s\p{Cc}\p{Cf}]{1,128}$/u.test(value)
  );
}

function isPositiveSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}

function isTimestamp(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

function getVerifiedIdentity(
  value: unknown,
  nowMs: number,
): VerifiedExportIdentity | null {
  if (!isPlainRecord(value)) {
    return null;
  }

  const userId = readOwn(value, "userId");
  const sessionId = readOwn(value, "sessionId");
  const sessionVersion = readOwn(value, "sessionVersion");
  const active = readOwn(value, "active");
  const emailVerified = readOwn(value, "emailVerified");
  const resolvedAtMs = readOwn(value, "resolvedAtMs");
  const expiresAtMs = readOwn(value, "expiresAtMs");

  if (
    !isCanonicalIdentifier(userId) ||
    !isCanonicalIdentifier(sessionId) ||
    !isPositiveSafeInteger(sessionVersion) ||
    active !== true ||
    emailVerified !== true ||
    !isTimestamp(resolvedAtMs) ||
    !isTimestamp(expiresAtMs) ||
    resolvedAtMs > nowMs ||
    nowMs - resolvedAtMs > MAX_IDENTITY_EVIDENCE_AGE_MS ||
    expiresAtMs <= nowMs ||
    resolvedAtMs >= expiresAtMs
  ) {
    return null;
  }

  return {
    userId,
    sessionId,
    sessionVersion,
    active,
    emailVerified,
    resolvedAtMs,
    expiresAtMs,
  };
}

function isValidMembership(
  value: unknown,
  currentUserId: string,
): value is PropertyExportMembership {
  if (!isPlainRecord(value)) {
    return false;
  }

  const id = readOwn(value, "id");
  const userId = readOwn(value, "userId");
  const homeId = readOwn(value, "homeId");
  const role = readOwn(value, "role");
  const active = readOwn(value, "active");
  const version = readOwn(value, "version");

  return (
    isCanonicalIdentifier(id) &&
    isCanonicalIdentifier(userId) &&
    isCanonicalIdentifier(homeId) &&
    userId === currentUserId &&
    typeof role === "string" &&
    HOUSEHOLD_ACCESS_ROLES.has(role as HouseholdAccessRole) &&
    active === true &&
    isPositiveSafeInteger(version)
  );
}

export function decidePropertyExportAccess(
  input: PropertyExportInput,
): PropertyExportDecision {
  try {
    if (!isPlainRecord(input)) {
      return UNAVAILABLE;
    }

    const identityValue = readOwn(input, "identity");
    const nowMs = readOwn(input, "nowMs");
    const selectedHomeId = readOwn(input, "selectedHomeId");
    const requestedExportKind = readOwn(input, "requestedExportKind");
    const memberships = readOwn(input, "memberships");

    if (
      !isTimestamp(nowMs) ||
      !isCanonicalIdentifier(selectedHomeId) ||
      typeof requestedExportKind !== "string" ||
      !EXPORT_KINDS.has(requestedExportKind as PropertyExportKind) ||
      !Array.isArray(memberships) ||
      memberships.length === 0 ||
      memberships.length > MAX_MEMBERSHIPS
    ) {
      return UNAVAILABLE;
    }

    const identity = getVerifiedIdentity(identityValue, nowMs);
    if (
      !identity ||
      !memberships.every((membership) =>
        isValidMembership(membership, identity.userId),
      )
    ) {
      return UNAVAILABLE;
    }

    const membershipIds = new Set<string>();
    const propertyIds = new Set<string>();
    let selectedMembership: PropertyExportMembership | null = null;

    for (const membership of memberships) {
      if (
        membershipIds.has(membership.id) ||
        propertyIds.has(membership.homeId)
      ) {
        return UNAVAILABLE;
      }

      membershipIds.add(membership.id);
      propertyIds.add(membership.homeId);
      if (membership.homeId === selectedHomeId) {
        selectedMembership = membership;
      }
    }

    if (!selectedMembership) {
      return UNAVAILABLE;
    }

    return Object.freeze({
      status: "export-allowed",
      userId: identity.userId,
      sessionId: identity.sessionId,
      sessionVersion: identity.sessionVersion,
      homeId: selectedMembership.homeId,
      membershipId: selectedMembership.id,
      membershipVersion: selectedMembership.version,
      role: selectedMembership.role,
      exportKind: requestedExportKind as PropertyExportKind,
    });
  } catch {
    return UNAVAILABLE;
  }
}
