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

export type AdditionalPropertyDraft = {
  name: string;
  addressLine?: string | null;
  suburb?: string | null;
  state?: string | null;
  postcode?: string | null;
};

export type AdditionalPropertyCreationDecision =
  | {
      status: "creation-allowed";
      requestId: string;
      ownerMembership: {
        userId: string;
        role: "OWNER";
      };
      home: {
        name: string;
        addressLine: string | null;
        suburb: string | null;
        state: string | null;
        postcode: string | null;
        country: "Australia";
      };
    }
  | {
      status: "unavailable";
    }
  | {
      status: "verification-required";
    }
  | {
      status: "invalid-request";
    };

function isCanonicalIdentifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 191 &&
    value.trim() === value &&
    !CONTROL_CHARACTERS.test(value)
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
    CONTROL_CHARACTERS.test(normalized)
  ) {
    return { valid: false };
  }

  return { valid: true, value: normalized };
}

export function decideAdditionalPropertyCreation({
  currentUserId,
  emailVerified,
  requestId,
  draft,
}: {
  currentUserId: string;
  emailVerified: boolean;
  requestId: string;
  draft: AdditionalPropertyDraft;
}): AdditionalPropertyCreationDecision {
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

  if (typeof draft !== "object" || draft === null) {
    return { status: "invalid-request" };
  }

  const name =
    typeof draft.name === "string" ? draft.name.trim() : "";
  const addressLine = normalizeBoundedOptional(draft.addressLine, 200);
  const suburb = normalizeBoundedOptional(draft.suburb, 100);
  const stateInput = normalizeBoundedOptional(draft.state, 3);
  const postcode = normalizeBoundedOptional(draft.postcode, 4);

  if (
    name.length < 2 ||
    name.length > 100 ||
    CONTROL_CHARACTERS.test(name) ||
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

  return {
    status: "creation-allowed",
    requestId,
    ownerMembership: {
      userId: currentUserId,
      role: "OWNER",
    },
    home: {
      name,
      addressLine: addressLine.value,
      suburb: suburb.value,
      state,
      postcode: postcode.value,
      country: "Australia",
    },
  };
}
