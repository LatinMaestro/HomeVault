-- AlterTable
ALTER TABLE "Document"
ADD COLUMN "attachmentContentType" TEXT,
ADD COLUMN "attachmentEtag" TEXT,
ADD COLUMN "attachmentSizeBytes" INTEGER,
ADD COLUMN "attachmentUploadedAt" TIMESTAMP(3);
