-- CreateTable
CREATE TABLE `User` (
    `login` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NULL,
    `idTeach` VARCHAR(191) NULL,

    PRIMARY KEY (`login`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
