/*
  Warnings:

  - You are about to drop the column `parentId` on the `Payment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_parentId_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "parentId",
ADD COLUMN     "studentId" INTEGER;

-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "group" BOOLEAN DEFAULT false,
ADD COLUMN     "week" TEXT DEFAULT 'all';

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
