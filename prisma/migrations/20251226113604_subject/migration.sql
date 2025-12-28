/*
  Warnings:

  - You are about to drop the column `subject` on the `teacher` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `teacher` DROP COLUMN `subject`,
    ADD COLUMN `subjectId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Subject` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `coef` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Teacher` ADD CONSTRAINT `Teacher_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
