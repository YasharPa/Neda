-- CreateTable
CREATE TABLE "Vocabulary" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hebrew" TEXT NOT NULL,
    "persian" TEXT NOT NULL,
    "example" TEXT,
    "difficulty" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
