const AUSTRALIAN_STATES = new Set([
  "ACT",
  "NSW",
  "NT",
  "QLD",
  "SA",
  "TAS",
  "VIC",
  "WA",
]);

const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/;
const FORMAT_CHARACTERS = /\p{Cf}/u;
const IDENTIFIER_WHITESPACE = /\s/u;

export type AdditionalPropertyDraft = {
  name: string;
  addressLine?: string | null;
  suburb?: string | null;
  state?: string | null;
  postcode?: string | null;
};

export type AdditionalPropertyCreationDecision =
  | Readonly<{
      status: "creation-allowed";
      requestId: string;
      ownerMembership: Readonly<{
        userId: string;
        role: "OWNER";
      }>;
      home: Readonly<{
        name: string;
        addressLine: string | null;
        suburb: string | null;
        state: string | null;
        postcode: string | null;
        country: "Australia";
      }>;
    }>
  | {
      status: "unavailable";
    }
  | {
      status: "verification-required";
    }
  | {
      status: "invalid-request";
    };

function containsUnsafeText(value: string): boolean {
  return CONTROL_CHARACTERS.test(value) || FORMAT_CHARACTERS.test(value);
}

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
    !containsUnsafeText(value)
  );
}

function normalizeBoundedOptional(
  value: unknown,
  maxLength: number,
): { valid: true; value: string | null } | { valid: false } {
  if (value === undefined || value === null) {
    return { valid: true, value: null };
  }

  if (typeof value !== "string") {
    return { valid: false };
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    return { valid: true, value: null };
  }

  if (
    normalized.length > maxLength ||
    containsUnsafeText(normalized)
  ) {
    return { valid: false };
  }

  return { valid: true, value: normalized };
}

export function decideAdditionalPropertyCreation(
  input: unknown,
): AdditionalPropertyCreationDecision {
  if (!isPlainRecord(input)) {
    return { status: "unavailable" };
  }

  let currentUserId: unknown;
  let emailVerified: unknown;
  let requestId: unknown;
  let draft: unknown;

  try {
    currentUserId = input.currentUserId;
    emailVerified = input.emailVerified;
    requestId = input.requestId;
    draft = input.draft;
  } catch {
    return { status: "unavailable" };
  }

  if (!isCanonicalIdentifier(currentUserId)) {
    return { status: "unavailable" };
  }

  if (emailVerified !== true) {
    return { status: "verification-required" };
  }

  if (
    typeof requestId !== "string" ||
    !/^[A-Za-z0-9_-]{16,128}$/.test(requestId)
  ) {
    return { status: "invalid-request" };
  }

  if (!isPlainRecord(draft)) {
    return { status: "invalid-request" };
  }

  let nameInput: unknown;
  let addressLineInput: unknown;
  let suburbInput: unknown;
  let stateInputValue: unknown;
  let postcodeInput: unknown;

  try {
    nameInput = draft.name;
    addressLineInput = draft.addressLine;
    suburbInput = draft.suburb;
    stateInputValue = draft.state;
    postcodeInput = draft.postcode;
  } catch {
    return { status: "invalid-request" };
  }

  const name = typeof nameInput === "string" ? nameInput.trim() : "";
  const addressLine = normalizeBoundedOptional(addressLineInput, 200);
  const suburb = normalizeBoundedOptional(suburbInput, 100);
  const stateInput = normalizeBoundedOptional(stateInputValue, 3);
  const postcode = normalizeBoundedOptional(postcodeInput, 4);

  if (
    name.length < 2 ||
    name.length > 100 ||
    containsUnsafeText(name) ||
    !addressLine.valid ||
    !suburb.valid ||
    !stateInput.valid ||
    !postcode.valid
  ) {
    return { status: "invalid-request" };
  }

  const state = stateInput.value?.toUpperCase() ?? null;

  if (
    (state !== null && !AUSTRALIAN_STATES.has(state)) ||
    (postcode.value !== null && !/^\d{4}$/.test(postcode.value))
  ) {
    return { status: "invalid-request" };
  }

  return Object.freeze({
    status: "creation-allowed",
    requestId,
    ownerMembership: Object.freeze({
      userId: currentUserId,
      role: "OWNER",
    }),
    home: Object.freeze({
      name,
      addressLine: addressLine.value,
      suburb: suburb.value,
      state,
      postcode: postcode.value,
      country: "Australia",
    }),
  });
}
