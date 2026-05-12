-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'ru',
    "content" TEXT,
    "excerpt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'publish',
    "authorId" INTEGER,
    "featuredImage" TEXT,
    "gallery" TEXT,
    "address" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "price" REAL NOT NULL DEFAULT 0,
    "salePrice" REAL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Post" ("address", "authorId", "content", "createdAt", "currency", "excerpt", "featuredImage", "gallery", "id", "latitude", "longitude", "price", "rating", "reviewCount", "salePrice", "slug", "status", "title", "type", "updatedAt") SELECT "address", "authorId", "content", "createdAt", "currency", "excerpt", "featuredImage", "gallery", "id", "latitude", "longitude", "price", "rating", "reviewCount", "salePrice", "slug", "status", "title", "type", "updatedAt" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
