/*
  Warnings:

  - You are about to drop the column `abandonmentNumber` on the `ShopInfo` table. All the data in the column will be lost.
  - You are about to drop the column `abandonmentTime` on the `ShopInfo` table. All the data in the column will be lost.
  - You are about to drop the column `tracking` on the `ShopInfo` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ShopInfo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "shopId" TEXT,
    "apiKey" TEXT NOT NULL,
    "productSync" INTEGER DEFAULT 0,
    "newSignup" INTEGER,
    "cartAbandonment" INTEGER,
    "purchase" INTEGER,
    "signupGroup" TEXT,
    "cartGroup" TEXT,
    "purchaseGroup" TEXT,
    "productAutosync" INTEGER DEFAULT 0
);
INSERT INTO "new_ShopInfo" ("apiKey", "cartAbandonment", "cartGroup", "id", "newSignup", "purchase", "purchaseGroup", "shop", "shopId", "signupGroup") SELECT "apiKey", "cartAbandonment", "cartGroup", "id", "newSignup", "purchase", "purchaseGroup", "shop", "shopId", "signupGroup" FROM "ShopInfo";
DROP TABLE "ShopInfo";
ALTER TABLE "new_ShopInfo" RENAME TO "ShopInfo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
