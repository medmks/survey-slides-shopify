-- CreateTable
CREATE TABLE "Survey" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "typeSurvey" TEXT NOT NULL,
    "subtitle" TEXT
);

-- CreateTable
CREATE TABLE "Field" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "surveyId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "Field_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Option" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fieldId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "Option_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
