/*
  Warnings:

  - You are about to drop the column `coef` on the `subject` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `subject` DROP COLUMN `coef`,
    ADD COLUMN `codematiere` VARCHAR(191) NULL;
