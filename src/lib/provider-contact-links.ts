export type ProviderContactLinks = {
  phone: string | null;
  email: string | null;
  website: string | null;
};

export function getProviderContactLinks({
  phone,
  email,
  website,
}: {
  phone?: string | null;
  email?: string | null;
  website?: string | null;
}): ProviderContactLinks {
  const dialValue = phone?.trim().replace(/[^\d+]/g, "") ?? "";
  const emailValue = email?.trim() ?? "";
  const safeEmail =
    emailValue && !/[\r\n]/.test(emailValue) && emailValue.includes("@")
      ? `mailto:${encodeURIComponent(emailValue)}`
      : null;

  let safeWebsite: string | null = null;
  if (website?.trim()) {
    try {
      const candidate = /^https?:\/\//i.test(website.trim())
        ? website.trim()
        : `https://${website.trim()}`;
      const url = new URL(candidate);
      safeWebsite = url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
    } catch {
      safeWebsite = null;
    }
  }

  return {
    phone: dialValue ? `tel:${dialValue}` : null,
    email: safeEmail,
    website: safeWebsite,
  };
}
