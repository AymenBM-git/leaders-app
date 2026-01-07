/*
  Warnings:

  - You are about to drop the column `email` on the `Parent` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Parent` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Parent` table. All the data in the column will be lost.
  - You are about to drop the column `relation` on the `Parent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Parent" DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "phone",
DROP COLUMN "relation",
ADD COLUMN     "email1" TEXT,
ADD COLUMN     "email2" TEXT,
ADD COLUMN     "name1" TEXT,
ADD COLUMN     "name2" TEXT,
ADD COLUMN     "phone1" TEXT,
ADD COLUMN     "phone2" TEXT,
ADD COLUMN     "relation1" TEXT,
ADD COLUMN     "relation2" TEXT;
