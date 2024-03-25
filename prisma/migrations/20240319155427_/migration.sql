/*
  Warnings:

  - You are about to drop the column `ansewer` on the `Answers` table. All the data in the column will be lost.
  - Added the required column `answer` to the `Answers` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Answers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idField" INTEGER NOT NULL,
    "AttributionId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    CONSTRAINT "Answers_AttributionId_fkey" FOREIGN KEY ("AttributionId") REFERENCES "Attribution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Answers" ("AttributionId", "id", "idField", "question") SELECT "AttributionId", "id", "idField", "question" FROM "Answers";
DROP TABLE "Answers";
ALTER TABLE "new_Answers" RENAME TO "Answers";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
