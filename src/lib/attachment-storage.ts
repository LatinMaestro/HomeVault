import { del, get, put } from "@vercel/blob";

export const attachmentMaxBytes = 4_000_000;

const allowedAttachments = {
  "application/pdf": { extension: "pdf", signature: [0x25, 0x50, 0x44, 0x46, 0x2d] },
  "image/jpeg": { extension: "jpg", signature: [0xff, 0xd8, 0xff] },
  "image/png": {
    extension: "png",
    signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  },
} as const;

export type AllowedAttachmentType = keyof typeof allowedAttachments;

export type AttachmentValidation =
  | { ok: true; contentType: AllowedAttachmentType; extension: string }
  | { ok: false; message: string };

export function isAttachmentStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_OIDC_TOKEN);
}

export function hasExpectedAttachmentSignature(
  contentType: AllowedAttachmentType,
  bytes: Uint8Array,
) {
  const signature = allowedAttachments[contentType].signature;
  return signature.every((byte, index) => bytes[index] === byte);
}

export async function validateAttachmentFile(file: File): Promise<AttachmentValidation> {
  if (!file.name || file.size === 0) {
    return { ok: false, message: "Choose a non-empty PDF, JPEG or PNG file." };
  }
  if (file.size > attachmentMaxBytes) {
    return { ok: false, message: "Attachments must be 4 MB or smaller." };
  }

  const contentType = file.type as AllowedAttachmentType;
  const rule = allowedAttachments[contentType];
  if (!rule) {
    return { ok: false, message: "Only PDF, JPEG and PNG attachments are supported." };
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  const acceptedExtensions =
    contentType === "image/jpeg" ? ["jpg", "jpeg"] : [rule.extension];
  if (!extension || !acceptedExtensions.includes(extension)) {
    return { ok: false, message: "The file extension does not match its selected file type." };
  }

  const signatureBytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  if (!hasExpectedAttachmentSignature(contentType, signatureBytes)) {
    return { ok: false, message: "The file contents do not match the selected file type." };
  }

  return { ok: true, contentType, extension: rule.extension };
}

function safePathPart(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export async function storePrivateAttachment({
  homeId,
  documentId,
  file,
  extension,
  contentType,
}: {
  homeId: string;
  documentId: string;
  file: File;
  extension: string;
  contentType: AllowedAttachmentType;
}) {
  if (!isAttachmentStorageConfigured()) {
    throw new Error("Private attachment storage is unavailable.");
  }

  const pathname = [
    "households",
    safePathPart(homeId),
    "documents",
    safePathPart(documentId),
    `${crypto.randomUUID()}.${extension}`,
  ].join("/");

  return put(pathname, file, {
    access: "private",
    addRandomSuffix: true,
    contentType,
    cacheControlMaxAge: 60,
  });
}

export function getAttachmentContentDisposition(fileName: string, inline = false) {
  const encodedName = encodeURIComponent(fileName);
  return `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodedName}`;
}

export async function getPrivateAttachment(pathname: string) {
  if (!isAttachmentStorageConfigured()) {
    throw new Error("Private attachment storage is unavailable.");
  }
  return get(pathname, { access: "private" });
}

export async function deletePrivateAttachment(pathname: string) {
  if (!isAttachmentStorageConfigured()) {
    throw new Error("Private attachment storage is unavailable.");
  }
  await del(pathname);
}

export async function deletePrivateAttachments(pathnames: string[]) {
  if (pathnames.length === 0) return true;
  if (!isAttachmentStorageConfigured()) return false;

  try {
    await del(pathnames);
    return true;
  } catch {
    return false;
  }
}
