/*
  Warnings:

  - Added the required column `size` to the `Recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Recipe` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Recipe` ADD COLUMN `size` VARCHAR(191) NOT NULL,
    ADD COLUMN `type` VARCHAR(191) NOT NULL;
