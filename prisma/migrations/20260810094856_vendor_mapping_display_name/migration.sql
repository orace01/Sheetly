/*
  Warnings:

  - Added the required column `vendorName` to the `VendorMapping` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VendorMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "vendorKey" TEXT NOT NULL,
    "vendorName" TEXT NOT NULL,
    "accountCode" TEXT NOT NULL,
    "accountLabel" TEXT,
    "timesUsed" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VendorMapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_VendorMapping" ("accountCode", "accountLabel", "id", "timesUsed", "updatedAt", "userId", "vendorKey") SELECT "accountCode", "accountLabel", "id", "timesUsed", "updatedAt", "userId", "vendorKey" FROM "VendorMapping";
DROP TABLE "VendorMapping";
ALTER TABLE "new_VendorMapping" RENAME TO "VendorMapping";
CREATE UNIQUE INDEX "VendorMapping_userId_vendorKey_key" ON "VendorMapping"("userId", "vendorKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
