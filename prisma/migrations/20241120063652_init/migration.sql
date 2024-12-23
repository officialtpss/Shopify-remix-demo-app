/*
  Warnings:

  - You are about to alter the column `status` on the `AbandonmentCart` table. The data in that column could be lost. The data in that column will be cast from `Int` to `DateTime`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AbandonmentCart" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "cartToken" TEXT,
    "checkoutId" TEXT,
    "customerId" TEXT,
    "createdAt" TEXT,
    "status" DATETIME
);
INSERT INTO "new_AbandonmentCart" ("cartToken", "checkoutId", "createdAt", "customerEmail", "customerId", "customerName", "customerPhone", "id", "shop", "status") SELECT "cartToken", "checkoutId", "createdAt", "customerEmail", "customerId", "customerName", "customerPhone", "id", "shop", "status" FROM "AbandonmentCart";
DROP TABLE "AbandonmentCart";
ALTER TABLE "new_AbandonmentCart" RENAME TO "AbandonmentCart";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
