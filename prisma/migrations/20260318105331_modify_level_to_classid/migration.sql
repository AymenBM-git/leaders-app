/*
  Warnings:

  - You are about to drop the column `level` on the `Planing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "Planing" DROP COLUMN "level",
ADD COLUMN     "classId" INTEGER;

-- AddForeignKey
ALTER TABLE "Planing" ADD CONSTRAINT "Planing_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
