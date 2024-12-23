/*
  Warnings:

  - You are about to drop the column `appUrl` on the `ShopInfo` table. All the data in the column will be lost.

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
    "productAutosync" INTEGER DEFAULT 0,
    "webpixel" INTEGER DEFAULT 0
);
INSERT INTO "new_ShopInfo" ("apiKey", "cartAbandonment", "cartGroup", "id", "newSignup", "productAutosync", "productSync", "purchase", "purchaseGroup", "shop", "shopId", "signupGroup", "webpixel") SELECT "apiKey", "cartAbandonment", "cartGroup", "id", "newSignup", "productAutosync", "productSync", "purchase", "purchaseGroup", "shop", "shopId", "signupGroup", "webpixel" FROM "ShopInfo";
DROP TABLE "ShopInfo";
ALTER TABLE "new_ShopInfo" RENAME TO "ShopInfo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
