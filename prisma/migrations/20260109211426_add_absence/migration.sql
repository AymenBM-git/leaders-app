/*
  Warnings:

  - You are about to drop the column `codeclass` on the `Class` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Class" DROP COLUMN "codeclass";

-- CreateTable
CREATE TABLE "Absence" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER,
    "classId" INTEGER,
    "dateAbsence" TIMESTAMP(3),
    "hour" TEXT,

    CONSTRAINT "Absence_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
