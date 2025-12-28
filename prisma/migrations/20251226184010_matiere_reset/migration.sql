/*
  Warnings:

  - You are about to drop the `_subjecttoteacher` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_subjecttoteacher` DROP FOREIGN KEY `_SubjectToTeacher_A_fkey`;

-- DropForeignKey
ALTER TABLE `_subjecttoteacher` DROP FOREIGN KEY `_SubjectToTeacher_B_fkey`;

-- AlterTable
ALTER TABLE `teacher` ADD COLUMN `subjectId` INTEGER NULL;

-- DropTable
DROP TABLE `_subjecttoteacher`;

-- AddForeignKey
ALTER TABLE `Teacher` ADD CONSTRAINT `Teacher_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
