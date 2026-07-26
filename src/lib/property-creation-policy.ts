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
      ownerUserId: string;
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

function normalizeOptional(value?: string | null) {
  const normalized = value?.trim() ?? "";
  return normalized || null;
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
  if (!currentUserId) {
    return { status: "unavailable" };
  }

  if (!emailVerified) {
    return { status: "verification-required" };
  }

  if (!/^[A-Za-z0-9_-]{16,128}$/.test(requestId)) {
    return { status: "invalid-request" };
  }

  const name = draft.name.trim();
  const addressLine = normalizeOptional(draft.addressLine);
  const suburb = normalizeOptional(draft.suburb);
  const state = normalizeOptional(draft.state)?.toUpperCase() ?? null;
  const postcode = normalizeOptional(draft.postcode);

  if (
    name.length < 2 ||
    name.length > 100 ||
    (state !== null && !AUSTRALIAN_STATES.has(state)) ||
    (postcode !== null && !/^\d{4}$/.test(postcode))
  ) {
    return { status: "invalid-request" };
  }

  return {
    status: "creation-allowed",
    requestId,
    ownerUserId: currentUserId,
    home: {
      name,
      addressLine,
      suburb,
      state,
      postcode,
      country: "Australia",
    },
  };
}
