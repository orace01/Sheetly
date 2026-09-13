-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'STARTER', 'CABINET');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'PROCESSING', 'EXTRACTED', 'ERROR');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('INVOICE', 'RECEIPT', 'BANK_STATEMENT', 'PURCHASE_ORDER', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "batchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Extraction" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL DEFAULT 'OTHER',
    "vendorName" TEXT,
    "invoiceNumber" TEXT,
    "documentDate" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "amountHt" DOUBLE PRECISION,
    "vatRate" DOUBLE PRECISION,
    "vatAmount" DOUBLE PRECISION,
    "amountTtc" DOUBLE PRECISION,
    "category" TEXT,
    "accountCode" TEXT,
    "accountLabel" TEXT,
    "confidence" DOUBLE PRECISION,
    "rawFields" TEXT,
    "integrityOk" BOOLEAN NOT NULL DEFAULT true,
    "integrityDelta" DOUBLE PRECISION,
    "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
    "duplicateOfId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Extraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorMapping" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vendorKey" TEXT NOT NULL,
    "vendorName" TEXT NOT NULL,
    "accountCode" TEXT NOT NULL,
    "accountLabel" TEXT,
    "timesUsed" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "columns" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'xlsx',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExportTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Document_userId_status_idx" ON "Document"("userId", "status");

-- CreateIndex
CREATE INDEX "Document_userId_batchId_idx" ON "Document"("userId", "batchId");

-- CreateIndex
CREATE UNIQUE INDEX "Extraction_documentId_key" ON "Extraction"("documentId");

-- CreateIndex
CREATE INDEX "Extraction_documentId_idx" ON "Extraction"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorMapping_userId_vendorKey_key" ON "VendorMapping"("userId", "vendorKey");

-- CreateIndex
CREATE UNIQUE INDEX "ExportTemplate_userId_name_key" ON "ExportTemplate"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "UsageRecord_userId_periodKey_key" ON "UsageRecord"("userId", "periodKey");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Extraction" ADD CONSTRAINT "Extraction_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorMapping" ADD CONSTRAINT "VendorMapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportTemplate" ADD CONSTRAINT "ExportTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
