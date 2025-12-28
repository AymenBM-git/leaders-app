/*
  Warnings:

  - You are about to drop the column `subject` on the `schedule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `schedule` DROP COLUMN `subject`,
    ADD COLUMN `subjectId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
