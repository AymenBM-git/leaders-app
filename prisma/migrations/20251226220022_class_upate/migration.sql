/*
  Warnings:

  - You are about to drop the column `teacherId` on the `class` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `class` DROP FOREIGN KEY `Class_teacherId_fkey`;

-- DropIndex
DROP INDEX `Class_teacherId_fkey` ON `class`;

-- AlterTable
ALTER TABLE `class` DROP COLUMN `teacherId`;

-- CreateTable
CREATE TABLE `_ClassToTeacher` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ClassToTeacher_AB_unique`(`A`, `B`),
    INDEX `_ClassToTeacher_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ClassToTeacher` ADD CONSTRAINT `_ClassToTeacher_A_fkey` FOREIGN KEY (`A`) REFERENCES `Class`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ClassToTeacher` ADD CONSTRAINT `_ClassToTeacher_B_fkey` FOREIGN KEY (`B`) REFERENCES `Teacher`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
