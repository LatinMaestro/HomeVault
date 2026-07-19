import { isAttachmentStorageConfigured } from "@/lib/attachment-storage";
import { isAuthRuntimeConfigured } from "@/lib/auth-config";
import { isAuthEmailConfigured } from "@/lib/auth-email";
import { getAuthDb, isPreviewDatabaseAccessDisabled } from "@/lib/db";

export const canonicalProductionOrigin = "https://home-vault.vercel.app";

export type ProductionReadinessConfiguration = {
  auth: boolean;
  email: boolean;
  attachments: boolean;
  canonicalUrl: boolean;
  previewModeDisabled: boolean;
};

function hasCanonicalAuthUrl() {
  try {
    const url = new URL(process.env.BETTER_AUTH_URL ?? "");
    return (
      url.origin === canonicalProductionOrigin &&
      (url.pathname === "/" || url.pathname === "")
    );
  } catch {
    return false;
  }
}

export function getProductionReadinessConfiguration(): ProductionReadinessConfiguration {
  return {
    auth: isAuthRuntimeConfigured(),
    email: isAuthEmailConfigured(),
    attachments: isAttachmentStorageConfigured(),
    canonicalUrl: hasCanonicalAuthUrl(),
    previewModeDisabled: isPreviewDatabaseAccessDisabled(),
  };
}

export function isProductionConfigurationReady(
  configuration = getProductionReadinessConfiguration(),
) {
  return Object.values(configuration).every(Boolean);
}

export async function isProductionRuntimeReady() {
  if (!isProductionConfigurationReady()) return false;

  try {
    await getAuthDb().$queryRawUnsafe("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
