/*
  Warnings:

  - Added the required column `RenderInShop` to the `Survey` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Survey" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "typeSurvey" TEXT NOT NULL,
    "subtitle" TEXT,
    "RenderInShop" BOOLEAN NOT NULL
);
INSERT INTO "new_Survey" ("id", "subtitle", "title", "typeSurvey") SELECT "id", "subtitle", "title", "typeSurvey" FROM "Survey";
DROP TABLE "Survey";
ALTER TABLE "new_Survey" RENAME TO "Survey";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
