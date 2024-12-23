-- CreateTable
CREATE TABLE "ShopCustomers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "customerId" TEXT,
    "customerEmail" TEXT,
    "customerPhone" TEXT
);
