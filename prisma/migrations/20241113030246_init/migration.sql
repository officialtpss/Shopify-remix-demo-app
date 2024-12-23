-- CreateTable
CREATE TABLE "AbandonmentCart" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "cartToken" TEXT,
    "completedAt" TEXT,
    "createdAt" TEXT
);

-- CreateTable
CREATE TABLE "AbandonmentItems" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productTitle" TEXT,
    "image" TEXT,
    "quantity" INTEGER,
    "price" TEXT
);
