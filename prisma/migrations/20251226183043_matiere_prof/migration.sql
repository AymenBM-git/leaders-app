/*
  Warnings:

  - You are about to drop the column `subjectId` on the `teacher` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `teacher` DROP FOREIGN KEY `Teacher_subjectId_fkey`;

-- DropIndex
DROP INDEX `Teacher_subjectId_fkey` ON `teacher`;

-- AlterTable
ALTER TABLE `teacher` DROP COLUMN `subjectId`;

-- CreateTable
CREATE TABLE `_SubjectToTeacher` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_SubjectToTeacher_AB_unique`(`A`, `B`),
    INDEX `_SubjectToTeacher_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_SubjectToTeacher` ADD CONSTRAINT `_SubjectToTeacher_A_fkey` FOREIGN KEY (`A`) REFERENCES `Subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SubjectToTeacher` ADD CONSTRAINT `_SubjectToTeacher_B_fkey` FOREIGN KEY (`B`) REFERENCES `Teacher`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
