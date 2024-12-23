/*
  Warnings:

  - You are about to drop the `AbandonmentItems` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `completedAt` on the `AbandonmentCart` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AbandonmentItems";
PRAGMA foreign_keys=on;

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
    "createdAt" TEXT
);
INSERT INTO "new_AbandonmentCart" ("cartToken", "createdAt", "customerEmail", "customerId", "customerName", "customerPhone", "id", "shop") SELECT "cartToken", "createdAt", "customerEmail", "customerId", "customerName", "customerPhone", "id", "shop" FROM "AbandonmentCart";
DROP TABLE "AbandonmentCart";
ALTER TABLE "new_AbandonmentCart" RENAME TO "AbandonmentCart";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
