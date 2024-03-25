-- CreateTable
CREATE TABLE "Attribution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "suevryname" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "order" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Answers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idField" INTEGER NOT NULL,
    "AttributionId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "ansewer" TEXT NOT NULL,
    CONSTRAINT "Answers_AttributionId_fkey" FOREIGN KEY ("AttributionId") REFERENCES "Attribution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
